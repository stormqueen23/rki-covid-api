import os
import re
from datetime import *
import numpy as np
import pandas as pd
import pytz

# %%
url = "https://www.arcgis.com/sharing/rest/content/items/f10774f1c63e40168479a1feb6c7ca74/data"

date_latest = datetime.now(pytz.timezone('Europe/Berlin')).date().strftime('%Y-%m-%d')

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'Fallzahlen')
LK_json_path = os.path.join(path, 'FixFallzahlen_' + date_latest + '_LK.json')
BL_json_path = os.path.join(path, 'FixFallzahlen_' + date_latest + '_BL.json')

BV_csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'Bevoelkerung',
                               'Bevoelkerung.csv')

iso_date_re = '([0-9]{4})(-?)(1[0-2]|0[1-9])\\2(3[01]|0[1-9]|[12][0-9])'
pattern = 'RKI_COVID19'
BV_dtypes = {'AGS': 'Int32', 'Name': 'object', 'GueltigAb': 'object', 'GueltigBis': 'object', 'Einwohner': 'Int32'}
CV_dtypes = {'Datenstand': 'object', 'IdBundesland': 'Int32', 'IdLandkreis': 'Int32', 'NeuerFall': 'Int8',
                'NeuerTodesfall': 'Int8', 'AnzahlFall': 'Int32', 'AnzahlTodesfall': 'Int32', 'Meldedatum': 'object'}
key_list_LK = ['Datenstand', 'IdBundesland', 'IdLandkreis']
key_list_BL = ['Datenstand', 'IdBundesland']

# %% open bevoelkerung.csv
BV = pd.read_csv(BV_csv_path, usecols=BV_dtypes.keys(), dtype=BV_dtypes)
BV['GueltigAb'] = pd.to_datetime(BV['GueltigAb'])
BV['GueltigBis'] = pd.to_datetime(BV['GueltigBis'])

# %% load covid latest from web
LK = pd.read_csv(url, usecols=CV_dtypes.keys(), dtype=CV_dtypes)

# %% eval incidence
LK['Meldedatum'] = pd.to_datetime(LK['Meldedatum']).dt.date
meldedatum_max = LK['Meldedatum'].max()
LK['AnzahlFall_neu'] = np.where(LK['NeuerFall'].isin([-1, 1]), LK['AnzahlFall'], 0)
LK['AnzahlFall'] = np.where(LK['NeuerFall'].isin([0, 1]), LK['AnzahlFall'], 0)
LK['AnzahlFall_7d'] = np.where(LK['Meldedatum'] > (meldedatum_max - timedelta(days=7)), LK['AnzahlFall'], 0)
datenstand = pd.to_datetime(LK['Datenstand'].iloc[0], format='%d.%m.%Y, %H:%M Uhr')
LK['Datenstand'] = datenstand.date()
LK.drop(['NeuerFall', 'NeuerTodesfall', 'AnzahlFall', 'AnzahlTodesfall', 'AnzahlFall_neu'], inplace=True, axis=1)
BL = LK.copy()
BL['IdLandkreis'] = 0
ID0 = BL.copy()
ID0['IdBundesland'] = 0
agg_key = {
    c: 'max' if c in ['Meldedatum', 'Datenstand'] else 'sum'
    for c in LK.columns
    if c not in key_list_LK
}
LK = LK.groupby(key_list_LK, as_index=False).agg(agg_key)
BL = BL.groupby(key_list_LK, as_index=False).agg(agg_key)
ID0 = ID0.groupby(key_list_LK, as_index=False).agg(agg_key)
BL = pd.concat([ID0, BL])
BL.reset_index(inplace=True, drop=True)
BL.drop(['IdLandkreis', 'Meldedatum'], inplace=True, axis=1)
LK.drop(['Meldedatum'], inplace=True, axis=1)
LK.sort_values(by=key_list_LK, inplace=True)
BL.sort_values(by=key_list_BL, inplace=True)
LK_pop_mask = (BV['AGS'].isin(LK['IdLandkreis'])) & (BV['GueltigAb'] <= datenstand) & (BV['GueltigBis'] >= datenstand)
LK_pop = BV[LK_pop_mask]
LK_pop.reset_index(inplace=True, drop=True)
LK['population'] = LK_pop['Einwohner']
LK.insert(loc=3, column='Landkreis', value=LK_pop['Name'])
LK['AnzahlFall_7d'] = LK['AnzahlFall_7d'].astype(int)
LK['incidence_7d'] = LK['AnzahlFall_7d'] / LK['population'] * 100000
LK.drop(['population'], inplace=True, axis=1)
BL_pop_mask = (BV['AGS'].isin(BL['IdBundesland'])) & (BV['GueltigAb'] <= datenstand) & (BV['GueltigBis'] >= datenstand)
BL_pop = BV[BL_pop_mask]
BL_pop.reset_index(inplace=True, drop=True)
BL['population'] = BL_pop['Einwohner']
BL.insert(loc=2, column='Bundesland', value=BL_pop['Name'])
BL['AnzahlFall_7d'] = BL['AnzahlFall_7d'].astype(int)
BL['incidence_7d'] = BL['AnzahlFall_7d'] / BL['population'] * 100000
BL.drop(['population'], inplace=True, axis=1)
LK['IdLandkreisStr'] = LK['IdLandkreis']
LK['IdLandkreisStr'] = LK['IdLandkreisStr'].astype(str)
LK['IdLandkreisStr'] = LK['IdLandkreisStr'].str.zfill(5)
LK.set_index(['IdLandkreisStr'], inplace=True, drop=True)
BL['IdBundeslandStr'] = BL['IdBundesland']
BL.set_index(['IdBundeslandStr'], inplace=True, drop=True)

# %% store json files
LK.to_json(LK_json_path, orient="index", date_format="iso", force_ascii=False)
BL.to_json(BL_json_path, orient="index", date_format="iso", force_ascii=False)

# %% limit files to the last 8 days
iso_date_re = '([0-9]{4})(-?)(1[0-2]|0[1-9])\\2(3[01]|0[1-9]|[12][0-9])'
file_list = os.listdir(path)
file_list.sort(reverse=False)
pattern = 'FixFallzahlen'
all_files = []
for file in file_list:
    file_path_full = os.path.join(path, file)
    if not os.path.isdir(file_path_full):
        filename = os.path.basename(file)
        re_filename = re.search(pattern, filename)
        re_search = re.search(iso_date_re, filename)
        if re_search and re_filename:
            report_date = date(int(re_search.group(1)), int(re_search.group(3)), int(re_search.group(4))).strftime('%Y-%m-%d')
            all_files.append((file_path_full, report_date))
day_range = pd.date_range(end=datetime.today(), periods=10).tolist()
day_range_str = []
for datum in day_range:
    day_range_str.append(datum.strftime('%Y-%m-%d'))
for file_path_full, report_date in all_files:
    if report_date not in day_range_str:
        os.remove(file_path_full)

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from . import DownloadFile
import os
import json

def download_RKI_COVID19_meta():
    meta_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'Fallzahlen')
    filename_meta = "RKI_COVID19_meta.json" 
    url_meta = "https://www.arcgis.com/sharing/rest/content/items/f10774f1c63e40168479a1feb6c7ca74?f=json"

    meta = DownloadFile(url=url_meta, filename=filename_meta, download_path=meta_path, compress=False, add_date=False, add_latest=False)
    meta.write_file()
    
    needed =["created", "modified", "name", "size"]

    with open(meta_path + "/" + filename_meta, 'r', encoding ='utf8') as file:
        metaObj = json.load(file)
    newObj = metaObj.copy()
    for property in newObj:
        if property not in needed:
            del metaObj[property]

    with open(meta_path + "/" + filename_meta, 'w', encoding ='utf8') as json_file:
        json.dump(metaObj, json_file, ensure_ascii = False)

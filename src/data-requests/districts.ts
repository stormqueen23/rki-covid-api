import axios from "axios";
import { getDateBefore, RKIError, parseDate, requireUncached } from "../utils";
import { ResponseData } from "./response-data";

export interface IDistrictData {
  ags: string;
  name: string;
  county: string;
  state: string;
  population: number;
  cases: number;
  deaths: number;
  casesPerWeek: number;
  deathsPerWeek: number;
  lastUpdated: number;
}

export async function getDistrictsData(): Promise<
  ResponseData<IDistrictData[]>
> {
  const response = await axios.get(
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=RS,GEN,EWZ,cases,deaths,county,last_update,cases7_lk,death7_lk,BL&returnGeometry=false&outSR=4326&f=json`
  );
  const data = response.data;
  if (data.error) {
    throw new RKIError(data.error, response.config.url);
  }
  const districts = data.features.map((feature) => {
    return {
      ags: feature.attributes.RS,
      name: feature.attributes.GEN,
      county: feature.attributes.county,
      state: feature.attributes.BL,
      population: feature.attributes.EWZ,
      cases: feature.attributes.cases,
      deaths: feature.attributes.deaths,
      casesPerWeek: feature.attributes.cases7_lk,
      deathsPerWeek: feature.attributes.death7_lk,
    };
  });
  return {
    data: districts,
    lastUpdate: parseDate(data.features[0].attributes.last_update),
  };
}

export async function getDistrictsRecoveredData(): Promise<
  ResponseData<{ ags: string; recovered: number }[]>
> {
  const data = requireUncached("../dataStore/accumulated/districts.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  const districts = data.map((ags) => {
    return {
      ags: ags.IdLandkreis,
      recovered: ags.recovered,
    };
  });
  return {
    data: districts,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getNewDistrictCases(): Promise<
  ResponseData<{ ags: string; cases: number }[]>
> {
  const data = requireUncached("../dataStore/new/districts.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  const districts = data.map((ags) => {
    return {
      ags: ags.IdLandkreis,
      cases: ags.cases,
    };
  });
  return {
    data: districts,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getNewDistrictDeaths(): Promise<
  ResponseData<{ ags: string; deaths: number }[]>
> {
  const data = requireUncached("../dataStore/new/districts.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  const districts = data.map((ags) => {
    return {
      ags: ags.IdLandkreis,
      deaths: ags.deaths,
    };
  });
  return {
    data: districts,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getNewDistrictRecovered(): Promise<
  ResponseData<{ ags: string; recovered: number }[]>
> {
  const data = requireUncached("../dataStore/new/districts.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  const districts = data.map((ags) => {
    return {
      ags: ags.IdLandkreis,
      recovered: ags.recovered,
    };
  });
  return {
    data: districts,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getLastDistrictCasesHistory(
  days?: number,
  ags?: string
): Promise<
  ResponseData<{ ags: string; name: string; cases: number; date: Date }[]>
> {
  const data = requireUncached("../dataStore/history/districts.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  let history: {
    ags: string;
    name: string;
    cases: number;
    date: Date;
  }[] = data.map((ags) => {
    return {
      ags: ags.IdLandkreis,
      name: ags.Landkreis,
      cases: ags.cases,
      date: new Date(ags.Meldedatum),
    };
  });
  if (days) {
    const reference_date = new Date(getDateBefore(days));
    history = history.filter((element) => element.date >= reference_date);
  }
  if (ags) {
    history = history.filter((element) => element.ags === ags);
  }
  return {
    data: history,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getLastDistrictDeathsHistory(
  days?: number,
  ags?: string
): Promise<
  ResponseData<{ ags: string; name: string; deaths: number; date: Date }[]>
> {
  const data = requireUncached("../dataStore/history/districts.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  let history: {
    ags: string;
    name: string;
    deaths: number;
    date: Date;
  }[] = data.map((ags) => {
    return {
      ags: ags.IdLandkreis,
      name: ags.Landkreis,
      deaths: ags.deaths,
      date: new Date(ags.Meldedatum),
    };
  });
  if (days) {
    const reference_date = new Date(getDateBefore(days));
    history = history.filter((element) => element.date >= reference_date);
  }
  if (ags) {
    history = history.filter((element) => element.ags === ags);
  }
  return {
    data: history,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getLastDistrictRecoveredHistory(
  days?: number,
  ags?: string
): Promise<
  ResponseData<{ ags: string; name: string; recovered: number; date: Date }[]>
> {
  const data = requireUncached("../dataStore/history/districts.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  let history: {
    ags: string;
    name: string;
    recovered: number;
    date: Date;
  }[] = data.map((ags) => {
    return {
      ags: ags.IdLandkreis,
      name: ags.Landkreis,
      recovered: ags.recovered,
      date: new Date(ags.Meldedatum),
    };
  });
  if (days) {
    const reference_date = new Date(getDateBefore(days));
    history = history.filter((element) => element.date >= reference_date);
  }
  if (ags) {
    history = history.filter((element) => element.ags === ags);
  }
  return {
    data: history,
    lastUpdate: new Date(meta.modified),
  };
}

import axios from "axios";
import { ResponseData } from "./response-data";
import {
  getDateBefore,
  RKIError,
  requireUncached,
} from "../utils";

export async function getCases(): Promise<ResponseData<number>> {
  const data = requireUncached("../dataStore/accumulated/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  return {
    data: data[0].cases,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getNewCases(): Promise<ResponseData<number>> {
  const data = requireUncached("../dataStore/new/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  return {
    data: data[0].cases,
    lastUpdate: new Date (meta.modified),
  };
}

export async function getLastCasesHistory(
  days?: number
): Promise<{ history: { cases: number; date: Date }[]; lastUpdate: Date }> {
  const data = requireUncached("../dataStore/history/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  let history = data.map((state) => {
    return {
      cases: state.cases,
      date: new Date(state.date),
    };
  });
  history = history.filter((state) => state.id == 0);
  if (days) {
    const reference_date = new Date(getDateBefore(days));
    history = history.filter((dates) => dates.date >= reference_date);
  }  
  return {
    history: history,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getLastDeathsHistory(
  days?: number
): Promise<{ history: { deaths: number; date: Date }[]; lastUpdate: Date }> {
  const data = requireUncached("../dataStore/history/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  let history = data.map((state) => {
    return {
      deaths: state.deaths,
      date: new Date(state.date),
    };
  });
  history = history.filter((state) => state.id == 0);
  if (days) {
    const reference_date = new Date(getDateBefore(days));
    history = history.filter((dates) => dates.date >= reference_date);
  }
  return {
    history: history,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getLastRecoveredHistory(
  days?: number
): Promise<{ history: { recovered: number; date: Date }[]; lastUpdate: Date }> {
  const data = requireUncached("../dataStore/history/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  let history = data.map((state) => {
    return {
      recovered: state.recovered,
      date: new Date(state.date),
    };
  });
  history = history.filter((state) => state.id == 0);
  if (days) {
    const reference_date = new Date(getDateBefore(days));
    history = history.filter((dates) => dates.date >= reference_date);
  }
  return {
    history: history,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getDeaths(): Promise<ResponseData<number>> {
  const data = requireUncached("../dataStore/accumulated/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  return {
    data: data[0].deaths,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getNewDeaths(): Promise<ResponseData<number>> {
  const data = requireUncached("../dataStore/new/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  return {
    data: data[0].deaths,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getRecovered(): Promise<ResponseData<number>> {
  const data = requireUncached("../dataStore/recoveredData/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  return {
    data: data[0].recovered,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getNewRecovered(): Promise<ResponseData<number>> {
  const data = requireUncached("../dataStore/new/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  return {
    data: data[0].recovered,
    lastUpdate: new Date(meta.modified),
  };
}

export interface AgeGroupData {
  casesMale: string;
  casesFemale: string;
  deathsMale: string;
  deathsFemale: string;
  casesMalePer100k: string;
  casesFemalePer100k: string;
  deathsMalePer100k: string;
  deathsFemalePer100k: string;
}

export async function getGermanyAgeGroups(): Promise<
  ResponseData<{ [ageGroup: string]: AgeGroupData }>
> {
  const response = await axios.get(
    "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/rki_altersgruppen_hubv/FeatureServer/0/query?where=BundeslandId=0&outFields=*&outSR=4326&f=json"
  );
  const data = response.data;
  if (data.error) {
    throw new RKIError(data.error, response.config.url);
  }
  const lastModified = response.headers["last-modified"];
  const lastUpdate = lastModified != null ? new Date(lastModified) : new Date();

  let germany_data: { [ageGroup: string]: AgeGroupData } = {};
  data.features.forEach((feature) => {
    // germany has BundeslandId=0
    if (feature.attributes.BundeslandId === 0) {
      germany_data[feature.attributes.Altersgruppe] = {
        casesMale: feature.attributes.AnzFallM,
        casesFemale: feature.attributes.AnzFallW,
        deathsMale: feature.attributes.AnzTodesfallM,
        deathsFemale: feature.attributes.AnzTodesfallW,
        casesMalePer100k: feature.attributes.AnzFall100kM,
        casesFemalePer100k: feature.attributes.AnzFall100kW,
        deathsMalePer100k: feature.attributes.AnzTodesfall100kM,
        deathsFemalePer100k: feature.attributes.AnzTodesfall100kW,
      };
    }
  });

  return {
    data: germany_data,
    lastUpdate,
  };
}

import axios from "axios";
import {
  getDateBefore,
  getStateAbbreviationById,
  RKIError,
  requireUncached,
} from "../utils";
import { ResponseData } from "./response-data";

export interface IStateData {
  id: number;
  name: string;
  population: number;
  cases: number;
  deaths: number;
  casesPerWeek: number;
  deathsPerWeek: number;
  lastUpdated: number;
}

export async function getStatesData(): Promise<ResponseData<IStateData[]>> {
  const response = await axios.get(
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronafälle_in_den_Bundesländern/FeatureServer/0/query?where=1%3D1&outFields=LAN_ew_EWZ,LAN_ew_AGS,Fallzahl,Aktualisierung,Death,cases7_bl,death7_bl,LAN_ew_GEN&returnGeometry=false&outSR=4326&f=json`
  );
  const data = response.data;
  if (data.error) {
    throw new RKIError(data.error, response.config.url);
  }
  const states = data.features.map((feature) => {
    return {
      id: parseInt(feature.attributes.LAN_ew_AGS),
      name: feature.attributes.LAN_ew_GEN,
      population: feature.attributes.LAN_ew_EWZ,
      cases: feature.attributes.Fallzahl,
      deaths: feature.attributes.Death,
      casesPerWeek: feature.attributes.cases7_bl,
      deathsPerWeek: feature.attributes.death7_bl,
    };
  });
  return {
    data: states,
    lastUpdate: new Date(
      data.features[0].attributes.Aktualisierung + 60 * 60 * 1000
    ),
  };
}

export async function getStatesRecoveredData(): Promise<
  ResponseData<{ id: number; recovered: number }[]>
> {
  const data = requireUncached(
    "../dataStore/accumulated/states.json"
  );
  const meta = requireUncached("../dataStore/meta/meta.json");
  const states = data.map((state) => {
    return {
      id: state.IdBundesland,
      recovered: state.recovered,
    };
  });
  return {
    data: states,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getNewStateRecovered(): Promise<
  ResponseData<{ id: number; recovered: number }[]>
> {
  const data = requireUncached("../dataStore/new/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  const states = data.map((state) => {
    return {
      id: state.IdBundesland,
      recovered: state.recovered,
    };
  });
  return {
    data: states,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getNewStateCases(): Promise<
  ResponseData<{ id: number; cases: number }[]>
> {
  const data = requireUncached("../dataStore/new/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  const states = data.map((state) => {
    return {
      id: state.IdBundesland,
      cases: state.cases,
    };
  });
  return {
    data: states,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getNewStateDeaths(): Promise<
  ResponseData<{ id: number; deaths: number }[]>
> {
  const data = requireUncached("../dataStore/new/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  const states = data.map((state) => {
    return {
      id: state.IdBundesland,
      deaths: state.deaths,
    };
  });
  return {
    data: states,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getLastStateCasesHistory(
  days?: number,
  id?: number
): Promise<
  ResponseData<{ id: number; name: string; cases: number; date: Date }[]>
> {
  const data = requireUncached("../dataStore/history/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  let history: {
    id: number;
    name: string;
    cases: number;
    date: Date;
  }[] = data.map((state) => {
    return {
      id: parseInt(state.IdBundesland),
      name: state.Bundesland,
      cases: state.cases,
      date: new Date(state.Meldedatum),
    };
  });
  if (days) {
    const reference_date = new Date(getDateBefore(days));
    history = history.filter((element) => element.date >= reference_date);
  }
  if (id) {
    history = history.filter((element) => element.id === id);
  } else {
    history = history.filter((element) => element.id != 0);
  }
  return {
    data: history,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getLastStateDeathsHistory(
  days?: number,
  id?: number
): Promise<
  ResponseData<{ id: number; name: string; deaths: number; date: Date }[]>
> {
  const data = requireUncached("../dataStore/history/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  let history: {
    id: number;
    name: string;
    deaths: number;
    date: Date;
  }[] = data.map((state) => {
    return {
      id: parseInt(state.IdBundesland),
      name: state.Bundesland,
      deaths: state.deaths,
      date: new Date(state.Meldedatum),
    };
  });
  if (days) {
    const reference_date = new Date(getDateBefore(days));
    history = history.filter((element) => element.date >= reference_date);
  }
  if (id) {
    history = history.filter((element) => element.id === id);
  } else {
    history = history.filter((element) => element.id != 0);
  }
  return {
    data: history,
    lastUpdate: new Date(meta.modified),
  };
}

export async function getLastStateRecoveredHistory(
  days?: number,
  id?: number
): Promise<
  ResponseData<{ id: number; name: string; recovered: number; date: Date }[]>
> {
  const data = requireUncached("../dataStore/history/states.json");
  const meta = requireUncached("../dataStore/meta/meta.json");
  let history: {
    id: number;
    name: string;
    recovered: number;
    date: Date;
  }[] = data.map((state) => {
    return {
      id: parseInt(state.IdBundesland),
      name: state.Bundesland,
      recovered: state.recovered,
      date: new Date(state.Meldedatum),
    };
  });
  if (days) {
    const reference_date = new Date(getDateBefore(days));
    history = history.filter((element) => element.date >= reference_date);
  }
  if (id) {
    history = history.filter((element) => element.id === id);
  } else {
    history = history.filter((element) => element.id != 0);
  }
  return {
    data: history,
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

export interface AgeGroupsData {
  [key: string]: {
    [key: string]: AgeGroupData;
  };
}

export async function getStatesAgeGroups(
  id?: number
): Promise<ResponseData<AgeGroupsData>> {
  const response = await axios.get(
    "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/rki_altersgruppen_hubv/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"
  );
  const data = response.data;
  if (data.error) {
    throw new RKIError(data.error, response.config.url);
  }
  const lastModified = response.headers["last-modified"];
  const lastUpdate = lastModified != null ? new Date(lastModified) : new Date();

  const states: AgeGroupsData = {};
  data.features.forEach((feature) => {
    if (!feature.attributes.BundeslandId) return;
    if (id && feature.attributes.BundeslandId != id) return;
    const abbreviation = getStateAbbreviationById(
      feature.attributes.BundeslandId
    );
    if (!states[abbreviation]) states[abbreviation] = {};
    states[abbreviation][feature.attributes.Altersgruppe] = {
      casesMale: feature.attributes.AnzFallM,
      casesFemale: feature.attributes.AnzFallW,
      deathsMale: feature.attributes.AnzTodesfallM,
      deathsFemale: feature.attributes.AnzTodesfallW,
      casesMalePer100k: feature.attributes.AnzFall100kM,
      casesFemalePer100k: feature.attributes.AnzFall100kW,
      deathsMalePer100k: feature.attributes.AnzTodesfall100kM,
      deathsFemalePer100k: feature.attributes.AnzTodesfall100kW,
    };
  });

  return {
    data: states,
    lastUpdate,
  };
}

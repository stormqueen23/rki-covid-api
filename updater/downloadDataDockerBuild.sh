#!/bin/bash

# date of last monday
lastMonday=$(date -dlast-monday +%Y-%m-%d)

# rubber1duck has daily created json files 
SOURCE="https://raw.githubusercontent.com/Rubber1Duck/RD_RKI_COVID19_DATA/master"
URL_METADATA="https://raw.githubusercontent.com/Rubber1Duck/RD_RKI_COVID19_DATA/master/Fallzahlen/RKI_COVID19_meta.json"

# set maxDate to last modified date from rubber1ducks meta data 
maxDate=$(curl -s -X GET -H "Accept: application/json" "$URL_METADATA" 2>&1 | sed -E 's/.*"modified": ([0-9]+)000.*/\1/')
if [ $? -ne 0 ]; then
  echo "unable to get RKI_COVID19_meta.json"
  exit 1
fi
maxDate=$(date -d "@$maxDate" '+%Y-%m-%d')
maxDate=$(date -I -d "$maxDate + 1 day")

# set startDate to lastMonday
startDate=$lastMonday
while [[ "$startDate" != "$maxDate" ]]; do
  # get BL and LK JSON files for the date, store it in ./Fallzahlen/frozen-incidence, print message
  wget -q "$SOURCE/Fallzahlen/FixFallzahlen_"$startDate"_BL.json" -O "./dataStore/frozen-incidence/frozen-incidence_"$startDate"_BL.json"
  if [ $? -ne 0 ]; then
    echo "unable to get ./Fallzahlen/FixFallzahlen_"$startDate"_BL.json, try again later and rebuild the docker image!"
    exit 1
  else 
    echo "./dataStore/frozen-incidence/frozen-incidence_"$startDate"_BL.json saved"
  fi
  wget -q "$SOURCE/Fallzahlen/FixFallzahlen_"$startDate"_LK.json" -O "./dataStore/frozen-incidence/frozen-incidence_"$startDate"_LK.json"
  if [ $? -ne 0 ]; then
    echo "unable to get ./Fallzahlen/FixFallzahlen_"$startDate"_LK.json, try again later and rebuild the docker image!"
    exit 1
  else 
    echo "./dataStore/frozen-incidence/frozen-incidence_"$startDate"_LK.json saved"
  fi
  # increase startDate by 1 day
  startDate=$(date -I -d "$startDate + 1 day")
done
# finaly get meta data as well, stored in ./Fallzahlen/
wget -q "$URL_METADATA" -O "./dataStore/meta/meta.json"
if [ $? -ne 0 ]; then
  echo "unable to get ./Fallzahlen/RKI_COVID19_meta.json, try again later and rebuild the docker image!"
  exit 1
else 
  echo "./dataStore/meta/meta.json saved"
fi
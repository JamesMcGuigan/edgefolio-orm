#!/usr/bin/env bash

cd $(dirname "$0")
THIS_DIR=`pwd`

mkdir -p ./dist;
OUTPUT_FILES=`node -e 'console.log(Object.keys(require("./edgefolio-models-includes.json")).join("\n"))'`

for OUTPUT_FILE in $OUTPUT_FILES; do
  CODE_FILES=`node -e 'console.log(require("./edgefolio-models-includes.json")["'$OUTPUT_FILE'"].join("\n"))'`

  rm dist/$OUTPUT_FILE.js dist/$OUTPUT_FILE.min.js

  echo "//***** built: `date -R` *****//" > dist/$OUTPUT_FILE.js
  for CODE_FILE in $CODE_FILES; do
    echo "//***** $CODE_FILE *****//" >> dist/$OUTPUT_FILE.js
    cat  $CODE_FILE >> dist/$OUTPUT_FILE.js
    echo ";" >> dist/$OUTPUT_FILE.js
    echo     >> dist/$OUTPUT_FILE.js
  done;
  uglifyjs dist/$OUTPUT_FILE.js > dist/$OUTPUT_FILE.min.js

  echo Wrote dist/$OUTPUT_FILE.js
  echo Wrote dist/$OUTPUT_FILE.min.js

done;

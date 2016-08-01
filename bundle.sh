#!/usr/bin/env bash

cd $(dirname "$0")
THIS_DIR=`pwd`

mkdir -p ./dist;
LIB_FILES=`node -e 'console.log(require("./edgefolio-models-includes.json").libs.join("\n"))'`
CODE_FILES=`node -e 'console.log(require("./edgefolio-models-includes.json").code.join("\n"))'`

rm dist/edgefolio-models.js dist/edgefolio-models.min.js

echo "//***** built: `date -R` *****//" > dist/edgefolio-models.js
for CODE_FILE in $CODE_FILES; do
  echo "//***** $CODE_FILE *****//" >> dist/edgefolio-models.js
  cat  $CODE_FILE >> dist/edgefolio-models.js
  echo ";" >> dist/edgefolio-models.js
  echo     >> dist/edgefolio-models.js
done;
uglifyjs dist/edgefolio-models.js > dist/edgefolio-models.min.js

echo Wrote dist/edgefolio-models.js
echo Wrote dist/edgefolio-models.min.js

#!/usr/bin/env bash -x

cd $(dirname "$0")
THIS_DIR=`pwd`

cd ../../
bower install simple-statistics

cd libs/bower_components/simple-statistics/
npm install
npm run bundle

cp dist/simple-statistics.js ${THIS_DIR}

echo wrote ${THIS_DIR}/simple-statistics.js

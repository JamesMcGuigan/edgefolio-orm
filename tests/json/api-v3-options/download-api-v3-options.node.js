#!/usr/bin/env node

var _      = require('lodash');
var fs     = require('fs');
var asyncQ = require('async-q');
var yargs  = require('yargs');
var requestPromise = require('request-promise');

yargs.default('raw', false);  // gulp test --chrome=0 to disable

var apiSchema = {
  "indexes": "https://v3.edgefolio.com/api/indexes/",
  "funds": "https://v3.edgefolio.com/api/funds/",
  "share-classes": "https://v3.edgefolio.com/api/share-classes/",
  "management-companies": "https://v3.edgefolio.com/api/management-companies/",
  "investment-companies": "https://v3.edgefolio.com/api/investment-companies/",
  "service-providers": "https://v3.edgefolio.com/api/service-providers/",
  "managers": "https://v3.edgefolio.com/api/managers/",
  "investors": "https://v3.edgefolio.com/api/investors/",
  "user-fund-search-queries": "https://v3.edgefolio.com/api/user/fund-search-queries/",
  "user-fund-groups": "https://v3.edgefolio.com/api/user/fund-groups/",
  "user-notifications": "https://v3.edgefolio.com/api/user/notifications/"
};
var apiToken = require('../../../../_secret/secretApiTokens.js')["https://v3.edgefolio.com"].token;


_.map(apiSchema, function(url, name) {
  return requestPromise({
    uri:     url,
    method: 'OPTIONS',
    headers: {
      'authorization': apiToken
    },
    json: true,
    transform: function(json) {
      if( yargs.argv.raw ) { return json; }
      return recursiveFilterChildrenAndData(json);
    }
  })
  .then(function(json) {
    var filename = __dirname + '/' + name + (yargs.argv.raw ? '.raw' : '') + '.json';
    fs.writeFileSync(filename, JSON.stringify(json, null, 2));

    console.log("download-api-v3-options.node.js", "DOWNLOADED", name, url, filename);
  })
  .catch(function(error) {
    console.log("download-api-v3-options.node.js", "FAILED", name, url, error);
  })
});


function recursiveFilterChildrenAndData(value) {
  if( typeof value === 'object' && !Array.isArray(value) ) {
    // Filter out DB data in the form of { type: 'field', choices: [] }
    if( value['type'] === 'field' ) {
      if( Array.isArray(value['choices']) ) {
        value['choices'] = [];
      }
      if( _.get(value, 'child.type') === 'nested object' && typeof _.get(value, 'child.children') === 'object' ) {
        _.set(value, 'child.children', {})
      }
    }
    return _.mapValues(value, recursiveFilterChildrenAndData);
  } else {
    return value;
  }
}

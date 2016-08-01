#!/usr/bin/env node

var _      = require('lodash');
var fs     = require('fs');
var asyncQ = require('async-q');
var yargs  = require('yargs');
var requestPromise = require('request-promise');

yargs.default('v2', true);
yargs.default('v3', true);

var apiSchema = {
  v2: {
    host:      "https://edgefolio-development.com",
    filename:  "edgefolio-api-v2.json",
    postfixes: ['','cache/'],
    headers: {
      results: {
        Authorization:  require(__dirname + '/../../../src/_secret/secretApiTokens.js')["https://edgefolio-development.com"].token
      },
      session: {
        Cookie: 'sessionid=k6w4g3dmvd0drqkqzrse034f9r8myqsg' // need to manually refresh this token
      }
    },
    results: {
      "computed-measures": "/api/computed-measures/",
      "indexes": "/api/indexes/",
      "funds": "/api/hedge-funds/",
      "share-classes": "/api/share-classes/",
      "management-companies": "/api/management-companies/",
      "people": "/api/people/",
      "service-providers": "/api/service-providers/"
    },
    session: {
      "user": "/api/user/",
      "user-notifications": "/api/user/notifications/"
    }
  },
  "v3": {
    host:     "https://v3.edgefolio.com",
    filename: "edgefolio-api-v3.json",
    headers: {
      results: {
        Authorization:  require(__dirname + '/../../../src/_secret/secretApiTokens.js')["https://v3.edgefolio.com"].token
      },
      session: {
        Cookie: 'sessionid=4w0b9dfclipzw0jbh5mj2qoxvyyaz1y4' // need to manually refresh this token
      }
    },
    results: {
      "indexes": "/api/indexes/",
      "funds": "/api/funds/",
      "share-classes": "/api/share-classes/",
      "management-companies": "/api/management-companies/",
      "investment-companies": "/api/investment-companies/",
      "service-providers": "/api/service-providers/",
      "managers": "/api/managers/",
      "investors": "/api/investors/",

      "funds-17": "/api/funds/17/",
      "share-classes-1233": "/api/share-classes/1233/"
    },
    session: {
      "user": "/api/user/",
      "user-fund-search-queries": "/api/user/fund-search-queries/",
      //"user-fund-groups": "/api/user/fund-groups/",
      "user-notifications": "/api/user/notifications/"
    }
  }
};

var promises = [];
var outputJson = {};
var promisesComplete = 0;

_.forIn(apiSchema, function(schema, schemaLabel) {
  outputJson[schemaLabel] = {};

  _.each(['session','results'], function(requestType) {
    _.forIn(schema[requestType], function(url, urlLabel) {
      var fullUrl = schema.host + url;
      var request = {
        uri:       fullUrl,
        method:    'GET',
        headers:   schema.headers[requestType],
        strictSSL: false,
        json:      !!(requestType === 'results') // /api/user endpoints error with { json: true }
      };
      promises.push(
        requestPromise(_.cloneDeep(request))
        .then(function(json) {
          if( typeof json === 'string' ) { json = JSON.parse(json); }

          if( !json || String(json.detail).match('Authentication credentials were not provided') ) {
            console.warn("download-api-v3-options.node.js", "INVALID JSON", schemaLabel, fullUrl, request, json);
            return;
          }

          outputJson[schemaLabel][url] = json;

          if( Array.isArray(json.results) ) {
            if( json.results.length ) {
              _.each(json.results, function(result) {
                if( result.id ) {
                  _.each(schema.postfixes || [''], function(postfix) {
                    outputJson[schemaLabel][url + result.id + '/' + postfix] = result;
                  })
                }
              });
            } else {
              console.info("download-api-v3-options.node.js", "WARN", schemaLabel, fullUrl, " - json.results: ", json.results);
            }
          }

          console.info("download-api-v3-options.node.js", "DOWNLOADED", schemaLabel, fullUrl);
        })
        ["catch"](function(error) {
          console.error("download-api-v3-options.node.js", "FAILED", schemaLabel, request, error);
        })
        ["finally"](function() {
          // BUG: asyncQ.each not waiting for all promises to complete
          promisesComplete++;
          if( promisesComplete === promises.length ) {
            writeFiles()
          }
        })
      )
    })
  });
});


function writeFiles() {
  _.forIn(apiSchema, function(schema, schemaLabel) {
    if( _.keys(outputJson[schemaLabel]).length ) {
      var filename = __dirname + "/" + schema.filename;
      fs.writeFileSync(filename, JSON.stringify(outputJson[schemaLabel], null, 2));
      console.info("download-api-v3-options.node.js", "WROTE", schema.filename);
    } else {
      console.error("download-api-v3-options.node.js", "NO DATA", schema.filename);
    }
  })
}




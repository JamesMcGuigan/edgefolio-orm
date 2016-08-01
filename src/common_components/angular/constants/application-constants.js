angular.module('edgefolio.constants.application', [
  'edgefolio.constants'
])
.provider('CONST', function() {
  this.$get = function(AggregationDefinitions, Colors, TimeframeDefinitions) {
    return {
      ANALYTICS_AGGREGATIONS: _.values(AggregationDefinitions),
      TIMEFRAME: TimeframeDefinitions,

      MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

      // paths
      MAX_GRAPH_POINTS:   5000,
      ADD_TO_GROUP_LIMIT:  100,

      PROFILE_PATH:   '/hedge-funds',
      DASHBOARD_PATH: '/dashboard',
      SEARCH_PATH:    '/search',

      PAGE_LISTING: 25,
      KEYWORD_PLACE_HOLDER: [
        'try a fund\'s name',
        'try a fund manager\'s name',
        'try a management company\'s name',
        'look through funds strategies',
        'try a service provider\'s name',
        'try a fund or manager\'s domicile'
      ],
      STRATEGY: [
        'U.S. Long/Short Equity',
        'U.S. Small Cap Long/Short Equity',
        'Asia/Pacific Long/Short Equity',
        'Europe Long/Short Equity',
        'Emerging Markets Long/Short Equity',
        'Global Long/Short Equity',
        'Bear Market Equity',
        'Long/Short Debt',
        'Convertible Arbitrage',
        'Equity Market Neutral',
        'Debt Arbitrage',
        'Systematic Futures',
        'Global Macro',
        'Distressed Securities',
        'Event Driven',
        'Multistrategy',
        'China Long/Short Equity',
        'Currency',
        'Diversified Arbitrage',
        'Merger Arbitrage',
        'Volatility',
        'Long-Only Debt',
        'Emerging Markets Long-Only Equity',
        'Long-Only Equity',
        'Long-Only Other'
      ],

      MAPSTYLE: [
        { featureType:'water',                   elementType: 'all',      stylers: [{ hue:   '#daeffe' }, { saturation:  -50 }, { lightness:  50 }, { visibility:'simplified' }] },
        { featureType:'landscape',               elementType: 'all',      stylers: [{ hue:   '#ffffff' }, { saturation: -100 }, { lightness: 100 }, { visibility:'simplified' }] },
        { featureType:'poi',                     elementType: 'all',      stylers: [{ hue:   '#ffffff' }, { saturation: -100 }, { lightness: 100 }, { visibility:'off'        }] },
        { featureType: 'poi.park',               elementType: 'geometry', stylers: [{ color: '#cdfbd9' }, { saturation:  -20 }, { lightness:  20 }, { visibility:'simplified' }] },
        { featureType:'transit',                 elementType: 'all',      stylers: [{ hue:   '#ffe9e9' }, { saturation:    0 }, { lightness:   0 }, { visibility:'on'         }] },
        { featureType:'administrative.country',  elementType: 'labels',   stylers: [{ color: '#d4d6da' }, { saturation:    0 }, { lightness: -20 }, { visibility:'simplified' }] },
        { featureType:'administrative.country',  elementType: 'geometry', stylers: [{ color: '#d4d6da' }, { saturation:    0 }, { lightness:   0 }, { visibility:'on'         }] },
        { featureType:'administrative.locality', elementType: 'all',      stylers: [{ color: '#d4d6da' }, { saturation:    0 }, { lightness: -20 }, { visibility:'simplified' }] },
        { featureType:'road',                    elementType: 'geometry', stylers: [{ color: '#d4d6da' }, { saturation:  -90 }, { lightness:  70 }, { visibility:'simplified' }] },
        { featureType:'road',                    elementType: 'labels',   stylers: [{ hue:   '#d4d6da' }, { saturation:  -90 }, { lightness:  60 }, { visibility:'simplified' }] }
      ],
      getPath: function( flow, form ) {
        return form.path;
        // if( form.source ) {
        // return '/' + flow.type + form.source.replace(/<BASE_PATH>/, '/');//.replace(/\:(.*?)\?\//g, '');
        // }
      }


      // @unused
      //BASE_APP_PATH: '/',
      //'STRATEGY_DESCRIPTION_LENGTH' : 1500,
      //PROFILE_TYPES: [ 'Dynamic (manager owned)', 'Static (from database)' ],
      //GROUPS_PATH: '/groups', // @unused
      //DEBUG: false,
      //REQUEST_MORE_INFO_CHOICES: [
      //  {
      //    value: 'report',
      //    trackingID: 'DDQ',
      //    name: 'Request a DDQ report'
      //  },
      //  {
      //    value: 'meeting',
      //    trackingID: 'meeting',
      //    name: 'Request a meeting'
      //  },
      //  {
      //    value: 'newsletter',
      //    trackingID: 'newsletter',
      //    name: 'Receive monthly newsletter'
      //  }
      //],
      //INVESTOR_TYPES: [
      //  { value: 'AssetManager',             name: 'Asset Manager' },
      //  { value: 'Bank',                     name: 'Bank' },
      //  { value: 'EndowmentPlan',            name: 'Endowment Plan' },
      //  { value: 'FamilyOffice',             name: 'Family Office' },
      //  { value: 'Foundation',               name: 'Foundation' },
      //  { value: 'FundOfHedgeFundsManager',  name: 'Fund of Hedge Funds Manager' },
      //  { value: 'InsuranceCompany',         name: 'Insurance Company' },
      //  { value: 'InvestmentCompany',        name: 'Investment Company' },
      //  { value: 'PrivateSectorPensionFund', name: 'Private Sector Pension Fund' },
      //  { value: 'PublicPensionFund',        name: 'Public Pension Fund' },
      //  { value: 'SovereignWealthFund',      name: 'Sovereign Wealth Fund' },
      //  { value: 'SupperannuationScheme',    name: 'Superannuation Scheme' },
      //  { value: 'WealthManager',            name: 'Wealth Manager' },
      //  { value: 'Other',                    name: 'Other' }
      //],
      //COUNTRIES: [
      //  {value:'USA', name:'United States'},
      //  {value:'GBR', name:'United Kingdom'},
      //  {value:'CHE', name:'Switzerland'},
      //  {value:'CAN', name:'Canada'},
      //  {value:'CHN', name:'China'},
      //  {value:'JPN', name:'Japan'},
      //  {value:'SGP', name:'Singapore'},
      //  {value:'ARE', name:'United Arab Emirates'},
      //  {value:'RUS', name:'Russia'},
      //  {value:'DEU', name:'Germany'},
      //  {value:'FRA', name:'France'},
      //  {value:'ITA', name:'Italy'},
      //  {value:'AUS', name:'Australia'},
      //  {value:'BRA', name:'Brazil'},
      //  {value:'MEX', name:'Mexico'},
      //  {value:'NOR', name:'Norway'},
      //  {value:'SWE', name:'Sweden'},
      //  {value:'DNK', name:'Denmark'},
      //  {value:'AME', name:'Other: Americas'},
      //  {value:'EUR', name:'Other: Europe'},
      //  {value:'ASI', name:'Other: Asia'},
      //  {value:'AFR', name:'Other: Africa'}
      //],
      //KINDS: [
      //  {
      //    value: 'Investor',
      //    name:  'Investor',
      //    label: 'I am an'
      //  },
      //  {
      //    value: 'HedgeFundManager',
      //    name:  'Manager',
      //    label: 'I am a'
      //  },
      //  {
      //    value: 'ServiceProvider',
      //    name:  'Agent',
      //    label: 'I am an'
      //  }
      //],
    }
  }
});

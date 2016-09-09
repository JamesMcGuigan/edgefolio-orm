//***** built: Fri, 09 Sep 2016 03:22:28 +0100 *****//
//***** src/_global/array_simplestatistics.js *****//
/**
 *  Add simplestatistics array methods to Array.prototype and lodash
 *  http://simplestatistics.org/docs/
 */
if( typeof ss !== "undefined" ) {
  ss.mixin(ss); // Add simplestatistics array methods to Array.prototype

  // Mixin simplestatistics arrayMethods to lodash without overwrite
  if( typeof _ !== "undefined" ) {
    _.mixin(
      _(ss).pick([
        // arrayMethods from libs/bower_components/simple-statistics/src/mixin.js
        'median', 'standardDeviation', 'sum', 'product',
        'sampleSkewness',
        'mean', 'min', 'max', 'quantile', 'geometricMean',
        'harmonicMean', 'root_mean_square'
      ])
      .omit(_.keys(_.prototype))
      .value()
    );
  }
}
;

//***** src/_global/moment_toString.js *****//
/**
 *  moment().toISOString() generates sortable strings suitable for use in object hashes
 *  @memoized - profiler indicates that moment().toString() in DateBucket is very expensive, so cache this function
 */
if( typeof moment !== "undefined" ) {
  moment.defaultFormat = "YYYY-MM-DD\\THH:mm:ss.SSS\\Z"; // only affects moment().format() and not .toString()
  moment.tz.setDefault("UTC");                           // prevent .toString() from outputting in localtime

  if( !moment.prototype._toString ) {
    moment.prototype._toString      = moment.prototype.toString;
    moment.prototype._toISOString   = moment.prototype.toISOString;
    moment._toISOStringCache = {};

    moment.prototype.toString = moment.prototype.toISOString = function() {
      var cache_key = Number(this);
      if( !moment._toISOStringCache[cache_key] ) {
        moment._toISOStringCache[cache_key] = this._toISOString()
      }
      return moment._toISOStringCache[cache_key];
    }
  }
}
;

//***** src/models/_models.module.js *****//
angular.module('edgefolio.models', [
  'edgefolio.constants'
]);

angular.module('edgefolio.models').value('_',          window._ );
angular.module('edgefolio.models').value('$',          window.$ );
angular.module('edgefolio.models').value('JS',         window.JS );
angular.module('edgefolio.models').value('moment',     window.moment);
angular.module('edgefolio.models').value('kurtosis',   require("compute-kurtosis"));
angular.module('edgefolio.models').value('covariance', require("compute-covariance"));

// Assumes presence of:
// - src/common_components/global/moment_toString.js:         moment.prototype.toString = moment.prototype.toISOString
// - src/common_components/global/array_simplestatistics.js:  array.prototype += ss.prototype[arrayFunctions]
;

//***** src/widgets/_widgets.module.js *****//
angular.module('edgefolio.enterprise.widgets', [
  'edgefolio.enterprise.widgets.documentation',
  'edgefolio.enterprise.widgets.edgefolioStatisticsTable',
  'edgefolio.enterprise.widgets.selectbox',
  'edgefolio.enterprise.widgets.timeframeSelector',
  'edgefolio.enterprise.widgets.timeseriesTable',
  'edgefolio.enterprise.widgets.fundgroupMenu'
]);
;

//***** src/constants/_constants.module.js *****//
angular.module('edgefolio.constants', [
  'edgefolio.constants.AggregationDefinitions',
  'edgefolio.constants.CountryCodes',
  'edgefolio.constants.CurrencySymbolMap',
  'edgefolio.constants.HttpStatusCodes',
  'edgefolio.constants.KeyCodes',
  'edgefolio.constants.LegalStructures',
  'edgefolio.constants.TimeframeDefinitions'
]);
;

//***** src/constants/AggregationDefinitions.js *****//
angular.module('edgefolio.constants.AggregationDefinitions', [])
.constant('AggregationDefinitions', {
  annualized_alpha: {
    'id': 'annualized_alpha',
    'name': 'Alpha (Annualized)*',
    'shortName': 'Alpha*',
    'unit': '%'
  },
  beta: {
    'id': 'beta',
    'name': 'Beta*',
    'shortName': 'Beta*',
    'negative': function() {
      return false;
    }
  },
  annualized_compounded_return: {
    'id': 'annualized_compounded_return',
    'name': 'Compounded Return (Annualized)',
    'benchmark_id': 'benchmark_annualized_compounded_return',
    'shortName': 'CAGR',
    'unit': '%'
  },
  annualized_compounded_excess_return: {
    'id': 'annualized_compounded_excess_return',
    'name': 'Compounded Excess Return (Annualized)',
    'shortName': 'Excess',
    'unit': '%'
  },
  annualized_volatility: {
    'id': 'annualized_volatility',
    'name': 'Volatility (Annualized)',
    'benchmark_id': 'benchmark_annualized_volatility',
    'shortName': 'Vol.',
    'unit': '%',
    'negative': function(value) {
      if( value > 15 ) {
        return true;
      }
    }
  },
  maximum_drawdown: {
    'id': 'maximum_drawdown',
    'name': 'Maximum Drawdown',
    'benchmark_id': 'benchmark_maximum_drawdown',
    'shortName': 'Max DD',
    'unit': '%',
    'negative': function(value) {
      if( Math.abs(value) > 20 ) {
        return true;
      }
    }
  },
  annualized_sharpe_ratio: {
    'id': 'annualized_sharpe_ratio',
    'name': 'Sharpe Ratio (Annualized)*',
    'shortName': 'Sharpe*',
    'negative': function() {
      return false;
    }
  },
  annualized_sortino_ratio: {
    'id': 'annualized_sortino_ratio',
    'name': 'Sortino Ratio (Annualized)*',
    'shortName': 'Sortino',
    'negative': function() {
      return false;
    }
  },
  correlation_coefficient: {
    'id': 'correlation_coefficient',
    'name': 'Correlation Coefficient',
    'shortName': 'Correlation',
    'unit': '%',
    'negative': function() {
      return false;
    }
  },
  expected_return: {
    'id': 'expected_return',
    'name': 'Expected Return',
    'benchmark_id': 'benchmark_expected_return',
    'shortName': 'Exp. Return',
    'unit': '%',
    'transformValue': function(value) {
      return (Math.pow((1.0 + value / 100), 12.0) - 1.0) * 100.0;
    }
  },
  skewness_risk: {
    'id': 'skewness_risk',
    'name': 'Skewness Risk',
    'benchmark_id': 'benchmark_skewness_risk',
    'shortName': 'Skewness',
    'negative': function(value) {
      if( Math.abs(value) > 0.8 ) {
        return true;
      }
    }
  },
  kurtosis_risk: {
    'id': 'kurtosis_risk',
    'name': 'Kurtosis Risk',
    'shortName': 'Kurtosis',
    'benchmark_id': 'benchmark_kurtosis_risk',
    'negative': function(value) {
      if( Math.abs(value) >= 3 ) {
        return true;
      }
    }
  }
});
;

//***** src/constants/application-constants.js *****//
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
;

//***** src/constants/CountryCodes.js *****//
// Howto recreate CountryCodes list from HTML:
// http://localhost:8000/manager-app-formflow/#/account-setup/management-companies/437/edit-address
// console: var map = {}; $("form select[name=country_code] option").each(function(option) { map[ $(this).val() ] = $(this).text(); });
// console: for( var key in map ) { console.log('"'+key+'": "'+map[key]+'",'); }
angular.module('edgefolio.constants.CountryCodes', [])
.constant("CountryCodes", {
  "":    "",
  "AFG": "Afghanistan",
  "ALA": "Åland Islands",
  "ALB": "Albania",
  "DZA": "Algeria",
  "ASM": "American Samoa",
  "AND": "Andorra",
  "AGO": "Angola",
  "AIA": "Anguilla",
  "ATA": "Antarctica",
  "ATG": "Antigua and Barbuda",
  "ARG": "Argentina",
  "ARM": "Armenia",
  "ABW": "Aruba",
  "AUS": "Australia",
  "AUT": "Austria",
  "AZE": "Azerbaijan",
  "BHS": "Bahamas",
  "BHR": "Bahrain",
  "BGD": "Bangladesh",
  "BRB": "Barbados",
  "BLR": "Belarus",
  "BEL": "Belgium",
  "BLZ": "Belize",
  "BEN": "Benin",
  "BMU": "Bermuda",
  "BTN": "Bhutan",
  "BOL": "Bolivia, Plurinational State of",
  "BES": "Bonaire, Sint Eustatius and Saba",
  "BIH": "Bosnia and Herzegovina",
  "BWA": "Botswana",
  "BVT": "Bouvet Island",
  "BRA": "Brazil",
  "IOT": "British Indian Ocean Territory",
  "BRN": "Brunei Darussalam",
  "BGR": "Bulgaria",
  "BFA": "Burkina Faso",
  "BDI": "Burundi",
  "KHM": "Cambodia",
  "CMR": "Cameroon",
  "CAN": "Canada",
  "CPV": "Cape Verde",
  "CYM": "Cayman Islands",
  "CAF": "Central African Republic",
  "TCD": "Chad",
  "CHL": "Chile",
  "CHN": "China",
  "CXR": "Christmas Island",
  "CCK": "Cocos (Keeling) Islands",
  "COL": "Colombia",
  "COM": "Comoros",
  "COG": "Congo",
  "COD": "Congo, The Democratic Republic of the",
  "COK": "Cook Islands",
  "CRI": "Costa Rica",
  "CIV": "Côte d'Ivoire",
  "HRV": "Croatia",
  "CUB": "Cuba",
  "CUW": "Curaçao",
  "CYP": "Cyprus",
  "CZE": "Czech Republic",
  "DNK": "Denmark",
  "DJI": "Djibouti",
  "DMA": "Dominica",
  "DOM": "Dominican Republic",
  "ECU": "Ecuador",
  "EGY": "Egypt",
  "SLV": "El Salvador",
  "GNQ": "Equatorial Guinea",
  "ERI": "Eritrea",
  "EST": "Estonia",
  "ETH": "Ethiopia",
  "FLK": "Falkland Islands (Malvinas)",
  "FRO": "Faroe Islands",
  "FJI": "Fiji",
  "FIN": "Finland",
  "FRA": "France",
  "GUF": "French Guiana",
  "PYF": "French Polynesia",
  "ATF": "French Southern Territories",
  "GAB": "Gabon",
  "GMB": "Gambia",
  "GEO": "Georgia",
  "DEU": "Germany",
  "GHA": "Ghana",
  "GIB": "Gibraltar",
  "GRC": "Greece",
  "GRL": "Greenland",
  "GRD": "Grenada",
  "GLP": "Guadeloupe",
  "GUM": "Guam",
  "GTM": "Guatemala",
  "GGY": "Guernsey",
  "GIN": "Guinea",
  "GNB": "Guinea-Bissau",
  "GUY": "Guyana",
  "HTI": "Haiti",
  "HMD": "Heard Island and McDonald Islands",
  "VAT": "Holy See (Vatican City State)",
  "HND": "Honduras",
  "HKG": "Hong Kong",
  "HUN": "Hungary",
  "ISL": "Iceland",
  "IND": "India",
  "IDN": "Indonesia",
  "IRN": "Iran, Islamic Republic of",
  "IRQ": "Iraq",
  "IRL": "Ireland",
  "IMN": "Isle of Man",
  "ISR": "Israel",
  "ITA": "Italy",
  "JAM": "Jamaica",
  "JPN": "Japan",
  "JEY": "Jersey",
  "JOR": "Jordan",
  "KAZ": "Kazakhstan",
  "KEN": "Kenya",
  "KIR": "Kiribati",
  "PRK": "Korea, Democratic People's Republic of",
  "KOR": "Korea, Republic of",
  "KWT": "Kuwait",
  "KGZ": "Kyrgyzstan",
  "LAO": "Lao People's Democratic Republic",
  "LVA": "Latvia",
  "LBN": "Lebanon",
  "LSO": "Lesotho",
  "LBR": "Liberia",
  "LBY": "Libya",
  "LIE": "Liechtenstein",
  "LTU": "Lithuania",
  "LUX": "Luxembourg",
  "MAC": "Macao",
  "MKD": "Macedonia, Republic of",
  "MDG": "Madagascar",
  "MWI": "Malawi",
  "MYS": "Malaysia",
  "MDV": "Maldives",
  "MLI": "Mali",
  "MLT": "Malta",
  "MHL": "Marshall Islands",
  "MTQ": "Martinique",
  "MRT": "Mauritania",
  "MUS": "Mauritius",
  "MYT": "Mayotte",
  "MEX": "Mexico",
  "FSM": "Micronesia, Federated States of",
  "MDA": "Moldova, Republic of",
  "MCO": "Monaco",
  "MNG": "Mongolia",
  "MNE": "Montenegro",
  "MSR": "Montserrat",
  "MAR": "Morocco",
  "MOZ": "Mozambique",
  "MMR": "Myanmar",
  "NAM": "Namibia",
  "NRU": "Nauru",
  "NPL": "Nepal",
  "NLD": "Netherlands",
  "NCL": "New Caledonia",
  "NZL": "New Zealand",
  "NIC": "Nicaragua",
  "NER": "Niger",
  "NGA": "Nigeria",
  "NIU": "Niue",
  "NFK": "Norfolk Island",
  "MNP": "Northern Mariana Islands",
  "NOR": "Norway",
  "OMN": "Oman",
  "PAK": "Pakistan",
  "PLW": "Palau",
  "PSE": "Palestine, State of",
  "PAN": "Panama",
  "PNG": "Papua New Guinea",
  "PRY": "Paraguay",
  "PER": "Peru",
  "PHL": "Philippines",
  "PCN": "Pitcairn",
  "POL": "Poland",
  "PRT": "Portugal",
  "PRI": "Puerto Rico",
  "QAT": "Qatar",
  "REU": "Réunion",
  "ROU": "Romania",
  "RUS": "Russian Federation",
  "RWA": "Rwanda",
  "BLM": "Saint Barthélemy",
  "SHN": "Saint Helena, Ascension and Tristan da Cunha",
  "KNA": "Saint Kitts and Nevis",
  "LCA": "Saint Lucia",
  "MAF": "Saint Martin (French part)",
  "SPM": "Saint Pierre and Miquelon",
  "VCT": "Saint Vincent and the Grenadines",
  "WSM": "Samoa",
  "SMR": "San Marino",
  "STP": "Sao Tome and Principe",
  "SAU": "Saudi Arabia",
  "SEN": "Senegal",
  "SRB": "Serbia",
  "SYC": "Seychelles",
  "SLE": "Sierra Leone",
  "SGP": "Singapore",
  "SXM": "Sint Maarten (Dutch part)",
  "SVK": "Slovakia",
  "SVN": "Slovenia",
  "SLB": "Solomon Islands",
  "SOM": "Somalia",
  "ZAF": "South Africa",
  "SGS": "South Georgia and the South Sandwich Islands",
  "ESP": "Spain",
  "LKA": "Sri Lanka",
  "SDN": "Sudan",
  "SUR": "Suriname",
  "SSD": "South Sudan",
  "SJM": "Svalbard and Jan Mayen",
  "SWZ": "Swaziland",
  "SWE": "Sweden",
  "CHE": "Switzerland",
  "SYR": "Syrian Arab Republic",
  "TWN": "Taiwan, Province of China",
  "TJK": "Tajikistan",
  "TZA": "Tanzania, United Republic of",
  "THA": "Thailand",
  "TLS": "Timor-Leste",
  "TGO": "Togo",
  "TKL": "Tokelau",
  "TON": "Tonga",
  "TTO": "Trinidad and Tobago",
  "TUN": "Tunisia",
  "TUR": "Turkey",
  "TKM": "Turkmenistan",
  "TCA": "Turks and Caicos Islands",
  "TUV": "Tuvalu",
  "UGA": "Uganda",
  "UKR": "Ukraine",
  "ARE": "United Arab Emirates",
  "GBR": "United Kingdom",
  "USA": "United States",
  "UMI": "United States Minor Outlying Islands",
  "URY": "Uruguay",
  "UZB": "Uzbekistan",
  "VUT": "Vanuatu",
  "VEN": "Venezuela, Bolivarian Republic of",
  "VNM": "Viet Nam",
  "VGB": "Virgin Islands, British",
  "VIR": "Virgin Islands, U.S.",
  "WLF": "Wallis and Futuna",
  "ESH": "Western Sahara",
  "YEM": "Yemen",
  "ZMB": "Zambia",
  "ZWE": "Zimbabwe"
});
;

//***** src/constants/CurrencySymbolMap.js *****//
/**
 * https://github.com/bengourley/currency-symbol-map/blob/master/map.js
 */
angular.module('edgefolio.constants.CurrencySymbolMap', [])
.constant("CurrencySymbolMap", {
  "ALL": "L",
  "AFN": "؋",
  "ARS": "$",
  "AWG": "ƒ",
  "AUD": "$",
  "AZN": "₼",
  "BSD": "$",
  "BBD": "$",
  "BYR": "p.",
  "BZD": "BZ$",
  "BMD": "$",
  "BOB": "Bs.",
  "BAM": "KM",
  "BWP": "P",
  "BGN": "лв",
  "BRL": "R$",
  "BND": "$",
  "KHR": "៛",
  "CAD": "$",
  "KYD": "$",
  "CLP": "$",
  "CNY": "¥",
  "COP": "$",
  "CRC": "₡",
  "HRK": "kn",
  "CUP": "₱",
  "CZK": "Kč",
  "DKK": "kr",
  "DOP": "RD$",
  "XCD": "$",
  "EGP": "£",
  "SVC": "$",
  "EEK": "kr",
  "EUR": "€",
  "FKP": "£",
  "FJD": "$",
  "GHC": "¢",
  "GIP": "£",
  "GTQ": "Q",
  "GGP": "£",
  "GYD": "$",
  "HNL": "L",
  "HKD": "$",
  "HUF": "Ft",
  "ISK": "kr",
  "INR": "₹",
  "IDR": "Rp",
  "IRR": "﷼",
  "IMP": "£",
  "ILS": "₪",
  "JMD": "J$",
  "JPY": "¥",
  "JEP": "£",
  "KES": "KSh",
  "KZT": "лв",
  "KPW": "₩",
  "KRW": "₩",
  "KGS": "лв",
  "LAK": "₭",
  "LVL": "Ls",
  "LBP": "£",
  "LRD": "$",
  "LTL": "Lt",
  "MKD": "ден",
  "MYR": "RM",
  "MUR": "₨",
  "MXN": "$",
  "MNT": "₮",
  "MZN": "MT",
  "NAD": "$",
  "NPR": "₨",
  "ANG": "ƒ",
  "NZD": "$",
  "NIO": "C$",
  "NGN": "₦",
  "NOK": "kr",
  "OMR": "﷼",
  "PKR": "₨",
  "PAB": "B/.",
  "PYG": "Gs",
  "PEN": "S/.",
  "PHP": "₱",
  "PLN": "zł",
  "QAR": "﷼",
  "RON": "lei",
  "RUB": "₽",
  "SHP": "£",
  "SAR": "﷼",
  "RSD": "Дин.",
  "SCR": "₨",
  "SGD": "$",
  "SBD": "$",
  "SOS": "S",
  "ZAR": "R",
  "LKR": "₨",
  "SEK": "kr",
  "CHF": "CHF",
  "SRD": "$",
  "SYP": "£",
  "TZS": "TSh",
  "TWD": "NT$",
  "THB": "฿",
  "TTD": "TT$",
  "TRY": "",
  "TRL": "₤",
  "TVD": "$",
  "UGX": "USh",
  "UAH": "₴",
  "GBP": "£",
  "USD": "$",
  "UYU": "$U",
  "UZS": "лв",
  "VEF": "Bs",
  "VND": "₫",
  "YER": "﷼",
  "ZWD": "Z$"
});
;

//***** src/constants/HttpStatusCodes.js *****//
/**
 * @source https://github.com/prettymuchbryce/node-http-status/blob/master/index.js
 *
 * Constants enumerating the HTTP status codes.
 *
 * All status codes defined in RFC1945 (HTTP/1.0, RFC2616 (HTTP/1.1),
 * and RFC2518 (WebDAV) are supported.
 *
 * Based on the org.apache.commons.httpclient.HttpStatus Java API.
 *
 * Ported by Bryce Neal.
 */
angular.module('edgefolio.constants.HttpStatusCodes', [])
.service('HttpStatusCodes', function() {
  var statusCodes = {};

  statusCodes[this.ACCEPTED = 202] = "Accepted";
  statusCodes[this.BAD_GATEWAY = 502] = "Bad Gateway";
  statusCodes[this.BAD_REQUEST = 400] = "Bad Request";
  statusCodes[this.CONFLICT = 409] = "Conflict";
  statusCodes[this.CONTINUE = 100] = "Continue";
  statusCodes[this.CREATED = 201] = "Created";
  statusCodes[this.EXPECTATION_FAILED = 417] = "Expectation Failed";
  statusCodes[this.FAILED_DEPENDENCY  = 424] = "Failed Dependency";
  statusCodes[this.FORBIDDEN = 403] = "Forbidden";
  statusCodes[this.GATEWAY_TIMEOUT = 504] = "Gateway Timeout";
  statusCodes[this.GONE = 410] = "Gone";
  statusCodes[this.HTTP_VERSION_NOT_SUPPORTED = 505] = "HTTP Version Not Supported";
  statusCodes[this.INSUFFICIENT_SPACE_ON_RESOURCE = 419] = "Insufficient Space on Resource";
  statusCodes[this.INSUFFICIENT_STORAGE = 507] = "Insufficient Storage";
  statusCodes[this.INTERNAL_SERVER_ERROR = 500] = "Server Error";
  statusCodes[this.LENGTH_REQUIRED = 411] = "Length Required";
  statusCodes[this.LOCKED = 423] = "Locked";
  statusCodes[this.METHOD_FAILURE = 420] = "Method Failure";
  statusCodes[this.METHOD_NOT_ALLOWED = 405] = "Method Not Allowed";
  statusCodes[this.MOVED_PERMANENTLY = 301] = "Moved Permanently";
  statusCodes[this.MOVED_TEMPORARILY = 302] = "Moved Temporarily";
  statusCodes[this.MULTI_STATUS = 207] = "Multi-Status";
  statusCodes[this.MULTIPLE_CHOICES = 300] = "Multiple Choices";
  statusCodes[this.NETWORK_AUTHENTICATION_REQUIRED = 511] = "Network Authentication Required";
  statusCodes[this.NO_CONTENT = 204] = "No Content";
  statusCodes[this.NON_AUTHORITATIVE_INFORMATION = 203] = "Non Authoritative Information";
  statusCodes[this.NOT_ACCEPTABLE = 406] = "Not Acceptable";
  statusCodes[this.NOT_FOUND = 404] = "Not Found";
  statusCodes[this.NOT_IMPLEMENTED = 501] = "Not Implemented";
  statusCodes[this.NOT_MODIFIED = 304] = "Not Modified";
  statusCodes[this.OK = 200] = "OK";
  statusCodes[this.PARTIAL_CONTENT = 206] = "Partial Content";
  statusCodes[this.PAYMENT_REQUIRED = 402] = "Payment Required";
  statusCodes[this.PRECONDITION_FAILED = 412] = "Precondition Failed";
  statusCodes[this.PRECONDITION_REQUIRED = 428] = "Precondition Required";
  statusCodes[this.PROCESSING = 102] = "Processing";
  statusCodes[this.PROXY_AUTHENTICATION_REQUIRED = 407] = "Proxy Authentication Required";
  statusCodes[this.REQUEST_HEADER_FIELDS_TOO_LARGE = 431] = "Request Header Fields Too Large";
  statusCodes[this.REQUEST_TIMEOUT = 408] = "Request Timeout";
  statusCodes[this.REQUEST_TOO_LONG = 413] = "Request Entity Too Large";
  statusCodes[this.REQUEST_URI_TOO_LONG = 414] = "Request-URI Too Long";
  statusCodes[this.REQUESTED_RANGE_NOT_SATISFIABLE = 416] = "Requested Range Not Satisfiable";
  statusCodes[this.RESET_CONTENT = 205] = "Reset Content";
  statusCodes[this.SEE_OTHER = 303] = "See Other";
  statusCodes[this.SERVICE_UNAVAILABLE = 503] = "Service Unavailable";
  statusCodes[this.SWITCHING_PROTOCOLS = 101] = "Switching Protocols";
  statusCodes[this.TEMPORARY_REDIRECT = 307] = "Temporary Redirect";
  statusCodes[this.TOO_MANY_REQUESTS = 429] = "Too Many Requests";
  statusCodes[this.UNAUTHORIZED = 401] = "Unauthorized";
  statusCodes[this.UNPROCESSABLE_ENTITY = 422] = "Unprocessable Entity";
  statusCodes[this.UNSUPPORTED_MEDIA_TYPE = 415] = "Unsupported Media Type";
  statusCodes[this.USE_PROXY = 305] = "Use Proxy";

  this.getStatusText = function(statusCode) {
    if (statusCodes.hasOwnProperty(statusCode)) {
      return statusCodes[statusCode];
    } else {
      console.log('HttpStatusCodes.js::getStatusText()', 'Status code does not exist: ', statusCode);
      return "";
    }
  };
});
;

//***** src/constants/KeyCodes.js *****//
angular.module('edgefolio.constants.KeyCodes', [])
.constant('KeyCodes', {
  enter:    13,
  up:       38,
  down:     40,
  left:     37,
  right:    39,
  escape:   27,
  space:    32
});
;

//***** src/constants/LegalStructures.js *****//
angular.module('edgefolio.constants.LegalStructures', [])
.constant('LegalStructures', {
  "01": "Partnership (3C1)",
  "02": "Partnership (3C7)",
  "03": "Corporation",
  "04": "Limited Liability Company",
  "05": "Closed Ended Investment Company",
  "06": "Exempted Limited Partnership",
  "08": "Open Ended Investment Company",
  "09": "SICAV",
  "11": "Non-Exempted Limited Partnership",
  "12": "Registered Hedge Fund",
  "20": "SeparateAccount",
  "22": "Unit Trust",
  "23": "FCP",
  "24": "SICAF",
  "25": "Trust Units",
  "26": "Investment Trust",
  "27": "Unit Investment Trust",
  "28": "Grantor Trust",
  "29": "Trusts",
  "30": "Pooled",
  "31": "Custom Fund",
  "32": "Market Index",
  "33": "Managed Account",
  "34": "Unstructured Hedge Fund",
  "35": "FCIMT",
  "36": "FIP",
  "37": "FCPI",
  "38": "FCPE",
  "39": "SIMCAV",
  "40": "Structured Product",
  "41": "Property Syndicate",
  "42": "IGSA",
  "43": "CIT",
  "45": "Unlisted Closed End Investment Company",
  "50": "Limited Liability Partnership"
});
;

//***** src/constants/TimeframeDefinitions.js *****//
angular.module('edgefolio.constants.TimeframeDefinitions', [])
.constant('TimeframeDefinitions', [
  { id: 0,   name: 'Since Inception' },
  //{ id: 600, name: '50Y' },
  { id: 120, name: '10Y' },
  { id: 60,  name: '5Y' },
  { id: 36,  name: '3Y' },
  { id: 12,  name: '1Y' },
  { id: 6,   name: '6M' },
  { id: 3,   name: '3M' }
  //{ id: 1,   name: '1M' }
]);
;

//***** src/widgets/documentation/documentation.js *****//
/**
 * Injects a <pre> tags, including the formatted source of the enclosed html
 * Also injects a debugging view/editor for detected variable names in html souce
 * Ignores any <aside> tags and closes with <hr/>
 *
 * <edgefolio-documentation>
 *   <aside>
 *     $state.$current.data.timeframeId: {{$state.$current.data.timeframeId}}<br/>
 *     $state.$current.data.benchmarkId: {{$state.$current.data.benchmarkId}}
 *   </aside>
 *   <edgefolio-timeframe-selector  selected-id="$state.$current.data.timeframeId"/>
 *   <edgefolio-selectbox-benchmark selected-id="$state.$current.data.benchmarkId"/>
 *   <edgefolio-graph-analysis
 *     share-class-id="1"
 *     timeframe-id="$state.$current.data.timeframeId"
 *     benchmark-id="$state.$current.data.benchmarkId"
 *   />
 * </edgefolio-documentation>
 *
 *
 * Console:
 *   - Edgefolio.DocumentationWidget('.selector')
 *   - Edgefolio.DocumentationWidget($0)              // Chrome last inspected element
 *   - Edgefolio.DocumentationWidget(element, scope)
 */
angular.module('edgefolio.enterprise.widgets.documentation', [])
.directive('edgefolioDocumentation', function(DocumentationWidget) {
  return {
    restrict: 'EA',
    link: function(scope, element) {
      // NOTE: $compileProvider.debugInfoEnabled(false); disables element.scope()
      // NOTE: angular.reloadWithDebugInfo();            to reenable
      DocumentationWidget(element, scope);
    }
  }
})
.run(function(Edgefolio, DocumentationWidget) {
  Edgefolio.DocumentationWidget = DocumentationWidget;
})
.factory('DocumentationWidget', function($compile, $interpolate, $log) {
  var DocumentationWidget = function(selector, scope) {
    $(selector).each(function(index, element) {
      DocumentationWidget.injectDocumentation($(element), scope);
    })
  };
  DocumentationWidget.__proto__ = {
    prettyPrintHtml: function(element) {
      element  = $(element).clone().find('aside').remove().end(); // remove any <aside> tags
      var html = element.html() || '';
      html     = html.replace(/^\s+|\s+$/mg, '');                         // trim whitespace
      html     = html.replace(/<(([\w-]+)[^>]*)>\s*<\/\2>/mg, '<$1\n/>'); // make tags self closing on new line
      html     = html.replace(/<([\w-]+)[\s\n]*\/>/g, '<$1/>');           // self closing tags with no attributes on same line
      html     = html.replace(/<\//g, '\n$&');                            // other closing tags on new line
      html     = html.replace(/\/></g, '\/>\n<');                         // split touching tags
      html     = html.replace(/ [\w-]+=/g, '\n    $&');                   // attributes indented on new line
      html     = html.replace(/(<[\w-]{1,6})[\s\n]+(\w+)/g, '$1 $2');     // first attribute unwrapped for short lines
      html     = html.replace(/\n+/g, '\n');                              // remove blank lines
      return html;
    },
    injectHtmlSource: function(element, scope) {
      var html = DocumentationWidget.prettyPrintHtml(element);
      $("<pre/>").text(html).prependTo(element);
    },
    silentConsoleError: function(func) {
      $log._error = $log.error;
      $log.error = _.noop;
      try {
        func.apply(this);
      } catch(e) {}
      $log.error = $log._error;
    },
    injectControls: function(element, scope) {
      var scope = (scope || $(element).scope()).$new();
      var html  = DocumentationWidget.prettyPrintHtml(element);

      var aside = $("<aside style='padding: 1em'/>").prependTo(element);

      var variables = _(html.match(/="([^"]+)["]|='([^']+)'/g))
        .map(function(varName) {
          return varName.replace(/=["'](.*)["']/g, '$1');
        })
        //.filter(function(varName) {
        //  return varName.match(/[$\.]/); // looks like a common variable name, rather than simple string or number
        //})
        .filter(function(varName) {
          return !varName.match(/[()]/);     // reject functions
        })
        .sortBy()
        .unique()
        .value()
      ;
      _.forEach(variables, function(varName) {
        this.silentConsoleError(function() {
          varName = varName.replace(/'/g, '"'); // Prevent html template compilation errors
          var injectHtml = "" +
            "<div style='overflow: scroll; max-height: 4.5em;'>" +
              "<input type='text'   ng-model='" + varName + "' ng-if='_.isString(" + varName + ") || _.isNull(" + varName + ") || _.isUndefined(" + varName + ")' style='width: 5em'/>" +
              "<input type='number' ng-model='" + varName + "' ng-if='_.isNumber(" + varName + ")' style='width: 5em'/>" +
              "<input type='text'   disabled='disabled'        ng-if='_.isObject(" + varName + ")' style='width: 5em; visibility: hidden'/>" +
              "<span>" + varName + ": {{(" + varName + ")}}</span>" +
              "<span>&nbsp; ({{"+varName+" | typeof}})</span>" +
            "<div>"
          ;
          var injectElement = $compile(injectHtml)(scope);
          aside.append(injectElement);
        });
      }, this);
    },
    injectDocumentation: function(element, scope) {
      DocumentationWidget.injectControls(element, scope);
      DocumentationWidget.injectHtmlSource(element, scope);
      element.append("<hr style='margin: 2em 0'/>");
    }
  };
  return DocumentationWidget;
})
.filter('typeof', function() {
  return function(any) {
    if( _.isArray(any)   ) { return 'array'; }
    if( _.isNull(any)    ) { return 'null';  }
    if( _.isBoolean(any) ) { return 'boolean';  }
    if( any && any.klass ) { return any.$$hashKey || any.uuid || any.displayName;  }
    return typeof any;
  };
});
;

//***** src/widgets/selectbox/selectbox.js *****//
'use strict';

angular.module('edgefolio.enterprise.widgets.selectbox', [
  'edgefolio.models'
])
.controller('EdgefolioSelectboxController', function($scope, $q) {
  $scope.state = {
    loading:      true,
    selectedItem: null
  };
  $scope.events = {
    onChange: function(options) {
      $scope.selectedId = _.get($scope, ['state','selectedItem','id']) || null;
      if( _.isFunction($scope.onChange) ) {
        $scope.onChange({ item: $scope.state.selectedItem })
      }
    }
  };
  $scope.reload = function() {
    $scope.label = String($scope.label || '').replace(/(\S)\s*:?\s*$/, '$1:'); // $scope.label = $scope.label + ':'

    $scope.state.loading = true;
    var promises = _($scope.items).pluck('$loadPromise').filter().value();
    $q.all(promises).then(function() {
      $scope.state.loading = false;
      $scope.updateSelectedItem();
    });
  };

  $scope.updateSelectedItem = function() {
    $scope.state.selectedItem = _.find($scope.items, function(item) {
      return item && item.id == $scope.selectedId; // soft equals  1 == "1"
    });
    $scope.state.selectedItem = $scope.state.selectedItem || _.first($scope.items);
    $scope.selectedId         = _.get($scope, ['state','selectedItem','id']) || null;
  };
  $scope.$watch('selectedId', function() {
    if( arguments[0] != arguments[1] ) {
      $scope.updateSelectedItem();
    }
  });
})
.directive('edgefolioSelectbox', function($q) {
  return {
    restrict: 'E',
    templateUrl: '/assets/whitelabel/enterprise/widgets/selectbox/selectbox.html',
    scope: {
      label:      '@',  // {String} 'Benchmarks:'
      items:      '=?', // {Array<object>} [{ id:, name: }, ...]
      selectedId: '=?', // {Number}
      onChange:   '&?'  // {Function} function(selectedItem)
    },
    controller: 'EdgefolioSelectboxController',
    link: function($scope, element, attr) {
      $scope.$watchCollection('[label, items, selectedId]', function() {
        $scope.reload();
      });
    }
  };
})
.directive('edgefolioSelectboxFundgroup', function(Edgefolio, FundGroups) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/assets/whitelabel/enterprise/widgets/selectbox/selectbox.html',
    scope: {
      selectedId: '=?', // {Number}
      onChange:   '&?', // {Function} function(selectedItem)
      onDelete:   '&?'  // {Function} @unimplemented
    },
    controller: 'EdgefolioSelectboxController',
    link: function($scope, element, attr) {
      $scope.label = "Watchlist";
      $scope.items = [];

      // ApiCollection.$deleteFromCollection() will trigger this watch
      $scope.$watch(function() { return Edgefolio.FundGroups.load().$$hashKey }, function() {
        FundGroups.load().$preloadPromise.then(function(fundgroups) {
          $scope.items = _.get(fundgroups, 'results');
        });
      });
      $scope.$watch('items', function() {
        $scope.updateSelectedItem();
        $scope.reload();
      })
    }
  };
})
.directive('edgefolioSelectboxBenchmark', function(Edgefolio, Benchmarks) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/assets/whitelabel/enterprise/widgets/selectbox/selectbox.html',
    scope: {
      selectedId: '=?', // {Number}
      onChange:   '&?', // {Function} function(selectedItem)
      onDelete:   '&?'  // {Function} @unimplemented
    },
    controller: 'EdgefolioSelectboxController',
    link: function($scope, element, attr) {
      $scope.label = "Benchmark";
      $scope.items = [];

      // ApiCollection.$deleteFromCollection() will trigger this watch
      $scope.$watch(function() { return Edgefolio.Benchmarks.load().$$hashKey }, function() {
        Benchmarks.load().$preloadPromise.then(function(benchmarks) {
          $scope.items = _.get(benchmarks, 'results');
        });
      });
      $scope.$watch('items', function() {
        $scope.updateSelectedItem();
        $scope.reload();
      })
    }
  };
});
;

//***** src/widgets/timeframeSelector/timeframeSelector.js *****//
'use strict';

angular.module('edgefolio.enterprise.widgets.timeframeSelector', [
  'edgefolio.models',
  'edgefolio.constants.TimeframeDefinitions'
])
.directive('edgefolioTimeframeSelector', function($q, TimeframeDefinitions, ApiBaseClass, TimeSeries, FundGroup) {
  return {
    restrict: 'E',
    templateUrl: '/assets/whitelabel/enterprise/widgets/timeframeSelector/timeframeSelector.html',
    scope: {
      fundgroupId: '=?',        // {Number}
      items:       '=?',        // {Array.<UUID>} TODO: rename uuids
      selectedId:  '=?',        // {Number}
      hideSinceInception: '=?'  // {Boolean}
    },
    controller: function($scope) {
      $scope.events = {
        onChange: function(options) {
          $scope.state.selectedTimeframe = _.get(options,'timeframe');
          $scope.selectedId              = _.get(options,'timeframe.id') || 0;
        },
        isValid: function(timeframe) {
          if( timeframe.id === 0                     ) { return true;  }
          if( _.size($scope.items) === 0             ) { return true;  }
          if( !_.isFinite($scope.state.maxMonths)    ) { return true;  }
          if( timeframe.id <= $scope.state.maxMonths ) { return true;  }
          else                                         { return false; }
        }
      };
    },
    link: function($scope, element, attr) {
      $scope.state = {};
      $scope.state.timeframes = _(_(TimeframeDefinitions).cloneDeep()).reject($scope.hideSinceInception ? { id: 0 } : false).value();
      $scope.state.maxMonths  = 0;

      $scope.data = {
        fundgroup: null
      };

      $scope.reload = function() {
        var promises = _([$scope.items])
          .flatten(false)
          .map(ApiBaseClass.loadUuid)
          .map(function(instance) {
            return [instance, _.get(instance, 'base_share_class')];
          })
          .flatten(true)
          .pluck('$loadPromise')
          .filter()
          .value();

        if( promises.length === 0 ) { return; }

        $q.all(promises).then(function recurse(items) {
          var time_series_array = _.filter(_.flatten([
            _.pluck(items, 'returns_time_series'),
            _.pluck(items, ['base_share_class','returns_time_series']),
            _(items).pluck('funds').flatten().pluck(['base_share_class','returns_time_series']).value() // FundGroup
          ]));

          // Need to rerun this after promises have loaded for it to take precedence over other $stateParams.timeframe setters
          $scope.selectedId = _.contains($scope.state.timeframes, { id: Number($scope.selectedId) }) && $scope.selectedId
                              || _($scope.state.timeframes).pluck('id').first()
                              || 0
          ;
          var first_date  = _(time_series_array).pluck('first_date').sortBy().first();
          $scope.state.maxMonths = moment().diff(first_date,  'months');

          // TimeframeDefinitions.id is months ago
          _.forEach($scope.state.timeframes, function(timeframe) {
            timeframe.invalid = !$scope.events.isValid(timeframe);
          });
          if( _.get($scope, 'state.selectedTimeframe.invalid') ) {
            $scope.state.selectedTimeframe = _.find($scope.state.timeframes, { invalid: false }) || $scope.state.selectedTimeframe;
          }
        });
      };


      $scope.$watch('selectedId', function(newVal, oldVal) {
        if( Number(newVal) != Number(oldVal) ) {
          $scope.state.selectedTimeframe = _.find($scope.state.timeframes, { id: Number($scope.selectedId) || 0 });
          $scope.selectedId              = Number(_.get($scope.state.selectedTimeframe,'id')) || 0;
        }
      });
      $scope.$watchCollection('[fundgroupId, data.fundgroup.$$hashKey]', function() {
        if( !$scope.fundgroupId ) { return; }
        FundGroup.load($scope.fundgroupId).$preloadPromise.then(function(fundgroup) {
          $scope.data.fundgroup = fundgroup;
          $scope.items = fundgroup.funds || [];
        })
      });
      $scope.$watch('items', function() {
        $scope.reload();
      })
    }
  }
});
;

//***** src/widgets/timeseriesTable/timeseriesTable.js *****//
'use strict';

/**
 * TODO: Add loading and error states
 */
angular.module('edgefolio.enterprise.widgets.timeseriesTable', [
  'edgefolio.models'
])
.directive('edgefolioTimeseriesTable', function(
  $q, $stateParams,
  ApiBaseClass, DateBucket, Fund, TimeSeries
) {
  return {
    restrict: 'E',
    templateUrl: '/assets/whitelabel/enterprise/widgets/timeseriesTable/timeseriesTable.html',
    scope: {
      timeseriesId: '=',
      timeframeId:  '=?'
    },
    controller: function($scope) {
      $scope.state = {
        loading: true,
        error:   false,
        selected: {
          month: null,
          year:  null
        }
      };
      $scope.data = {
        months:     [],
        years:      [],
        timeseries: null,
        table:      null
      };
      $scope.events = {
        isNegative: function(value) {
          return value < 0;
        }
      };
    },
    link: function($scope, element, attr) {
      $scope.timeframeId  = $scope.timeframeId || 0;
      $scope.data.months  = moment.monthsShort().concat('YTD');

      $scope.reload = function() {
        $scope.state.loading = true;

        TimeSeries.loadFromUuid($scope.timeseriesId, { timeframe_id: $scope.timeframeId }).then(function(timeseries) {
          $scope.state.loading = false;
          $scope.state.error   = !timeseries || _.all(timeseries, _.isNull);

          $scope.data.timeseries = timeseries;
          if( !timeseries ) {

            $scope.data.table  = {};
            $scope.data.years  = [];
            $scope.state.error = true;

          } else {

            $scope.data.table  = {};
            _.forIn($scope.data.timeseries, function(value, date) {
              date = moment(date);
              _.set($scope.data.table, [date.year(), moment.monthsShort(date.month())], value);
            });

            _.forIn($scope.data.table, function(row, year) {
              $scope.data.table[year]['YTD'] = _(row)
                .values()
                .reject(_.isNull)
                .thru(TimeSeries.toCalc, TimeSeries)
                .map(function(value)  { return value + 1; })
                .thru(ss.product)
                .thru(function(value) { return value - 1; })
                .thru(TimeSeries.fromCalc, TimeSeries)
                .value();
            });

            $scope.data.years  = _.keys($scope.data.table).sort().reverse();
            $scope.data.months = moment.monthsShort().concat('YTD');
          }
        });
      };
      $scope.$watchCollection('[timeframeId, timeseriesId]', function() {
        $scope.reload();
      });
    }
  }
});
;

//***** src/widgets/fundgroupMenu/fundgroupMenu.js *****//
'use strict';

/**
 * TODO: Add loading and error states
 */
angular.module('edgefolio.enterprise.widgets.fundgroupMenu', [
  'edgefolio.models'
])
.directive('edgefolioFundgroupMenu', function(
  $q, $stateParams,
  FundGroup
) {
  return {
    restrict: 'E',
    templateUrl: '/assets/whitelabel/enterprise/widgets/fundgroupMenu/fundgroupMenu.html',
    scope: {
      fundgroupId:    '=',
      selectedFundId: '=?',
      hoverFundId:    '=?',
      timeframeId:    '=?',
      fundSref:       '=?'
    },
    controller: function($scope) {
      $scope.defaults = {
        fundSref: 'root.hedge-funds.profile'
      };
      $scope.state = {
        loading: true,
        error:   false
      };
      $scope.data = {
        fundgroup: null,
        funds: []
      };
      $scope.events = {
        removeId: function(id) {
          if( $scope.data.fundgroup ) {
            $scope.data.fundgroup.$removeFundIds(id);
          }
        }
      }
    },
    link: function($scope, element, attr) {
      $scope.$scope = $scope;
      $scope.reload = function() {
        $scope.state.loading  = true;
        $scope.state.error    = false;

        FundGroup.load($scope.fundgroupId, {silent: true}).$loadPromise.then(function(fundgroup) {
          $scope.data.fundgroup = fundgroup;
          $scope.selectedFundId = _.contains(fundgroup.fund_ids, Number($scope.selectedFundId)) ? $scope.selectedFundId : _.first(fundgroup.fund_ids) || $scope.selectedFundId;
        })
        ['finally'](function() {
          $scope.state.loading = false;
          $scope.state.error   = !_.size(_.get($scope, 'data.fundgroup.funds'));
        })
      };

      $scope.$watchCollection('[fundgroupId, data.fundgroup.$$hashKey]', function() {
        if( !$scope.fundgroupId ) { return; }
        $scope.reload();
      });
    }
  }
});
;

//***** src/widgets/baseWidget/baseWidget.js *****//
angular.module("edgefolio.models").factory("BaseWidget", function() {
  var BaseWidget = new JS.Class("BaseWidget", {
    restrict:    'E',
    templateUrl: '/assets/whitelabel/enterprise/widgets/baseWidget/baseWidget.html',
    scope:       {
      label:      '@',  // {String} 'Benchmarks:'
      items:      '=?', // {Array<object>} [{ id:, name: }, ...]
      selectedId: '=?'  // {Number}
    },
    initialize: function(options) {
      var instance = this;
      instance.options = options;

      this.compile = function(element, attributes){
        return {
          pre: function(scope, element, attributes, controller, transcludeFn) {
            scope.instance = instance;
            return instance.pre.call(instance, scope, element, attributes, controller, transcludeFn);
          },
          post: function(scope, element, attributes, controller, transcludeFn){
            return instance.post.call(instance, scope, element, attributes, controller, transcludeFn);
          }
        }
      }
    },
    pre: function(scope, element, attributes, controller, transcludeFn){
      console.log("baseWidget.js:25:pre", "this, scope, element, attributes, controller, transcludeFn", this, scope, element, attributes, controller, transcludeFn);
    },
    post: function(scope, element, attributes, controller, transcludeFn){
      console.log("baseWidget.js:29:post", "scope, element, attributes, controller, transcludeFn", scope, element, attributes, controller, transcludeFn);
    },

    extend: {
      init: function(options) {
        return new this(options);
      }
    }
  });
  return BaseWidget;
});
angular.module("edgefolio.models").directive("baseWidget", function(BaseWidget) {
  var options = {
    color: 'red'
  };
  var directive = new BaseWidget(options);
  return directive;
});
;

//***** src/models/_models.module.js *****//
angular.module('edgefolio.models', [
  'edgefolio.constants'
]);

angular.module('edgefolio.models').value('_',          window._ );
angular.module('edgefolio.models').value('$',          window.$ );
angular.module('edgefolio.models').value('JS',         window.JS );
angular.module('edgefolio.models').value('moment',     window.moment);
angular.module('edgefolio.models').value('kurtosis',   require("compute-kurtosis"));
angular.module('edgefolio.models').value('covariance', require("compute-covariance"));

// Assumes presence of:
// - src/common_components/global/moment_toString.js:         moment.prototype.toString = moment.prototype.toISOString
// - src/common_components/global/array_simplestatistics.js:  array.prototype += ss.prototype[arrayFunctions]
;

//***** src/models/mixins/EventModule.js *****//
angular.module('edgefolio.models').factory('EventModule', function(
  JS, _
) {
  var EventModule = new JS.Module({
    $bindEvents: null, // { "eventName": [{ callback:, context: }] }

    /**
     * Binds a callback function to an event which can be called via $trigger(), context is
     *
     * @param {String}   eventName
     * @param {Function} callback
     * @param {?Object}   context
     */
    $bind: function(eventName, callback, context) {
      this.$bindEvents            = this.$bindEvents || {};
      this.$bindEvents[eventName] = this.$bindEvents[eventName] || [];

      if( !_.isFunction(callback) ) {
        console.error("EventModule::$bind(eventName, callback)", "callback is not a function: ", eventName, callback);
        return;
      }
      var bindEntry = { callback: callback, context: context || this };
      if( !_.find(this.$bindEvents[eventName], function(loopBindEntry) {
        return bindEntry.callback === loopBindEntry.callback
            && bindEntry.context  === loopBindEntry.context
      })) {
        this.$bindEvents[eventName].push(bindEntry);
      }
    },
    /**
     * Unbinds an eventName. If callback and/or context are passed in, these are used to filter the unbind
     *
     * @param {?String}   eventName
     * @param {?Function} callback
     * @param {?Object}   context
     */
    $unbind: function(eventName, callback, context) {
      this.$bindEvents            = this.$bindEvents || {};
      this.$bindEvents[eventName] = this.$bindEvents[eventName] || [];

      if( callback || context ) {
        this.$bindEvents[eventName] = _.reject(this.$bindEvents[eventName], function(bindEntry) {
          if( callback && context ) {
            return bindEntry.callback === callback && bindEntry.context === context
          }
          else if( callback && !context ) {
            return bindEntry.callback === callback
          }
          else if( !callback && context ) {
            return bindEntry.context  === context
          }
        });
      } else {
        this.$bindEvents[eventName] = [];
      }
    },
    /**
     * Triggers all previously bound events with the same eventName, passing in any additional arguments to the callbacks
     *
     * @param {String} eventName
     */
    $trigger: function(eventName /* ,arguments */ ) {
      this.$bindEvents            = this.$bindEvents || {};
      this.$bindEvents[eventName] = this.$bindEvents[eventName] || [];

      var restArgs = [].slice.call(arguments, 1); // = _.rest(arguments)
      _.each(this.$bindEvents[eventName], function(bindEntry) {
        bindEntry.callback.apply(bindEntry.context, restArgs);
      });
    }
  });
  return EventModule;
});
;

//***** src/models/util/CallbackPromise.js *****//
/**
 *  This a decorator around $q.defer() that looks and acts like a $q promise
 *
 *  CallbackPromise.prototype = {
 *    klass:      CallbackPromise,
 *    init:       function(previousCallbackPromise) {},
 *
 *    // Instance variables
 *    deferred:   $q.defer(),
 *    status:     "unresolved", // "unresolved" | "success" | "error"
 *    value:      { "success": null, "error": null },
 *    callbacks:  { "success": [],   "error": [] },
 *    $$state:    this.deferred.promise.$$state,
 *
 *    // Class methods
 *    then:          function(asyncFn) {}, // == this.deferred.promise.then(asyncFn)
 *    catch:         function(asyncFn) {}, // == this.deferred.promise.catch(asyncFn)
 *    finally:       function(asyncFn) {}, // == this.deferred.promise.finally(asyncFn)
 *    callback:      function(syncFn)  {}, // synchronous callback after .resolve()
 *    errorCallback: function(syncFn)  {}, // synchronous callback after .reject()
 *    resolve:    function(resolvedValue) {},
 *    reject:     function(resolvedValue) {},
 *
 *    executeCallbacks: function() {},
 *  };
 */
angular.module('edgefolio.models').factory("CallbackPromise", function($q) {
  function CallbackPromise(previousCallbackPromise) {
    this.init(previousCallbackPromise);
  }

  CallbackPromise.prototype = {
    klass: CallbackPromise,

    init: function(previousCallbackPromise) {
      var self      = this;
      this.deferred = $q.defer();
      this.status   = "unresolved"; // "unresolved" | "success" | "error"

      this.value = {
        "success": null,
        "error":   null
      };
      this.callbacks = {
        "success": [],
        "error":   []
      };

      // add .then() .catch() .finally(), $$state
      for( var key in this.deferred.promise ) {
        this[key] = this.deferred.promise[key]; // don't add to __proto__ it creates a shared promise between all instances
      }

      // chain any unresolved .then() blocks to the new promise
      if( previousCallbackPromise && previousCallbackPromise.status === "unresolved" ) {
        this.then(function() {
          previousCallbackPromise.resolve(self);
          return previousCallbackPromise.then(function() {
            return self; // pass instance to the next promise in the chain
          })
        });
      }
    },

    callback: function(callback) {
      if( typeof callback !== "function" ) {
        console.warn("CallbackPromise::callback(): callback not of type function", callback);
        return this;
      }

      this.callbacks["success"].unshift(callback);
      this.executeCallbacks();

      return this;
    },

    errorCallback: function(callback) {
      if( typeof callback !== "function" ) {
        console.warn("CallbackPromise::onError(): callback not of type function", callback);
        return this;
      }

      this.callbacks["error"].unshift(callback);
      this.executeCallbacks();

      return this;
    },

    executeCallbacks: function() {
      if( this.status === "success" || this.status === "error" ) {
        var next_function;
        while( next_function = this.callbacks[this.status].pop() ) {
          next_function(this.value[this.status]);
        }
      }
    },

    resolve: function(resolvedValue) {
      this.status             = "success";
      this.value[this.status] = resolvedValue;
      this.executeCallbacks();
      return this.deferred.resolve(this.value[this.status]);
    },


    reject: function(resolvedValue) {
      this.status             = "error";
      this.value[this.status] = resolvedValue;
      this.executeCallbacks();
      return this.deferred.reject(this.value[this.status]);
    }
  };

  return function() {
    return new CallbackPromise();
  }
});
;

//***** src/models/util/ApiFieldGenerator.js *****//
/**
 *  Generator for Object.defineProperty()
 *
 *  Performance Implications of Object.defineProperty(): https://www.nczonline.net/blog/2015/11/performance-implication-object-defineproperty/
 */
angular.module('edgefolio.models').factory('ApiFieldGenerator', function($injector) {
  var AFG, ApiFieldGenerator;
  AFG = ApiFieldGenerator = {
    klass: {
      unenumerableKlassPrototype: function(klass) {
        // for( key in Klass() should not list prototype
        klass = ApiFieldGenerator._getKlass(klass);

        // using `for ver in object` rather than _.keys() as this also matches .constructor
        for( var key in klass.prototype ) {
          Object.defineProperty(klass.prototype, key, {
            configurable: true,
            writable:     true,
            enumerable:   false,
            value:        klass.prototype[key]
          });
        }
        return klass;
      }
    },

    _call: function(context, functionOrValue, value) {
      if( functionOrValue instanceof Function ) {
        return functionOrValue.call(context, value);
      } else {
        return (functionOrValue !== undefined) ? functionOrValue : null;
      }
    },

    _getKlass: function(klass) {
      // workaround for circular dependency injection
      if( typeof klass === "string" ) {
        try {
          klass = $injector.get(klass);
        } catch(e) {
          console.error("ApiFieldGenerator", "$injector.get(", klass, ") failed");
          return null;
        }
      }
      return klass;
    },

    _getId: function(value) {
      if( typeof value === "number" || typeof value === "string" ) {
        return value;
      }
      return value && value.id || null;
    },

    /**
     * Converts field argument into a standardized array structure
     * Lodash _.get() and _.set() execute faster when field is passed in as an pre-parsed array
     * Examples:
     *  'a'             -> ['a']
     *  'a.b.c'         -> ['a','b','c']
     *  ['a','b','c']   -> ['a','b','c']
     *  [['a','b','c']] -> ['a','b','c']
     *
     * @param   {string|Array<string>} field
     * @returns {Array<string>}
     */
    _convertSelectorToArray: function(field) {
      return _.isArray(field) ? _.flatten(field) : String(field).split('.');
      // return _([field]).flatten().map(function(string) { return string.split('.') }).flatten().value(); // ['a', 'b.c'] is not syntax supported by lodash
    },

    /**
     * @untested
     * @param func
     * @returns {recur}
     */
    memoize: function(func) {
      var cache = {};
      var memoized = function() {
        var cacheArgs = [this].concat(_.values(arguments));
        var cacheKey  = JSON.stringify(_.map(cacheArgs, AFG._memoizeCacheKey, AFG));
        if( typeof cache[cacheKey] === 'undefined' ) {
          cache[cacheKey] = func.apply(this, arguments);
        }
        return cache[cacheKey];
      };
      memoized.cache = cache;
      return memoized;
    },
    _memoizeCacheKey: function(item) {
      if( _.isArray(item)  ) { return _.map(item, AFG._memoizeCacheKey, AFG); }
      if( _.isNumber(item) ) { return item; }
      if( _.isString(item) ) { return item; }
      if( _.isObject(item) ) {
        if( item.$$hashkey   ) { return item.$$hashkey;   }
        if( item.displayName ) { return item.displayName; }
        if( item.klass       ) { return String(item);     }
      }
      return item;
    },

    /**
     * Wrapper around Object.defineProperty(instance, field, descriptor)
     * - Prevents redeclaration of fields by duplicate invocations
     * - sets: instance.$fields[options.generator][field] = true
     *
     * @param instance    {object} passed to Object.defineProperty()
     * @param field       {string} passed to Object.defineProperty()
     * @param descriptor  {object} passed to Object.defineProperty()
     * @param options     {object}
     * @param options.generator {string}  index key used in: instance.$fields[options.generator]
     * @param options.priority  {boolean} overwrite defineProperty if undefined or other generator has previously defined it
     *                                    (does not overwrite defineProperty for same [options.generator][field] pair)
     *                                    set { priority: true } for generators that directly access instance.$data
     * @param options.overwrite {boolean} force overwrite defineProperty, even if previously defined by same generator
     */
    defineProperty: function(instance, field, descriptor, options) {
      if( typeof options === "string" ) { options = { generator: options }; }
      options = _.extend({
        generator: "",
        priority:  true,
        overwrite: false
      }, options);

      // instance.$fields = { options.generator: { field: <Boolean> }}
      if( instance && instance.$fields && options.generator ) {

        // Don't redefine defineProperty if explicitly overridden
        if(  options.overwrite
         ||  options.priority && _.get(instance.$fields, [options.generator, field]) !== true
         || !options.priority && _.get(instance.$fields, [options.generator, field]) === undefined
        ) {
          ApiFieldGenerator._defineDeepProperty(instance, field, descriptor, options);

          // Set all other generator references to false
          for( var generatorKey in instance.$fields ) {
            if( instance.$fields[generatorKey][field] === true ) {
              instance.$fields[generatorKey][field] = false;
            }
          }
          _.set(instance.$fields, _.flatten([options.generator, field]), true);
        }
      } else {
        ApiFieldGenerator._defineDeepProperty(instance, field, descriptor, options);
      }
    },
    _defineDeepProperty: function(instance, field, descriptor, options) {
      descriptor = _.extend({
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true   // allow property to be redefined later
      }, descriptor);

      // If field is a deep selector, then build a data structure and repoint instance here
      var field_array_parent = AFG._convertSelectorToArray(field);
      var child_field = field_array_parent.pop(); // remove last element
      var parent_instance = instance;
      if( field_array_parent.length ) {
        if( !_.isObject(_.get(instance, field_array_parent)) ) {
          _.set(instance, field_array_parent, {});
        }
        parent_instance = _.get(instance, field_array_parent);
      }
      Object.defineProperty(parent_instance, child_field, descriptor);
    },
    _defineDeepProperties: function(instance, descriptorHash, options) {
      _.forIn(descriptorHash, function(descriptor, field) {
        ApiFieldGenerator._defineDeepProperty(instance, field, descriptor, options);
      });
    },


    /**
     * @untested
     * Maps: defines property as function getter, with a wrapper that overwrites the value with the generated output
     * Cache can be invalidated by reinvoking the selfCaching function
     *
     * @param {object}        instance    JS.Class::this
     * @param {string|object} methodHash  fieldName string or { fieldName: callback } methodHash
     * @param {?function}     callback    used if methodHash is a string
     * @param {?object}       descriptor  { enumerable: true, configurable: true }
     */
    defineGetters: function(instance, methodHash, _callback, descriptor) {
      if( _.isString(methodHash) ) {
        methodHash = _.set({}, methodHash, _callback);
      }
      if( !_.isFunction(_callback) && _.isObject(_callback) ) {
        descriptor = _callback;
        _callback = null
      }
      descriptor = _.extend({
        enumerable:   true // expose in for( key in instance ) loop
      }, descriptor);

      _.forIn(methodHash, function(callback, field) {
        ApiFieldGenerator._defineDeepProperty(instance, field, _.extend({}, descriptor, {
          configurable: true, // allow property to be redefined later
          get: function() {
            var output = null;
            if( _.isFunction(callback) ) {
              return callback.call(this);
            }
            return output
          }
        }));
      })
    },

    /**
     * Maps: defines property as function getter, with a wrapper that overwrites the value with the generated output
     * Cache can be invalidated by reinvoking the selfCaching function
     *
     * @param {object}        instance    JS.Class::this
     * @param {string|object} methodHash  fieldName string or { fieldName: callback } methodHash
     * @param {?function}     callback    used if methodHash is a string
     * @param {?object}       descriptor  { enumerable: true, configurable: true }
     */
    selfCaching: function(instance, methodHash, _callback, descriptor) {
      if( _.isString(methodHash) ) {
        methodHash = _.set({}, methodHash, _callback);
      }
      if( !_.isFunction(_callback) && _.isObject(_callback) ) {
        descriptor = _callback;
        _callback = null
      }
      descriptor = _.extend({
        enumerable:   true // expose in for( key in instance ) loop
      }, descriptor);

      _.forIn(methodHash, function(callback, field) {
        ApiFieldGenerator._defineDeepProperty(instance, field, _.extend({}, descriptor, {
          configurable: true, // allow property to be redefined later
          get: function() {
            var output = null;
            if( _.isFunction(callback) ) {
              output = callback.call(this);

              if( output !== null ) {
                // This caches the result as an object literal
                // descriptor must be extended to ensure { enumerable: false } is additionally passed in
                ApiFieldGenerator._defineDeepProperty(this, field, {
                  configurable: true, // allow property to be redefined later
                  enumerable:   descriptor.enumerable,
                  value:        output
                });
              }
            }
            return output
          }
        }));
      })
    },


    /**
     *  Maps: instance[field] -> instance.$data[field]
     *
     *  NOTE: Object.defineProperty does introduce a 20x performance hit on read/write operations
     *        but speed should is still be acceptable (500 nanoseconds vs 25 nanoseconds)
     *        https://jsperf.com/property-access-with-defineproperty/3
     *
     * @param instance {object} ApiBaseClass::this
     * @param field    {string} name of field to define
     * @param data     {object} [optional | default: instance.$data] data object map
     */
    'static': function(instance, field, data) {
      data = data || instance.$data;

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function()      { return data[field];  },
        set: function(value) { data[field] = value; }
      }, { generator: 'static', priority: false })
    },

    /**
     * Maps: instance[alias] -> instance[field]
     * @param {Object}               instance    ApiBaseClass::this
     * @param {string|Array<string>} alias       deep selector for alias location
     * @param {string|Array<string>} field       deep selector for instance field to access
     */
    alias: function(instance, alias, field) {
      // If alias is passed in as a deep selector, then build any necessary subtree
      field = AFG._convertSelectorToArray(field); // Lodash optimization
      ApiFieldGenerator.defineProperty(instance, alias, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function()      { return _.get(instance, field); }, // context: this === instance
        set: function(value) { _.set(instance, field, value); }  // context: this === instance
      }, { generator: 'alias', priority: false })
    },

    /**
     * Maps: instance[alias] -> instance[field].call(instance)
     * @param {Object}               instance    ApiBaseClass::this
     * @param {string|Array<string>} alias       deep selector for alias location
     * @param {string|Array<string>} field       deep selector for instance field to access
     * @param {string|Object}        context     Object || _.get(instance,"context") || instance - use string for lazy context initialization
     */
    aliasFunction: function(instance, alias, field, context) {
      field = AFG._convertSelectorToArray(field); // Lodash optimization
      var field_string = field.join('.');

      if( field_string.match(/^[^()]+\(\)$/) ) { // a.b.c() - only last item in chain is a function
        field = AFG._convertSelectorToArray(field_string.replace('()',''));

        // No function syntax available in the alias chain as context is lazy loaded
        ApiFieldGenerator.defineProperty(instance, alias, {
          enumerable:   true,  // expose in for( key in this ) loop
          configurable: true,  // allow property to be redefined later
          get: function() {
            context  = (_.isString(context) ? _.get(instance, context) : context) || instance; // lazy load context, unmatched string defaults to original_instance
            var func = _.get(instance, field);
            return _.isFunction(func) ? func.call(context) : null;
          }
        }, { generator: 'aliasFunction', priority: false })
      } else {
        // No function syntax available in the alias chain as context is lazy loaded
        ApiFieldGenerator.defineProperty(instance, alias, {
          enumerable:   true,  // expose in for( key in this ) loop
          configurable: true,  // allow property to be redefined later
          get: function() {
            context = (_.isString(context) ? _.get(instance, context) : context) || instance; // lazy load context, unmatched string defaults to original_instance
            return AFG._resolveFunctionChain(instance, field, context);
          }
        }, { generator: 'aliasFunction', priority: false })
      }
    },
    _resolveFunctionChain: function(instance, field, context) {
      context = (_.isString(context) ? _.get(instance, context) : context) || instance; // lazy load context, unmatched string defaults to original_instance

      var original = {
        field:    field,
        context:  context,
        instance: instance
      };

      var field_array = AFG._convertSelectorToArray(field); // Lodash optimization
      var output = instance;
      try {
        for( var i=0, n=field_array.length; i<n; i++ ) {
          var child_field = field_array[i];

          var field_is_function = false;
          if( _.endsWith(child_field, '()') ) {
            child_field       = child_field.replace('()', '');
            field_is_function = true;
          }


          if( output !== null && output !== undefined ) {
            output = output[child_field];
          } else {
            console.error("ApiFieldGenerator::_resolveFunctionChain", "unable to resolve chain", field_array.join('.'), 'at', child_field, original);
          }

          // No context available during climb through field_array
          if( field_is_function ) { // Attempt to call using
            if( output && _.isFunction(output) ) {
              output = output.call(context);
            } else {
              console.error("ApiFieldGenerator::_resolveFunctionChain", child_field + "() is not a function", output, 'for', field_array.join('.'), output, original);
              return null;
            }
          }
        }
      } catch(exception) {
        console.error("ApiFieldGenerator::_resolveFunctionChain", "unable to resolve chain", field_array.join('.'), 'at', child_field, output, original, exception);
        return null;
      }
      return output;
    },

//     aliasFunction: function(instance, alias, field, context) {
//       ApiFieldGenerator.defineProperty(instance, alias, {
//         enumerable:   true,  // expose in for( key in this ) loop
//         configurable: true,  // allow property to be redefined later
//         get: function() {
//           context = (_.isString(context) ? _.get(instance, context) : context) || instance; // lazy load context
//           var func = _.get(instance, field);
//           return _.isFunction(func) ? func.call(context) : null
//         }
//       }, { generator: 'alias', priority: false })
//     },

    /**
     * Maps: instance[alias] -> _.pick(instance, fields)
     * @param {Object}               instance    ApiBaseClass::this
     * @param {string|Array<string>} alias       deep selector for alias location
     * @param {Array<string>}        fields      deep selector for instance fields to use as alias properties
     */
    objectAlias: function(instance, alias, fields) {
      ApiFieldGenerator.defineProperty(instance, alias, {
        value: {}
      }, { generator: 'objectAlias', priority: false });

      _.each(fields, function(field) {
        var field_array = AFG._convertSelectorToArray(field); // Lodash optimization
        var last_field  = _.last(field_array);
        var object      = _.get(instance, alias);
        ApiFieldGenerator._defineDeepProperty(object, last_field, {
          enumerable:   true,  // expose in for( key in this ) loop
          configurable: true,  // allow property to be redefined later
          get: function()      { return _.get(instance, field_array); }, // context: this === instance
          set: function(value) { _.set(instance, field_array, value); }  // context: this === instance
        })
      })
    },

    /**
     * Maps: instance[field] -> instance.$data[field].unCamelCase()
     */
    unCamelCase: function(instance, field) {
      var data = instance.$data;

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          return String(data[field] || '').replace(/([a-z])([A-Z])/g, '$1 $2');
        },
        set: function(value) {
          data[field] = String(value  || '').replace(/\s+/g, '') || null;
        }
      }, { generator: 'unCamelCase', priority: true });
    },

    /**
     * Maps: instance[field] -> _(instance).pick(fields).values().filter().join(seperator || ' ')
     */
    join: function(instance, field, fields, seperator) {
      var data = instance.$data;
      seperator = seperator || ' ';

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          return _(instance).pick(fields).values().filter().join(seperator || ' ');
        }
      }, { generator: 'join', priority: false });
    },

    /**
     * Maps: instance[alias] -> lookup[instance[field]]
     */
    lookupAlias: function(instance, alias, field, lookup) {
      lookup = lookup || {};

      ApiFieldGenerator.defineProperty(instance, alias, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          return lookup[instance[field]] || null;
        },
        set: function(value) {
          // _.findKey(lookup, _.matches(value)); doesn't seem to work for single valued hashes
          for( var key in lookup ) {
            if( lookup[key] == value ) {
              instance[field] = key;
              return;
            }
          }
          instance[field] = null;
        }
      }, { generator: 'lookup', priority: false });
    },

    /**
     * @untested
     * Maps: instance[alias] -> lookup[instance.$data[field]]
     */
    lookupOverwrite: function(instance, field, lookup) {
      var data = instance.$data;

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          return lookup[data[field]] || null;
        },
        set: function(value) {
          // _.findKey(lookup, _.matches(value)); doesn't seem to work for single valued hashes
          for( var key in lookup ) {
            if( lookup[key] == value ) {
              data[field] = key;
              return;
            }
          }
          instance[field] = null;
        }
      }, { generator: 'lookup', priority: true });
    },

    /**
     * Wraps a this.$data item with a class constructor but storing itself in instance.$cache
     * - class can have any structure, but write operations do not propagate to instance.$data
     *
     * @param {object} instance
     * @param {string} field
     * @param {object} klass
     */
    wrapClassReadOnly: function(instance, field, klass) {
      klass = ApiFieldGenerator._getKlass(klass);
      var data = instance.$data;
      var cache = instance.$cache;

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          if( !cache[field] ) {
            cache[field] = new klass(data[field]);
          }
          return cache[field];
        },
        set: function(value) {
          if( value instanceof klass ) {
            cache[field] = value;
          } else {
            cache[field] = new klass(value);
          }
        }
      }, { wrapClass: 'wrapClassReadOnly', priority: true });
    },

    /**
     * Wraps a this.$data item with a class constructor overwriting the value in instance.$data
     * - this assumes the class has the appearance of flat json object via ApiFieldGenerator.unenumerableKlassPrototype
     *
     * @param {object} instance
     * @param {string} field
     * @param {object} klass
     */
    wrapClassOverwrite: function(instance, field, klass) {
      klass = ApiFieldGenerator._getKlass(klass);
      var data = instance.$data;

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          if(!( data[field] instanceof klass )) {
            data[field] = new klass(data[field]);
          }
          return data[field];
        },
        set: function(value) {
          if( value instanceof klass ) {
            data[field] = value;
          } else {
            data[field] = new klass(value);
          }
        }
      }, { wrapClass: 'wrapClassReadOnly', priority: true });
    },

    /**
     * Creates a single valued lazy load field
     *
     * Example:
     *   ApiFieldGenerator.lazyLoadId:(this, "fund", "Fund") {
     *   - maps: this["fund_id"] -> this.$data["fund"]
     *   - maps: this["fund"]    -> Fund.load({ id: this["fund_id"], options })
     *
     * @param instance  {object}          "this" within context of ApiBaseClass instance
     * @param field     {String}          name of the api field within this.$data
     * @param klass     {ApiBaseClass|String} klass to initialize, can be passed in as a string to avoid circular dependency injection
     */
    lazyLoadId: function(instance, field, klass) {
      klass = ApiFieldGenerator._getKlass(klass);

      var id_field   = field + '_id';
      var uuid_field = field + '_uuid';
      var cache = instance.$cache;

      // Map this.field_id -> this.$data.field
      ApiFieldGenerator.defineProperty(instance, id_field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function()      { return this.$data[field] || null;  },
        set: function(value) { this.$data[field] = value; }
      }, { generator: 'lazyLoadId', priority: true });

      ApiFieldGenerator.defineProperty(instance, uuid_field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function()      { return _.get(this[field], 'uuid') || null;  }
      }, { generator: 'lazyLoadId', priority: true });

      // Map: this.field -> klass.load({ id: this.field_id })
      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          if( !this[id_field] ) {
            cache[field] = null
          }
          else if( !cache[field] || cache[field].id != this[id_field] ) {
            cache[field] = klass.load(this[id_field]);
          }
          return cache[field] || null;
        },
        set: function(value) {
          this[id_field] = ApiFieldGenerator._getId(value);
        }
      }, { generator: 'lazyLoadId', priority: true });


      // Handle pre-injected data structures
      if( instance[id_field] && typeof instance[id_field] === "object" && instance[id_field].id ) {
        var preloadedData = instance[id_field];

        // instance[field] setter should automatically update instance[id_field] value to Number(id) - after klass.load() chain
        instance[field] = klass.load({
          id:     preloadedData.id,
          data:   preloadedData,
          load:   false,
          loaded: true
        });
      }


      ////***** Previous abstracted implementation *****//
      //
      //this.lazyLoadField(instance, field, klass, options,
      //  instance.$cache,
      //  {
      //    id:  function()      { return this[id_field]; },                      // context: this == instance
      //    set: function(value) { this[id_field] = value && value.id || null; }, // context: this == instance
      //    cache_key: field
      //  }
      //);
      //instance[id_field] = instance[id_field] || null; // prefer null over undefined
    },

    //
    /**
     *  SPEC: Current view model is assumed to be read only, thus adding, removing or editing ids is not currently supported
     *
     *  instance.$data.funds:
     *   - instance.fund_ids   = [2,4,6]
     *   - instance.funds      = [Fund.load(2), Fund.load(4), Fund.load(6)]
     *   - instance.fund_index = {2: Fund.load(2), 4: Fund.load(4), 6: Fund.load(6) }
     */
    lazyLoadIdArray: function(instance, field, klass) {
      klass = ApiFieldGenerator._getKlass(klass);

      var self  = this;
      var cache = instance.$cache;

      // id_field: funds -> fund_ids
      // id_field: share_classes -> share_class_ids
      // id_field: employees -> employee_ids
      var id_field = String(field).match(/ees$/) ? String(field).replace(/s$/,  '') + '_ids'
                                                 : String(field).replace(/e?s$/,'') + '_ids';

      var uuid_field  = String(id_field).replace(/_ids$/, '_uuids');
      var index_field = String(id_field).replace(/_ids$/, '_index');


      // Map <Array> this.field_ids -> <Array> this.$data.field
      ApiFieldGenerator.defineProperty(instance, id_field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function()      { return this.$data[field];  }, // context: this === instance
        set: function(value) { this.$data[field] = value; }  // context: this === instance
      }, { generator: 'lazyLoadIdArray', priority: true });
      instance[id_field] = instance[id_field] || []; // initialize if null

      // Map <Array> this.field_ids -> <Array> this.$data.field
      ApiFieldGenerator.selfCaching(instance, uuid_field, function() {
        return _.pluck(this[field], 'uuid'); // context: this === instance
      }, { generator: 'lazyLoadIdArray', priority: true });

      // Map <Array> this[field] -> <Array> this[id_field].map(klass.load)
      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          // context: this === instance
          var array_cache_key = [ field, '[', String(instance[id_field]), ']'].join('');
          if( !cache[array_cache_key] ) { // || cache[array_cache_key].length !== instance[id_field].length ) {
            cache[array_cache_key] = _.map(instance[id_field], function(item) {
              var id = Number(item && item.id || item);
              return id && klass.load(id) || null;
            });
          }
          return cache[array_cache_key];
        },
        set: function(value) {
          // context: this === instance
          instance[id_field] = _(value).map(ApiFieldGenerator._getId).filter().value();
        }
      }, { generator: 'lazyLoadIdArray', priority: true });

      // Map <Object> instance[index_field] -> <Object> cache[field]
      ApiFieldGenerator.defineProperty(instance, index_field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          // context: this === instance
          // dynamically recreate instance[index_field] if instance[id_field] changes
          var hash_cache_key = [ field, '<', String(instance[id_field]), '>'].join('');
          if( !cache[hash_cache_key] ) { // || cache[array_cache_key].length !== instance[id_field].length ) {
            cache[hash_cache_key] = {};

            _.each(instance[id_field], function(item) {
              var id = (item && typeof item === "object") ? item.id : Number(item) || null; // may be either an preloaded object or numeric id

              // TODO: Figure out a mechanism for watching destroy events on child instances
              // Object.defineProperty() and not ApiFieldGenerator.defineProperty() as not applying directly to instance
              Object.defineProperty(cache[hash_cache_key], id, {
                enumerable:   true,  // expose in for( key in this ) loop
                configurable: true,  // allow property to be redefined later
                get: function()      { return klass.cache[id] || klass.load(id) || null;  }, // context: this === instance
                set: function(value) {
                  var new_id = ApiFieldGenerator._getId(value);
                  if( id && new_id && id != new_id && instance[id_field].indexOf(id) !== -1 ) {
                    instance[id_field].splice(instance[id_field].indexOf(id),1, new_id);
                  }
                }
              });
            });
          }
          return cache[hash_cache_key];
        },
        set: function(value) {
          // context: this === instance
          instance[id_field] = _(value).map(ApiFieldGenerator._getId).filter().value();
        }
      }, 'lazyLoadIdArray');

      // TODO: Figure out a mechanism for watching destroy events on child instances
      // Handle pre-injected data structures
      _.each(instance[id_field], function(preloadedData, index) {
        if( typeof preloadedData === "object" ) {
          var id = Number(preloadedData.id);
          if( id ) {
            klass.load({
              id:     id,
              data:   preloadedData,
              load:   false,
              loaded: true
            });
          }

          // preloadedData may be multiply nested, don't modify until klass.load() chain is fully loaded
          // NOTE: need to manually set id for lazyLoadIdArray, but not lazyLoadId
          instance[id_field][index] = id;
        }
      });
    }


//    /**
//     * Fully abstracted method for defining a lazyLoad field without corresponding id_field
//     *
//     * NOTE: Attempting to define lazyLoadField({ instance:, field:, klass:, options:, cache:, callbacks: })
//     *       resulted in getting shared pointers to the cache object
//     *
//     * @param instance  {object}          "this" within context of ApiBaseClass instance
//     * @param field     {String}          name of the api field within this.$data
//     * @param klass     {ApiBaseClass|String} klass to initialize, can be passed in as a string to avoid circular dependency injection
//     * @param options   {object}          [optional] additional options to pass into klass constructor
//     * @param cache     {object}          defaults to instance.$cache
//     * @param callbacks {object[function|value]} functions are called in the context of "this" else return value
//     * @param callbacks.id                function(set_value) - value passed in on set, null on get
//     * @param callbacks.set               function(set_value) - closure for additional set logic
//     * @param callbacks.cache_key         function(id)        - used by: _.get(cache, cache_key) and _.set(cache, cache_key, set_value)
//     * @private
//     * @unused
//     */
//    lazyLoadField: function(instance, field, klass, options, cache, callbacks) {
//      options   = _.extend({}, options);
//      cache     = cache || instance.$cache;
//      callbacks = _.extend({
//        //// Reference implementations subject to change, please explicitly define
//        id:        function(set_value) { return set_value && set_value.id || instance.$data[field] || null; },
//        set:       function(set_value) { return instance.$data[field] = ApiFieldGenerator._getId(set_value) || null; },
//        cache_key: function(id)        { return instance[field]; }
//      }, callbacks);
//
//      var call = function(functionOrValue, value) {
//        if( functionOrValue instanceof Function ) {
//          return functionOrValue.call(instance, value);
//        } else {
//          return functionOrValue || null;
//        }
//      };
//
//      // Map: instance[field] -> klass.load({ id: callbacks.id })
//      ApiFieldGenerator.defineProperty(instance, field, {
//        enumerable:   true,  // expose in for( key in this ) loop
//        configurable: true,  // allow property to be redefined later
//        get: function() {
//          options.id    = call(callbacks.id);
//          var cache_key = call(callbacks.cache_key, options.id);
//
//          if( !_.get(cache, cache_key) && options.id ) {
//            _.set(cache, cache_key, klass.load(options));
//          }
//          return _.get(cache, cache_key) || null;
//        },
//        set: function(set_value) {
//          if( set_value && set_value.klass !== klass ) { console.warn("ApiFieldGenerator.lazyLoadField::set(<", _.get(set_value, 'klass.displayName'), ">) - not of klass: <", _.get(klass, 'klass.displayName'), ">"); } // null is a valid parameter
//
//          var cache_key = call(callbacks.cache_key, set_value.id);
//          _.set(cache, cache_key, set_value || null);
//          call(callbacks.set, set_value);
//        }
//      });
//    }

  };
  return ApiFieldGenerator;
});
;

//***** src/models/util/ApiCache.js *****//
/**
 *  ApiCache[this.klass.displayName][this.id] is the global cache structure for ApiBaseClass and all children
 */
angular.module('edgefolio.models').factory('ApiCache',  function() { return {} }); // .factory() needed to reset ApiCache between tests;

//***** src/models/util/Edgefolio.js *****//
/**
 *  Convenience namespace for accessing model framework from console, or angular view templates
 */
angular.module('edgefolio.models').factory('Edgefolio', function() { return {} });
angular.module('edgefolio.models').run(function($injector, $rootScope, $window, Edgefolio, ApiFieldGenerator) {
  $window.Edgefolio    = Edgefolio;
  $rootScope.Edgefolio = Edgefolio;

  var classNames = [
    "ApiCache", "ApiFieldGenerator", "CallbackPromise",

    "ApiBaseClass",
    "User",
    "Company", "ManagementCompany", "InvestmentCompany", "ServiceProvider",
    "Fund", "ShareClass",
    "Person", "Manager", "Investor",
    "DateBucket", "TimeSeries",
    //"DateBucketMapped", "DateBucketValue", "TimeSeriesValue",

    "ApiCollection",
    "Indexes", "Benchmarks", "Index",
    "FundGroups", "FundGroup"
  ];
  for( var i in classNames ) {
    $rootScope[classNames[i]] = Edgefolio[classNames[i]] || ApiFieldGenerator._getKlass(classNames[i]);
  }
});
;

//***** src/models/util/UnenumerablePrototype.js *****//
/**
 *  @class UnenumerablePrototype
 */
angular.module('edgefolio.models').factory('UnenumerablePrototype', function(ApiFieldGenerator) {

  var UnenumerablePrototype = new JS.Class("UnenumerablePrototype", {
    /**
     * Initialize needs to be defined as a function on UnenumerablePrototype.prototype for the code below to work
     */
    initialize: function() {
      var self = this;
    },
    extend: {
      /**
       * @jsclass internal class initialization function
       * This ensures that any functions defined on the class prototype do not pollute the enumerable namespace
       */
      resolve: function() {
        this.callSuper();
        ApiFieldGenerator.klass.unenumerableKlassPrototype(this); // Make prototype properties UnenumerablePrototype
      },

      /**
       * @jsclass internal method, called on class extend for all functions
       * This ensures that JS.Class keyword injections do not pollute the enumerable namespace
       *
       * JS.Class reads the function as a string and detects if these are there, if so its adds the callSuper() binding
       * This hack triggers callSuper() insertion on every function call, and guarantees that it will never be enumerable
       *
       * Code below has hardcoded the assumption that only the callSuper() keyword is ever used in this class hierarchy
       *   _.pluck(JS.Method._keywords, 'name') == ["callSuper", "blockGiven", "yieldWith"]
       *
       * Attempting to optionally add the wrapper function based on callable.toString() fail tests on deeply nested classes
       *
       * NOTE: ConstantScope is the class to look at for attempting to do code injections via a module
       */
      define: function(name, callable, options) {
        var _callable = function() {
          // The string 'callSuper' needs to appear in the text of the function for this to work
          Object.defineProperty(this, 'callSuper', { enumerable: false, configurable: true, writable: true });
          return callable.apply(this, arguments);
        };
        return this.callSuper(name, _callable, options);
      }
    }

    //// Additional Methods in JS.Class that can potentually be hooked into
    //
    // initialize: function(name, methods, options) {},
    // define: function(name, callable, options) {},
    // include: function(module, options) {},
    // alias: function(aliases) {},
    // resolve: function(host) {},
    // shouldIgnore: function(field, value) { return false; },
    // ancestors: function(list) { return list; },
    // lookup: function(name) { return methods; },
    // includes: function(module) { return false; },
    // instanceMethod: function(name) { return this.lookup(name).pop(); },
    // instanceMethods: function(recursive, list) { return methods; }
    // match: function(object) { return object && object.isA && object.isA(this); },
    // toString: function() { return this.displayName; }
  });

  return UnenumerablePrototype;
});


/**
 * @broken
 * src/models/_tests/util/UnenumerableApiBaseClass.spec.broken.js
 * it("UnenumerablePrototype", function() {
 *    var instance = UnenumerableApiBaseClass.load();
 *   expect(_.keys(instance)).to.deep.equal([]);
 * });
 */
angular.module('edgefolio.models').factory('UnenumerableApiBaseClass', function(ApiBaseClass, ApiFieldGenerator) {
  var UnenumerableApiBaseClass = new JS.Class("UnenumerableApiBaseClass", ApiBaseClass, {
    /**
     * Defining initialize() in this specific instance breaks JS.Class
     */
    // initialize: function() {},
    $reload: function() {
      console.error("@broken - UnenumerableApiBaseClass does not make instance variables unenumerable");

      this.callSuper();

      // AssertionError: expected [ '$options', 'id', '$loaded', '$dataVersion', '$data', '$cache', '$fields', '$loadPromise', '$preloadPromise', 'result_ids', 'results', 'result_index' ] to deeply equal []
      var self = this;
      _(this).omit(_.isFunction).keys().sortBy().each(function(key) {
        Object.defineProperty(self, key, { enumerable: false, configurable: true, writable: true });
      });
    },
    extend: {
      resolve: function() {
        this.callSuper();
        ApiFieldGenerator.klass.unenumerableKlassPrototype(this); // Make prototype properties UnenumerablePrototype
      },
      define: function(name, callable, options) {
        var _callable = function() {
          // The string 'callSuper' needs to appear in the text of the function for this to work
          Object.defineProperty(this, 'callSuper', { enumerable: false, configurable: true, writable: true });
          return callable.apply(this, arguments);
        };
        return this.callSuper(name, _callable, options);
      }
    }
  });
  return UnenumerableApiBaseClass;
});
;

//***** src/models/api/ApiBaseClass.js *****//
/**
 *  This is the base ApiBaseClass for the v3 model framework
 *  @documentation JS.Class: http://jsclass.jcoglan.com/
 *
 *  NOTE: All instance methods and parameters should be prefixed with $ to avoid namespace collisions with dictionary $data
 *  TODO: How to implement angular $$hash for $scope updates
 *
 *  Usage:
 *    var Fund =  new JS.Class("this.klass.displayName", ApiBaseClass, { extend: { classMethod: }, instanceMethod: })
 *    var fund = Fund.load({ id: 1 })                         // returns object before load
 *    var fund = Fund.load({ stateParams: { fund_id: 1 }})    // defaults to ui-router $stateParams
 *    Fund.load({ id: 1 }).loadPromise.then(function(fund){}) // async loading
 *    fund.klass.displayName                                  // access displayName from class constructor
 *    fund.klass.url                                          // access class methods or attributes
 */
angular.module('edgefolio.models').factory('ApiBaseClass', function(
  $injector, $q, $http, $cacheFactory,
  Edgefolio, ApiCache, ApiFieldGenerator, CallbackPromise, EventModule
) {
  var anonClassSetNameCounter = 1;
  var ApiBaseClass = new JS.Class("ApiBaseClass", {
    include: EventModule,

    //***** Instance Parameters - initialize in constructor - fields here are defined in .prototype *****//

    uuid:         null,   // {String} 'Fund:1'   input to ApiBaseClass.loadUuid()
    $$hashKey:    null,   // {String} 'Fund:1:0' for Angular ng-repeat and ApiFieldGenerator.memoize()
    $options:     null,   // {Object} original options the instance was intialized with
    $dataVersion: null,   // {Number} internal version number, incremented on setData
    $data:        null,   // {Object} data as provided by the api
    $cache:       null,   // data cache for ApiFieldGenerator
    $fields:      null,   // ApiFieldGenerator: instance.$fields = { generatorName: { field: <Boolean> }}
    $loadPromise: null,   // <CallbackPromise>
    $loaded:      false,  // <Boolean> has $loadPromise been resolved


    //***** Instance Methods *****//

    /**
     *  Loads a new instance, either fetched from cache or newly created and added to cache
     *  ApiBaseClass.load(1) === new ApiBaseClass(1) === ApiBaseClass.cache[1] (if cached)
     *
     *  @param id      {Number|String|Object}  this.$options = this.klass.parseOptions(id, config)
     *  @param config  {?Object}               this.$options = this.klass.parseOptions(id, config)
     *
     *  @param config.id     {Number|String|function} ID to load
     *  @param config.data   {Object}  define new data for instance
     *  @param config.load   {Boolean} request cached http update for instance [default: true if config.data set]
     *  @param config.force  {Boolean} trigger uncached htto update for instance
     *  @param config.loaded {Boolean} trigger resolution of $loadPromise      [default: true if config.data set]
     *  @param config.silent {Boolean} disable console errors and warnings - for unit tests
     *  @constructor
     */
    initialize: function(id, config) {
      if( !config && typeof id === "number" && this.klass.cache[id] ) { return this.klass.cache[id]; } // short circuit simplest case, bypassing parseOptions()

      this.$options = this.klass.parseOptions(id, config);
      this.id       = this.$options.id; // overwritten by $initializeObjectProperties()

      // Check to see if object already exists in cache, and set or return as necessary
      // NOTE: null is a valid cache id, even if this.idParams - this prevents infinite loops when accessed from HTML layer
      if( this.klass.cache[this.id] ) {
        if( this.$options.data ) {
          this.klass.cache[this.id].$setData(this.$options.$data);
        }
        if( this.$options.force ) {
          this.klass.cache[this.id].$reload({
            force: this.$options.force,
            load:  this.$options.force
          });
        }
        return this.klass.cache[this.id];
      } else {
        this.klass.cache[this.id] = this;
      }

      this.$loaded      = !!this.$loaded; // instance paramters declared outside initialize do not seem to show
      this.$dataVersion = this.$dataVersion || 0;
      this.uuid         = [this.klass.displayName, this.id].join(':'); // 'Fund:1:0'
      this.$$hashKey    = [this.klass.displayName, this.id, this.$dataVersion].join(':');
      this.$data        = {};
      this.$cache       = {};
      this.$fields      = {};
      this.$reload(_.extend({ force: false, load: true }, this.$options));
    },

    /**
     *  @untested
     *  Force reloads the object from the API, resetting $loadPromise but preserving any unresolved chains
     *  - Called by initialize with this.$options
     *
     *  $reload() is potentually called as this.klass.cache[this.id].$reload(options) - so don't read this.$options
     *
     *  @param options.data   - define new data for instance
     *  @param options.load   - request cached http update for instance
     *  @param options.force  - trigger uncached htto update for instance
     *  @param options.loaded - trigger resolution of $loadPromise
     *  @returns {CallbackPromise}
     */
    $reload: function(options) {
      options = options || {};
      options = {
        force:   options.force,
        load:    options.load,
        loaded:  options.loaded,
        data:    options.data
      };
      this.$options = _.extend(this.$options, options);

      this.$initializeLoadPromise();
      this.$initializePreloadPromise();

      this.$setData(options.data);
      if( options.load !== false ) { // assume true if undefined
        this.$loadData(options);
      }
      if( options.loaded ) {
        this.$loadPromise.resolve(this); // set this.$loaded = true; and resolve $loadPromise
      }

      return this.$loadPromise; // allow instance.$reload().then()
    },
    $initializeLoadPromise: function() {
      var self = this;
      this.$loadPromise = CallbackPromise(this.$loadPromise || null); // chain any unresolved .then() blocks to the new promise object
      this.$loadPromise.callback(function() {
        self.$loaded = true; // doesn't matter if this gets called multiple times on $reload
      });
    },
    $initializePreloadPromise: function() {
      // Wait for $preloadPromise to be accessed before lazy-loading child data
      this.klass.ApiFieldGenerator.defineGetters(this, {
        $preloadPromise: function() {
          return $q.when(this.$loadPromise)
        }
      })
    },


    /**
     *  Defines the getter/setter mappings for this.data
     *  Gets run on original initialization, and again after this.$setData(),
     *  as this function may depend on the keys in this.data
     *
     *  Extend $initializeObjectProperties with additional Object.defineProperty() specifications
     *  NOTE: remember to also call: this.callSuper()
     */
    $initializeObjectProperties: function() {
      for( var field in this.$data ) {
        this.klass.ApiFieldGenerator['static'](this, field, this.$data);
      }
      this.klass.ApiFieldGenerator.aliasFunction(this, 'url', '$getUrl()');
    },

    //***** API CRUD Methods *****//

    $deleteFromApi: function() {
      var self = this;
      this.$invalidateCache();
      return $http({
        method: "DELETE",
        url:    this.$getUrl()
      }).then(function() {
        self.$trigger('destroy', this); // @unused - TODO: Implement in ApiFieldGenerator
        delete self.klass.cache[self.id];
        return self;
      })
    },

    //***** Utility Methods *****//

    /**
     * @untested
     * Returns the url for the current object
     * @returns {String}
     */
    $getUrl: function() {
      return this.klass.getUrl(this.id);
    },


    //***** Data Loading *****//

    /**
     * @untested
     * Overridable setter function
     * @param data
     */
    $setData: function(data) {
      if( !_.isObject(this.$data) ) {
        this.$data = {};
      }
      if( _.isObject(data) ) {
        // WARNING: this creates a pointer, rather than a clone - _.cloneDeep() is potentially expensive
        this.$dataVersion = this.$dataVersion + 1;
        this.$$hashKey    = [this.klass.displayName, this.id, this.$dataVersion].join(':'); // 'Fund:1:0'
        this.$data        = data;
      }
      this.$initializeObjectProperties();
      this.$trigger('$setData', this)
    },

    /**
     * @untested
     * Calls $fetchData(), $setData(), returns resolved _loadDeferred.promise
     * @returns Promise(response.data || null)
     */
    $loadData: function(options) {
      var self = this;
      return this.$fetchData(options)
        .then(function(responseData) {
          self.$setData(responseData);
          return self.$loadPromise.resolve(self);
        })
        ["catch"](function(response) {
          return self.$loadPromise.reject(response);
        })
    },

    /**
     * @untested
     * Fetches response.data from the api and returns promise with raw data
     * @param options
     * @returns Promise(response || null)
     */
    $fetchData: function(options) {
      var self = this;
      options = _.extend({
        url:    this.$getUrl(),
        silent: false,
        force:  false
      }, this.$options, options);

      if( options.force ) {
        this.$invalidateCache(options.url);
      }
      return $http.get(options.url, { cache: true }).then(function(response) {
        if( !response.data || response.status >= 400 ) {
          options.silent || console.error(self.klass.displayName, '::$fetchData() invalid response: ', options.url, response);
          return $q.reject(response);
        } else {
          return response.data;
        }
      })
    },
    $invalidateCache: function(url) {
      url = url || this.$getUrl();
      var path = url.replace(new RegExp('^https?://[^/]+/'), '/'); // $cacheFactory indexes on url path without domain
      $cacheFactory.get('$http').remove(path);
    },

    toString: function() {
      return this.$$hashKey;
    },
    /**
     * BUGFIX: inspectlet.js: Uncaught TypeError: Converting circular structure to JSON - SPEC: Remove dependency on inspectlet due to legal/privacy issues
     */
    toJSON: function() {
      return JSON.stringify(this.$data);
    },
    /**
     * @return {Object} object litteral
     */
    toObject: function() {
      return _.clone(this);
    },

    //***** Class Methods and Parameters *****//

    extend: {
      // displayName: "",    // Dynamically inserted by JS.Class("this.klass.displayName", ApiBaseClass)
      url:     null,         // application-constants.js - API.HEDGE_FUNDS_DETAILS: '/api/funds/:fund_id/',
      idParam: null,         // fund_id
      cache:   {},
      ApiFieldGenerator: ApiFieldGenerator, // convenience pointer

      defaultOptions: {
        id:          null,  // <int>        explicit id, overriding stateParams
        data:        null,  // <Object>     data to load instance with
        load:        true,  // <Boolean>    explicitly set to false if no data loading is required
        silent:      false  // <Boolean>    disable console warnings
      },

      // Called by class initialization function
      setName: function(name) {
        // Keep this.displayName if set to prevent JS.Class renaming klass to Benchmarks.resultsKlass etc.
        name = this.displayName || name || "AnonClass-" + (anonClassSetNameCounter++);
        return this.callSuper(name);
      },

      // Class initialization function
      resolve: function() {
        this.cache = ApiCache[this.displayName] = ApiCache[this.displayName] || {};

        Edgefolio[this.displayName] = Edgefolio[this.displayName] || this;
        return this.callSuper();
      },

      /**
       * Class method for loading a new instance, either fetched from cache or newly created and added to cache
       * ApiBaseClass.load(1) === new ApiBaseClass(1) === ApiBaseClass.cache[1] (if cached)
       *
       * @param id      {number|string|object}
       * @param config  [optional] {object}
       * @returns {ApiBaseClass}
       */
      load: function(id, config) {
        // short circuit simplest case, bypassing parseOptions() - null is a valid id
        if( !config && !_.isObject(id) && this.cache[id] ) {
          return this.cache[id];
        }

        //this.isValid = this.isValid || this.validateClass(); // only validate on first load
        return new this(id, config); // id singleton pattern moved to instance constructor
      },

      /**
       * @tested
       * @param   {Any}         1, "ApiBaseClass:1", ["ApiBaseClass","1"], ApiBaseClass.load(1), $stateParams, null
       * @returns {String|null} eg 'Fund:1', 'FundGroups:' OR null for invalid input
       */
      toUuid: function(uuid) {
        if( _.isNull(uuid) && _.isUndefined(uuid) ) {
          return null;
        }
        if( _.isArray(uuid) && _.isFinite(Number(uuid[1])) ) {
          return uuid.join(':');
        }
        if( _.isString(uuid) && _.contains(uuid, ':') ) { // already a uuid
          return uuid;
        }
        if( uuid && uuid.uuid ) {
          return uuid.uuid;
        }
        else {
          if( this.idParam ) {
            var options = this.parseOptions(uuid, { silent: true });
            return options.id && [this.displayName, options.id].join(':') || null;
          } else {
            return this.displayName + ':';
          }
        }
      },
      /**
       * @tested
       * _.memoize() required to return same Array object literal (not needed for strings)
       * Prevents: angular exception: 10 $digest() iterations reached. Aborting!
       *
       * @param   {Array<Any>}  1, "ApiBaseClass:1", ["ApiBaseClass","1"], ApiBaseClass.load(1), $stateParams, null
       * @returns {Array}       filtered - ['Fund:1', 'FundGroups:']
       */
      toUuids: ApiFieldGenerator.memoize(function(ids) {
        var output   = _.map(ids, this.toUuid, this);
        this.cache.toUuids         = this.cache.toUuids || {};
        this.cache.toUuids[output] = this.cache.toUuids[output] || output; // return same object literal for view layer
        return this.cache.toUuids[output];
      }),


      /**
       * @untested
       * Loads an ApiBaseClass instance from String
       * @param   {String|Array|Number}  uuid          "Fund:1" || ["Fund", "1"] || 1
       * @param   {String|Object}        defaultClass  "Fund" || Fund
       * @returns {ApiBaseClass}
       */
      loadUuid: function(uuid, defaultClass) {
        var id, klass;

        // If a instance has been passed in directly, just return it
        if( uuid && uuid.klass ) {
          return uuid;
        }
        defaultClass = defaultClass || this; // For subclasses

        uuid = _.isArray(uuid) ? uuid : String(uuid).split(':');
        if( !_.isNaN(Number(uuid[0])) ) {
          klass = defaultClass;
          id    = Number(uuid[0]);
        } else {
          klass = uuid[0];
          id    = Number(uuid[1]);
        }
        if( !id ) {
          return null;
        }
        if( _.isString(klass) ) {
          klass = ApiFieldGenerator._getKlass(klass);
        }

        if( klass && klass.load ) {
          if( !klass.idParam ) {
            return klass.load(null);
          } else {
            return id && klass.load(id) || null
          }
        } else {
          // Only console.error if klass is not defined
          console.error("ApiBaseClass.loadUuid(", uuid, defaultClass, ") - unable to parse options");
          return null;
        }
      },

      /**
       *  Parse (id, config) in an implicit and intuitive way
       *  Examples:
       *    ApiBaseClass.load() - implicit via $stateParams
       *    ApiBaseClass.load(1)
       *    ApiBaseClass.load("1")
       *    ApiBaseClass.load({ id: 1 })
       *    ApiBaseClass.load({ fund_id: 1 })
       *    ApiBaseClass.load({ stateParams: { fund_id: 1 }})
       *    ApiBaseClass.load(1, { silent: true })
       *    ApiBaseClass.load({ id: 1 }, { silent: true })
       *    ApiBaseClass.load({ fund_id: 1 }, { silent: true })
       *
       *  @param id      {number|string|object}
       *  @param config  [optional] {object}
       *  @returns       {object}
       */
      parseOptions: function(id, config) {
        config = config || {};
        var options = _.extend({}, this.defaultOptions, {
          // config.load and config.loaded can still be manually overridden
          load:    !(_.get(id, 'data') || _.get(config, 'data')),
          loaded: !!(_.get(id, 'data') || _.get(config, 'data'))
        }, config);

        if( typeof id === "number" || typeof id == "string" ) {
          options.id = id;
        }
        else if( typeof id === "object" ) {
          options = _.extend(options, id);
        }

        options.id = options.id
                  || this.idParam && options[this.idParam]
                  || options.stateParams && options.stateParams[this.idParam]
                  || null;

        if( options.id instanceof Function ) {
          options.id = options.id.call(this);
        }
        if( typeof options.id === "string" && options.id.match(/^\d+$/) ) {
          options.id = Number(options.id);
        }
        options[this.idParam] = options.id || null;

        //// TODO: Commented out for production deployment - trace back null calls
        //if( this.idParam && !options.id ) {
        //  options.silent || console.error(this.displayName, '::load() - unable to parse id: ', id, config);
        //}

        delete options.stateParams;
        return options;
      },

      validateClass: function() {
        var isValid = true;

        if( typeof this.url         !== 'string' ) { console.warn(this.displayName, '::load() - invalid this.url: ',     this); isValid = false; }
        if( typeof this.idParam     !== 'string' ) { console.warn(this.displayName, '::load() - invalid this.idParam: ', this); isValid = false; }

        return isValid;
      },

      /**
       * @untested
       * @returns {string}
       */
      getUrl: function(id, config) {
        var options = this.parseOptions(id, config);
        var url = String(this.url || '');
        if( this.idParam && options.id ) {
          url = url.replace(new RegExp(':'+this.idParam, 'g'), options.id);
        }
        return url;
      },

      /**
       * @untested
       * TODO: should really be a class property
       * @returns {string}
       */
      getIndexUrl: function() {
        return String(this.url || '').replace(new RegExp(':'+this.idParam+'/*', 'g'), '');
      }
    }
  });

  return ApiBaseClass;
});
;

//***** src/models/api/Fund.js *****//
// https://v3.edgefolio.com/api/funds/
angular.module('edgefolio.models').factory('Fund', function(
  $q, ApiBaseClass, CountryCodes, LegalStructures, TimeSeries, Index, CurrencySymbolMap
) {
  var Fund = new JS.Class('Fund', ApiBaseClass, {
    extend: {
      url:       "/api/funds/:fund_id/",
      idParam:   "fund_id",
      risk_free_index_id: 63304 // HARD-CODED: { id: 63304, "name": "BofAML US Treasury Bills 1 Yr TR USD"," }
    },
    $reload: function() {
      this.callSuper();

      //this.klass.ApiFieldGenerator.defineGetters(this, {
      //  // Wait for $preloadPromise to be accessed before lazy-loading child data
      //});

      // Ensure risk_free_index is always loaded
      return this.$loadPromise.then(function(fund) {
        $q.all(
          _.pluck(fund.share_classes, '$loadPromise') // Force preload of all share class data
        )
        .then(function() {
          // Sort share classes by length of returns_time_series (longest first)
          fund.share_classes    = _.sortBy(fund.share_classes, function(share_class) { return -_.size(share_class.returns_time_series); });
          fund.base_share_class = _.first(fund.share_classes);
        })
        .then(function() {
          // BUGFIX: risk_free_index not always defined in unit tests
          if( fund.risk_free_index ) {
            return fund.risk_free_index.$loadPromise;
          }
        })
        .then(function() {
          return fund;
        })
      });
    },
    $initializePreloadPromise: function() {
      // Wait for $preloadPromise to be accessed before lazy-loading child data
      this.klass.ApiFieldGenerator.defineGetters(this, {
        $preloadPromise: function() {
          var self = this;
          return $q.when(self.$loadPromise)
          .then(function() {
            var promises = _([
              self.management_company,
              self.share_classes,
              self.service_providers,
              self.managers,
              self.category_benchmark_index,
              self.asset_class_benchmark_index,
              self.prospectus_benchmark_index,
              self.risk_free_index
            ])
            .flatten()
            .pluck('$loadPromise') // .pluck($loadPromise) only goes one level deep, .pluck('$preloadPromise') for fully recursive
            .reject(_.isNull)
            .map(function(promise) {
              return $q.when(promise)['catch'](_.noop);
            })
            .value();

            return $q.all(promises).then(function() {
              return self;
            });
          });
        }
      })
    },

    $setData: function(data) {
      // BUGFIX: _.extend() causing callSuper()::_.isObject() null data check to fail
      if( _.isObject(data) ) {
        data = _.extend({
          risk_free_index: this.klass.risk_free_index_id // HARD-CODED: { id: 63304, "name": "BofAML US Treasury Bills 1 Yr TR USD"," }
        }, data);
      }
      return this.callSuper(data);
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadId(this, "management_company",      "ManagementCompany");
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "share_classes",      "ShareClass");
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "service_providers",  "ServiceProvider");
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "managers",           "Manager");
      this.klass.ApiFieldGenerator.lookupOverwrite(this, "legal_structure",    LegalStructures);

      this.klass.ApiFieldGenerator.wrapClassOverwrite(this, "aum_time_series",      "TimeSeries");
      this.klass.ApiFieldGenerator.lazyLoadId(this,  "category_benchmark_index",    "Index");
      this.klass.ApiFieldGenerator.lazyLoadId(this,  "asset_class_benchmark_index", "Index");
      this.klass.ApiFieldGenerator.lazyLoadId(this,  "prospectus_benchmark_index",  "Index");

      this.klass.ApiFieldGenerator.lazyLoadId(this,  "risk_free_index",   "Index");
      //this.klass.ApiFieldGenerator.selfCaching(this, 'base_share_class', this.$base_share_class);

      // V2 API Mappings
      this.klass.ApiFieldGenerator.alias(this,       'latest_aum.amount',   'aum_time_series.latest',      'aum_time_series');
      this.klass.ApiFieldGenerator.alias(this,       'latest_aum.currency', 'aum_series_currency');
      this.klass.ApiFieldGenerator.alias(this,       'latest_aum.date',     'aum_time_series.latest_date', 'aum_time_series');
      this.klass.ApiFieldGenerator.lookupAlias(this, "latest_aum.symbol",   "aum_series_currency",         CurrencySymbolMap);

      this.klass.ApiFieldGenerator.lookupOverwrite(this, "domicile_country",      CountryCodes);
      this.klass.ApiFieldGenerator.lookupAlias(this,     "domicile_country_code", "domicile_country");


      this.klass.ApiFieldGenerator.objectAlias(this, "investors_breakdown", [
        "sovereign_wealth",
        "pension_funds",
        "foundations_and_endowments",
        "consultants",
        "family_offices",
        "funds_of_funds",
        "managed_account_platforms",
        "seeders_and_accelerators",
        "high_net_worth_individuals",
        "internal",
        "number_of_investors"
      ]);
    },

    $isValidForTimeframeId: function(timeframe_id) {
      if( this.base_share_class ) {
        return this.base_share_class.$isValidForTimeframeId(timeframe_id);
      } else {
        return false;
      }
    },

    /**
     * @param   {Object} options
     * @returns {Object}
     */
    $statistics: function(options) {
      options = _.extend({
        share_class_id:  _.get(this, 'base_share_class.id') || null,
        risk_free_index: this.risk_free_index || null
      }, options);
      return TimeSeries.statistics(options);
    }
  });
  return Fund;
});
;

//***** src/models/api/Index.js *****//
// https://v3.edgefolio.com/api/indexes/
angular.module('edgefolio.models').factory('Index', function(ApiBaseClass) {
  var Index = new JS.Class('Index', ApiBaseClass, {
    extend: {
      url:       "/api/indexes/:index_id/",
      idParam:   "index_id"
    },
    $initializeObjectProperties: function() {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.wrapClassOverwrite(this, "returns_time_series", "TimeSeries");
    },
    $statistics: function(options) {
      return this.returns_time_series.$statistics(options);
    }
  });
  return Index;
});
;

//***** src/models/api/Person.js *****//
angular.module('edgefolio.models').factory('Person', function(ApiBaseClass) {
  var Person = new JS.Class('Person', ApiBaseClass, {
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.join(this, "full_name", ["first_name", "middle_name", "last_name"]);
    }
  });
  return Person;
});

// https://v3.edgefolio.com/api/managers/
angular.module('edgefolio.models').factory('Manager', function(ApiBaseClass, Person) {
  var Manager = new JS.Class('Manager', Person, {
    extend: {
      url:       "/api/managers/:manager_id/",
      idParam:   "manager_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadId(this, "management_company", "ManagementCompany")
    }
  });
  return Manager;
});

// https://v3.edgefolio.com/api/investors/
angular.module('edgefolio.models').factory('Investor', function(ApiBaseClass, Person) {
  var Investor = new JS.Class('Investor', Person, {
    extend: {
      url:       "/api/investors/:investor_id/",
      idParam:   "investor_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadId(this, "investment_company", "InvestmentCompany")
    }
  });
  return Investor;
});;

//***** src/models/api/ShareClass.js *****//
// https://v3.edgefolio.com/api/funds/
angular.module('edgefolio.models').factory('ShareClass', function(
  $q, ApiBaseClass, Fund, Benchmarks, Index, TimeSeries, TimeframeDefinitions
) {
  var ShareClass = new JS.Class('ShareClass', ApiBaseClass, {
    $initializeObjectProperties: function(data) {
      var self = this;
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadId(this, "fund", "Fund");
      this.klass.ApiFieldGenerator.wrapClassOverwrite(this, "returns_time_series", TimeSeries);

      this.klass.ApiFieldGenerator.alias(this, "max_timeframe_id",  'returns_time_series.max_timeframe_id','amount');

      this.klass.ApiFieldGenerator.defineGetters(this, "time_periods", function() {
        return _(TimeframeDefinitions)
          .filter(function(timeframe) {
            if( timeframe.id === 0                    ) { return true;  }
            if( this.max_timeframe_id === 0           ) { return false; }
            if( timeframe.id <= this.max_timeframe_id ) { return true;  }
            else                                        { return false  }
          }, this)
          .cloneDeep()
      });


      this.$loadPromise.then(function() {
        return Benchmarks.load().$loadPromise.then(function(benchmark) {
          self.benchmarks = benchmark.results;
        })
      });
    },
    $isValidForTimeframeId: function(timeframe_id) {
      timeframe_id = Number(timeframe_id && timeframe_id.id || timeframe_id) || 0;

      if( timeframe_id === 0                    ) { return true;  }
      if( this.max_timeframe_id === 0           ) { return false; }
      if( timeframe_id <= this.max_timeframe_id ) { return true;  }
      else                                        { return false  }
    },

    $statistics: function(options) {
      options = _.extend({
        share_class:     this,
        risk_free_index: _.get(this, 'fund.risk_free_index') || null
      }, options);
      return TimeSeries.statistics(options);
    },

    /**
     * @untested
     * @param   {Object} options
     * @returns {Promise<Object>}
     */
    loadCombinedReturnsPlotData: function(options) {
      return this.klass.loadCombinedReturnsPlotData(_.extend({
        share_class_id: this.id
      }, options))
    },

    extend: {
      url: "/api/share-classes/:share_class_id/",
      idParam: "share_class_id",

      /**
       * @untested
       * @demo  https://edgefolio-local.com/enterprise/documentation/graphPerformance
       * combined_returns_plot_data = {
       *   "aum_time_series": { "2005-10-31": 1000, ... }
       *   "benchmark": {
       *     "name": "Russell 1000 TR USD",
       *     "performance": [ -1.75, 3.8, 0.14, 2.8, 0.22, 1.42, 1.2, -2.95, 0.13, 0.22, 2.4, 2.37, 3.4, 2.13, 1.28, 1.93, -1.72, 1.04, 4.2, 3.6, -1.91, -3.09, 1.36, 3.82, 1.74, -4.26, -0.65, -6, -3.06, -0.68, 5.07, 1.83, -8.31, -1.16, 1.38, -9.53, -17.46, -7.56, 1.6, -8.16, -10.34, 8.75, 10.12, 5.53, 0.24, 7.63, 3.63, 4.06, -2.21, 5.89, 2.43, -3.6, 3.3, 6.14, 1.85, -7.93, -5.57, 6.95, -4.47, 9.19, 3.89, 0.33, 6.68, 2.4, 3.48, 0.26, 3.01, -1.07, -1.75, -2.17, -5.76, -7.46, 11.21, -0.26, 0.84, 4.87, 4.39, 3.13, -0.58, -6.15, 3.83, 1.19, 2.43, 2.57, -1.69, 0.79, 1.04, 5.42, 1.34, 3.86, 1.81, 2.22, -1.36, 5.35, -2.76, 3.49, 4.4, 2.81, 2.7, -3.19, 4.75, 0.64, 0.47, 2.3, 2.27, -1.62, 4.13, -1.75, 2.44, 2.62, -0.23, -2.75, 5.78, -1.25, 0.71, 1.31, -1.88, 1.93, -6.02, -2.74],
       *     "compounded": [ 982, 1020, 1021, 1050, 1052, 1067, 1080, 1048, 1049, 1052, 1077, 1102, 1140, 1164, 1179, 1202, 1181, 1193, 1244, 1288, 1264, 1225, 1241, 1289, 1311, 1255, 1247, 1172, 1137, 1129, 1186, 1208, 1108, 1095, 1110, 1004, 829, 766, 778, 715, 641, 697, 767, 810, 812, 874, 906, 942, 922, 976, 1000, 964, 995, 1057, 1076, 991, 936, 1001, 956, 1044, 1084, 1088, 1160, 1188, 1230, 1233, 1270, 1256, 1234, 1208, 1138, 1053, 1171, 1168, 1178, 1235, 1290, 1330, 1322, 1241, 1288, 1304, 1335, 1370, 1347, 1357, 1371, 1446, 1465, 1522, 1549, 1584, 1562, 1646, 1600, 1656, 1729, 1777, 1825, 1767, 1851, 1863, 1872, 1915, 1958, 1926, 2006, 1971, 2019, 2072, 2067, 2010, 2126, 2100, 2115, 2143, 2102, 2143, 2014, 1959]
       *   },
       *   "fund": {
       *     "performance": [ -6.94, 3.45, 0.98, 16.64, -8.44, 5.61, 9.23, -4.75, -2.27, -4.4, -5.4, -12.01, 2.88, 2.66, -1.2, 2.58, -0.51, 5.42, 3.84, 2.31, -1.44, 3.7, -3.18, 5.11, 8.16, -1.12, -0.02, -10.94, 4.75, -1.17, 7.17, 2.53, 21.12, -8.81, -6.53, -13.38, -6.76, -13.71, -7.66, -12.25, -3.75, -3.46, 2.77, 3.51, -8.44, 1.44, -0.05, 6.32, -12.51, 6.54, 3.15, -6.28, 7.81, 9.04, 6.84, -8.21, -6.49, 4.07, -3.92, 13.01, 8.6, 1.99, 5.21, 0.92, 5.51, -0.98, 1.16, -5.16, -5.19, 0.37, -3.12, -12.94, 9.22, -1.16, -2.75, 7.42, 3.1, -2.53, -1.12, -9.37, -0.3, -4.15, 3.42, 1.62, -1.24, -1.01, 0.68, 4.74, -1.93, 7.55, -0.77, 3.92, -2.52, 5.12, -1.34, 10.2, 2.39, 3.98, 7.12, -1.82, 6.61, -3.11, -3.06, 2.25, 3.85, -4.27, 2.25, 0.37, 2.51, 1.38, -1.76, -5.39, 3.45, -2.34, -4.12, 2.87, -7.03, 5.83, -7.46, 0],
       *     "compounded":  [ 931, 963, 972, 1134, 1038, 1096, 1198, 1141, 1115, 1066, 1008, 887, 913, 937, 926, 950, 945, 996, 1034, 1058, 1043, 1081, 1047, 1101, 1190, 1177, 1177, 1048, 1098, 1085, 1163, 1192, 1444, 1317, 1231, 1066, 994, 858, 792, 695, 669, 646, 664, 687, 629, 638, 638, 678, 593, 632, 652, 611, 659, 718, 767, 704, 659, 686, 659, 744, 808, 824, 867, 875, 924, 915, 925, 877, 832, 835, 809, 704, 769, 760, 739, 794, 819, 798, 789, 715, 713, 683, 707, 718, 709, 702, 707, 741, 726, 781, 775, 805, 785, 825, 814, 897, 919, 955, 1023, 1005, 1071, 1038, 1006, 1029, 1068, 1023, 1046, 1050, 1076, 1091, 1072, 1014, 1049, 1024, 982, 1010, 939, 994, 920, 920]
       *   },
       *   "timeframe": [ "2005-10-31", "2005-11-30", "2005-12-31", "2006-01-31", "2006-02-28", "2006-03-31", "2006-04-30", "2006-05-31", "2006-06-30", "2006-07-31", "2006-08-31", "2006-09-30", "2006-10-31", "2006-11-30", "2006-12-31", "2007-01-31", "2007-02-28", "2007-03-31", "2007-04-30", "2007-05-31", "2007-06-30", "2007-07-31", "2007-08-31", "2007-09-30", "2007-10-31", "2007-11-30", "2007-12-31", "2008-01-31", "2008-02-29", "2008-03-31", "2008-04-30", "2008-05-31", "2008-06-30", "2008-07-31", "2008-08-31", "2008-09-30", "2008-10-31", "2008-11-30", "2008-12-31", "2009-01-31", "2009-02-28", "2009-03-31", "2009-04-30", "2009-05-31", "2009-06-30", "2009-07-31", "2009-08-31", "2009-09-30", "2009-10-31", "2009-11-30", "2009-12-31", "2010-01-31", "2010-02-28", "2010-03-31", "2010-04-30", "2010-05-31", "2010-06-30", "2010-07-31", "2010-08-31", "2010-09-30", "2010-10-31", "2010-11-30", "2010-12-31", "2011-01-31", "2011-02-28", "2011-03-31", "2011-04-30", "2011-05-31", "2011-06-30", "2011-07-31", "2011-08-31", "2011-09-30", "2011-10-31", "2011-11-30", "2011-12-31", "2012-01-31", "2012-02-29", "2012-03-31", "2012-04-30", "2012-05-31", "2012-06-30", "2012-07-31", "2012-08-31", "2012-09-30", "2012-10-31", "2012-11-30", "2012-12-31", "2013-01-31", "2013-02-28", "2013-03-31", "2013-04-30", "2013-05-31", "2013-06-30", "2013-07-31", "2013-08-31", "2013-09-30", "2013-10-31", "2013-11-30", "2013-12-31", "2014-01-31", "2014-02-28", "2014-03-31", "2014-04-30", "2014-05-31", "2014-06-30", "2014-07-31", "2014-08-31", "2014-09-30", "2014-10-31", "2014-11-30", "2014-12-31", "2015-01-31", "2015-02-28", "2015-03-31", "2015-04-30", "2015-05-31", "2015-06-30", "2015-07-31", "2015-08-31", "2015-09-30"],
       *   "comp_min": 593.2655723290119,
       *   "comp_max": 2142.8640254628417,
       *   "perfmin": -17.46062,
       *   "perfmax": 21.12,
       *   "perfunit": "%",
       *   "compunit": "$"
       * },
       * @param  {Object} options
       * @param  {?Number} options.fund_id          sets default of options.share_class_id -> fund.base_share_class.id
       * @param  {Number}  options.share_class_id   must be set if not options.fund_id
       * @param  {Number}  options.benchmark_id
       * @param  {Number}  options.timeframe_id
       * @return {Promise<object>}                  combined_returns_plot_data
       */
      loadCombinedReturnsPlotData: function(options) {
        var self = this;
        options  = _.extend({
          fund_id:        null,
          share_class_id: null,
          benchmark_id:   null,
          timeframe_id:   null
        }, options);

        var loaded = {};
        if( options.fund_id        ) { Fund.load(options.fund_id);              } // begin loading to avoid async delay
        if( options.share_class_id ) { ShareClass.load(options.share_class_id); } // begin loading to avoid async delay
        if( options.benchmark_id   ) { Index.load(options.benchmark_id); } // begin loading to avoid async delay

        return Benchmarks.load().$loadPromise.then(function(benchmarks) {
          options.benchmark_id = options.benchmark_id || _.get(benchmarks, ['results', 0, 'id']);
          loaded.benchmarks    = benchmarks;
          loaded.benchmark     = Index.load(options.benchmark_id);
          return loaded.benchmark.$loadPromise
        })
        .then(function() {
          if( options.fund_id && !options.share_class_id ) {
            return Fund.load(options.fund_id).$loadPromise.then(function(fund) {
              options.share_class_id = _.get(fund, ['base_share_class', 'id']);
            })
          }
        })
        .then(function() {
          // Short circuit if invalid ids provided - sometimes happens on page transition
          if( !options.share_class_id ) {
            return $q.reject(options);
          }
          loaded.shareClass = ShareClass.load(options.share_class_id);
          return loaded.shareClass.$loadPromise
        })
        .then(function() {
          loaded.timeseries = loaded.shareClass.returns_time_series;
          loaded.fund       = loaded.shareClass.fund;
          return loaded.fund.$loadPromise
        })
        .then(function() {
          // SPEC: Ensure performanceGraph only renders time range for which there is timeseries data (and not just benchmark)
          options.timeframe_id = options.timeframe_id && Math.min(options.timeframe_id, loaded.timeseries.max_timeframe_id)
                                                      || loaded.timeseries.max_timeframe_id || 0;
        })
        .then(function() {
          loaded.timeseries        = loaded.timeseries.timeframe(options.timeframe_id);
          loaded.benchmark_returns = loaded.benchmark.returns_time_series.timeframe(options.timeframe_id);
          loaded.aum_time_series   = loaded.fund.aum_time_series.timeframe(options.timeframe_id);

          // Combine to unify date ranges
          var combined_returns      = TimeSeries.groupByDateObject(loaded.timeseries, loaded.benchmark_returns, loaded.aum_time_series);
          var timeseries_returns    = _(combined_returns).pluck(0).map(function(value) { return value || 0; }).value();
          var benchmark_returns     = _(combined_returns).pluck(1).map(function(value) { return value || 0; }).value();
          var aum_time_series       = _(combined_returns)
            .mapKeys(  function(value, key) {
              // @optimization: moment(key).format('YYYY-MM-DD') is slow - so do string regexp
              var match = key.match(/^\d{4}-\d{2}-\d{2}/);
              if( match ) {
                return match[0];
              } else {
                return moment(key).format('YYYY-MM-DD'); //  combined_returns_plot_data.dates format
              }
            })
            .mapValues(function(array, key) {
              return _.isFinite(array[2]) ? array[2] : null
            })
            .value() // {Object} output
          ;
          var timeseries_compounded = _.values(TimeSeries.toCompounded(timeseries_returns, 1000));
          var benchmark_compounded  = _.values(TimeSeries.toCompounded(benchmark_returns,  1000));
          var dates                 = _.keys(aum_time_series); // = _(combined_returns).keys().map(function(value) { return moment(value).format("YYYY-MM-DD") }).value();

          // computedMeasure = { combined_returns_plot_data: {} }
          var combined_returns_plot_data = {
            aum_time_series: aum_time_series,
            fund: {
              performance: timeseries_returns,
              compounded:  timeseries_compounded
            },
            benchmark: {
              name:        loaded.benchmark.name,
              performance: benchmark_returns,
              compounded:  benchmark_compounded
            },
            timeframe: dates,
            perfmin:  _([timeseries_returns, benchmark_returns]).flatten(true).min(),
            perfmax:  _([timeseries_returns, benchmark_returns]).flatten(true).max(),
            comp_min: _([timeseries_compounded, benchmark_compounded]).flatten(true).min(),
            comp_max: _([timeseries_compounded, benchmark_compounded]).flatten(true).max(),

            perfunit: "%",
            compunit: _.get(loaded, 'fund.latest_aum.symbol') || '$'
          };
          return combined_returns_plot_data;
        })
        ['catch'](function() {
          // Propagate catch to external functions
          return $q.reject(options);
        });
      },

      /**
       * @untested
       * @demo  https://edgefolio-local.com/enterprise/documentation/graphPerformance
       *
       * computedMeasure = {
       *   "id": 374936,
       *   "url": "https://edgefolio.com/api/computed-measures/374936/",
       *
       *   "time_period": 120,
       *   "track_record_years": 10,
       *
       *   "annualized_alpha": -5.091942425302926,
       *   "annualized_compounded_excess_return": -7.978081073026411,
       *   "annualized_compounded_return": -0.8322033830685416,
       *   "annualized_sharpe_ratio": 0.0076928315309794625,
       *   "annualized_sortino_ratio": 0.0125353136946491,
       *   "annualized_volatility": 21.473308995841297,
       *   "benchmark_annualized_compounded_return": 6.954301414751818,
       *   "benchmark_annualized_volatility": 15.176377726447454,
       *   "benchmark_expected_return": 0.6590336666666666,
       *   "benchmark_kurtosis_risk": 2.0730334513066158,
       *   "benchmark_maximum_drawdown": -51.1125932755426916,
       *   "benchmark_skewness_risk": -0.8231298603994012,
       *   "beta": 0.7913714414597214,
       *   "correlation_coefficient": 56.33154480758037,
       *   "cumulative_return": -8.017197226762097,
       *   "data_completeness": 99.16666666666667,
       *   "expected_return": 0.12025210084033616,
       *   "kurtosis_risk": 0.5901303850931748,
       *   "maximum_drawdown": -58.91670460140463,
       *   "skewness_risk": 0.1142024368393561,
       *
       *   "combined_returns_plot_data": {
       *     "benchmark": {
       *       "name": "Russell 1000 TR USD",
       *       "performance": [ -1.75, 3.8, 0.14, 2.8, 0.22, 1.42, 1.2, -2.95, 0.13, 0.22, 2.4, 2.37, 3.4, 2.13, 1.28, 1.93, -1.72, 1.04, 4.2, 3.6, -1.91, -3.09, 1.36, 3.82, 1.74, -4.26, -0.65, -6, -3.06, -0.68, 5.07, 1.83, -8.31, -1.16, 1.38, -9.53, -17.46, -7.56, 1.6, -8.16, -10.34, 8.75, 10.12, 5.53, 0.24, 7.63, 3.63, 4.06, -2.21, 5.89, 2.43, -3.6, 3.3, 6.14, 1.85, -7.93, -5.57, 6.95, -4.47, 9.19, 3.89, 0.33, 6.68, 2.4, 3.48, 0.26, 3.01, -1.07, -1.75, -2.17, -5.76, -7.46, 11.21, -0.26, 0.84, 4.87, 4.39, 3.13, -0.58, -6.15, 3.83, 1.19, 2.43, 2.57, -1.69, 0.79, 1.04, 5.42, 1.34, 3.86, 1.81, 2.22, -1.36, 5.35, -2.76, 3.49, 4.4, 2.81, 2.7, -3.19, 4.75, 0.64, 0.47, 2.3, 2.27, -1.62, 4.13, -1.75, 2.44, 2.62, -0.23, -2.75, 5.78, -1.25, 0.71, 1.31, -1.88, 1.93, -6.02, -2.74],
       *       "compounded": [ 982, 1020, 1021, 1050, 1052, 1067, 1080, 1048, 1049, 1052, 1077, 1102, 1140, 1164, 1179, 1202, 1181, 1193, 1244, 1288, 1264, 1225, 1241, 1289, 1311, 1255, 1247, 1172, 1137, 1129, 1186, 1208, 1108, 1095, 1110, 1004, 829, 766, 778, 715, 641, 697, 767, 810, 812, 874, 906, 942, 922, 976, 1000, 964, 995, 1057, 1076, 991, 936, 1001, 956, 1044, 1084, 1088, 1160, 1188, 1230, 1233, 1270, 1256, 1234, 1208, 1138, 1053, 1171, 1168, 1178, 1235, 1290, 1330, 1322, 1241, 1288, 1304, 1335, 1370, 1347, 1357, 1371, 1446, 1465, 1522, 1549, 1584, 1562, 1646, 1600, 1656, 1729, 1777, 1825, 1767, 1851, 1863, 1872, 1915, 1958, 1926, 2006, 1971, 2019, 2072, 2067, 2010, 2126, 2100, 2115, 2143, 2102, 2143, 2014, 1959]
       *     },
       *     "fund": {
       *       "performance": [ -6.94, 3.45, 0.98, 16.64, -8.44, 5.61, 9.23, -4.75, -2.27, -4.4, -5.4, -12.01, 2.88, 2.66, -1.2, 2.58, -0.51, 5.42, 3.84, 2.31, -1.44, 3.7, -3.18, 5.11, 8.16, -1.12, -0.02, -10.94, 4.75, -1.17, 7.17, 2.53, 21.12, -8.81, -6.53, -13.38, -6.76, -13.71, -7.66, -12.25, -3.75, -3.46, 2.77, 3.51, -8.44, 1.44, -0.05, 6.32, -12.51, 6.54, 3.15, -6.28, 7.81, 9.04, 6.84, -8.21, -6.49, 4.07, -3.92, 13.01, 8.6, 1.99, 5.21, 0.92, 5.51, -0.98, 1.16, -5.16, -5.19, 0.37, -3.12, -12.94, 9.22, -1.16, -2.75, 7.42, 3.1, -2.53, -1.12, -9.37, -0.3, -4.15, 3.42, 1.62, -1.24, -1.01, 0.68, 4.74, -1.93, 7.55, -0.77, 3.92, -2.52, 5.12, -1.34, 10.2, 2.39, 3.98, 7.12, -1.82, 6.61, -3.11, -3.06, 2.25, 3.85, -4.27, 2.25, 0.37, 2.51, 1.38, -1.76, -5.39, 3.45, -2.34, -4.12, 2.87, -7.03, 5.83, -7.46, 0],
       *       "compounded":  [ 931, 963, 972, 1134, 1038, 1096, 1198, 1141, 1115, 1066, 1008, 887, 913, 937, 926, 950, 945, 996, 1034, 1058, 1043, 1081, 1047, 1101, 1190, 1177, 1177, 1048, 1098, 1085, 1163, 1192, 1444, 1317, 1231, 1066, 994, 858, 792, 695, 669, 646, 664, 687, 629, 638, 638, 678, 593, 632, 652, 611, 659, 718, 767, 704, 659, 686, 659, 744, 808, 824, 867, 875, 924, 915, 925, 877, 832, 835, 809, 704, 769, 760, 739, 794, 819, 798, 789, 715, 713, 683, 707, 718, 709, 702, 707, 741, 726, 781, 775, 805, 785, 825, 814, 897, 919, 955, 1023, 1005, 1071, 1038, 1006, 1029, 1068, 1023, 1046, 1050, 1076, 1091, 1072, 1014, 1049, 1024, 982, 1010, 939, 994, 920, 920]
       *     },
       *     "timeframe": [ "2005-10-31", "2005-11-30", "2005-12-31", "2006-01-31", "2006-02-28", "2006-03-31", "2006-04-30", "2006-05-31", "2006-06-30", "2006-07-31", "2006-08-31", "2006-09-30", "2006-10-31", "2006-11-30", "2006-12-31", "2007-01-31", "2007-02-28", "2007-03-31", "2007-04-30", "2007-05-31", "2007-06-30", "2007-07-31", "2007-08-31", "2007-09-30", "2007-10-31", "2007-11-30", "2007-12-31", "2008-01-31", "2008-02-29", "2008-03-31", "2008-04-30", "2008-05-31", "2008-06-30", "2008-07-31", "2008-08-31", "2008-09-30", "2008-10-31", "2008-11-30", "2008-12-31", "2009-01-31", "2009-02-28", "2009-03-31", "2009-04-30", "2009-05-31", "2009-06-30", "2009-07-31", "2009-08-31", "2009-09-30", "2009-10-31", "2009-11-30", "2009-12-31", "2010-01-31", "2010-02-28", "2010-03-31", "2010-04-30", "2010-05-31", "2010-06-30", "2010-07-31", "2010-08-31", "2010-09-30", "2010-10-31", "2010-11-30", "2010-12-31", "2011-01-31", "2011-02-28", "2011-03-31", "2011-04-30", "2011-05-31", "2011-06-30", "2011-07-31", "2011-08-31", "2011-09-30", "2011-10-31", "2011-11-30", "2011-12-31", "2012-01-31", "2012-02-29", "2012-03-31", "2012-04-30", "2012-05-31", "2012-06-30", "2012-07-31", "2012-08-31", "2012-09-30", "2012-10-31", "2012-11-30", "2012-12-31", "2013-01-31", "2013-02-28", "2013-03-31", "2013-04-30", "2013-05-31", "2013-06-30", "2013-07-31", "2013-08-31", "2013-09-30", "2013-10-31", "2013-11-30", "2013-12-31", "2014-01-31", "2014-02-28", "2014-03-31", "2014-04-30", "2014-05-31", "2014-06-30", "2014-07-31", "2014-08-31", "2014-09-30", "2014-10-31", "2014-11-30", "2014-12-31", "2015-01-31", "2015-02-28", "2015-03-31", "2015-04-30", "2015-05-31", "2015-06-30", "2015-07-31", "2015-08-31", "2015-09-30"],
       *     "comp_min": 593.2655723290119,
       *     "comp_max": 2142.8640254628417,
       *     "perfmin": -17.46062,
       *     "perfmax": 21.12,
       *     "perfunit": "%",
       *     "compunit": "$"
       *   },
       *
       *   "risk_free_index": {
       *     "id": 23,
       *     "name": "USTREAS T-Bill Auction Ave 3 Mon",
       *     "url": "https://edgefolio.com/api/indices/23/",
       *     "description": "The index measures the performance of the average investment rate of US T-Bills securities with the maturity of 3 months.",
       *     "classification": {
       *       "alternative_sector": "6",
       *       "asset_class_orientation": "Diverse",
       *       "sector_orientation": "2",
       *       "region_orientation": "8",
       *       "weighting_scheme": null
       *     },
       *     "performance_type": "",
       *     "trading_symbol": null
       *   },
       *   "benchmark": {
       *     "id": 12,
       *     "name": "Russell 1000 TR USD"
       *     "url": "https://edgefolio.com/api/indices/12/",
       *     "description": "The index measures the performance of the large-cap segment of the US equity securities. It is a subset of the Russell 3000 index and includes approximately 1000 of the largest securities based on a combination of their market cap and current index membership.",
       *     "classification": {
       *       "alternative_sector": null,
       *       "asset_class_orientation": "Equity",
       *       "sector_orientation": "0",
       *       "region_orientation": "8",
       *       "weighting_scheme": "3"
       *     },
       *     "performance_type": "",
       *     "trading_symbol": null,
       *   },
       *   "hedge_fund": {
       *     "id": 9704,
       *     "url": "https://edgefolio.com/api/hedge-funds/9704/",
       *     "name": "HCM Classic Hedge",
       *     "aum": {
       *       "currency": "USD",
       *       "amount": 9695486
       *     },
       *     "strategy": "U.S. Long/Short Equity",
       *     "year_to_date": "-14.16",
       *     "is_edited_by_manager": false,
       *     "base_share_class": {
       *       "id": 7631
       *     }
       *   },
       *
       *   "share_class": {
       *     "id": 7631,
       *     "url": "https://edgefolio.com/api/share-classes/7631/",
       *     "currency": "USD",
       *     "is_base_class": true,
       *     "name": "HCM Classic Hedge"
       *   }
       * };
       *
       * @param  {Object}  options
       * @param  {?Number} options.fund_id          sets default of options.share_class_id -> fund.base_share_class.id
       * @param  {Number}  options.share_class_id   must be set if not options.fund_id
       * @param  {Number}  options.benchmark_id
       * @param  {Number}  options.timeframe_id
       * @return {Promise<object>}                  computedMeasure
       */
      loadComputedMeasure: function(options) {
        var self = this;
        options  = _.extend({
          fund_id:        null,
          share_class_id: null,
          benchmark_id:   null,
          timeframe_id:   null
        }, options);

        return $q.when()
        .then(function() {
          if( options.fund_id && !options.share_class_id ) {
            return Fund.load(options.fund_id).$loadPromise.then(function(fund) {
              options.share_class_id = _.get(fund, ['base_share_class', 'id']);
              return fund;
            })
          } else {
            return $q.when()
          }
        })
        .then(function() {
          // Short circuit if invalid ids provided - sometimes happens on page transition
          if( !options.share_class_id ) {
            return $q.reject(options);
          }
          return $q.all({
            share_class: ShareClass.load(options.share_class_id).$loadPromise,
            benchmarks:  Benchmarks.load().$loadPromise
          })
        })
        .then(function(loaded) {
          options.benchmark_id = options.benchmark_id || _.get(loaded.benchmarks, ['results', 0, 'id']);

          return $q.all({
            benchmarks:  loaded.benchmarks.$loadPromise,
            share_class: loaded.share_class.$loadPromise,
            fund:        loaded.share_class.fund.$loadPromise,
            benchmark:   Index.load(options.benchmark_id).$loadPromise,
            combined_returns_plot_data: ShareClass.loadCombinedReturnsPlotData({
              share_class_id: options.share_class_id,
              benchmark_id:   options.benchmark_id,
              timeframe_id:   options.timeframe_id
            })
          })
        })
        .then(function(loaded) {
          var computedMeasure = {};
          computedMeasure = _.extend(computedMeasure,
            loaded.share_class.$statistics(options)
          );
          computedMeasure = _.extend(computedMeasure, _.mapKeys(
            loaded.benchmark.returns_time_series.$statistics(options),
            function(value, key) { return "benchmark_" + key; }
          ));
          computedMeasure = _.extend(computedMeasure, {
            "time_period":                options.timeframe_id,
            "track_record_years":         options.timeframe_id / 12 || 0,
            "combined_returns_plot_data": loaded.combined_returns_plot_data,
            "risk_free_index":            loaded.fund.risk_free_index,
            "benchmark":                  loaded.benchmark,
            "hedge_fund":                 loaded.fund,
            "share_class":                loaded.share_class
          });
          return computedMeasure;
        })
        ['catch'](function(error) {
          !options.silent && console.error("ShareClass.js::loadComputedMeasure()", options, error);
        });
      },
      loadAnalysisData: function(options) {
        // TODO: Replace hardcoded data with api endpoint
        return $q.when({
          "aggregations": {
            "beta":                                { "values": { "5.0": -0.011378890077979346, "25.0":   0.2590640709270656,  "50.0":   0.5568018295490429,   "75.0":   0.8321122521671087,  "95.0":  1.2065789034873509  } },
            "annualized_volatility":               { "values": { "5.0":  4.386722419896362,    "25.0":   9.503835341720041,   "50.0":  14.216886028397294,    "75.0":  17.884822318333182,   "95.0": 29.2080784069086     } },
            "skewness_risk":                       { "values": { "5.0": -1.255198823976933,    "25.0":  -0.7420517278702031,  "50.0":  -0.26548084380863624,  "75.0":   0.1712817184033512,  "95.0":  1.2597839582770636  } },
            "annualized_sharpe_ratio":             { "values": { "5.0": -0.1704695494927714,   "25.0":   0.13384837976899072, "50.0":   0.38241910324157596,  "75.0":   0.667940016074366,   "95.0":  1.0674025733710664  } },
            "annualized_compounded_excess_return": { "values": { "5.0": -9.97300542023482,     "25.0":  -5.290055477238276,   "50.0":  -2.6815142348382173,   "75.0":   0.799480525493157,   "95.0":  4.875374769528348   } },
            "annualized_compounded_return":        { "values": { "5.0": -3.7821643427842613,   "25.0":   1.8300789909024118,  "50.0":   5.043230306275348,    "75.0":   8.388993722755039,   "95.0": 13.901157973562539   } },
            "correlation_coefficient":             { "values": { "5.0": -2.362587387422491,    "25.0":  37.36150149594646,    "50.0":  57.97168974212245,     "75.0":  73.18781080572623,    "95.0": 86.90926969406661    } },
            "expected_return":                     { "values": { "5.0": -0.15179075630252098,  "25.0":   0.28697943600517134, "50.0":   0.4844944957983194,   "75.0":   0.8162653508771929,  "95.0":  1.3412492690058482  } },
            "annualized_alpha":                    { "values": { "5.0": -7.778369685812743,    "25.0":  -1.6764362401012405,  "50.0":   1.3556088111789848,   "75.0":   5.223031583446895,   "95.0": 11.150750952759141   } },
            "kurtosis_risk":                       { "values": { "5.0": -0.057336449316577776, "25.0":   1.074393791431112,   "50.0":   2.2758422924742976,   "75.0":   4.198839976473933,   "95.0": 11.360218777410434   } },
            "maximum_drawdown":                    { "values": { "5.0": -73.34988797955162,    "25.0": -52.276863409493835,   "50.0": -31.70667554825193,     "75.0": -21.337774698939036,   "95.0": -6.1956574700649485  } },
            "annualized_sortino_ratio":            { "values": { "5.0": -0.23078307230783285,  "25.0":   0.1892764198964992,  "50.0":   0.5300898471923283,   "75.0":   0.9312279495393041,  "95.0":  1.952475164398659   } }
          }
        })
      },
      /**
       * V3 version of ElasticSearchService.getAnalysisData()
       * @param options
       * @returns {*}
       */
      getAnalysisData: function(options) {
        var self = this;
        options = _.extend({
          //service:    'ElasticSearchService',
          percents:   [0, 25, 50, 75, 100],
          //isBaseShareClass: true,
          timeframe:  null,
          benchmark:  null,
          hedgeFunds: null,
          //strategy:   _(options).get('hedgeFundDetails.strategy') || null,
          //hedgeFundDetails: null,
          sort:       null, // { name: 'annualized_compounded_return', desc: true },
          size:       0
        }, options);

        var promises = _.map(options.hedgeFunds, function(fund_id) {
          var config = {
            fund_id:        _.isFinite(Number(fund_id)) ? Number(fund_id) : _.get(fund_id, 'id'),
            percents:       options.percents,
            benchmark_id:   options.benchmark_id || _.isFinite(Number(options.benchmark)) ? Number(options.benchmark) : _.get(options.benchmark, 'id'),
            timeframe_id:   options.timeframe_id || _.isFinite(Number(options.timeframe)) ? Number(options.timeframe) : _.get(options.timeframe, 'id'),
            silent:         true
          };
          return self.loadComputedMeasure(config)['catch'](_.noop);
        });
        return $q.all(promises).then(function(computedMeasures) {
          computedMeasures = _.filter(computedMeasures);


          // Ensure all data arrays are mapped to the same length
          // BUGFIX: performanceGraph was rendering graphs incorrectly when data sources had different timeframes
          var computedMeasureDates = _(computedMeasures)
            .pluck('combined_returns_plot_data.timeframe')
            .flatten()
            .unique()
            .sortBy()
            .value()
          ;
          _(computedMeasures).value().forEach(function(fund) {
            _.each([
              //'combined_returns_plot_data.aum_time_series',  // This is an timeseries_object rather than an array
              'combined_returns_plot_data.fund.performance',
              'combined_returns_plot_data.fund.compounded',
              'combined_returns_plot_data.benchmark.performance',
              'combined_returns_plot_data.benchmark.compounded'
            ], function(arrayKey) {
              var timeseriesInputArray = _.get(fund, arrayKey);
              var timeframes = _.get(fund, 'combined_returns_plot_data.timeframe');

              var lastValue = _.contains(arrayKey, 'compounded') ? 1000 : 0;
              var timeseriesOutputArray = _(computedMeasureDates)
                .indexBy()
                .mapValues(function(dateString) {
                  var index = _.indexOf(timeframes, dateString);
                  var output;
                  if( index !== -1 && _.isFinite(timeseriesInputArray[index]) ) {
                    output = timeseriesInputArray[index];
                  } else {
                    output = lastValue;
                  }
                  lastValue = output;
                  return output;
                })
                .values()
                .value()
              ;
              _.set(fund, arrayKey, timeseriesOutputArray);
            });
            _.set(fund, 'combined_returns_plot_data.timeframe', computedMeasureDates);
          });


          if( options.sort ) {
            if( options.sort.name ) {
              computedMeasures = _.sortBy(computedMeasures, options.sort.name);
            }
            if( options.sort.desc ) {
              computedMeasures = Array.reverse(computedMeasures);
            }
          }
          if( options.size ) {
            computedMeasures = _.take(computedMeasures, options.size);
          }
          computedMeasures = _.map(computedMeasures, function(computedMeasure) {
            return {
              _id:     computedMeasure.id,
              _index:  null,
              _score:  0,
              _type:   "computed-measures",
              _source: computedMeasure
            };
          });
          return { hits: { hits: computedMeasures } };
        });
      }
    }
  });
  return ShareClass;
});
;

//***** src/models/api/User.js *****//
// https://v3.edgefolio.com/api/user/
angular.module('edgefolio.models').factory('User', function(ApiBaseClass) {
  var User = new JS.Class('User', ApiBaseClass, {
    extend: {
      url:       "/api/user/",
      idParam:   null
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
    }
  });
  return User;
});
;

//***** src/models/api/Company.js *****//
angular.module("edgefolio.models").factory("Company", function(ApiBaseClass, CountryCodes) {
  var Company = new JS.Class("Company", ApiBaseClass, {
    extend: {
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.objectAlias(this, "contact_information", ["address_line_1", "address_line_2", "postal_code", "city", "country_code", "province", "latitude", "longitude", "phone", "fax", "email", "homepage"]);
      this.klass.ApiFieldGenerator.lookupAlias(this, "country", "country_code", CountryCodes);
      this.klass.ApiFieldGenerator.join(this, "address", ["address_line_1", "address_line_2", "city", "postal_code", "country", "province"], ', ');
    }
  });
  return Company;
});

angular.module("edgefolio.models").factory("ManagementCompany", function(ApiBaseClass, Company) {
  var ManagementCompany = new JS.Class("ManagementCompany", Company, {
    extend: {
      url:       "/api/management-companies/:management_company_id/",
      idParam:   "management_company_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "funds", "Fund");
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "employees", "Manager");
    }
  });
  return ManagementCompany;
});

angular.module("edgefolio.models").factory("InvestmentCompany", function(ApiBaseClass, Company) {
  var InvestmentCompany = new JS.Class("InvestmentCompany", Company, {
    extend: {
      url:       "/api/investment-companies/:investment_company_id/",
      idParam:   "investment_company_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "employees", "Investor");
    }
  });
  return InvestmentCompany;
});

angular.module("edgefolio.models").factory("ServiceProvider", function(ApiBaseClass, Company) {
  var ServiceProvider = new JS.Class("ServiceProvider", Company, {
    extend: {
      url:       "/api/service-providers/:service_provider_id/",
      idParam:   "service_provider_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "funds", "Fund");
      this.klass.ApiFieldGenerator.unCamelCase(this, "provider_kind");
    }
  });
  return ServiceProvider;
});
;

//***** src/models/collections/ApiCollection.js *****//
angular.module("edgefolio.models").factory("ApiCollection", function($q, $timeout, $rootScope, $http, ApiBaseClass) {
  var ApiCollection = new JS.Class("ApiCollection", ApiBaseClass, {
    extend: {
      url:          "",
      idParam:      null,
      resultsKlass: null
    },
    $initializeObjectProperties: function() {
      this.callSuper();
      if( this.klass.resultsKlass ) {
        this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "results", this.klass.resultsKlass);
      }
    },
    /**
     * @untested
     * Fetches response.data from the api and returns promise with raw data
     * @param options
     * @returns Promise(response.data || null)
     */
    $fetchData: function(options) {
      var callSuper = this.callSuper;
      var baseUrl   = this.$getUrl();
      var outputData = {};
      return this.callSuper(options).then(function(responseData) {
        responseData.results = _.isArray(responseData.results) ? responseData.results : [];
        outputData = responseData;

        if( responseData.results.length === 0 || responseData.results.length >= outputData.count) {
          return outputData;
        } else {
          // No need to refetch ?page=1
          var numberOfPages = _.ceil(outputData.count/responseData.results.length);
          var fetchAllPromise = _(2).range(numberOfPages+1)
            .map(function(pageNumber) {
              return callSuper(_.extend({}, options, {
                url: baseUrl + '?page=' + pageNumber
              }));
            })
            .thru(function(promises) {
              return $q.all(promises);
            })
            .value();

          return fetchAllPromise.then(function(responseDataArray) {
            _.each(responseDataArray, function(data) {
              outputData.results = outputData.results.concat(data.results);
            });
            return outputData;
          })
        }
      });
    },
    /**
     * @untested
     * @param   {Object} itemData       $http({ method: 'POST', url:  this.$getUrl(), data: itemData } })
     * @returns {Promise<resultsKlass>} newly created resultsKlass
     */
    $addToCollection: function(itemData) {
      var self = this;
      this.$invalidateCache(this.$getUrl());

      return $http({
        method: 'POST',
        url:    this.$getUrl(),
        data:   itemData
      }).then(function(response) {
        if( !response.data || response.status >= 400 ) {
          return $q.reject(response);
        } else {
          self.klass.resultsKlass.load(response.data.id, { data: response.data }); // Add to model layer cache
          if( !_.contains(self.result_ids, response.data.id) ) {
            self.$data.results.push(response.data.id);
            self.$setData(self.$data);                   // Updates $$hashKey and recalls $initializeObjectProperties()
          }
          return self.klass.resultsKlass.load(response.data.id);
        }
      })
    },
    /**
     * @untested
     * @param   {ApiBaseClass} itemData
     * @returns {Promise<resultsKlass>} newly created resultsKlass
     */
    $removeFromCollection: function(itemOrId) {
      var id = itemOrId && itemOrId.id || itemOrId;
      if( _.contains(this.$data.results, id) ) {
        _.pull(this.$data.results, id);          // Remove data_item as inline operation
        this.$setData(this.$data);               // Updates $$hashKey and recalls $initializeObjectProperties()
      }
      else {
        // @untested and unrun
        var data_item = _.find( this.$data.results, { id: id }) || null; // this.$data.results[] could be either id or object
        if( data_item && _.contains(this.$data.results, data_item) ) {
          _.pull(this.$data.results, data_item); // Remove data_item as inline operation
          this.$setData(this.$data);             // Updates $$hashKey and recalls $initializeObjectProperties()
        }
      }
      // $timeout(function() { $rootScope.$apply(); }); // need to trigger $scope.$watch inside directives) // TODO: Remove?
    },

    /**
     * TODO: selectboxFundgroup directive not updating on $deleteFromCollection
     * @untested
     * @param   {ApiBaseClass} itemData
     * @returns {Promise<resultsKlass>} newly created resultsKlass
     */
    $deleteFromCollection: function(itemOrId) {
      var self = this;

      return this.klass.resultsKlass.load(itemOrId, { load: false }).$deleteFromApi().then(function(item) {
        self.$removeFromCollection(item);
      })
    }
  });
  return ApiCollection;
});
;

//***** src/models/collections/Benchmarks.js *****//
// Collections

angular.module("edgefolio.models").factory("Indexes", function(ApiCollection, Index) {
  var Indexes = new JS.Class("Indexes", ApiCollection, {
    extend: {
      url:          "/api/indexes/",
      idParam:      null,
      resultsKlass: Index
    }
  });
  return Indexes;
});

/**
 * Benchmarks are currently implemented as the full set of available indexes
 */
angular.module("edgefolio.models").factory("Benchmarks", function(ApiCollection, Indexes, Index) {
  var Benchmarks = new JS.Class("Benchmarks", Indexes, {
    extend: {
      url:          "/api/indexes/",
      idParam:      null,
      resultsKlass: Index
    }
  });
  return Benchmarks;
});
;

//***** src/models/collections/FundGroups.js *****//
angular.module("edgefolio.models").factory("FundGroups", function($q, $http, ApiCollection, FundGroup) {
  var FundGroups = new JS.Class("FundGroups", ApiCollection, {
    extend: {
      url:          "/api/user/fund-groups/",
      idParam:      null,
      resultsKlass: FundGroup
    }

    ///**
    // * Fake Data for testing FundGroups
    // * @param options
    // * @returns {Promise} { count:, next:, prev:, results: [{ id:, created:, modifed:, name, funds: [ Number, ... ] }, ... ]}
    // */
    //,$fetchData: function(options) {
    //  // NOTE: Fake FundGroup Data for testing
    //  var responseData = [
    //    {
    //      id: 458,
    //      created: "2015-08-04T13:55:15.054963Z",
    //      modified: "2015-08-04T13:55:15.059178Z",
    //      name: "Demo FundGroup",
    //      funds: [4, 5, 6, 7]
    //    },
    //    {
    //      id: 457,
    //      created: "2015-08-04T13:55:15.026575Z",
    //      modified: "2015-08-04T13:55:15.030677Z",
    //      name: "Single Fund FundGroup",
    //      funds: [1]
    //    },
    //    {
    //      id: 456,
    //      created: "2015-08-04T13:55:14.996139Z",
    //      modified: "2015-08-04T13:55:15.000797Z",
    //      name: "Empty FundGroup",
    //      funds: []
    //    },
    //    {
    //      id: 455,
    //      created: "2015-08-04T13:55:14.996139Z",
    //      modified: "2015-08-04T13:55:15.000797Z",
    //      name: "Giant FundGroup",
    //      funds: _.range(1, 100)
    //    }
    //  ];
    //  return $q.when({ results: responseData });
    //}
  });
  return FundGroups;
});

angular.module("edgefolio.models").factory("FundGroup", function($q, $http, ApiBaseClass) {
  var FundGroup = new JS.Class("FundGroup", ApiBaseClass, {
    extend: {
      url:          "/api/user/fund-groups/:fundgroup_id/",
      idParam:      "fundgroup_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "funds", "Fund");
    },
    $initializePreloadPromise: function() {
      // Wait for $preloadPromise to be accessed before lazy-loading child data
      this.klass.ApiFieldGenerator.defineGetters(this, {
        $preloadPromise: function() {
          var self = this;
          return $q.when(self.$loadPromise)
          .then(function() {
            var promises = _([
              self.funds
            ])
            .flatten()
            .pluck('$loadPromise')
            .reject(_.isNull)
            .map(function(promise) {
              return $q.when(promise)['catch'](_.noop);
            })
            .value();

            return $q.all(promises).then(function() {
              return self;
            });
          });
        }
      })
    },
    $patchFundIds: function(fund_ids) {
      var self = this;
      this.$invalidateCache(this.$getUrl());

      return $http({
        method: 'PATCH',
        url:    this.$getUrl(),
        data:   {
          funds: _([fund_ids]).flatten(true).filter().map(String).unique().value()
        }
      }).then(function(response) {
        if( !response.data || response.status >= 400 ) {
          return $q.reject(response);
        } else {
          self.$setData(response.data);
        }
      }).then(function() {
        return self;
      })
    },
    $addFundIds: function(id) {
      return this.$patchFundIds(_.flatten([this.fund_ids, Number(id)]));
    },
    $removeFundIds: function(id) {
      return this.$patchFundIds(_.without(this.fund_ids, Number(id)));
    }
  });
  return FundGroup;
});
;

//***** src/models/timeseries/DateBucket.js *****//
/**
 *  This is the base DateBucket for the v3 model framework
 *
 *  Assumes:
 *    src/common_components/global/date_toString.js - sets Date.prototype.toString = Date.prototype.toISOString (sortable)
 *
 *  DateBucketCache is kept outside the visible object tree, to avoid Inspectlet and other 3rd party libs from excess processing
 *
 *  NOTE: Strips null tails from both ends of timestamp_indexed_object
 *
 *  @documentation JS.Class: http://jsclass.jcoglan.com/
 *  @class DateBucket
 */
angular.module('edgefolio.models').factory('DateBucketCache', function() {
  return {
    getKey:        {},
    dateBucket:    {},
    incrementDate: {}
  };
});
angular.module('edgefolio.models').factory('DateBucket', function(
  _, $q, ApiBaseClass, ApiFieldGenerator, UnenumerablePrototype, DateBucketCache, moment
) {

  var DateBucket = new JS.Class("DateBucket", UnenumerablePrototype, {
    initialize: function(timestamp_indexed_object, options) {
      options = _.extend({
        prevalidated: false // @optimization: if true, don't run this.klass.dateBucketObject() on input
      }, options);

      if( options.prevalidated ) {
        this._setAllFromObjectPrevalidated(timestamp_indexed_object);
      } else {
        this._setAllFromObject(timestamp_indexed_object);
      }
    },

    // TimeSeries.latest_date needs to be self-caching to preserve object identity - preventing angular $digest loops
    $initializeObjectProperties: function() {
      ApiFieldGenerator.selfCaching(this, {
        "latest":           this.$latest,
        "latest_date":      this.$latest_date,
        "first":            this.$first,
        "first_date":       this.$first_date,
        "max_timeframe_id": this.$max_timeframe_id
      }, {
        enumerable:   false, // expose in for( key in instance ) loop
        configurable: false  // allow property to be redefined later
      });
    },

    has: function(date) {
      return _.has( this, this.getKey(date) );
    },
    /**
     * Returns this.klass.dateBucket(date).toISOString()
     *
     * @memoized - profiler indicates this is a highly used function, and moment(date).toISOString() is expensive
     * @param   {moment|string} date
     * @returns {String}
     */
    getKey: function(date) {
      var cache     = DateBucketCache['getKey'];
      var cache_key = date instanceof moment ? Number(date) : date;
      if( !cache[cache_key] ) {
        cache[cache_key] = this.klass.dateBucket(date).toISOString(); // .toString() === .toISOString()
      }
      return cache[cache_key];
    },
    get: function(date) {
      var value = this[ this.getKey(date) ];
      return this.klass.isValidValue(value) ? value : null; // // 0 -> 0; null, undefined, NaN, Infinity -> null
    },

    /**
     * DateBucket objects connected to ApiTimeClass instances should not be modified, create new object instead
     * @param date  {string|moment}
     * @param value {number}
     */
    _set: function(date, value) {
      if( this.has(date) ) {
        this[ this.getKey(date) ] = value;
        this.$initializeObjectProperties(date, value);
      } else {
        // Need to ensure new key values are in sorted order
        this[ this.getKey(date) ] = value;
        this._setAllFromObject( this.toObject() );
      }
    },

    /**
     * Resets key/value pairs in DateBucket "this"
     * Rounds and sorts all date keys to endOf(klass.dateBucketSize || "month"), filling in blanks with null
     * If multiple timestamp keys are in the same dateBucket, then latest non-null datestamp value is chosen
     * Results in _.keys(this) being a sorted timestamp list, containing only data from the last call to this._setAllFromObject()
     * @param timestamp_indexed_object {DateBucket}
     */
    _setAllFromObject: function(timestamp_indexed_object) {
      timestamp_indexed_object = this.klass.dateBucketObject(timestamp_indexed_object);
      this._setAllFromObjectPrevalidated(timestamp_indexed_object);
    },
    _setAllFromObjectPrevalidated: function(timestamp_indexed_object) {
      // Remove any old keys
      for( var key in this ) {
        delete this[key];
      }
      // Apply new keys to this
      for( var key in timestamp_indexed_object ) {
        this[key] = timestamp_indexed_object[key];
      }
      this.$initializeObjectProperties();
    },

    /**
     * @returns {array<String>} datestrings currently stored
     */
    keys: function() {
      var keys = [];
      for( var key in this ) {
        keys.push(key)
      }
      return keys;
    },
    /**
     * @returns {array<moment>} datestrings currently stored converted to moment() dates
     */
    dates: function() {
      return this.keys().map(function(key) { return moment(key); });
    },

    /**
     * @returns {array<number>} array of values, stored by default as 1 = 1%
     */
    values: function() {
      var values = [];
      for( var key in this ) {
        values.push(this[key])
      }
      return values;
    },

    size: function() {
      return this.keys().length
    },


    /**
     * @returns {object}
     */
    toObject: function() {
      var object = {};
      for( var key in this ) {
        object[key] = this[key];
      }
      return object; // returns object not TimesSeries
    },

    /**
     * @returns {DateBucket}
     */
    clone: function() {
      return new this.klass( this.toObject() );
    },

    /**
     * @untested
     * Runs _.mapValues() but returning a new DateBucket object
     * @param   {Function} callback
     * @param   {?Object}  context
     * @returns {DateBucket}
     */
    mapValues: function(callback, context) {
      var mapped_data = _.mapValues(this.toObject(), callback, context);
      return this.klass.init(mapped_data);
    },

    $latest: function() {
      var value = _(this.toObject()).omit(_.isNull).values().last();
      return this.klass.isValidValue(value) ? value : null;
    },
    $latest_date: function() {
      var value = _(this.toObject()).omit(_.isNull).keys().last();
      return value && moment(value) || null;
    },
    $first: function() {
      var value = _(this.toObject()).omit(_.isNull).values().first();
      return this.klass.isValidValue(value) ? value : null;
    },
    $first_date: function() {
      var value = _(this.toObject()).omit(_.isNull).keys().first();
      return value && moment(value) || null;
    },
    $max_timeframe_id: function() {
      return moment().diff( this.first_date, 'months' ) || 0;
    },

    /**
     * TODO: remove
     * @returns {string} first datestring in DateBucket range
     */
    $start_datestring: function() {
      return _(this.keys()).first(); // keys are presorted, so sort operation should be O(N)
    },
    /**
     * TODO: remove
     * @returns {string} last datestring in DateBucket range as moment
     */
    $start_date: function() {
      return moment( this.$start_datestring() );
    },
    /**
     * TODO: remove
     * @returns {string} last datestring in DateBucket range
     */
    $end_datestring: function() {
      return _(this.keys()).last(); // keys are presorted, so sort operation should be O(N)
    },
    /**
     * TODO: remove
     * @returns {string} last datestring in DateBucket range as moment
     */
    $end_date: function() {
      return moment( this.$end_datestring() );
    },

    /**
     * @tested
     * Returns a new TimeSeries object limited to the provided date range
     *
     * python: mask_returns_to_period
     * @param start_date {string|moment|array<string|moment>} dates can be passed in as as either arguments or arrays
     * @param end_date   {string|moment|array<string|moment>}
     * @returns {TimeSeries}
     */
    subsetDateRange: function( /* start_date, end_date */ ) {
      var date_range = _(this.klass.argumentsToFlattenedFilteredArray(arguments)).map(String).sortBy().value();
      var start_date = _.first(date_range);
      var end_date   = _.last(date_range);

      return this._subsetDateRange(start_date, end_date);
    },
    _subsetDateRange: function(start_date, end_date) {
      // @optimization, Optimized too many times - ensure start_date, end_date are always of type String
      var timestamp_indexed_object = {};
      var keys = this.keys();

      // this.keys() is presorted - so linear search is fastest
      for( var i=0, n=keys.length; i<n; i++ ) {
        if( keys[i] >= start_date ) { break; }
      }
      for( ; i<n; i++ ) {
        if( keys[i] > end_date ) { break; }
        timestamp_indexed_object[keys[i]] = this[keys[i]]; // if( start_date <= date && date <= end_date )
      }
      return this.klass.init(timestamp_indexed_object, { prevalidated: true });
    },

    /**
     * @untested
     * Returns a subset of the dataset as a new instance, from now to X months ago
     * @param   {Number|Object} months  timeframe_id which equals the number of months previous subset
     * @returns {DateBucket}
     */
    timeframe: function( input ) {
      var months = _.isObject(input) ? Number(input.timeframe_id) : Number(input) || 0;
      if( !_.isFinite(months) || months === 0 ) { return this; } // no-op

      var unit = this.klass.dateBucketSize || 'month';
      return this.subsetDateRange(moment(), moment().add(-months, unit));
    },

    extend: {
      dateBucketSide: 'endOf', // endOf | startOf
      dateBucketSize: 'month', // year | quarter | month | week | day | hour | minute | second | millisecond

      // Class initialization function
      resolve: function() {
        this.dateBucketSize       = moment.normalizeUnits(this.dateBucketSize); // m || months -> month
        this._dateBucketSizeIsDay = _(['day', 'hour', 'minute', 'second', 'millisecond']).includes( this.dateBucketSize );
        this.callSuper();

        // ApiFieldGenerator.klass.unenumerableKlassPrototype(this); // Called from UnenumerablePrototype.klass.define()
      },

      /**
       * Creates/clones a new DateBucket object
       * @param timestamp_indexed_object
       * @returns {DateBucket}
       */
      init: function(timestamp_indexed_object, options) {
        return new this(timestamp_indexed_object, options);
      },

      /**
       *
       * @param   {Array|String} options.timeseries_id  argument for Edgefolio.load()
       * @param   {Number}       options.timeframe_id
       * @returns {Promise<TimeSeries|null>}
       */
      loadFromUuid: function(uuid, options) {
        var self = this;
        options = {
          timeframe_id:  options.timeframe_id  || 0
        };
        var timeseries = ApiBaseClass.loadUuid(uuid);

        if( !timeseries || !timeseries.$loadPromise ) {
          return $q.when(null);
        }
        return timeseries.$loadPromise.then(function(timeseries) {
          if( !timeseries.isA(DateBucket) ) {
            timeseries = _.get(timeseries, 'returns_time_series') || timeseries;
          }
          if( !timeseries.isA(DateBucket) && _.get(timeseries, 'base_share_class') ) {
            uuid = _.get(timeseries, 'base_share_class.uuid');
            return self.loadFromUuid(uuid, options); // recurse
          }
          if( !timeseries.isA(DateBucket) ) {
            return null;
          } else {
            return timeseries.timeframe(options.timeframe_id);
          }
        });
      },


      isValidValue: function(value) {
        return _.isFinite(value);
      },

      /**
       * Buckets date and add(1, dateBucketSize)
       * @param date {string|moment}
       * @returns {moment}
       */
      incrementDate: function(date) {
        var cache     = DateBucketCache['incrementDate'];
        var cache_key = date instanceof moment ? Number(date) : date;
        if( !cache[cache_key] ) {
          cache[cache_key] = this.dateBucket( moment(date).add(1, this.dateBucketSize) );
          Object.freeze(cache[cache_key])
        }
        return cache[cache_key]
      },

      /**
       * Returns a bucketed date rounded to the start of the last day in the month
       * or as configured via this.dateBucketSide and this.dateBucketSize
       *
       * @memoized - profiler indicates this is a highly used function, and moment(date).toISOString() is expensive
       * @param date {string|moment}
       * @returns {moment}
       */
      dateBucket: function(date) {
        var cache     = DateBucketCache['dateBucket'];
        var cache_key = date instanceof moment ? Number(date) : date;
        if( !cache[cache_key] ) {
          if( this._dateBucketSizeIsDay ) { // cache lookup in klass.resolve() as this is a looped over function
            cache[cache_key] = moment(date)[this.dateBucketSide](this.dateBucketSize);
          } else {
            cache[cache_key] = moment(date)[this.dateBucketSide](this.dateBucketSize).startOf('day');
          }
          Object.freeze(cache[cache_key])
        }
        return cache[cache_key]
      },

      /**
       * Returns sorted array of all bucketed dates between the first and last dates in the input range
       * @param date_array {array<string|moment>}
       * @returns {array<moment>}
       */
      dateArray: function(date_array) {
        if( !_.isArray(date_array) || date_array.length === 0 ) {
          return [];
        }
        var dates      = _(date_array).filter().sortBy().value();
        var start_date = this.dateBucket(_.first(dates));
        var end_date   = this.dateBucket(_.last(dates));

        // date <= $end_date is broken due to Datejs toISOString() bug
        var output = [];
        for( var date = start_date; date <= end_date; date = this.incrementDate(date) ) {
          output.push(date);
        }
        return output;
      },

      /**
       * Reindexes a timestamp indexed object with this.dateArray() as keys
       * If two dates are in the same bucket, the latest date non-null value will be used
       * Does not modify original object
       * Only excludes null and undefined values
       * @param timestamp_indexed_object {DateBucket}
       * @returns {object}
       */
      dateBucketObject: function(timestamp_indexed_object) {
        var key;
        var date_strings = [];
        for( key in timestamp_indexed_object ) {
          if( !_.isNull(timestamp_indexed_object[key]) && !_.isUndefined(timestamp_indexed_object[key]) ) {
            date_strings.push(key);
          }
        };
        date_strings.sort();

        var date_range = this.dateArray(date_strings);

        var output = {};
        for( var i=0, n=date_range.length; i<n; i++ ) {
          output[date_range[i]] = null;
        }
        for( key in timestamp_indexed_object ) {
          if( timestamp_indexed_object[key] !== null && timestamp_indexed_object[key] !== undefined ) {
            output[this.dateBucket(key)] = timestamp_indexed_object[key];
          }
        }
        return output;
      },

      /**
       * @untested
       * TODO: Optimize
       * Returns a new TimeSeries object limited to the provided date range
       *
       * python: mask_returns_to_period
       * @param {DateBucket} timestamp_indexed_object
       * @param {string|moment|array<string|moment>} start_date   dates can be passed in as as either arguments or arrays
       * @param {string|moment|array<string|moment>} end_date
       * @returns {TimeSeries}
       */
      subsetDateRange: function(timestamp_indexed_object, start_date, end_date) {
        return this.init(timestamp_indexed_object, { prevalidated: true }).subsetDateRange(start_date, end_date);
      },

      /**
       * @untested
       * TODO: Optimize
       * Returns a subset of the dataset for the last X months (or dateBucketSize)
       *
       * @param {DateBucket} timestamp_indexed_object
       * @param months
       * @returns {DateBucket}
       */
      timeframe: function(timestamp_indexed_object, months) {
        return this.init(timestamp_indexed_object, { prevalidated: true }).timeframe(months);
      },


      /**
       * @tested
       */
      toCalc: function(value) {
        // process common cases first
        if( value === null    ) { return null; }
        if( _.isFinite(value) ) { return value === 0 ? 0 : value/100; }
        if( _.isNumber(value) ) { return value || null; } // NaN -> null
        if( _.isArray(value)  ) { return _.map(value, this.toCalc, this); }
        if( _.isObject(value) ) { return _.mapValues(_.clone(value), this.toCalc, this); }
        else                    { return null; }
      },

      /**
       * @tested
       */
      fromCalc: function(value) {
        // process common cases first
        if( value === null    ) { return null; }
        if( _.isFinite(value) ) { return value * 100; }
        if( _.isNumber(value) ) { return value || null; } // NaN -> null
        if( _.isArray(value)  ) { return _.map(value, this.fromCalc, this); }
        if( _.isObject(value) ) { return _.mapValues(_.clone(value), this.fromCalc, this); }
        else                    { return null; }
      },

      toCompounded: function(fund_returns, base_multiplier) {
        var was_array   = _.isArray(fund_returns);
        base_multiplier = base_multiplier || 1000;

        var count = 1;
        var compounded_returns = _(fund_returns)
          .thru(this.toCalc, this)
          .mapValues(function(value) {
            count = count * (1 + (value || 0));
            return count;
          })
          .mapValues(function(value) {
            return value * base_multiplier;
          })
          .value()
        ;

        if( was_array ) {
          compounded_returns = _.values(compounded_returns);
        }
        return compounded_returns;
      },

      /**
       * @tested implicitly
       */
      thruCalcToNumber: function(fund_returns, callback, context) {
        return _(fund_returns)
          .values()
          .reject(_.isNull)
          .thru(this.toCalc, this)    // n = n/100
          .thru(function(values_array) {
            context = context || this;
            return callback.call(context, values_array);
          })
          .thru(function(value) { return _.isFinite(value) ? value : 0; })  // null, undefined, NaN -> 0
          .thru(this.fromCalc, this)  // n = n*100
          .value()
        ;
      },

      /**
       * @tested - implicitly through this.groupByDateObject() and this.subsetDateRange()
       * @optimized "bad value context for arguments value" causing lodash to slow
       *
       * @param  {Array} arguments
       * @return {Array} _(arguments).flatten(true).filter().value();
       */
      argumentsToFlattenedFilteredArray: function(args) {
        var array_of_returns = [];
        if( args && args.length ) {
          for( var i = 0, ni = args.length; i < ni; i++ ) {
            if( _.isArray(args[i]) ) {
              for( var j = 0, nj = args[i].length; j < nj; j++ ) {
                if( _.isArray(args[i][j]) ) {
                  for( var k = 0, nk = args[i][j].length; k < nk; k++ ) {
                    if( !_.isNull(args[i][j][k]) && !_.isUndefined(args[i][j][k]) ) {
                      array_of_returns.push(args[i][j][k]);
                    }
                  }
                } else {
                  if( !_.isNull(args[i][j]) && !_.isUndefined(args[i][j]) ) {
                    array_of_returns.push(args[i][j]);
                  }
                }
              }
            } else {
              if( !_.isNull(args[i]) && !_.isUndefined(args[i]) ) {
                array_of_returns.push(args[i]);
              }
            }
          }
        }
        return array_of_returns;
      },

      /**
       * this.groupByDateObject() without TimeSeries cast
       * @param   {Array<DateBucket>} arguments - is flattened and filtered
       * @returns {*|DateBucket}  { "timestamp": [1,2,3], ... }
       */
      groupByDate: function() {
        return this.init( this.groupByDateObject.apply(this, arguments), { prevalidated: true });
      },

      /**
       * @tested
       * this.groupByDate() but without the TimeSeries cast
       *
       * _(keys).indexBy().mapValues(function(key) {
       *  return _(array_of_returns).pluck(key).map(function(value) { return _.isUndefined(value) ? null : value;  }).value()
       * }).value();
       *
       * @param   {Array<DateBucket>} arguments - is flattened and filtered
       * @returns {object}  { "timestamp": [1,2,3], ... }
       */
      groupByDateObject: function( /* array_of_returns */ ) {
        var array_of_returns = this.argumentsToFlattenedFilteredArray(arguments);
        return this._groupByDateObject(array_of_returns); // @optimization: "bad value context for arguments value"
      },
      _groupByDateObject: function(array_of_returns) {
        var keys = this.groupByDateKeys(array_of_returns);

        var output = {};
        for( var k=0, nk=keys.length; k<nk; k++ ) {
          var key = keys[k];
          var row = []; row.length = array_of_returns.length;
          for( var i=0, ni=array_of_returns.length; i<ni; i++ ) {
            var value = array_of_returns[i][key];
            value = ( typeof value !== 'undefined' ) ? value : null;
            row[i] = value;
          }
          output[key] = row; // output[key][i] = array_of_returns[i][key]
        }
        return output; // @optimized - cast to TimeFrame is expensive in a tight loop
      },
      /**
       * @tested - implicitly by groupByDateObject()
       *
       * Sorted, unique, flattened list of keys in all arguments
       * _(array_of_returns).map(_.keys).flatten().unique().sortBy().value();
       *
       * @param   {Array<DateBucket>} arguments - is flattened and filtered
       * @returns {Array}
       */
      groupByDateKeys: function( /* array_of_returns */ ) {
        var array_of_returns = this.argumentsToFlattenedFilteredArray(arguments);
        return this._groupByDateKeys(array_of_returns); // @optimization: "bad value context for arguments value"
      },
      _groupByDateKeys: function(array_of_returns) {
        var keys = [];
        var keys_seen = {};
        for( var i=0, ni=array_of_returns.length; i<ni; i++ ) {
          for( var key in array_of_returns[i] ) {
            keys_seen[key] || keys.push(key);
            keys_seen[key] = true;
          }
        }
        keys.sort();
        return keys;
      },

      /**
       * @destructive to container object, but not children
       * If options.timeframe_id != 0, then invoke .timeframe() on all other properties of object, if defined
       * @param   {Object}  options
       * @param   {?Number} options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Object}
       */
      invokeTimeframeOptions: function(options) {
        options = _.isObject(options) ? options : {};
        if( options.timeframe_id ) {
          for( var key in options ) {
            if( _.isFunction(_.get(options, [key, 'timeframe'])) ) {
              options[key] = options[key].timeframe(options.timeframe_id);
            }
          }
          delete options.timeframe_id; // @optimization, remove flag incase this function gets called multiple times
        }
        return options;
      }
    }
  });



//  // Loadsh v3 extensions
//  _.each([
//    "chain",
//    //"create",
//    //"defaults",
//    //"defaultsDeep",
//    //"extend", // -> assign
//    "findKey",
//    "findLastKey",
//    "forIn",
//    "forInRight",
//    "forOwn",
//    "forOwnRight",
//    "functions",
//    "get",
//    "has",
//    "invert",
//    "keys",
//    "keysIn",
//    "mapKeys",
//    "mapValues",
//    //"merge",
//    //"methods", // -> functions
//    "omit",
//    "pairs",
//    "pick",
//    "result",
//    "_set",
//    "transform",
//    "values",
//    "valuesIn"
//  ], function(lodashMixin) {
//    DateBucket.prototype[lodashMixin] = function() {
//      var args = [this].concat(arguments);
//      return _[lodashMixin].apply(_, args);
//    };
//  });
//
//  // Mixin simple statistics arrayMethods to lodash
//  _.each([
//    'median', 'standard_deviation', 'sum',
//    'sampleSkewness',
//    'mean', 'min', 'max', 'quantile', 'geometricMean',
//    'harmonicMean', 'root_mean_square'
//  ], function(ssMixin) {
//    DateBucket.prototype[ssMixin] = function() {
//      // TODO: map .toCalc() .toDisplay()
//
//      var args = [_.values(this)].concat(arguments);
//      return ss[ssMixin].apply(ss, args);
//    };
//  });

  return DateBucket;
});
;

//***** src/models/timeseries/TimeSeries.js *****//
/**
 * Class based reimpleme ntation of /api/src/compute/measures/tasks.py
 */
angular.module('edgefolio.models').factory('TimeSeries', function(
  $q, kurtosis, covariance,
  Edgefolio, ApiFieldGenerator, DateBucket, AggregationDefinitions // NOTE: Injecting "Fund" causes a DI injection loop
) {
  var TimeSeries = new JS.Class("TimeSeries", DateBucket, {

    /**
     * Defines the getter/setter mappings for this.data
     * Gets run on original initialization, and again after this.$setData(),
     * as this function may depend on the keys in this.data
     *
     * Extend $initializeObjectProperties with additional Object.defineProperty() specifications
     * NOTE: remember to also call: this.callSuper()
     */
    $initializeObjectProperties: function() {
      this.callSuper();
    },

    /**
     * COPY/PASTE: Fund.$statistics()
     * @param   {Object} options
     * @returns {Object}
     */
    $statistics: function(options) {
      options = _.extend({
        fund_returns: this
      }, options);
      var output = this.klass.statistics(options);

      return output;
    },


    toCalc: function(options) {
      return new this( this.klass.toCalc(this), { prevalidated: true });
    },
    fromCalc: function(options) {
      return new this( this.klass.toCalc(this), { prevalidated: true });
    },
    groupByDateObject: function(options) {
      return new this( this.klass.groupByDateObject([this, arguments]), { prevalidated: true });
    },


    excess: function(options) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns && !options.risk_free_returns ) { return null; }
      return this.klass.excess(options);
    },
    mean: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.mean(options);
    },
    expected_return: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.expected_return(options);
    },
    standard_deviation: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.standard_deviation(options);
    },
    annualized_standard_deviation: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.annualized_standard_deviation(options);
    },
    annualized_volatility: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.annualized_volatility(options);
    },
    downside_deviation: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.downside_deviation(options);
    },
    skewness: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.skewness(options);
    },
    kurtosis: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.kurtosis(options);
    },
    period_return: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.period_return(options);
    },
    annualized_compounded_return: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.annualized_compounded_return(options);
    },
    annualized_period_return: function( options ) {
      options = _.extend({ fund_returns: this, track_record_years: 0 }, options);
      return this.klass.annualized_period_return(options);
    },
    maximum_drawdown: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.maximum_drawdown(options);
    },
    sharpe_ratio: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.risk_free_returns ) { return null; }
      return this.klass.sharpe_ratio(options);
    },
    annualized_sharpe_ratio: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.risk_free_returns ) { return null; }
      return this.klass.annualized_sharpe_ratio(options);
    },
    sortino_ratio: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.risk_free_returns ) { return null; }
      return this.klass.sortino_ratio(options);
    },
    annualized_sortino_ratio: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      return this.klass.annualized_sortino_ratio(options);
    },
    correlation_coefficient: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      return this.klass.correlation_coefficient(options);
    },
    beta: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      if( !options.risk_free_returns ) { return null; }
      return this.klass.beta(options);
    },
    annualized_beta: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      if( !options.risk_free_returns ) { return null; }
      return this.klass.annualized_beta(options);
    },
    alpha: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      if( !options.risk_free_returns ) { return null; }
      return this.klass.alpha(options);
    },
    annualized_alpha: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      if( !options.risk_free_returns ) { return null; }
      return this.klass.annualized_alpha(options);
    },
    information_ratio: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      if( !options.risk_free_returns ) { return null; }
      return this.klass.information_ratio(options);
    },


    //----- TimeSeries Klass Methods -----//
    extend: {
      // mappingKlass: TimeSeriesValue,

      /**
       * COPY/PASTE: TimeSeries.$statistics()
       * NOTE: Assumes all data structures have been pre-loaded, doesn't return a promise
       *
       * @param   {Object} options
       * @returns {Object}
       */
      statistics: function(options) {
        options = options || {};

        options.fund            = options.fund            || options.fund_id            && Edgefolio.Fund.load(options.fund_id)              || null;
        options.share_class     = options.share_class     || options.share_class_id     && Edgefolio.ShareClass.load(options.share_class_id) || null;
        options.benchmark       = options.benchmark       || options.benchmark_id       && Edgefolio.Index.load(options.benchmark_id)        || null;
        options.risk_free_index = options.risk_free_index || Edgefolio.Index.load(options.risk_free_index_id || Edgefolio.Fund.risk_free_index_id) || null; // Hardcoded Fund.risk_free_index == 63304

        options.fund            = options.fund            || _.get(options.share_class, 'fund');
        options.share_class     = options.share_class     || _.get(options.fund, 'base_share_class');
        options.benchmark       = options.benchmark       || _.get(options.fund, 'category_benchmark_index');
        options.risk_free_index = options.risk_free_index || _.get(options.fund, 'risk_free_index');

        options = {
          fund_returns:      options.fund_returns      || _.get(options.share_class,     'returns_time_series') || null,
          benchmark_returns: options.benchmark_returns || _.get(options.benchmark,       'returns_time_series') || null,
          risk_free_returns: options.risk_free_returns || _.get(options.risk_free_index, 'returns_time_series') || null,
          timeframe_id:      options.timeframe_id      || 0
        };
        // Clip statistics() to only contain timerange of options.fund_returns, not for the full history of the benchmark
        if( _.get(options, 'fund_returns.max_timeframe_id') ) {
          options.timeframe_id = ( options.timeframe_id === 0 )
                               ? options.fund_returns.max_timeframe_id
                               : Math.min(options.fund_returns.max_timeframe_id, options.timeframe_id) || 0
        }
        this.invokeTimeframeOptions(options);

        var output = _.mapValues(AggregationDefinitions, function(aggregation) {
          if( _.isFunction(this[aggregation.id]) ) {
            return this[aggregation.id](options);
          }
          return null;
        }, this);
        return output;
      },


      /**
       * @tested
       * @shared_task
       * def excess_returns(fund_returns, benchmark_returns):
       *  return fund_returns - benchmark_returns
       *
       * @param   {?DateBucket}  options.fund_returns
       * @param   {?DateBucket}  options.benchmark_returns
       * @param   {?DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {TimeSeries}
       */
      excess: function(options) {
        options = this.invokeTimeframeOptions(options);
        var array_of_returns = _([options.fund_returns, options.benchmark_returns, options.risk_free_returns])
          .filter()
          .take(2)
          .value()
        ;
        var returns = this.groupByDateObject(array_of_returns);
        var excess = _(returns)
          .thru(this.toCalc, this)
          .mapValues(function(values_array, date) {
            if( _.isFinite(values_array[0]) && _.isFinite(values_array[1]) ) {
              return values_array[0] - values_array[1];
            } else {
              return null;
            }
          })
          .thru(this.fromCalc, this)
          .value();

        return new this(excess, { prevalidated: true });
      },

      /**
       * @tested
       * @shared_task
       * def arithmetic_mean(returns):
       *     return returns.mean()
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      mean: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        if( !_.isObject(fund_returns) ) { return null; }

        return this.thruCalcToNumber(fund_returns, function(values_array) {
          return ss.mean(values_array);
        });
      },
      /**
       * expected_return: simply the arithmetic mean of the series in the time frame under consideration.
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      expected_return: function(options) {
        //options = this.invokeTimeframeOptions(options);
        return this.mean(options);
      },


      /**
       * @tested
       * @shared_task
       * def standard_deviation(returns):
       *     return returns.std()
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      standard_deviation: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        if( !_.isObject(fund_returns) ) { return null; }

        return this.thruCalcToNumber(fund_returns, function(values_array) {
          // ss.sampleStandardDeviation() uses x.sum()/N-1 | ss.standardDeviation() uses x.sum()/N
          return ss.sampleStandardDeviation(values_array);
        });
      },


      /**
       * @tested
       * @shared_task
       * def annualized_standard_deviation(returns):
       *    return math.sqrt(12) * standard_deviation(returns)
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_standard_deviation: function(options) {
        //options = this.invokeTimeframeOptions(options);
        return Math.sqrt(12) * this.standard_deviation(options);
      },

      /**
       * annualized_volatility: sqrt(12) * standard_deviation(returns) in the time frame under consideration.
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_volatility: function(options) {
        //options = this.invokeTimeframeOptions(options);
        return this.annualized_standard_deviation(options);
      },


      /**
       * @tested
       * @shared_task
       * def downside_deviation(returns, mar=0.0):
       *     mask = returns < mar
       *     downside_diff = returns[mask] - mar
       *     if len(downside_diff) <= 1:
       *         return 0.0
       *     return np.std(downside_diff, ddof=1)
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {Number}      options.margin
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      downside_deviation: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        var margin       = options.margin || 0;
        if( !_.isObject(fund_returns) ) { return null; }

        margin = _.isFinite(margin) ? margin : 0;

        return _(fund_returns)
          .values()
          .reject(_.isNull)
          .thru(this.toCalc, this)                           // n = n/100
          .filter(function(value) { return value < margin }) // mask = returns < mar
          .map(function(value)    { return value - margin }) // downside_diff = returns[mask] - mar
          .thru(function(values_array) {
            return ss.sampleStandardDeviation(values_array); // ss.sampleStandardDeviation() uses x.sum()/N-1 | ss.standardDeviation() uses x.sum()/N
          })
          // .thru(function(values_array) {
          //   /**
          //    * @unused
          //    * @tested against ss.sampleStandardDeviation()
          //    * np.std:
          //    *   The standard deviation is the square root of the average of the squared deviations from the mean,
          //    *   i.e., std = sqrt(mean(abs(x - x.mean())**2)).
          //    *
          //    *   The average squared deviation is normally calculated as x.sum() / N, where N = len(x).
          //    *   If, however, ddof is specified, the divisor N - ddof is used instead.
          //    *   In standard statistical practice,
          //    *       ddof=1 provides an unbiased estimator of the variance of the infinite population.
          //    *       ddof=0 provides a maximum likelihood estimate of the variance for normally distributed variables.
          //    *
          //    *    The standard deviation computed in this function is the square root of the estimated variance,
          //    *    so even with ddof=1, it will not be an unbiased estimate of the standard deviation per se.
          //    *
          //    * @doc https://docs.scipy.org/doc/numpy-1.10.0/reference/generated/numpy.std.html
          //    * @doc http://simplestatistics.org/docs/#samplestandarddeviation
          //    */
          //
          //   var ddof = 1;
          //   if( values_array.length - ddof > 0 ) {
          //     var x_mean   = ss.mean(values_array) || 0;
          //     var abs      = values_array.map(function(x) { return Math.pow(x - x_mean, 2); }).sum(); // using Array.prototype rather than _.lodash()
          //     var variance = abs / (values_array.length - ddof);
          //     var rms      = Math.sqrt(variance);
          //     return rms;
          //   } else {
          //     return 0;
          //   }
          // })
          .thru(function(value) { return _.isFinite(value) ? value : 0; }) // null, undefined, NaN -> 0
          .thru(this.fromCalc, this)  // n = n*100                         // n = n * 100
          .value();
      },

      /**
       * @untested
       * @shared_task
       * def skewness(returns):
       *     return returns.skew()
       *
       * @doc https://docs.scipy.org/doc/scipy-0.14.0/reference/generated/scipy.stats.skew.html - Unknown Implementation
       * @doc http://simplestatistics.org/docs/#sampleskewness - Fisher-Pearson
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      skewness: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        if( !_.isObject(fund_returns) ) { return null; }

        return this.thruCalcToNumber(fund_returns, function(values_array) {
          return ss.sampleSkewness(values_array); // ss.sampleStandardDeviation() uses x.sum()/N-1 | ss.standardDeviation() uses x.sum()/N
        });
      },

      /**
       * @untested
       * @shared_task
       * def kurtosis(returns):
       *     return returns.kurtosis()
       *
       * @doc https://github.com/compute-io/kurtosis
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      kurtosis: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        if( !_.isObject(fund_returns) ) { return null; }

        return kurtosis(fund_returns); // compute-io/kurtosis
      },

      /**
       * @tested
       * @shared_task
       * def period_return(returns):
       *     return ((1.0 + returns/100.0).prod() - 1.0)*100.0
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      period_return: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        if( !_.isObject(fund_returns) ) { return null; }

        return this.thruCalcToNumber(fund_returns, function(values_array) {
          // TODO: implement product in simple-statistics
          var product = _.reduce(values_array, function(product, returns) {
            return product * (1 + returns);
          }, 1) - 1;

          return _.isFinite(product) ? product : 0;
        });
      },
      /**
       * TODO: verify this is the correct mapping
       * annualized_compounded_return: (1.0 + returns_series/100.0).cumprod()
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_compounded_return: function(options) {
        //options = this.invokeTimeframeOptions(options);
        return this.annualized_period_return(options);
      },

      /**
       * @untested
       * @shared_task
       * def annualized_period_return(returns, track_record_years):
       *     if track_record_years > 0:
       *         cumulative_growth = (1.0 + returns/100.0).prod()
       *         annualized_period_return = (cumulative_growth**(1.0/track_record_years) - 1.0)*100.0
       *         return annualized_period_return
       *     else:
       *         return 0.0
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {Number}      options.track_record_years
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_period_return: function(options) {
        if( !_.isObject(options && options.fund_returns) ) { return null; }

        var track_record_years = (options.fund_returns.max_timeframe_id + 1) / 12 || 1;
        var period_return = 1 + this.toCalc(this.period_return(options));
        var annualized_period_return = Math.pow(period_return, (1/track_record_years)) - 1;
        return this.fromCalc(annualized_period_return) || 0;
      },

      /**
       * @untested
       * @shared_task
       * def maximum_drawdown(returns):
       *     compounded_returns = []
       *     cur_return = 0.0
       *
       *     for r in returns:
       *         try:
       *             cur_return += math.log(1.0 + r/100.0)
       *         # This is a guard for a single day returning -100%
       *         except ValueError:
       *             # TODO: Log the following properly
       *             print("{cur} return, zeroing the returns".format(cur=cur_return))
       *             cur_return = 0.0
       *         compounded_returns.append(cur_return)
       *
       *     cur_max = None
       *     max_drawdown = None
       *
       *     for cur in compounded_returns:
       *         if cur_max is None or cur > cur_max:
       *             cur_max = cur
       *
       *         drawdown = (cur - cur_max)
       *         if max_drawdown is None or drawdown < max_drawdown:
       *             max_drawdown = drawdown
       *
       *     if max_drawdown is None:
       *         return 0.0
       *
       *     return -(1.0 - math.exp(max_drawdown))*100.0
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      maximum_drawdown: function(options) {
        options = this.invokeTimeframeOptions(options);
        if( !_.isObject(options.fund_returns) ) { return null; }

        var fund_returns       = _.values(options.fund_returns) || null;
        var compounded_returns = [];
        var cur_return         = 0.0;

        // for( var r in returns ) {
        compounded_returns = _.map(fund_returns, function(r) {
          cur_return += Math.log(1.0 + r / 100.0) || 0; // Math.log(-1) === NaN
          return cur_return;
        });

        var cur_max      = null;
        var max_drawdown = null;

        _.each(compounded_returns, function(cur) {
          if( cur_max === null || cur > cur_max ) {
            cur_max = cur;
          }

          var drawdown = (cur - cur_max);
          if( max_drawdown === null || drawdown < max_drawdown ) {
            max_drawdown = drawdown
          }
        });

        if( max_drawdown === null ) {
          return 0; // Javascript: All numbers are implicitly floating point to double precision
        } else {
          return -( 1 - Math.exp(max_drawdown) ) * 100;
        }
      },

      /**
       * @untested
       * @shared_task
       * def sharpe_ratio(fund_returns, risk_free_returns):
       *     excess_returns_series = excess_returns(fund_returns, risk_free_returns)
       *     expected_value = arithmetic_mean(excess_returns_series)
       *     monthly_volatility = standard_deviation(excess_returns_series)
       *
       *     if approx_equals(monthly_volatility, 0):
       *         return 0.0
       *
       *     return expected_value/monthly_volatility
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null} in range (0.00, 1.00)
       */
      sharpe_ratio: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(risk_free_returns) ) { return null; }

        var excess_returns_series = this.excess({ fund_returns: fund_returns, risk_free_returns: risk_free_returns });
        var expected_value        = excess_returns_series.mean();
        var monthly_volatility    = excess_returns_series.standard_deviation();

        // Verify: is proximity check required
        var proximity = 0.00001;
        if( 0 - proximity <= monthly_volatility && monthly_volatility <= proximity + 0 ) {
          return 0;
        } else {
          return expected_value / monthly_volatility; // display value is {0.00,1.00}
        }
      },

      /**
       * @untested
       * @shared_task
       * def annualized_sharpe_ratio(fund_returns, risk_free_returns):
       *     return math.sqrt(12)*sharpe_ratio(fund_returns, risk_free_returns)
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_sharpe_ratio: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(risk_free_returns) ) { return null; }

        return Math.sqrt(12) * this.sharpe_ratio(options);
      },

      /**
       * @untested
       * @shared_task
       * def sortino_ratio(fund_returns, risk_free_returns, minimum_acceptable_return=0.0):
       *     excess_returns_series = excess_returns(fund_returns, risk_free_returns)
       *     expected_value = arithmetic_mean(excess_returns_series)
       *     monthly_downside_deviation = downside_deviation(excess_returns_series, mar=0.0)
       *
       *     if approx_equals(monthly_downside_deviation, 0):
       *         return 0.0
       *
       *     return expected_value/monthly_downside_deviation
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      sortino_ratio: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(risk_free_returns) ) { return null; }

        var excess_returns_series      = this.excess({ fund_returns: fund_returns, risk_free_returns: risk_free_returns });
        var expected_value             = excess_returns_series.mean();
        var monthly_downside_deviation = this.downside_deviation(excess_returns_series, 0);

        // Verify: is proximity check required
        var proximity = 0.00001;
        if( 0 - proximity <= monthly_downside_deviation && monthly_downside_deviation <= proximity + 0 ) {
          return 0;
        } else {
          return this.toCalc(expected_value / monthly_downside_deviation);
        }
      },

      /**
       * @untested
       * @shared_task
       * def annualized_sortino_ratio(fund_returns, benchmark_returns):
       *     return math.sqrt(12)*sortino_ratio(fund_returns, benchmark_returns)
       *
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_sortino_ratio: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) ) { return null; }

        return Math.sqrt(12) * this.sortino_ratio(options);
      },

      /**
       * @tested
       * @shared_task
       * def correlation_coefficient(fund_returns, benchmark_returns):
       *     return np.corrcoef(fund_returns, benchmark_returns)[0][1]*100.0
       *
       * @doc http://simplestatistics.org/docs/#samplecorrelation
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      correlation_coefficient: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) ) { return null; }

        return _([fund_returns,benchmark_returns])
          //.thru(this.toCalc, this)    // ss.sampleCorrelation() is scale independent
          .thru(this.groupByDateObject, this) // = { "timestamp": [fund_value, benchmark_value], ... }
          .reject(function(row) {
            // ss.sampleCorrelation returns NaN if any inputs are null
            for( var i=0, n=row.length; i<n; i++ ) {
              if( row[i] === null || row[i] === undefined ) {
                return true;
              }
            }
            return false;
            //return _.any(row, _.isNull);
          })
          .thru(function(group_by_date) {
            return ss.sampleCorrelation(
              _.pluck(group_by_date, 0),
              _.pluck(group_by_date, 1)
            );
          })
          .thru(this.fromCalc, this) // ss.sampleCorrelation() returns (1,-1) || NaN || undefined - needs to be converted back to 1 = 1% format
          .value();
      },

      /**
       * @untested
       * @shared_task
       * def beta(fund_returns, benchmark_returns, risk_free_returns):
       *     # For fewer than two months, don't calculate anything
       *     if len(fund_returns) < 2:
       *         return 0.0
       *
       *     fund_excess_returns = excess_returns(fund_returns, risk_free_returns)
       *     benchmark_excess_returns = excess_returns(benchmark_returns, risk_free_returns)
       *     returns_matrix = np.vstack([fund_excess_returns, benchmark_excess_returns])
       *     C = np.cov(returns_matrix, ddof=1)
       *     excess_returns_covariance = C[0][1]
       *     benchmark_excess_returns_variance = C[1][1]
       *
       *     return excess_returns_covariance/benchmark_excess_returns_variance
       *
       * @doc https://docs.scipy.org/doc/numpy-1.10.1/reference/generated/numpy.cov.html
       * @doc https://docs.scipy.org/doc/numpy-1.10.1/reference/generated/numpy.vstack.html
       * @doc https://github.com/compute-io/covariance
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      beta: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) || !_.isObject(risk_free_returns) ) { return null; }
        if( fund_returns.size() < 2 ) { return 0; } // For fewer than two months, don't calculate anything

        var fund_excess_returns      = this.excess({ fund_returns:      fund_returns,      risk_free_returns: risk_free_returns });
        var benchmark_excess_returns = this.excess({ benchmark_returns: benchmark_returns, risk_free_returns: risk_free_returns });
        var returns_matrix           = this.groupByDateObject(fund_excess_returns, benchmark_excess_returns); // was numpy.vstack:

        // @doc https://github.com/compute-io/covariance
        //      By default, each element of the covariance matrix is an unbiased covariance estimate.
        //      Hence, the covariance matrix is the sample covariance matrix.
        //      For those cases where you want a biased estimate (i.e., population statistics), set the bias option to true.
        // WAS: np.cov(returns_matrix, ddof=1);
        //
        // NOTE: this.groupByDateObject() ensures the two _.pluck() arrays are the same size and date matching pairs
        //
        // TODO: input format of compute-io/covariance is different from np.cov()
        try {
          var C = covariance(
            this.toCalc(_.pluck(returns_matrix, 0)),
            this.toCalc(_.pluck(returns_matrix, 1)),
            { bias: true }
          );

          // TODO: verify that output format of compute-io/covariance is same as np.cov()
          // Test Data === [ [0.000016099930962771668,0], [0,0] ]
          var excess_returns_covariance         = C[0][1];
          var benchmark_excess_returns_variance = C[1][1];

        } catch(exception) {
          console.error("TimeSeries.beta()", "exception", exception);
        }

        var beta = excess_returns_covariance / benchmark_excess_returns_variance || 0;
        return beta; // NOT: this.fromCalc(beta);
      },
      /**
       * @untested
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_beta: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) || !_.isObject(risk_free_returns) ) { return null; }

        return 12 * this.beta(options);
      },


      /**
       * @untested
       * @shared_task
       * def alpha(fund_returns, benchmark_returns, risk_free_returns):
       *     fund_expected_excess_returns = arithmetic_mean(excess_returns(fund_returns, risk_free_returns))
       *     benchmark_expected_excess_returns = arithmetic_mean(excess_returns(benchmark_returns, risk_free_returns))
       *     beta_ = beta(fund_returns, benchmark_returns, risk_free_returns)
       *     return fund_expected_excess_returns - beta_*benchmark_expected_excess_returns
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      alpha: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) || !_.isObject(risk_free_returns) ) { return null; }

        var fund_expected_excess_mean      = this.excess({ fund_returns:      fund_returns,      risk_free_returns: risk_free_returns }).mean();
        var benchmark_expected_excess_mean = this.excess({ benchmark_returns: benchmark_returns, risk_free_returns: risk_free_returns }).mean();
        var beta                           = this.beta({   fund_returns: fund_returns, benchmark_returns: benchmark_returns, risk_free_returns: risk_free_returns });

        return fund_expected_excess_mean - (beta * benchmark_expected_excess_mean);
      },


      /**
       * @untested
       * @shared_task
       * def annualized_alpha(fund_returns, benchmark_returns, risk_free_returns):
       *     return 12*alpha(fund_returns, benchmark_returns, risk_free_returns)
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_alpha: function(options) {
        return 12 * this.alpha(options);
      },

      /**
       * @untested
       * @shared_task
       * def information_ratio(fund_returns, benchmark_returns):
       *     relative_returns = fund_returns - benchmark_returns
       *     relative_deviation = relative_returns.std(ddof=1)
       *
       *     if approx_equals(relative_deviation, 0) or np.isnan(relative_deviation):
       *         return 0.0
       *
       *     return np.mean(relative_returns)/relative_deviation
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      information_ratio: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) ) { return null; }

        return _(this.groupByDateObject(fund_returns, benchmark_returns))
          .values()
          .thru(this.toCalc, this)
          .map(function(fb_array) { // fb_array = [ fund_return, benchmark_return ]
            if( _.isFinite(fb_array[0]) && _.isFinite(fb_array[1]) ) {
              return fb_array[0] - fb_array[1]; // fund_returns - benchmark_returns
            } else {
              return null;
            }
          })
          .reject(_.isNull)
          .thru(function(values) {
            return ss.mean(values) / ss.sampleStandardDeviation(values)
          })
          .thru(function(relative_deviation) { return _.isFinite(relative_deviation) ? relative_deviation : 0; })  // null, undefined, NaN -> 0
          .thru(function(relative_deviation) {
            var proximity = 0.00001;
            if( 0 - proximity <= relative_deviation && relative_deviation <= proximity + 0 ) {
              return 0;
            } else {
              return relative_deviation;
            }
          })  // null, undefined, NaN -> 0
          .thru(this.fromCalc, this)
          .value();
      }
    }
  });
  return TimeSeries;
});
;

//***** src/models/timeseries/mapped/DateBucketMapped.js *****//
angular.module('edgefolio.models').factory('DateBucketMapped', function(ApiFieldGenerator, DateBucket, DateBucketValue) {
  var DateBucketMapped = new JS.Class("DateBucketMapped", DateBucket, {
    /**
     * Last non-null value sorted timewise, or null if data is completely null or empty
     * @returns {*|null}
     */

    _set: function(date, value) {
      value = this.klass.mappingKlass.init(value, date, this);
      this.callSuper(date, value);
    },

    _setAllFromObject: function(timestamp_indexed_object) {
      var self = this;
      if( this.klass.mappingKlass ) {
        timestamp_indexed_object = _.mapValues(timestamp_indexed_object, function(value, date) {
          return self.klass.mappingKlass.init(value, date, self);
        });
      }
      return this.callSuper(timestamp_indexed_object);
    },

    /**
     * Return a plain object of the original values
     * @returns {Object}
     */
    toObject: function() {
      var self = this;
      return _.mapValues(this, function(value, key) {
        return self.klass.isValidValue(value) ? value.value() : null;
      });
    },

    extend: {
      mappingKlass: DateBucketValue,

      isValidValue: function(value) {
        return value && value.klass && value.isA(this.mappingKlass) || false;
      }
    }
  });
  return DateBucketMapped;
});;

//***** src/models/timeseries/mapped/DateBucketValue.js *****//
/**
 *  This is the base DateBucketValue for the v3 model framework
 *  @documentation JS.Class: http://jsclass.jcoglan.com/
 *  @class DateBucketValue
 */
angular.module('edgefolio.models').factory('DateBucketValue', function(ApiFieldGenerator) {

  //// TODO:
  // - have prototype.dates()/values() = [].prototype.timeseries = this (for d3)
  // - map simplestatistics to prototype

  var DateBucketValue = new JS.Class("DateBucketValue", {
    display: null,
    moment:  null,
    parent:  null,

    initialize: function(value, key, parent) {
      this.parent = parent || null;

      ApiFieldGenerator.selfCaching(this, "moment", function() {
        return moment(this.date)
      });

      this.date    = key;
      this.display = value;
    },

    /**
     * The original value, incase it is ever mapped to something other than display
     * @returns {null}
     */
    value: function() {
      return this.display;
    },
    /**
     * toString should return a string representation of the original value
     * This is partially for tests, and partially for the view layer
     * @returns {string}
     */
    toString: function() {
      return String(this.display);
    },
    extend: {
      /**
       * Called by class initialization function
       * When class is used as a object literal in DateBucketMapped or TimeSeries, class is reinitalized but not cloned
       * ```this.displayName || name``` prevents name from getting set to DateBucketMapped.mappingKlass
       */
      setName: function(name) {
        //this.last = this; // console.log("DateBucketValue.js:60:setName", "this.displayName, this.last === this", name, !this.last, this.last === this);
        return this.callSuper(this.displayName || name);
      },

      /**
       * Typesafe casting function
       * @param value  {number|DateBucketValue|null}
       * @param key    {string}
       * @param parent {object}
       * @returns      {*}
       */
      init: function(value, key, parent) {
        if( value === null || value === undefined ) {
          return null
        } else if( value && value.klass && value.isA(this) ) {
          return value;
        } else {
          return new this(value, key, parent);
        }
      }
    }
  });
  return DateBucketValue;
});;

//***** src/models/timeseries/mapped/TimeSeriesValue.js *****//
/**
 *  @class TimeSeriesValue
 */
angular.module('edgefolio.models').factory('TimeSeriesValue', function(ApiFieldGenerator, DateBucketValue) {

  //// TODO:
  // - have prototype.dates()/values() = [].prototype.timeseries = this (for d3)
  // - map simplestatistics to prototype

  var TimeSeriesValue = new JS.Class("TimeSeriesValue", DateBucketValue, {
    calc:    null,
    display: null,
    moment:  null,
    parent:  null,
    roundTo: 5,

    initialize: function(value, key, parent) {
      // Optimization: V8 can't optimise code containing Object.defineProperty, plus in involves a function call
      //               so store this.calc as object literal value, and define getters and setters for this.display for the view
      //               this also solves the floating point rounding issue after calculations
      Object.defineProperties(this, {
        "display": {
          enumerable:   true,  // expose in for( key in instance ) loop
          configurable: false, // allow property to be redefined later
          get: function() {
            return _.isFinite(this.calc) ? _.round(this.calc*100, this.roundTo) : null;
          },
          set: function(value) {
            this.calc = _.isFinite(value) ? value && value / 100 : null; // catch divide by zero error
          }
        }
      });

      this.callSuper(); // calls this.display = value, thus setting this.calc
    }
  });
  return TimeSeriesValue;
});;


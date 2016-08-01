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

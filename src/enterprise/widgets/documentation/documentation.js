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

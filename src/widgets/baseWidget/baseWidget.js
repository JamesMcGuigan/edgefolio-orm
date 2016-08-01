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

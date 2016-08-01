var JS = (typeof this.JS === 'undefined') ? {} : this.JS;
JS.Date = Date;

(function(factory) {
  var $ = (typeof this.global === 'object') ? this.global : this,
      E = (typeof exports === 'object');

  if (E) {
    exports.JS = exports;
    JS = exports;
  } else {
    $.JS = JS;
  }
  factory($, JS);

})(function(global, exports) {
'use strict';

var Package = function(loader) {
  Package._index(this);

  this._loader    = loader;
  this._names     = new OrderedSet();
  this._deps      = new OrderedSet();
  this._uses      = new OrderedSet();
  this._styles    = new OrderedSet();
  this._observers = {};
  this._events    = {};
};

Package.displayName = 'Package';
Package.toString = function() { return Package.displayName };

Package.log = function(message) {
  if (!exports.debug) return;
  if (typeof window === 'undefined') return;
  if (typeof global.runtime === 'object') runtime.trace(message);
  if (global.console && console.info) console.info(message);
};

var resolve = function(filename) {
  if (/^https?:/.test(filename)) return filename;
  var root = exports.ROOT;
  if (root) filename = (root + '/' + filename).replace(/\/+/g, '/');
  return filename;
};

//================================================================
// Ordered list of unique elements, for storing dependencies

var OrderedSet = function(list) {
  this._members = this.list = [];
  this._index = {};
  if (!list) return;

  for (var i = 0, n = list.length; i < n; i++)
    this.push(list[i]);
};

OrderedSet.prototype.push = function(item) {
  var key   = (item.id !== undefined) ? item.id : item,
      index = this._index;

  if (index.hasOwnProperty(key)) return;
  index[key] = this._members.length;
  this._members.push(item);
};

//================================================================
// Wrapper for deferred values

var Deferred = Package.Deferred = function() {
  this._status    = 'deferred';
  this._value     = null;
  this._callbacks = [];
};

Deferred.prototype.callback = function(callback, context) {
  if (this._status === 'succeeded') callback.call(context, this._value);
  else this._callbacks.push([callback, context]);
};

Deferred.prototype.succeed = function(value) {
  this._status = 'succeeded';
  this._value  = value;
  var callback;
  while (callback = this._callbacks.shift())
    callback[0].call(callback[1], value);
};

//================================================================
// Environment settings

Package.ENV = exports.ENV = global;

Package.onerror = function(e) { throw e };

Package._throw = function(message) {
  Package.onerror(new Error(message));
};


//================================================================
// Configuration methods, called by the DSL

var instance = Package.prototype,

    methods = [['requires', '_deps'],
               ['uses',     '_uses']],

    i = methods.length;

while (i--)
  (function(pair) {
    var method = pair[0], list = pair[1];
    instance[method] = function() {
      var n = arguments.length, i;
      for (i = 0; i < n; i++) this[list].push(arguments[i]);
      return this;
    };
  })(methods[i]);

instance.provides = function() {
  var n = arguments.length, i;
  for (i = 0; i < n; i++) {
    this._names.push(arguments[i]);
    Package._getFromCache(arguments[i]).pkg = this;
  }
  return this;
};

instance.styling = function() {
  for (var i = 0, n = arguments.length; i < n; i++)
    this._styles.push(resolve(arguments[i]));
};

instance.setup = function(block) {
  this._onload = block;
  return this;
};

//================================================================
// Event dispatchers, for communication between packages

instance._on = function(eventType, block, context) {
  if (this._events[eventType]) return block.call(context);
  var list = this._observers[eventType] = this._observers[eventType] || [];
  list.push([block, context]);
  this._load();
};

instance._fire = function(eventType) {
  if (this._events[eventType]) return false;
  this._events[eventType] = true;

  var list = this._observers[eventType];
  if (!list) return true;
  delete this._observers[eventType];

  for (var i = 0, n = list.length; i < n; i++)
    list[i][0].call(list[i][1]);

  return true;
};

//================================================================
// Loading frontend and other miscellany

instance._isLoaded = function(withExceptions) {
  if (!withExceptions && this.__isLoaded !== undefined) return this.__isLoaded;

  var names = this._names.list,
      i     = names.length,
      name, object;

  while (i--) { name = names[i];
    object = Package._getObject(name, this._exports);
    if (object !== undefined) continue;
    if (withExceptions)
      return Package._throw('Expected package at ' + this._loader + ' to define ' + name);
    else
      return this.__isLoaded = false;
  }
  return this.__isLoaded = true;
};

instance._load = function() {
  if (!this._fire('request')) return;
  if (!this._isLoaded()) this._prefetch();

  var allDeps = this._deps.list.concat(this._uses.list),
      source  = this._source || [],
      n       = (this._loader || {}).length,
      self    = this;

  Package.when({load: allDeps});

  Package.when({complete: this._deps.list}, function() {
    Package.when({complete: allDeps, load: [this]}, function() {
      this._fire('complete');
    }, this);

    var loadNext = function(exports) {
      if (n === 0) return fireOnLoad(exports);
      n -= 1;
      var index = self._loader.length - n - 1;
      Package.loader.loadFile(self._loader[index], loadNext, source[index]);
    };

    var fireOnLoad = function(exports) {
      self._exports = exports;
      if (self._onload) self._onload();
      self._isLoaded(true);
      self._fire('load');
    };

    if (this._isLoaded()) {
      this._fire('download');
      return this._fire('load');
    }

    if (this._loader === undefined)
      return Package._throw('No load path found for ' + this._names.list[0]);

    if (typeof this._loader === 'function')
      this._loader(fireOnLoad);
    else
      loadNext();

    if (!Package.loader.loadStyle) return;

    var styles = this._styles.list,
        i      = styles.length;

    while (i--) Package.loader.loadStyle(styles[i]);

    this._fire('download');
  }, this);
};

instance._prefetch = function() {
  if (this._source || !(this._loader instanceof Array) || !Package.loader.fetch)
    return;

  this._source = [];

  for (var i = 0, n = this._loader.length; i < n; i++)
    this._source[i] = Package.loader.fetch(this._loader[i]);
};

instance.toString = function() {
  return 'Package:' + this._names.list.join(',');
};

//================================================================
// Class-level event API, handles group listeners

Package.when = function(eventTable, block, context) {
  var eventList = [], objects = {}, event, packages, i;
  for (event in eventTable) {
    if (!eventTable.hasOwnProperty(event)) continue;
    objects[event] = [];
    packages = new OrderedSet(eventTable[event]);
    i = packages.list.length;
    while (i--) eventList.push([event, packages.list[i], i]);
  }

  var waiting = i = eventList.length;
  if (waiting === 0) return block && block.call(context, objects);

  while (i--)
    (function(event) {
      var pkg = Package._getByName(event[1]);
      pkg._on(event[0], function() {
        objects[event[0]][event[2]] = Package._getObject(event[1], pkg._exports);
        waiting -= 1;
        if (waiting === 0 && block) block.call(context, objects);
      });
    })(eventList[i]);
};

//================================================================
// Indexes for fast lookup by path and name, and assigning IDs

var globalPackage = (global.JS || {}).Package || {};

Package._autoIncrement = globalPackage._autoIncrement || 1;
Package._indexByPath   = globalPackage._indexByPath   || {};
Package._indexByName   = globalPackage._indexByName   || {};
Package._autoloaders   = globalPackage._autoloaders   || [];

Package._index = function(pkg) {
  pkg.id = this._autoIncrement;
  this._autoIncrement += 1;
};

Package._getByPath = function(loader) {
  var path = loader.toString(),
      pkg  = this._indexByPath[path];

  if (pkg) return pkg;

  if (typeof loader === 'string')
    loader = [].slice.call(arguments);

  pkg = this._indexByPath[path] = new this(loader);
  return pkg;
};

Package._getByName = function(name) {
  if (typeof name !== 'string') return name;
  var cached = this._getFromCache(name);
  if (cached.pkg) return cached.pkg;

  var autoloaded = this._manufacture(name);
  if (autoloaded) return autoloaded;

  var placeholder = new this();
  placeholder.provides(name);
  return placeholder;
};

Package.remove = function(name) {
  var pkg = this._getByName(name);
  delete this._indexByName[name];
  delete this._indexByPath[pkg._loader];
};

//================================================================
// Auotloading API, generates packages from naming patterns

Package._autoload = function(pattern, options) {
  this._autoloaders.push([pattern, options]);
};

Package._manufacture = function(name) {
  var autoloaders = this._autoloaders,
      n = autoloaders.length,
      i, j, autoloader, path;

  for (i = 0; i < n; i++) {
    autoloader = autoloaders[i];
    if (!autoloader[0].test(name)) continue;

    path = autoloader[1].from;
    if (typeof path === 'string') path = this._convertNameToPath(path);

    var pkg = new this([path(name)]);
    pkg.provides(name);

    if (path = autoloader[1].require) {
      path = [].concat(path);
      j = path.length;
      while (j--) pkg.requires(name.replace(autoloader[0], path[j]));
    }

    return pkg;
  }
  return null;
};

Package._convertNameToPath = function(from) {
  return function(name) {
    return from.replace(/\/?$/, '/') +
           name.replace(/([a-z])([A-Z])/g, function(m,a,b) { return a + '_' + b })
               .replace(/\./g, '/')
               .toLowerCase() + '.js';
  };
};

//================================================================
// Cache for named packages and runtime objects

Package._getFromCache = function(name) {
  return this._indexByName[name] = this._indexByName[name] || {};
};

Package._getObject = function(name, rootObject) {
  if (typeof name !== 'string') return undefined;

  var cached = rootObject ? {} : this._getFromCache(name);
  if (cached.obj !== undefined) return cached.obj;

  var object = rootObject || this.ENV,
      parts  = name.split('.'), part;

  while (part = parts.shift()) object = object && object[part];

  if (rootObject && object === undefined)
    return this._getObject(name);

  return cached.obj = object;
};

Package.CommonJSLoader = {
  usable: function() {
    return typeof require === 'function' &&
           typeof exports === 'object';
  },

  __FILE__: function() {
    return this._currentPath;
  },

  loadFile: function(path, fireCallbacks) {
    var file, module;

    if (typeof process !== 'undefined') {
      module = path.replace(/\.[^\.]+$/g, '');
      file   = require('path').resolve(module);
    }
    else if (typeof phantom !== 'undefined') {
      file = phantom.libraryPath.replace(/\/$/, '') + '/' +
             path.replace(/^\//, '');
    }

    this._currentPath = file + '.js';
    var module = require(file);
    fireCallbacks(module);

    return module;
  }
};

Package.BrowserLoader = {
  HOST_REGEX: /^(https?\:)?\/\/[^\/]+/i,

  usable: function() {
    return !!Package._getObject('window.document.getElementsByTagName') &&
           typeof phantom === 'undefined';
  },

  __FILE__: function() {
    var scripts = document.getElementsByTagName('script'),
        src     = scripts[scripts.length - 1].src,
        url     = window.location.href;

    if (/^\w+\:\/+/.test(src)) return src;
    if (/^\//.test(src)) return window.location.origin + src;
    return url.replace(/[^\/]*$/g, '') + src;
  },

  cacheBust: function(path) {
    if (exports.cache !== false) return path;
    var token = new JS.Date().getTime();
    return path + (/\?/.test(path) ? '&' : '?') + token;
  },

  fetch: function(path) {
    var originalPath = path;
    path = this.cacheBust(path);

    this.HOST = this.HOST || this.HOST_REGEX.exec(window.location.href);
    var host = this.HOST_REGEX.exec(path);

    if (!this.HOST || (host && host[0] !== this.HOST[0])) return null;
    Package.log('[FETCH] ' + path);

    var source = new Package.Deferred(),
        self   = this,
        xhr    = window.ActiveXObject
               ? new ActiveXObject('Microsoft.XMLHTTP')
               : new XMLHttpRequest();

    xhr.open('GET', path, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;
      xhr.onreadystatechange = self._K;
      source.succeed(xhr.responseText + '\n//@ sourceURL=' + originalPath);
      xhr = null;
    };
    xhr.send(null);
    return source;
  },

  loadFile: function(path, fireCallbacks, source) {
    if (!source) path = this.cacheBust(path);

    var self   = this,
        head   = document.getElementsByTagName('head')[0],
        script = document.createElement('script');

    script.type = 'text/javascript';

    if (source)
      return source.callback(function(code) {
        Package.log('[EXEC]  ' + path);
        var execute = new Function('code', 'eval(code)');
        execute(code);
        fireCallbacks();
      });

    Package.log('[LOAD] ' + path);
    script.src = path;

    script.onload = script.onreadystatechange = function() {
      var state = script.readyState, status = script.status;
      if ( !state || state === 'loaded' || state === 'complete' ||
           (state === 4 && status === 200) ) {
        fireCallbacks();
        script.onload = script.onreadystatechange = self._K;
        head   = null;
        script = null;
      }
    };
    head.appendChild(script);
  },

  loadStyle: function(path) {
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = this.cacheBust(path);

    document.getElementsByTagName('head')[0].appendChild(link);
  },

  _K: function() {}
};

Package.RhinoLoader = {
  usable: function() {
    return typeof java === 'object' &&
           typeof require === 'function';
  },

  __FILE__: function() {
    return this._currentPath;
  },

  loadFile: function(path, fireCallbacks) {
    var cwd    = java.lang.System.getProperty('user.dir'),
        module = path.replace(/\.[^\.]+$/g, '');

    var requirePath = new java.io.File(cwd, module).toString();
    this._currentPath = requirePath + '.js';
    var module = require(requirePath);
    fireCallbacks(module);

    return module;
  }
};

Package.ServerLoader = {
  usable: function() {
    return typeof Package._getObject('load') === 'function' &&
           typeof Package._getObject('version') === 'function';
  },

  __FILE__: function() {
    return this._currentPath;
  },

  loadFile: function(path, fireCallbacks) {
    this._currentPath = path;
    load(path);
    fireCallbacks();
  }
};

Package.WshLoader = {
  usable: function() {
    return !!Package._getObject('ActiveXObject') &&
           !!Package._getObject('WScript');
  },

  __FILE__: function() {
    return this._currentPath;
  },

  loadFile: function(path, fireCallbacks) {
    this._currentPath = path;
    var fso = new ActiveXObject('Scripting.FileSystemObject'), file, runner;
    try {
      file   = fso.OpenTextFile(path);
      runner = function() { eval(file.ReadAll()) };
      runner();
      fireCallbacks();
    } finally {
      try { if (file) file.Close() } catch (e) {}
    }
  }
};

Package.XULRunnerLoader = {
  jsloader:   '@mozilla.org/moz/jssubscript-loader;1',
  cssservice: '@mozilla.org/content/style-sheet-service;1',
  ioservice:  '@mozilla.org/network/io-service;1',

  usable: function() {
    try {
      var CC = (Components || {}).classes;
      return !!(CC && CC[this.jsloader] && CC[this.jsloader].getService);
    } catch(e) {
      return false;
    }
  },

  setup: function() {
    var Cc = Components.classes, Ci = Components.interfaces;
    this.ssl = Cc[this.jsloader].getService(Ci.mozIJSSubScriptLoader);
    this.sss = Cc[this.cssservice].getService(Ci.nsIStyleSheetService);
    this.ios = Cc[this.ioservice].getService(Ci.nsIIOService);
  },

  loadFile: function(path, fireCallbacks) {
    Package.log('[LOAD] ' + path);

    this.ssl.loadSubScript(path);
    fireCallbacks();
  },

  loadStyle: function(path) {
    var uri = this.ios.newURI(path, null, null);
    this.sss.loadAndRegisterSheet(uri, this.sss.USER_SHEET);
  }
};

var candidates = [  Package.XULRunnerLoader,
                    Package.RhinoLoader,
                    Package.BrowserLoader,
                    Package.CommonJSLoader,
                    Package.ServerLoader,
                    Package.WshLoader ],

    n = candidates.length,
    i, candidate;

for (i = 0; i < n; i++) {
  candidate = candidates[i];
  if (candidate.usable()) {
    Package.loader = candidate;
    if (candidate.setup) candidate.setup();
    break;
  }
}

var DSL = {
  __FILE__: function() {
    return Package.loader.__FILE__();
  },

  pkg: function(name, path) {
    var pkg = path
        ? Package._getByPath(path)
        : Package._getByName(name);
    pkg.provides(name);
    return pkg;
  },

  file: function(filename) {
    var files = [], i = arguments.length;
    while (i--) files[i] = resolve(arguments[i]);
    return Package._getByPath.apply(Package, files);
  },

  load: function(path, fireCallbacks) {
    Package.loader.loadFile(path, fireCallbacks);
  },

  autoload: function(pattern, options) {
    Package._autoload(pattern, options);
  }
};

DSL.files  = DSL.file;
DSL.loader = DSL.file;

var packages = function(declaration) {
  declaration.call(DSL);
};

var parseLoadArgs = function(args) {
 var files = [], i = 0;

  while (typeof args[i] === 'string'){
    files.push(args[i]);
    i += 1;
  }

  return {files: files, callback: args[i], context: args[i+1]};
};

exports.load = function(path, callback) {
  var args = parseLoadArgs(arguments),
      n    = args.files.length;

  var loadNext = function(index) {
    if (index === n) return args.callback.call(args.context);
    Package.loader.loadFile(args.files[index], function() {
      loadNext(index + 1);
    });
  };
  loadNext(0);
};

exports.require = function() {
  var args = parseLoadArgs(arguments);

  Package.when({complete: args.files}, function(objects) {
    if (!args.callback) return;
    args.callback.apply(args.context, objects && objects.complete);
  });

  return this;
};

exports.Package  = Package;
exports.Packages = exports.packages = packages;
exports.DSL      = DSL;
});

var JS = (typeof this.JS === 'undefined') ? {} : this.JS;

(function(factory) {
  var $ = (typeof this.global === 'object') ? this.global : this,
      E = (typeof exports === 'object');

  if (E) {
    exports.JS = exports;
    JS = exports;
  } else {
    $.JS = JS;
  }
  factory($, JS);

})(function(global, exports) {
'use strict';

var JS = {ENV: global};

JS.END_WITHOUT_DOT = /([^\.])$/;

JS.array = function(enumerable) {
  var array = [], i = enumerable.length;
  while (i--) array[i] = enumerable[i];
  return array;
};

JS.bind = function(method, object) {
  return function() {
    return method.apply(object, arguments);
  };
};

JS.Date = JS.ENV.Date;

JS.extend = function(destination, source, overwrite) {
  if (!destination || !source) return destination;
  for (var field in source) {
    if (destination[field] === source[field]) continue;
    if (overwrite === false && destination.hasOwnProperty(field)) continue;
    destination[field] = source[field];
  }
  return destination;
};

JS.indexOf = function(list, item) {
  if (list.indexOf) return list.indexOf(item);
  var i = list.length;
  while (i--) {
    if (list[i] === item) return i;
  }
  return -1;
};

JS.isType = function(object, type) {
  if (typeof type === 'string')
    return typeof object === type;

  if (object === null || object === undefined)
    return false;

  return (typeof type === 'function' && object instanceof type) ||
         (object.isA && object.isA(type)) ||
         object.constructor === type;
};

JS.makeBridge = function(parent) {
  var bridge = function() {};
  bridge.prototype = parent.prototype;
  return new bridge();
};

JS.makeClass = function(parent) {
  parent = parent || Object;

  var constructor = function() {
    return this.initialize
         ? this.initialize.apply(this, arguments) || this
         : this;
  };
  constructor.prototype = JS.makeBridge(parent);

  constructor.superclass = parent;

  constructor.subclasses = [];
  if (parent.subclasses) parent.subclasses.push(constructor);

  return constructor;
};

JS.match = function(category, object) {
  if (object === undefined) return false;
  return typeof category.test === 'function'
       ? category.test(object)
       : category.match(object);
};

JS.Method = JS.makeClass();

JS.extend(JS.Method.prototype, {
  initialize: function(module, name, callable) {
    this.module   = module;
    this.name     = name;
    this.callable = callable;

    this._words = {};
    if (typeof callable !== 'function') return;

    this.arity  = callable.length;

    var matches = callable.toString().match(/\b[a-z\_\$][a-z0-9\_\$]*\b/ig),
        i       = matches.length;

    while (i--) this._words[matches[i]] = true;
  },

  setName: function(name) {
    this.callable.displayName =
    this.displayName = name;
  },

  contains: function(word) {
    return this._words.hasOwnProperty(word);
  },

  call: function() {
    return this.callable.call.apply(this.callable, arguments);
  },

  apply: function(receiver, args) {
    return this.callable.apply(receiver, args);
  },

  compile: function(environment) {
    var method     = this,
        trace      = method.module.__trace__ || environment.__trace__,
        callable   = method.callable,
        words      = method._words,
        allWords   = JS.Method._keywords,
        i          = allWords.length,
        keywords   = [],
        keyword;

    while  (i--) {
      keyword = allWords[i];
      if (words[keyword.name]) keywords.push(keyword);
    }
    if (keywords.length === 0 && !trace) return callable;

    var compiled = function() {
      var N = keywords.length, j = N, previous = {}, keyword, existing, kwd;

      while (j--) {
        keyword  = keywords[j];
        existing = this[keyword.name];

        if (existing && !existing.__kwd__) continue;

        previous[keyword.name] = {
          _value: existing,
          _own:   this.hasOwnProperty(keyword.name)
        };
        kwd = keyword.filter(method, environment, this, arguments);
        if (kwd) kwd.__kwd__ = true;
        this[keyword.name] = kwd;
      }
      var returnValue = callable.apply(this, arguments),
          j = N;

      while (j--) {
        keyword = keywords[j];
        if (!previous[keyword.name]) continue;
        if (previous[keyword.name]._own)
          this[keyword.name] = previous[keyword.name]._value;
        else
          delete this[keyword.name];
      }
      return returnValue;
    };

    var StackTrace = trace && (exports.StackTrace || require('./stack_trace').StackTrace);
    if (trace) return StackTrace.wrap(compiled, method, environment);
    return compiled;
  },

  toString: function() {
    var name = this.displayName || (this.module.toString() + '#' + this.name);
    return '#<Method:' + name + '>';
  }
});

JS.Method.create = function(module, name, callable) {
  if (callable && callable.__inc__ && callable.__fns__)
    return callable;

  var method = (typeof callable !== 'function')
             ? callable
             : new this(module, name, callable);

  this.notify(method);
  return method;
};

JS.Method.compile = function(method, environment) {
  return (method instanceof this)
      ? method.compile(environment)
      : method;
};

JS.Method.__listeners__ = [];

JS.Method.added = function(block, context) {
  this.__listeners__.push([block, context]);
};

JS.Method.notify = function(method) {
  var listeners = this.__listeners__,
      i = listeners.length,
      listener;

  while (i--) {
    listener = listeners[i];
    listener[0].call(listener[1], method);
  }
};

JS.Method._keywords = [];

JS.Method.keyword = function(name, filter) {
  this._keywords.push({name: name, filter: filter});
};

JS.Method.tracing = function(classes, block, context) {
  var pkg = exports.require ? exports : require('./loader');
  pkg.require('JS.StackTrace', function(StackTrace) {
    var logger = StackTrace.logger,
        active = logger.active;

    classes = [].concat(classes);
    this.trace(classes);
    logger.active = true;
    block.call(context);

    this.untrace(classes);
    logger.active = active;
  }, this);
};

JS.Method.trace = function(classes) {
  var i = classes.length;
  while (i--) {
    classes[i].__trace__ = true;
    classes[i].resolve();
  }
};

JS.Method.untrace = function(classes) {
  var i = classes.length;
  while (i--) {
    classes[i].__trace__ = false;
    classes[i].resolve();
  }
};

JS.Module = JS.makeClass();
JS.Module.__queue__ = [];

JS.extend(JS.Module.prototype, {
  initialize: function(name, methods, options) {
    if (typeof name !== 'string') {
      options = arguments[1];
      methods = arguments[0];
      name    = undefined;
    }
    options = options || {};

    this.__inc__ = [];
    this.__dep__ = [];
    this.__fns__ = {};
    this.__tgt__ = options._target;
    this.__anc__ = null;
    this.__mct__ = {};

    this.setName(name);
    this.include(methods, {_resolve: false});

    if (JS.Module.__queue__)
      JS.Module.__queue__.push(this);
  },

  setName: function(name) {
    this.displayName = name || '';

    for (var field in this.__fns__)
      this.__name__(field);

    if (name && this.__meta__)
      this.__meta__.setName(name + '.');
  },

  __name__: function(name) {
    if (!this.displayName) return;

    var object = this.__fns__[name];
    if (!object) return;

    name = this.displayName.replace(JS.END_WITHOUT_DOT, '$1#') + name;
    if (typeof object.setName === 'function') return object.setName(name);
    if (typeof object === 'function') object.displayName = name;
  },

  define: function(name, callable, options) {
    var method  = JS.Method.create(this, name, callable),
        resolve = (options || {})._resolve;

    this.__fns__[name] = method;
    this.__name__(name);
    if (resolve !== false) this.resolve();
  },

  include: function(module, options) {
    if (!module) return this;

    var options = options || {},
        resolve = options._resolve !== false,
        extend  = module.extend,
        include = module.include,
        extended, field, value, mixins, i, n;

    if (module.__fns__ && module.__inc__) {
      this.__inc__.push(module);
      if ((module.__dep__ || {}).push) module.__dep__.push(this);

      if (extended = options._extended) {
        if (typeof module.extended === 'function')
          module.extended(extended);
      }
      else {
        if (typeof module.included === 'function')
          module.included(this);
      }
    }
    else {
      if (this.shouldIgnore('extend', extend)) {
        mixins = [].concat(extend);
        for (i = 0, n = mixins.length; i < n; i++)
          this.extend(mixins[i]);
      }
      if (this.shouldIgnore('include', include)) {
        mixins = [].concat(include);
        for (i = 0, n = mixins.length; i < n; i++)
          this.include(mixins[i], {_resolve: false});
      }
      for (field in module) {
        if (!module.hasOwnProperty(field)) continue;
        value = module[field];
        if (this.shouldIgnore(field, value)) continue;
        this.define(field, value, {_resolve: false});
      }
      if (module.hasOwnProperty('toString'))
        this.define('toString', module.toString, {_resolve: false});
    }

    if (resolve) this.resolve();
    return this;
  },

  alias: function(aliases) {
    for (var method in aliases) {
      if (!aliases.hasOwnProperty(method)) continue;
      this.define(method, this.instanceMethod(aliases[method]), {_resolve: false});
    }
    this.resolve();
  },

  resolve: function(host) {
    var host   = host || this,
        target = host.__tgt__,
        inc    = this.__inc__,
        fns    = this.__fns__,
        i, n, key, compiled;

    if (host === this) {
      this.__anc__ = null;
      this.__mct__ = {};
      i = this.__dep__.length;
      while (i--) this.__dep__[i].resolve();
    }

    if (!target) return;

    for (i = 0, n = inc.length; i < n; i++)
      inc[i].resolve(host);

    for (key in fns) {
      compiled = JS.Method.compile(fns[key], host);
      if (target[key] !== compiled) target[key] = compiled;
    }
    if (fns.hasOwnProperty('toString'))
      target.toString = JS.Method.compile(fns.toString, host);
  },

  shouldIgnore: function(field, value) {
    return (field === 'extend' || field === 'include') &&
           (typeof value !== 'function' ||
             (value.__fns__ && value.__inc__));
  },

  ancestors: function(list) {
    var cachable = !list,
        list     = list || [],
        inc      = this.__inc__;

    if (cachable && this.__anc__) return this.__anc__.slice();

    for (var i = 0, n = inc.length; i < n; i++)
      inc[i].ancestors(list);

    if (JS.indexOf(list, this) < 0)
      list.push(this);

    if (cachable) this.__anc__ = list.slice();
    return list;
  },

  lookup: function(name) {
    var cached = this.__mct__[name];
    if (cached && cached.slice) return cached.slice();

    var ancestors = this.ancestors(),
        methods   = [],
        fns;

    for (var i = 0, n = ancestors.length; i < n; i++) {
      fns = ancestors[i].__fns__;
      if (fns.hasOwnProperty(name)) methods.push(fns[name]);
    }
    this.__mct__[name] = methods.slice();
    return methods;
  },

  includes: function(module) {
    if (module === this) return true;

    var inc  = this.__inc__;

    for (var i = 0, n = inc.length; i < n; i++) {
      if (inc[i].includes(module))
        return true;
    }
    return false;
  },

  instanceMethod: function(name) {
    return this.lookup(name).pop();
  },

  instanceMethods: function(recursive, list) {
    var methods = list || [],
        fns     = this.__fns__,
        field;

    for (field in fns) {
      if (!JS.isType(this.__fns__[field], JS.Method)) continue;
      if (JS.indexOf(methods, field) >= 0) continue;
      methods.push(field);
    }

    if (recursive !== false) {
      var ancestors = this.ancestors(), i = ancestors.length;
      while (i--) ancestors[i].instanceMethods(false, methods);
    }
    return methods;
  },

  match: function(object) {
    return object && object.isA && object.isA(this);
  },

  toString: function() {
    return this.displayName;
  }
});

JS.Kernel = new JS.Module('Kernel', {
  __eigen__: function() {
    if (this.__meta__) return this.__meta__;
    var name = this.toString() + '.';
    this.__meta__ = new JS.Module(name, null, {_target: this});
    return this.__meta__.include(this.klass, {_resolve: false});
  },

  equals: function(other) {
    return this === other;
  },

  extend: function(module, options) {
    var resolve = (options || {})._resolve;
    this.__eigen__().include(module, {_extended: this, _resolve: resolve});
    return this;
  },

  hash: function() {
    return JS.Kernel.hashFor(this);
  },

  isA: function(module) {
    return (typeof module === 'function' && this instanceof module) ||
           this.__eigen__().includes(module);
  },

  method: function(name) {
    var cache = this.__mct__ = this.__mct__ || {},
        value = cache[name],
        field = this[name];

    if (typeof field !== 'function') return field;
    if (value && field === value._value) return value._bound;

    var bound = JS.bind(field, this);
    cache[name] = {_value: field, _bound: bound};
    return bound;
  },

  methods: function() {
    return this.__eigen__().instanceMethods();
  },

  tap: function(block, context) {
    block.call(context, this);
    return this;
  },

  toString: function() {
    if (this.displayName) return this.displayName;
    var name = this.klass.displayName || this.klass.toString();
    return '#<' + name + ':' + this.hash() + '>';
  }
});

(function() {
  var id = 1;

  JS.Kernel.hashFor = function(object) {
    if (object.__hash__ !== undefined) return object.__hash__;
    object.__hash__ = (new JS.Date().getTime() + id).toString(16);
    id += 1;
    return object.__hash__;
  };
})();

JS.Class = JS.makeClass(JS.Module);

JS.extend(JS.Class.prototype, {
  initialize: function(name, parent, methods, options) {
    if (typeof name !== 'string') {
      options = arguments[2];
      methods = arguments[1];
      parent  = arguments[0];
      name    = undefined;
    }
    if (typeof parent !== 'function') {
      options = methods;
      methods = parent;
      parent  = Object;
    }
    JS.Module.prototype.initialize.call(this, name);
    options = options || {};

    var klass = JS.makeClass(parent);
    JS.extend(klass, this);

    klass.prototype.constructor =
    klass.prototype.klass = klass;

    klass.__eigen__().include(parent.__meta__, {_resolve: options._resolve});
    klass.setName(name);

    klass.__tgt__ = klass.prototype;

    var parentModule = (parent === Object)
                     ? {}
                     : (parent.__fns__ ? parent : new JS.Module(parent.prototype, {_resolve: false}));

    klass.include(JS.Kernel,    {_resolve: false})
         .include(parentModule, {_resolve: false})
         .include(methods,      {_resolve: false});

    if (options._resolve !== false) klass.resolve();

    if (typeof parent.inherited === 'function')
      parent.inherited(klass);

    return klass;
  }
});

(function() {
  var methodsFromPrototype = function(klass) {
    var methods = {},
        proto   = klass.prototype;

    for (var field in proto) {
      if (!proto.hasOwnProperty(field)) continue;
      methods[field] = JS.Method.create(klass, field, proto[field]);
    }
    return methods;
  };

  var classify = function(name, parentName) {
    var klass  = JS[name],
        parent = JS[parentName];

    klass.__inc__ = [];
    klass.__dep__ = [];
    klass.__fns__ = methodsFromPrototype(klass);
    klass.__tgt__ = klass.prototype;

    klass.prototype.constructor =
    klass.prototype.klass = klass;

    JS.extend(klass, JS.Class.prototype);
    klass.include(parent || JS.Kernel);
    klass.setName(name);

    klass.constructor = klass.klass = JS.Class;
  };

  classify('Method');
  classify('Module');
  classify('Class', 'Module');

  var eigen = JS.Kernel.instanceMethod('__eigen__');

  eigen.call(JS.Method).resolve();
  eigen.call(JS.Module).resolve();
  eigen.call(JS.Class).include(JS.Module.__meta__);
})();

JS.NotImplementedError = new JS.Class('NotImplementedError', Error);

JS.Method.keyword('callSuper', function(method, env, receiver, args) {
  var methods    = env.lookup(method.name),
      stackIndex = methods.length - 1,
      params     = JS.array(args);

  if (stackIndex === 0) return undefined;

  var _super = function() {
    var i = arguments.length;
    while (i--) params[i] = arguments[i];

    stackIndex -= 1;
    if (stackIndex === 0) delete receiver.callSuper;
    var returnValue = methods[stackIndex].apply(receiver, params);
    receiver.callSuper = _super;
    stackIndex += 1;

    return returnValue;
  };

  return _super;
});

JS.Method.keyword('blockGiven', function(method, env, receiver, args) {
  var block = Array.prototype.slice.call(args, method.arity),
      hasBlock = (typeof block[0] === 'function');

  return function() { return hasBlock };
});

JS.Method.keyword('yieldWith', function(method, env, receiver, args) {
  var block = Array.prototype.slice.call(args, method.arity);

  return function() {
    if (typeof block[0] !== 'function') return;
    return block[0].apply(block[1] || null, arguments);
  };
});

JS.Interface = new JS.Class('Interface', {
  initialize: function(methods) {
    this.test = function(object, returnName) {
      var n = methods.length;
      while (n--) {
        if (typeof object[methods[n]] !== 'function')
          return returnName ? methods[n] : false;
      }
      return true;
    };
  },

  extend: {
    ensure: function() {
      var args = JS.array(arguments), object = args.shift(), face, result;
      while (face = args.shift()) {
        result = face.test(object, true);
        if (result !== true) throw new Error('object does not implement ' + result + '()');
      }
    }
  }
});

JS.Singleton = new JS.Class('Singleton', {
  initialize: function(name, parent, methods) {
    return new (new JS.Class(name, parent, methods));
  }
});

JS.extend(exports, JS);
if (global.JS) JS.extend(global.JS, JS);
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Enumerable = new JS.Module('Enumerable', {
  extend: {
    ALL_EQUAL: {},

    forEach: function(block, context) {
      if (!block) return new Enumerator(this, 'forEach');
      for (var i = 0; i < this.length; i++)
        block.call(context, this[i]);
      return this;
    },

    isComparable: function(list) {
      return list.all(function(item) { return typeof item.compareTo === 'function' });
    },

    areEqual: function(expected, actual) {
      var result;

      if (expected === actual)
        return true;

      if (expected && typeof expected.equals === 'function')
        return expected.equals(actual);

      if (expected instanceof Function)
        return expected === actual;

      if (expected instanceof Array) {
        if (!(actual instanceof Array)) return false;
        for (var i = 0, n = expected.length; i < n; i++) {
          result = this.areEqual(expected[i], actual[i]);
          if (result === this.ALL_EQUAL) return true;
          if (!result) return false;
        }
        if (expected.length !== actual.length) return false;
        return true;
      }

      if (expected instanceof Date) {
        if (!(actual instanceof Date)) return false;
        if (expected.getTime() !== actual.getTime()) return false;
        return true;
      }

      if (expected instanceof Object) {
        if (!(actual instanceof Object)) return false;
        if (this.objectSize(expected) !== this.objectSize(actual)) return false;
        for (var key in expected) {
          if (!this.areEqual(expected[key], actual[key]))
            return false;
        }
        return true;
      }

      return false;
    },

    objectKeys: function(object, includeProto) {
      var keys = [];
      for (var key in object) {
        if (object.hasOwnProperty(key) || includeProto !== false)
          keys.push(key);
      }
      return keys;
    },

    objectSize: function(object) {
      return this.objectKeys(object).length;
    },

    Collection: new JS.Class({
      initialize: function(array) {
        this.length = 0;
        if (array) Enumerable.forEach.call(array, this.push, this);
      },

      push: function(item) {
        Array.prototype.push.call(this, item);
      },

      clear: function() {
        var i = this.length;
        while (i--) delete this[i];
        this.length = 0;
      }
    })
  },

  all: function(block, context) {
    block = Enumerable.toFn(block);
    var truth = true;
    this.forEach(function(item) {
      truth = truth && (block ? block.apply(context, arguments) : item);
    });
    return !!truth;
  },

  any: function(block, context) {
    block = Enumerable.toFn(block);
    var truth = false;
    this.forEach(function(item) {
      truth = truth || (block ? block.apply(context, arguments) : item);
    });
    return !!truth;
  },

  chunk: function(block, context) {
    if (!block) return this.enumFor('chunk');

    var result  = [],
        value   = null,
        started = false;

    this.forEach(function(item) {
      var v = block.apply(context, arguments);
      if (started) {
        if (Enumerable.areEqual(value, v))
          result[result.length - 1][1].push(item);
        else
          result.push([v, [item]]);
      } else {
        result.push([v, [item]]);
        started = true;
      }
      value = v;
    });
    return result;
  },

  count: function(block, context) {
    if (typeof this.size === 'function') return this.size();
    var count = 0, object = block;

    if (block && typeof block !== 'function')
      block = function(x) { return Enumerable.areEqual(x, object) };

    this.forEach(function() {
      if (!block || block.apply(context, arguments))
        count += 1;
    });
    return count;
  },

  cycle: function(n, block, context) {
    if (!block) return this.enumFor('cycle', n);
    block = Enumerable.toFn(block);
    while (n--) this.forEach(block, context);
  },

  drop: function(n) {
    var entries = [];
    this.forEachWithIndex(function(item, i) {
      if (i >= n) entries.push(item);
    });
    return entries;
  },

  dropWhile: function(block, context) {
    if (!block) return this.enumFor('dropWhile');
    block = Enumerable.toFn(block);

    var entries = [],
        drop    = true;

    this.forEach(function(item) {
      if (drop) drop = drop && block.apply(context, arguments);
      if (!drop) entries.push(item);
    });
    return entries;
  },

  forEachCons: function(n, block, context) {
    if (!block) return this.enumFor('forEachCons', n);
    block = Enumerable.toFn(block);

    var entries = this.toArray(),
        size    = entries.length,
        limit   = size - n,
        i;

    for (i = 0; i <= limit; i++)
      block.call(context, entries.slice(i, i+n));

    return this;
  },

  forEachSlice: function(n, block, context) {
    if (!block) return this.enumFor('forEachSlice', n);
    block = Enumerable.toFn(block);

    var entries = this.toArray(),
        size    = entries.length,
        m       = Math.ceil(size/n),
        i;

    for (i = 0; i < m; i++)
      block.call(context, entries.slice(i*n, (i+1)*n));

    return this;
  },

  forEachWithIndex: function(offset, block, context) {
    if (typeof offset === 'function') {
      context = block;
      block   = offset;
      offset  = 0;
    }
    offset = offset || 0;

    if (!block) return this.enumFor('forEachWithIndex', offset);
    block = Enumerable.toFn(block);

    return this.forEach(function(item) {
      var result = block.call(context, item, offset);
      offset += 1;
      return result;
    });
  },

  forEachWithObject: function(object, block, context) {
    if (!block) return this.enumFor('forEachWithObject', object);
    block = Enumerable.toFn(block);

    this.forEach(function() {
      var args = [object].concat(JS.array(arguments));
      block.apply(context, args);
    });
    return object;
  },

  find: function(block, context) {
    if (!block) return this.enumFor('find');
    block = Enumerable.toFn(block);

    var needle = {}, K = needle;
    this.forEach(function(item) {
      if (needle !== K) return;
      needle = block.apply(context, arguments) ? item : needle;
    });
    return needle === K ? null : needle;
  },

  findIndex: function(needle, context) {
    if (needle === undefined) return this.enumFor('findIndex');

    var index = null,
        block = (typeof needle === 'function');

    this.forEachWithIndex(function(item, i) {
      if (index !== null) return;
      if (Enumerable.areEqual(needle, item) || (block && needle.apply(context, arguments)))
        index = i;
    });
    return index;
  },

  first: function(n) {
    var entries = this.toArray();
    return (n === undefined) ? entries[0] : entries.slice(0,n);
  },

  grep: function(pattern, block, context) {
    block = Enumerable.toFn(block);
    var results = [];
    this.forEach(function(item) {
      var match = (typeof pattern.match === 'function') ? pattern.match(item)
                : (typeof pattern.test === 'function')  ? pattern.test(item)
                : JS.isType(item, pattern);

      if (!match) return;
      if (block) item = block.apply(context, arguments);
      results.push(item);
    });
    return results;
  },

  groupBy: function(block, context) {
    if (!block) return this.enumFor('groupBy');
    block = Enumerable.toFn(block);

    var Hash = ((typeof require === 'function') ? require('./hash') : JS).Hash,
        hash = new Hash();

    this.forEach(function(item) {
      var value = block.apply(context, arguments);
      if (!hash.hasKey(value)) hash.store(value, []);
      hash.get(value).push(item);
    });
    return hash;
  },

  inject: function(memo, block, context) {
    var args    = JS.array(arguments),
        counter = 0,
        K       = {};

    switch (args.length) {
      case 1:   memo      = K;
                block     = args[0];
                break;

      case 2:   if (typeof memo === 'function') {
                  memo    = K;
                  block   = args[0];
                  context = args[1];
                }
    }
    block = Enumerable.toFn(block);

    this.forEach(function(item) {
      if (!counter++ && memo === K) return memo = item;
      var args = [memo].concat(JS.array(arguments));
      memo = block.apply(context, args);
    });
    return memo;
  },

  map: function(block, context) {
    if (!block) return this.enumFor('map');
    block = Enumerable.toFn(block);

    var map = [];
    this.forEach(function() {
      map.push(block.apply(context, arguments));
    });
    return map;
  },

  max: function(block, context) {
    return this.minmax(block, context)[1];
  },

  maxBy: function(block, context) {
    if (!block) return this.enumFor('maxBy');
    return this.minmaxBy(block, context)[1];
  },

  member: function(needle) {
    return this.any(function(item) { return Enumerable.areEqual(item, needle) });
  },

  min: function(block, context) {
    return this.minmax(block, context)[0];
  },

  minBy: function(block, context) {
    if (!block) return this.enumFor('minBy');
    return this.minmaxBy(block, context)[0];
  },

  minmax: function(block, context) {
    var list = this.sort(block, context);
    return [list[0], list[list.length - 1]];
  },

  minmaxBy: function(block, context) {
    if (!block) return this.enumFor('minmaxBy');
    var list = this.sortBy(block, context);
    return [list[0], list[list.length - 1]];
  },

  none: function(block, context) {
    return !this.any(block, context);
  },

  one: function(block, context) {
    block = Enumerable.toFn(block);
    var count = 0;
    this.forEach(function(item) {
      if (block ? block.apply(context, arguments) : item) count += 1;
    });
    return count === 1;
  },

  partition: function(block, context) {
    if (!block) return this.enumFor('partition');
    block = Enumerable.toFn(block);

    var ayes = [], noes = [];
    this.forEach(function(item) {
      (block.apply(context, arguments) ? ayes : noes).push(item);
    });
    return [ayes, noes];
  },

  reject: function(block, context) {
    if (!block) return this.enumFor('reject');
    block = Enumerable.toFn(block);

    var map = [];
    this.forEach(function(item) {
      if (!block.apply(context, arguments)) map.push(item);
    });
    return map;
  },

  reverseForEach: function(block, context) {
    if (!block) return this.enumFor('reverseForEach');
    block = Enumerable.toFn(block);

    var entries = this.toArray(),
        n       = entries.length;

    while (n--) block.call(context, entries[n]);
    return this;
  },

  select: function(block, context) {
    if (!block) return this.enumFor('select');
    block = Enumerable.toFn(block);

    var map = [];
    this.forEach(function(item) {
      if (block.apply(context, arguments)) map.push(item);
    });
    return map;
  },

  sort: function(block, context) {
    var comparable = Enumerable.isComparable(this),
        entries    = this.toArray();

    block = block || (comparable
        ? function(a,b) { return a.compareTo(b); }
        : null);
    return block
        ? entries.sort(function(a,b) { return block.call(context, a, b); })
        : entries.sort();
  },

  sortBy: function(block, context) {
    if (!block) return this.enumFor('sortBy');
    block = Enumerable.toFn(block);

    var util       = Enumerable,
        map        = new util.Collection(this.map(block, context)),
        comparable = util.isComparable(map);

    return new util.Collection(map.zip(this).sort(function(a, b) {
      a = a[0]; b = b[0];
      return comparable ? a.compareTo(b) : (a < b ? -1 : (a > b ? 1 : 0));
    })).map(function(item) { return item[1]; });
  },

  take: function(n) {
    var entries = [];
    this.forEachWithIndex(function(item, i) {
      if (i < n) entries.push(item);
    });
    return entries;
  },

  takeWhile: function(block, context) {
    if (!block) return this.enumFor('takeWhile');
    block = Enumerable.toFn(block);

    var entries = [],
        take    = true;
    this.forEach(function(item) {
      if (take) take = take && block.apply(context, arguments);
      if (take) entries.push(item);
    });
    return entries;
  },

  toArray: function() {
    return this.drop(0);
  },

  zip: function() {
    var util    = Enumerable,
        args    = [],
        counter = 0,
        n       = arguments.length,
        block, context;

    if (typeof arguments[n-1] === 'function') {
      block = arguments[n-1]; context = {};
    }
    if (typeof arguments[n-2] === 'function') {
      block = arguments[n-2]; context = arguments[n-1];
    }
    util.forEach.call(arguments, function(arg) {
      if (arg === block || arg === context) return;
      if (arg.toArray) arg = arg.toArray();
      if (JS.isType(arg, Array)) args.push(arg);
    });
    var results = this.map(function(item) {
      var zip = [item];
      util.forEach.call(args, function(arg) {
        zip.push(arg[counter] === undefined ? null : arg[counter]);
      });
      return ++counter && zip;
    });
    if (!block) return results;
    util.forEach.call(results, block, context);
  }
});

// http://developer.mozilla.org/en/docs/index.php?title=Core_JavaScript_1.5_Reference:Global_Objects:Array&oldid=58326
Enumerable.define('forEach', Enumerable.forEach);

Enumerable.alias({
  collect:    'map',
  detect:     'find',
  entries:    'toArray',
  every:      'all',
  findAll:    'select',
  filter:     'select',
  reduce:     'inject',
  some:       'any'
});

Enumerable.extend({
  toFn: function(object) {
    if (!object) return object;
    if (object.toFunction) return object.toFunction();
    if (this.OPS[object]) return this.OPS[object];
    if (JS.isType(object, 'string') || JS.isType(object, String))
    return function() {
        var args   = JS.array(arguments),
            target = args.shift(),
            method = target[object];
        return (typeof method === 'function') ? method.apply(target, args) : method;
      };
    return object;
  },

  OPS: {
    '+':    function(a,b) { return a + b },
    '-':    function(a,b) { return a - b },
    '*':    function(a,b) { return a * b },
    '/':    function(a,b) { return a / b },
    '%':    function(a,b) { return a % b },
    '^':    function(a,b) { return a ^ b },
    '&':    function(a,b) { return a & b },
    '&&':   function(a,b) { return a && b },
    '|':    function(a,b) { return a | b },
    '||':   function(a,b) { return a || b },
    '==':   function(a,b) { return a == b },
    '!=':   function(a,b) { return a != b },
    '>':    function(a,b) { return a > b },
    '>=':   function(a,b) { return a >= b },
    '<':    function(a,b) { return a < b },
    '<=':   function(a,b) { return a <= b },
    '===':  function(a,b) { return a === b },
    '!==':  function(a,b) { return a !== b },
    '[]':   function(a,b) { return a[b] },
    '()':   function(a,b) { return a(b) }
  },

  Enumerator: new JS.Class({
    include: Enumerable,

    extend: {
      DEFAULT_METHOD: 'forEach'
    },

    initialize: function(object, method, args) {
      this._object = object;
      this._method = method || this.klass.DEFAULT_METHOD;
      this._args   = (args || []).slice();
    },

    // this is largely here to support testing since I don't want to make the
    // ivars public
    equals: function(enumerator) {
      return JS.isType(enumerator, this.klass) &&
             this._object === enumerator._object &&
             this._method === enumerator._method &&
             Enumerable.areEqual(this._args, enumerator._args);
          },

          forEach: function(block, context) {
      if (!block) return this;
      var args = this._args.slice();
      args.push(block);
      if (context) args.push(context);
      return this._object[this._method].apply(this._object, args);
    }
  })
});

Enumerable.Enumerator.alias({
  cons:       'forEachCons',
  reverse:    'reverseForEach',
  slice:      'forEachSlice',
  withIndex:  'forEachWithIndex',
  withObject: 'forEachWithObject'
});

Enumerable.Collection.include(Enumerable);

JS.Kernel.include({
  enumFor: function(method) {
    var args   = JS.array(arguments),
        method = args.shift();
    return new Enumerable.Enumerator(this, method, args);
  }
}, {_resolve: false});

JS.Kernel.alias({toEnum: 'enumFor'});

exports.Enumerable = Enumerable;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Observable = new JS.Module('Observable', {
  extend: {
    DEFAULT_METHOD: 'update'
  },

  addObserver: function(observer, context) {
    (this.__observers__ = this.__observers__ || []).push({_block: observer, _context: context});
  },

  removeObserver: function(observer, context) {
    this.__observers__ = this.__observers__ || [];
    context = context;
    var i = this.countObservers();
    while (i--) {
      if (this.__observers__[i]._block === observer && this.__observers__[i]._context === context) {
        this.__observers__.splice(i,1);
        return;
      }
    }
  },

  removeObservers: function() {
    this.__observers__ = [];
  },

  countObservers: function() {
    return (this.__observers__ = this.__observers__ || []).length;
  },

  notifyObservers: function() {
    if (!this.isChanged()) return;
    var i = this.countObservers(), observer, block, context;
    while (i--) {
      observer = this.__observers__[i];
      block    = observer._block;
      context  = observer._context;
      if (typeof block === 'function') block.apply(context, arguments);
      else block[context || Observable.DEFAULT_METHOD].apply(block, arguments);
    }
  },

  setChanged: function(state) {
    this.__changed__ = !(state === false);
  },

  isChanged: function() {
    if (this.__changed__ === undefined) this.__changed__ = true;
    return !!this.__changed__;
  }
});

Observable.alias({
  subscribe:    'addObserver',
  unsubscribe:  'removeObserver'
}, true);

exports.Observable = Observable;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      Observable = js.Observable || require('./observable').Observable;

  if (E) exports.JS = exports;
  factory(js, Enumerable, Observable, E ? exports : js);

})(function(JS, Enumerable, Observable, exports) {
'use strict';

var Command = new JS.Class('Command', {
  initialize: function(functions) {
    if (typeof functions === 'function')
      functions = {execute: functions};
    this._functions = functions;
    this._stack = this._functions.stack || null;
  },

  execute: function(push) {
    if (this._stack) this._stack._restart();
    var exec = this._functions.execute;
    if (exec) exec.apply(this);
    if (this._stack && push !== false) this._stack.push(this);
  },

  undo: function() {
    var exec = this._functions.undo;
    if (exec) exec.apply(this);
  },

  extend: {
    Stack: new JS.Class({
      include: [Observable || {}, Enumerable || {}],

      initialize: function(options) {
        options = options || {};
        this._redo = options.redo || null;
        this.clear();
      },

      forEach: function(block, context) {
        if (!block) return this.enumFor('forEach');
        block = Enumerable.toFn(block);

        for (var i = 0, n = this._stack.length; i < n; i++) {
          if (this._stack[i] !== undefined)
            block.call(context, this._stack[i], i);
        }
        return this;
      },

      clear: function() {
        this._stack = [];
        this.length = this.pointer = 0;
      },

      _restart: function() {
        if (this.pointer === 0 && this._redo && this._redo.execute)
          this._redo.execute();
      },

      push: function(command) {
        this._stack.splice(this.pointer, this.length);
        this._stack.push(command);
        this.length = this.pointer = this._stack.length;
        if (this.notifyObservers) this.notifyObservers(this);
      },

      stepTo: function(position) {
        if (position < 0 || position > this.length) return;
        var i, n;

        switch (true) {
          case position > this.pointer :
            for (i = this.pointer, n = position; i < n; i++)
              this._stack[i].execute(false);
            break;

          case position < this.pointer :
            if (this._redo && this._redo.execute) {
              this._redo.execute();
              for (i = 0, n = position; i < n; i++)
                this._stack[i].execute(false);
            } else {
              for (i = 0, n = this.pointer - position; i < n; i++)
                this._stack[this.pointer - i - 1].undo();
            }
            break;
        }
        this.pointer = position;
        if (this.notifyObservers) this.notifyObservers(this);
      },

      undo: function() {
        this.stepTo(this.pointer - 1);
      },

      redo: function() {
        this.stepTo(this.pointer + 1);
      }
    })
  }
});

exports.Command = Command;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Comparable = new JS.Module('Comparable', {
  extend: {
    ClassMethods: new JS.Module({
      compare: function(one, another) {
        return one.compareTo(another);
      }
    }),

    included: function(base) {
      base.extend(this.ClassMethods);
    }
  },

  lt: function(other) {
    return this.compareTo(other) < 0;
  },

  lte: function(other) {
    return this.compareTo(other) < 1;
  },

  gt: function(other) {
    return this.compareTo(other) > 0;
  },

  gte: function(other) {
    return this.compareTo(other) > -1;
  },

  eq: function(other) {
    return this.compareTo(other) === 0;
  },

  between: function(a, b) {
    return this.gte(a) && this.lte(b);
  }
});

exports.Comparable = Comparable;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable;

  if (E) exports.JS = exports;
  factory(js, Enumerable, E ? exports : js);

})(function(JS, Enumerable, exports) {
'use strict';

var Console = new JS.Module('Console', {
  extend: {
    nameOf: function(object, root) {
      var results = [], i, n, field, l;

      if (JS.isType(object, Array)) {
        for (i = 0, n = object.length; i < n; i++)
          results.push(this.nameOf(object[i]));
        return results;
      }

      if (object.displayName) return object.displayName;

      field = [{name: null, o: root || JS.ENV}];
      l = 0;
      while (typeof field === 'object' && l < this.MAX_DEPTH) {
        l += 1;
        field = this.descend(field, object);
      }
      if (typeof field == 'string') {
        field = field.replace(/\.prototype\./g, '#');
        object.displayName = field;
        if (object.__meta__) object.__meta__.displayName = field + '.__meta__';
      }
      return object.displayName;
    },

    descend: function(list, needle) {
      var results = [],
          n       = list.length,
          i       = n,
          key, item, name;

      while (i--) {
        item = list[i];
        if (JS.isType(item.o, Array)) continue;
        name = item.name ? item.name + '.' : '';
        for (key in item.o) {
          if (needle && item.o[key] === needle) return name + key;
          results.push({name: name + key, o: item.o[key]});
        }
      }
      return results;
    },

    convert: function(object, stack) {
      if (object === null || object === undefined) return String(object);
      var E = Enumerable, stack = stack || [], items;

      if (JS.indexOf(stack, object) >= 0) return '#circular';

      if (object instanceof Error) {
        return (typeof object.message === 'string' && !object.message)
             ? object.name
             : object.name + (object.message ? ': ' + object.message : '');
      }

      if (object instanceof Array) {
        stack.push(object);
        items = new E.Collection(object).map(function(item) {
            return this.convert(item, stack);
          }, this).join(', ');
        stack.pop();
        return items ? '[ ' + items + ' ]' : '[]';
      }

      if (object instanceof String || typeof object === 'string')
        return '"' + object + '"';

      if (object instanceof Function)
        return object.displayName ||
               object.name ||
              (object.toString().match(/^\s*function ([^\(]+)\(/) || [])[1] ||
               '#function';

      if (object instanceof Date)
        return object.toGMTString();

      if (object.toString &&
          object.toString !== Object.prototype.toString &&
          !object.toString.__traced__)
        return object.toString();

      if (object.nodeType !== undefined) return object.toString();

      stack.push(object);
      items = new E.Collection(E.objectKeys(object, false).sort()).map(function(key) {
          return this.convert(key, stack) + ': ' + this.convert(object[key], stack);
        }, this).join(', ');
      stack.pop();
      return items ? '{ ' + items + ' }' : '{}';
    },

    filterBacktrace: function(stack) {
      if (!stack) return stack;
      stack = stack.replace(/^\S.*\n?/gm, '');
      var filter = this.adapter.backtraceFilter();

      return filter
           ? stack.replace(filter, '')
           : stack;
    },

    ANSI_CSI:       '\u001B[',
    DEFAULT_WIDTH:  78,
    DEFAULT_HEIGHT: 24,
    MAX_DEPTH:      4,
    NO_COLOR:       'NO_COLOR',

    ESCAPE_CODES: {
      cursor: {
        cursorUp:           '%1A',
        cursorDown:         '%1B',
        cursorForward:      '%1C',
        cursorBack:         '%1D',
        cursorNextLine:     '%1E',
        cursorPrevLine:     '%1F',
        cursorColumn:       '%1G',
        cursorPosition:     '%1;%2H',
        cursorHide:         '?25l',
        cursorShow:         '?25h'
      },

      screen: {
        eraseScreenForward: '0J',
        eraseScreenBack:    '1J',
        eraseScreen:        '2J',
        eraseLineForward:   '0K',
        eraseLineBack:      '1K',
        eraseLine:          '2K'
      },

      reset: {
        reset:      '0m'
      },

      weight: {
        bold:       '1m',   normal:     '22m'
      },

      style: {
        italic:     '',     noitalic:   ''
      },

      underline: {
        underline:  '4m',   noline:     '24m'
      },

      blink: {
        blink:      '5m',   noblink:    '25m'
      },

      color: {
        black:      '30m',
        red:        '31m',
        green:      '32m',
        yellow:     '33m',
        blue:       '34m',
        magenta:    '35m',
        cyan:       '36m',
        white:      '37m',
        nocolor:    '39m',
        grey:       '90m'
      },

      background: {
        bgblack:    '40m',
        bgred:      '41m',
        bggreen:    '42m',
        bgyellow:   '43m',
        bgblue:     '44m',
        bgmagenta:  '45m',
        bgcyan:     '46m',
        bgwhite:    '47m',
        bgnocolor:  '49m'
      }
    },

    coloring: function() {
      return this.adapter.coloring();
    },

    envvar: function(name) {
      return this.adapter.envvar(name);
    },

    escape: function(string) {
      return Console.ANSI_CSI + string;
    },

    exit: function(status) {
      this.adapter.exit(status);
    },

    getDimensions: function() {
      return this.adapter.getDimensions();
    }
  },

  consoleFormat: function() {
    this.reset();
    var i = arguments.length;
    while (i--) this[arguments[i]]();
  },

  print: function(string) {
    string = (string === undefined ? '' : string).toString();
    Console.adapter.print(string);
  },

  puts: function(string) {
    string = (string === undefined ? '' : string).toString();
    Console.adapter.puts(string);
  }
});

Console.extend({
  Base: new JS.Class({
    __buffer__: '',
    __format__: '',

    backtraceFilter: function() {
      if (typeof version === 'function' && version() > 100) {
        return /.*/;
      } else {
        return null;
      }
    },

    coloring: function() {
      return !this.envvar(Console.NO_COLOR);
    },

    echo: function(string) {
      if (typeof console !== 'undefined') return console.log(string);
      if (typeof print === 'function')    return print(string);
    },

    envvar: function(name) {
      return null;
    },

    exit: function(status) {
      if (typeof system === 'object' && system.exit) system.exit(status);
      if (typeof quit === 'function')                quit(status);
    },

    format: function(type, name, args) {
      if (!this.coloring()) return;
      var escape = Console.ESCAPE_CODES[type][name];

      for (var i = 0, n = args.length; i < n; i++)
        escape = escape.replace('%' + (i+1), args[i]);

      this.__format__ += Console.escape(escape);
    },

    flushFormat: function() {
      var format = this.__format__;
      this.__format__ = '';
      return format;
    },

    getDimensions: function() {
      var width  = this.envvar('COLUMNS') || Console.DEFAULT_WIDTH,
          height = this.envvar('ROWS')    || Console.DEFAULT_HEIGHT;

      return [parseInt(width, 10), parseInt(height, 10)];
    },

    print: function(string) {
      var coloring = this.coloring(),
          width    = this.getDimensions()[0],
          esc      = Console.escape,
          length, prefix, line;

      while (string.length > 0) {
        length = this.__buffer__.length;
        prefix = (length > 0 && coloring) ? esc('1F') + esc((length + 1) + 'G') : '';
        line   = string.substr(0, width - length);

        this.__buffer__ += line;

        if (coloring) this.echo(prefix + this.flushFormat() + line);

        if (this.__buffer__.length === width) {
          if (!coloring) this.echo(this.__buffer__);
          this.__buffer__ = '';
        }
        string = string.substr(width - length);
      }
    },

    puts: function(string) {
      var coloring = this.coloring(),
          esc      = Console.escape,
          length   = this.__buffer__.length,
          prefix   = (length > 0 && coloring) ? esc('1F') + esc((length + 1) + 'G') : this.__buffer__;

      this.echo(prefix + this.flushFormat() + string);
      this.__buffer__ = '';
    }
  })
});

Console.extend({
  Browser: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(window.location.href.replace(/(\/[^\/]+)/g, '($1)?') + '/?', 'g');
    },

    coloring: function() {
      if (this.envvar(Console.NO_COLOR)) return false;
      return Console.AIR;
    },

    echo: function(string) {
      if (window.runtime) return window.runtime.trace(string);
      if (window.console) return console.log(string);
      alert(string);
    },

    envvar: function(name) {
      return window[name] || null;
    },

    getDimensions: function() {
      if (Console.AIR) return this.callSuper();
      return [1024, 1];
    }
  })
});

Console.extend({
  BrowserColor: new JS.Class(Console.Browser, {
    COLORS: {
      green: 'limegreen'
    },

    __queue__: [],
    __state__: null,

    format: function(type, name) {
      name = name.replace(/^bg/, '');

      var state = JS.extend({}, this.__state__ || {}),
          color = this.COLORS[name] || name,
          no    = /^no/.test(name);

      if (type === 'reset')
        state = null;
      else if (no)
        delete state[type];
      else if (type === 'weight')
        state.weight = 'font-weight: ' + name;
      else if (type === 'style')
        state.style = 'font-style: ' + name;
      else if (type === 'underline')
        state.underline = 'text-decoration: underline';
      else if (type === 'color')
        state.color = 'color: ' + color;
      else if (type === 'background')
        state.background = 'background-color: ' + color;
      else
        state = undefined;

      if (state !== undefined) {
        this.__state__ = state;
        this.__queue__.push(state);
      }
    },

    print: function(string) {
      this.__queue__.push(string)
    },

    puts: function(string) {
      this.print(string);
      var buffer = '', formats = [], item;
      while ((item = this.__queue__.shift()) !== undefined) {
        if (typeof item === 'string') {
          if (this.__state__) {
            buffer += '%c' + item;
            formats.push(this._serialize(this.__state__));
          } else {
            buffer += item;
          }
        } else {
          this.__state__ = item;
        }
      }
      console.log.apply(console, [buffer].concat(formats));
    },

    _serialize: function(state) {
      var rules = [];
      for (var key in state) rules.push(state[key]);
      return rules.join('; ');
    }
  })
});

Console.extend({
  Node: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(process.cwd() + '/', 'g');
    },

    coloring: function() {
      return !this.envvar(Console.NO_COLOR) && require('tty').isatty(1);
    },

    envvar: function(name) {
      return process.env[name] || null;
    },

    exit: function(status) {
      process.exit(status);
    },

    getDimensions: function() {
      var width, height, dims;
      if (process.stdout.getWindowSize) {
        dims   = process.stdout.getWindowSize();
        width  = dims[0];
        height = dims[1];
      } else {
        dims   = process.binding('stdio').getWindowSize();
        width  = dims[1];
        height = dims[0];
      }
      return [width, height];
    },

    print: function(string) {
      process.stdout.write(this.flushFormat() + string);
    },

    puts: function(string) {
      console.log(this.flushFormat() + string);
    }
  })
});

Console.extend({
  Phantom: new JS.Class(Console.Base, {
    echo: function(string) {
      console.log(string);
    },

    envvar: function(name) {
      return require('system').env[name] || null;
    },

    exit: function(status) {
      phantom.exit(status);
    }
  })
});

Console.extend({
  Rhino: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(java.lang.System.getProperty('user.dir') + '/', 'g');
    },

    envvar: function(name) {
      var env = java.lang.System.getenv();
      return env.get(name) || null;
    },

    getDimensions: function() {
      var proc = java.lang.Runtime.getRuntime().exec(['sh', '-c', 'stty -a < /dev/tty']),
          is   = proc.getInputStream(),
          bite = 0,
          out  = '',
          width, height;

      while (bite >= 0) {
        bite = is.read();
        if (bite >= 0) out += String.fromCharCode(bite);
      }

      var match = out.match(/rows\s+(\d+);\s+columns\s+(\d+)/);
      if (!match) return this._dimCache || this.callSuper();

      return this._dimCache = [parseInt(match[2], 10), parseInt(match[1], 10)];
    },

    print: function(string) {
      java.lang.System.out.print(this.flushFormat() + string);
    },

    puts: function(string) {
      java.lang.System.out.println(this.flushFormat() + string);
    }
  })
});

Console.extend({
  Windows: new JS.Class(Console.Base, {
    coloring: function() {
      return false;
    },

    echo: function(string) {
      WScript.Echo(string);
    },

    exit: function(status) {
      WScript.Quit(status);
    }
  })
});

Console.BROWSER = (typeof window !== 'undefined');
Console.NODE    = (typeof process === 'object') && !Console.BROWSER;
Console.PHANTOM = (typeof phantom !== 'undefined');
Console.AIR     = (Console.BROWSER && typeof runtime !== 'undefined');
Console.RHINO   = (typeof java !== 'undefined' && typeof java.lang !== 'undefined');
Console.WSH     = (typeof WScript !== 'undefined');

var useColor = false, ua;
if (Console.BROWSER) {
  ua = navigator.userAgent;
  if (window.console && /Chrome/.test(ua))
    useColor = true;
}

if (Console.PHANTOM)      Console.adapter = new Console.Phantom();
else if (useColor)        Console.adapter = new Console.BrowserColor();
else if (Console.BROWSER) Console.adapter = new Console.Browser();
else if (Console.NODE)    Console.adapter = new Console.Node();
else if (Console.RHINO)   Console.adapter = new Console.Rhino();
else if (Console.WSH)     Console.adapter = new Console.Windows();
else                      Console.adapter = new Console.Base();

for (var type in Console.ESCAPE_CODES) {
  for (var key in Console.ESCAPE_CODES[type]) (function(type, key) {
    Console.define(key, function() {
      Console.adapter.format(type, key, arguments);
    });
  })(type, key);
}

Console.extend(Console);

exports.Console = Console;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var ConstantScope = new JS.Module('ConstantScope', {
  extend: {
    included: function(base) {
      base.__consts__ = new JS.Module();
      base.extend(this.ClassMethods);
      base.__eigen__().extend(this.ClassMethods);

      base.include(base.__consts__);
      base.extend(base.__consts__);

      base.include(this.extract(base.__fns__));
      base.extend(this.extract(base.__eigen__().__fns__));
    },

    ClassMethods: new JS.Module({
      define: function(name, callable) {
        var constants = this.__consts__ || this.__tgt__.__consts__;

        if (/^[A-Z]/.test(name))
          constants.define(name, callable);
        else
          this.callSuper();

        if (JS.isType(callable, JS.Module)) {
          callable.include(ConstantScope);
          callable.__consts__.include(constants);
        }
      }
    }),

    extract: function(methods, base) {
      var constants = {}, key, object;
      for (key in methods) {
        if (!/^[A-Z]/.test(key)) continue;

        object = methods[key];
        constants[key] = object;
        delete methods[key];
      }
      return constants;
    }
  }
});

exports.ConstantScope = ConstantScope;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Decorator = new JS.Class('Decorator', {
  initialize: function(decoree, methods) {
    var decorator  = new JS.Class(),
        delegators = {},
        method, func;

    for (method in decoree.prototype) {
      func = decoree.prototype[method];
      if (typeof func === 'function' && func !== decoree) func = this.klass.delegate(method);
      delegators[method] = func;
    }

    decorator.include(new JS.Module(delegators), {_resolve: false});
    decorator.include(this.klass.InstanceMethods, {_resolve: false});
    decorator.include(methods);
    return decorator;
  },

  extend: {
    delegate: function(name) {
      return function() {
        return this.component[name].apply(this.component, arguments);
      };
    },

    InstanceMethods: new JS.Module({
      initialize: function(component) {
        this.component = component;
        this.klass = this.constructor = component.klass;
        var method, func;
        for (method in component) {
          if (this[method]) continue;
          func = component[method];
          if (typeof func === 'function') func = Decorator.delegate(method);
          this[method] = func;
        }
      },

      extend: function(source) {
        this.component.extend(source);
        var method, func;
        for (method in source) {
          func = source[method];
          if (typeof func === 'function') func = Decorator.delegate(method);
          this[method] = func;
        }
      }
    })
  }
});

exports.Decorator = Decorator;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Deferrable = new JS.Module('Deferrable', {
  extend: {
    Timeout: new JS.Class(Error)
  },

  callback: function(block, context) {
    if (this.__deferredStatus__ === 'success')
      return block.apply(context, this.__deferredValue__);

    if (this.__deferredStatus__ === 'failure')
      return;

    this.__callbacks__ = this.__callbacks__ || [];
    this.__callbacks__.push([block, context]);
  },

  errback: function(block, context) {
    if (this.__deferredStatus__ === 'failure')
      return block.apply(context, this.__deferredValue__);

    if (this.__deferredStatus__ === 'success')
      return;

    this.__errbacks__ = this.__errbacks__ || [];
    this.__errbacks__.push([block, context]);
  },

  timeout: function(milliseconds) {
    this.cancelTimeout();
    var self = this, error = new Deferrable.Timeout();
    this.__timeout__ = JS.ENV.setTimeout(function() { self.fail(error) }, milliseconds);
  },

  cancelTimeout: function() {
    if (!this.__timeout__) return;
    JS.ENV.clearTimeout(this.__timeout__);
    delete this.__timeout__;
  },

  setDeferredStatus: function(status, args) {
    this.__deferredStatus__ = status;
    this.__deferredValue__  = args;

    this.cancelTimeout();

    switch (status) {
      case 'success':
        if (!this.__callbacks__) return;
        var callback;
        while (callback = this.__callbacks__.pop())
          callback[0].apply(callback[1], args);
        break;

      case 'failure':
        if (!this.__errbacks__) return;
        var errback;
        while (errback = this.__errbacks__.pop())
          errback[0].apply(errback[1], args);
        break;
    }
  },

  succeed: function() {
    return this.setDeferredStatus('success', arguments);
  },

  fail: function() {
    return this.setDeferredStatus('failure', arguments);
  }
});

exports.Deferrable = Deferrable;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var DOM = {
  ELEMENT_NODE:                   1,
  ATTRIBUTE_NODE:                 2,
  TEXT_NODE:                      3,
  CDATA_SECTION_NODE:             4,
  ENTITY_REFERENCE_NODE:          5,
  ENTITY_NODE:                    6,
  PROCESSING_INSTRUCTION_NODE:    7,
  COMMENT_NODE:                   8,
  DOCUMENT_NODE:                  9,
  DOCUMENT_TYPE_NODE:             10,
  DOCUMENT_FRAGMENT_NODE:         11,
  NOTATION_NODE:                  12,

  ENV: this,

  toggleClass: function(node, className) {
    if (this.hasClass(node, className)) this.removeClass(node, className);
    else this.addClass(node, className);
  },

  hasClass: function(node, className) {
    var classes = node.className.split(/\s+/);
    return JS.indexOf(classes, className) >= 0;
  },

  addClass: function(node, className) {
    if (this.hasClass(node, className)) return;
    node.className = node.className + ' ' + className;
  },

  removeClass: function(node, className) {
    var pattern = new RegExp('\\b' + className + '\\b\\s*', 'g');
    node.className = node.className.replace(pattern, '');
  }
};

DOM.Builder = new JS.Class('DOM.Builder', {
  extend: {
    addElement: function(name) {
      this.define(name, function() {
        return this.makeElement(name, arguments);
      });
      DOM[name] = function() {
        return new DOM.Builder().makeElement(name, arguments);
      };
    },

    addElements: function(list) {
      var i = list.length;
      while (i--) this.addElement(list[i]);
    }
  },

  initialize: function(parent) {
    this._parentNode = parent;
  },

  makeElement: function(name, children) {
    var element, child, attribute;
    if ( document.createElementNS ) {
      // That makes possible to mix HTML within SVG or XUL.
      element = document.createElementNS('http://www.w3.org/1999/xhtml', name);
    } else {
      element = document.createElement(name);
    }
    for (var i = 0, n = children.length; i < n; i++) {
      child = children[i];
      if (typeof child === 'function') {
        child(new this.klass(element));
      } else if (JS.isType(child, 'string')) {
        element.appendChild(document.createTextNode(child));
      } else {
        for (attribute in child)
          element[attribute] = child[attribute];
      }
    }
    if (this._parentNode) this._parentNode.appendChild(element);
    return element;
  },

  concat: function(text) {
    if (!this._parentNode) return;
    this._parentNode.appendChild(document.createTextNode(text));
  }
});

DOM.Builder.addElements([
  'a', 'abbr', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b',
  'base', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption',
  'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del',
  'details', 'device', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
  'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input',
  'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'map', 'mark',
  'marquee', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol',
  'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp',
  'rt', 'ruby', 'samp', 'script', 'section', 'select', 'small', 'source',
  'span', 'strong', 'style', 'sub', 'sup', 'summary', 'table', 'tbody', 'td',
  'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'ul',
  'var', 'video', 'wbr'
]);

DOM.Event = {
  _registry: [],

  on: function(element, eventName, callback, context) {
    if (element === undefined) return;

    if (element !== DOM.ENV &&
        element.nodeType !== DOM.ELEMENT_NODE &&
        element.nodeType !== DOM.DOCUMENT_NODE)
      return;

    var wrapped = function() { callback.call(context, element) };

    if (element.addEventListener)
      element.addEventListener(eventName, wrapped, false);
    else if (element.attachEvent)
      element.attachEvent('on' + eventName, wrapped);

    this._registry.push({
      _element:   element,
      _type:      eventName,
      _callback:  callback,
      _context:   context,
      _handler:   wrapped
    });
  },

  detach: function(element, eventName, callback, context) {
    var i = this._registry.length, register;
    while (i--) {
      register = this._registry[i];

      if ((element    && element    !== register._element)   ||
          (eventName  && eventName  !== register._type)      ||
          (callback   && callback   !== register._callback)  ||
          (context    && context    !== register._context))
        continue;

      if (register._element.removeEventListener)
        register._element.removeEventListener(register._type, register._handler, false);
      else if (register._element.detachEvent)
        register._element.detachEvent('on' + register._type, register._handler);

      this._registry.splice(i,1);
      register = null;
    }
  }
};

DOM.Event.on(DOM.ENV, 'unload', DOM.Event.detach, DOM.Event);

exports.DOM = DOM;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Forwardable = new JS.Module('Forwardable', {
  defineDelegator: function(subject, method, alias, resolve) {
    alias = alias || method;
    this.define(alias, function() {
      var object   = this[subject],
          property = object[method];

      return (typeof property === 'function')
          ? property.apply(object, arguments)
          : property;
    }, {_resolve: resolve !== false});
  },

  defineDelegators: function() {
    var methods = JS.array(arguments),
        subject = methods.shift(),
        i       = methods.length;

    while (i--) this.defineDelegator(subject, methods[i], methods[i], false);
    this.resolve();
  }
});

exports.Forwardable = Forwardable;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      Comparable = js.Comparable || require('./comparable').Comparable;

  if (E) exports.JS = exports;
  factory(js, Enumerable, Comparable, E ? exports : js);

})(function(JS, Enumerable, Comparable, exports) {
'use strict';

var Hash = new JS.Class('Hash', {
  include: Enumerable || {},

  extend: {
    Pair: new JS.Class({
      include: Comparable || {},
      length: 2,

      setKey: function(key) {
        this[0] = this.key = key;
      },

      hasKey: function(key) {
        return Enumerable.areEqual(this.key, key);
      },

      setValue: function(value) {
        this[1] = this.value = value;
      },

      hasValue: function(value) {
        return Enumerable.areEqual(this.value, value);
      },

      compareTo: function(other) {
        return this.key.compareTo
            ? this.key.compareTo(other.key)
            : (this.key < other.key ? -1 : (this.key > other.key ? 1 : 0));
      },

      hash: function() {
        var key   = Hash.codeFor(this.key),
            value = Hash.codeFor(this.value);

        return [key, value].sort().join('/');
      }
    }),

    codeFor: function(object) {
      if (typeof object !== 'object') return String(object);
      return (typeof object.hash === 'function')
          ? object.hash()
          : object.toString();
    }
  },

  initialize: function(object) {
    this.clear();
    if (!JS.isType(object, Array)) return this.setDefault(object);
    for (var i = 0, n = object.length; i < n; i += 2)
      this.store(object[i], object[i+1]);
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);

    var hash, bucket, i;

    for (hash in this._buckets) {
      if (!this._buckets.hasOwnProperty(hash)) continue;
      bucket = this._buckets[hash];
      i = bucket.length;
      while (i--) block.call(context, bucket[i]);
    }
    return this;
  },

  _bucketForKey: function(key, createIfAbsent) {
    var hash   = this.klass.codeFor(key),
        bucket = this._buckets[hash];

    if (!bucket && createIfAbsent)
      bucket = this._buckets[hash] = [];

    return bucket;
  },

  _indexInBucket: function(bucket, key) {
    var i     = bucket.length,
        ident = !!this._compareByIdentity;

    while (i--) {
      if (ident ? (bucket[i].key === key) : bucket[i].hasKey(key))
        return i;
    }
    return -1;
  },

  assoc: function(key, createIfAbsent) {
    var bucket, index, pair;

    bucket = this._bucketForKey(key, createIfAbsent);
    if (!bucket) return null;

    index = this._indexInBucket(bucket, key);
    if (index > -1) return bucket[index];
    if (!createIfAbsent) return null;

    this.size += 1; this.length += 1;
    pair = new this.klass.Pair;
    pair.setKey(key);
    bucket.push(pair);
    return pair;
  },

  rassoc: function(value) {
    var key = this.key(value);
    return key ? this.assoc(key) : null;
  },

  clear: function() {
    this._buckets = {};
    this.length = this.size = 0;
  },

  compareByIdentity: function() {
    this._compareByIdentity = true;
    return this;
  },

  comparesByIdentity: function() {
    return !!this._compareByIdentity;
  },

  setDefault: function(value) {
    this._default = value;
    return this;
  },

  getDefault: function(key) {
    return (typeof this._default === 'function')
        ? this._default(this, key)
        : (this._default || null);
  },

  equals: function(other) {
    if (!JS.isType(other, Hash) || this.length !== other.length)
      return false;
    var result = true;
    this.forEach(function(pair) {
      if (!result) return;
      var otherPair = other.assoc(pair.key);
      if (otherPair === null || !otherPair.hasValue(pair.value)) result = false;
    });
    return result;
  },

  hash: function() {
    var hashes = [];
    this.forEach(function(pair) { hashes.push(pair.hash()) });
    return hashes.sort().join('');
  },

  fetch: function(key, defaultValue, context) {
    var pair = this.assoc(key);
    if (pair) return pair.value;

    if (defaultValue === undefined) throw new Error('key not found');
    if (typeof defaultValue === 'function') return defaultValue.call(context, key);
    return defaultValue;
  },

  forEachKey: function(block, context) {
    if (!block) return this.enumFor('forEachKey');
    block = Enumerable.toFn(block);

    this.forEach(function(pair) {
      block.call(context, pair.key);
    });
    return this;
  },

  forEachPair: function(block, context) {
    if (!block) return this.enumFor('forEachPair');
    block = Enumerable.toFn(block);

    this.forEach(function(pair) {
      block.call(context, pair.key, pair.value);
    });
    return this;
  },

  forEachValue: function(block, context) {
    if (!block) return this.enumFor('forEachValue');
    block = Enumerable.toFn(block);

    this.forEach(function(pair) {
      block.call(context, pair.value);
    });
    return this;
  },

  get: function(key) {
    var pair = this.assoc(key);
    return pair ? pair.value : this.getDefault(key);
  },

  hasKey: function(key) {
    return !!this.assoc(key);
  },

  hasValue: function(value) {
    var has = false, ident = !!this._compareByIdentity;
    this.forEach(function(pair) {
      if (has) return;
      if (ident ? value === pair.value : Enumerable.areEqual(value, pair.value))
        has = true;
    });
    return has;
  },

  invert: function() {
    var hash = new this.klass;
    this.forEach(function(pair) {
      hash.store(pair.value, pair.key);
    });
    return hash;
  },

  isEmpty: function() {
    for (var hash in this._buckets) {
      if (this._buckets.hasOwnProperty(hash) && this._buckets[hash].length > 0)
        return false;
    }
    return true;
  },

  keepIf: function(block, context) {
    return this.removeIf(function() {
      return !block.apply(context, arguments);
    });
  },

  key: function(value) {
    var result = null;
    this.forEach(function(pair) {
      if (!result && Enumerable.areEqual(value, pair.value))
        result = pair.key;
    });
    return result;
  },

  keys: function() {
    var keys = [];
    this.forEach(function(pair) { keys.push(pair.key) });
    return keys;
  },

  merge: function(hash, block, context) {
    var newHash = new this.klass;
    newHash.update(this);
    newHash.update(hash, block, context);
    return newHash;
  },

  rehash: function() {
    var temp = new this.klass;
    temp._buckets = this._buckets;
    this.clear();
    this.update(temp);
  },

  remove: function(key, block) {
    if (block === undefined) block = null;
    var bucket, index, result;

    bucket = this._bucketForKey(key);
    if (!bucket) return (typeof block === 'function')
                      ? this.fetch(key, block)
                      : this.getDefault(key);

    index = this._indexInBucket(bucket, key);
    if (index < 0) return (typeof block === 'function')
                        ? this.fetch(key, block)
                        : this.getDefault(key);

    result = bucket[index].value;
    this._delete(bucket, index);
    this.size -= 1;
    this.length -= 1;

    if (bucket.length === 0)
      delete this._buckets[this.klass.codeFor(key)];

    return result;
  },

  _delete: function(bucket, index) {
    bucket.splice(index, 1);
  },

  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = Enumerable.toFn(block);

    var toRemove = [];

    this.forEach(function(pair) {
      if (block.call(context, pair))
        toRemove.push(pair.key);
    }, this);

    var i = toRemove.length;
    while (i--) this.remove(toRemove[i]);

    return this;
  },

  replace: function(hash) {
    this.clear();
    this.update(hash);
  },

  shift: function() {
    var keys = this.keys();
    if (keys.length === 0) return this.getDefault();
    var pair = this.assoc(keys[0]);
    this.remove(pair.key);
    return pair;
  },

  store: function(key, value) {
    this.assoc(key, true).setValue(value);
    return value;
  },

  toString: function() {
    return 'Hash:{' + this.map(function(pair) {
      return pair.key.toString() + '=>' + pair.value.toString();
    }).join(',') + '}';
  },

  update: function(hash, block, context) {
    var givenBlock = (typeof block === 'function');
    hash.forEach(function(pair) {
      var key = pair.key, value = pair.value;
      if (givenBlock && this.hasKey(key))
        value = block.call(context, key, this.get(key), value);
      this.store(key, value);
    }, this);
  },

  values: function() {
    var values = [];
    this.forEach(function(pair) { values.push(pair.value) });
    return values;
  },

  valuesAt: function() {
    var i = arguments.length, results = [];
    while (i--) results.push(this.get(arguments[i]));
    return results;
  }
});

Hash.alias({
  includes: 'hasKey',
  index:    'key',
  put:      'store'
});

var OrderedHash = new JS.Class('OrderedHash', Hash, {
  assoc: function(key, createIfAbsent) {
    var _super = Hash.prototype.assoc;

    var existing = _super.call(this, key, false);
    if (existing || !createIfAbsent) return existing;

    var pair = _super.call(this, key, true);

    if (!this._first) {
      this._first = this._last = pair;
    } else {
      this._last._next = pair;
      pair._prev = this._last;
      this._last = pair;
    }
    return pair;
  },

  clear: function() {
    this.callSuper();
    this._first = this._last = null;
  },

  _delete: function(bucket, index) {
    var pair = bucket[index];

    if (pair._prev) pair._prev._next = pair._next;
    if (pair._next) pair._next._prev = pair._prev;

    if (pair === this._first) this._first = pair._next;
    if (pair === this._last) this._last = pair._prev;

    return this.callSuper();
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);

    var pair = this._first;
    while (pair) {
      block.call(context, pair);
      pair = pair._next;
    }
  },

  rehash: function() {
    var pair = this._first;
    this.clear();
    while (pair) {
      this.store(pair.key, pair.value);
      pair = pair._next;
    }
  }
});

exports.Hash = Hash;
exports.OrderedHash = OrderedHash;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      hash = js.Hash ? js : require('./hash');

  if (E) exports.JS = exports;
  factory(js, Enumerable, hash, E ? exports : js);

})(function(JS, Enumerable, hash, exports) {
'use strict';

var Set = new JS.Class('Set', {
  extend: {
    forEach: function(list, block, context) {
      if (!list || !block) return;
      if (list.forEach) return list.forEach(block, context);
      for (var i = 0, n = list.length; i < n; i++) {
        if (list[i] !== undefined)
          block.call(context, list[i], i);
      }
    }
  },

  include: Enumerable || {},

  initialize: function(list, block, context) {
    this.clear();
    if (block) this.klass.forEach(list, function(item) {
      this.add(block.call(context, item));
    }, this);
    else this.merge(list);
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);

    this._members.forEachKey(block, context);
    return this;
  },

  add: function(item) {
    if (this.contains(item)) return false;
    this._members.store(item, true);
    this.length = this.size = this._members.length;
    return true;
  },

  classify: function(block, context) {
    if (!block) return this.enumFor('classify');
    block = Enumerable.toFn(block);

    var classes = new hash.Hash();
    this.forEach(function(item) {
      var value = block.call(context, item);
      if (!classes.hasKey(value)) classes.store(value, new this.klass);
      classes.get(value).add(item);
    }, this);
    return classes;
  },

  clear: function() {
    this._members = new hash.Hash();
    this.size = this.length = 0;
  },

  complement: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (!this.contains(item)) set.add(item);
    }, this);
    return set;
  },

  contains: function(item) {
    return this._members.hasKey(item);
  },

  difference: function(other) {
    other = JS.isType(other, Set) ? other : new Set(other);
    var set = new this.klass;
    this.forEach(function(item) {
      if (!other.contains(item)) set.add(item);
    });
    return set;
  },

  divide: function(block, context) {
    if (!block) return this.enumFor('divide');
    block = Enumerable.toFn(block);

    var classes = this.classify(block, context),
        sets    = new Set;

    classes.forEachValue(sets.method('add'));
    return sets;
  },

  equals: function(other) {
    if (this.length !== other.length || !JS.isType(other, Set)) return false;
    var result = true;
    this.forEach(function(item) {
      if (!result) return;
      if (!other.contains(item)) result = false;
    });
    return result;
  },

  hash: function() {
    var hashes = [];
    this.forEach(function(object) { hashes.push(hash.Hash.codeFor(object)) });
    return hashes.sort().join('');
  },

  flatten: function(set) {
    var copy = new this.klass;
    copy._members = this._members;
    if (!set) { set = this; set.clear(); }
    copy.forEach(function(item) {
      if (JS.isType(item, Set)) item.flatten(set);
      else set.add(item);
    });
    return set;
  },

  inspect: function() {
    return this.toString();
  },

  intersection: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (this.contains(item)) set.add(item);
    }, this);
    return set;
  },

  isEmpty: function() {
    return this._members.length === 0;
  },

  isProperSubset: function(other) {
    return this._members.length < other._members.length && this.isSubset(other);
  },

  isProperSuperset: function(other) {
    return this._members.length > other._members.length && this.isSuperset(other);
  },

  isSubset: function(other) {
    var result = true;
    this.forEach(function(item) {
      if (!result) return;
      if (!other.contains(item)) result = false;
    });
    return result;
  },

  isSuperset: function(other) {
    return other.isSubset(this);
  },

  keepIf: function(block, context) {
    return this.removeIf(function() {
      return !block.apply(context, arguments);
    });
  },

  merge: function(list) {
    this.klass.forEach(list, function(item) { this.add(item) }, this);
  },

  product: function(other) {
    var pairs = new Set;
    this.forEach(function(item) {
      this.klass.forEach(other, function(partner) {
        pairs.add([item, partner]);
      });
    }, this);
    return pairs;
  },

  rebuild: function() {
    this._members.rehash();
    this.length = this.size = this._members.length;
  },

  remove: function(item) {
    this._members.remove(item);
    this.length = this.size = this._members.length;
  },

  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = Enumerable.toFn(block);

    this._members.removeIf(function(pair) {
      return block.call(context, pair.key);
    });
    this.length = this.size = this._members.length;
    return this;
  },

  replace: function(other) {
    this.clear();
    this.merge(other);
  },

  subtract: function(list) {
    this.klass.forEach(list, function(item) {
      this.remove(item);
    }, this);
  },

  toString: function() {
    var items = [];
    this.forEach(function(item) {
      items.push(item.toString());
    });
    return this.klass.displayName + ':{' + items.join(',') + '}';
  },

  union: function(other) {
    var set = new this.klass;
    set.merge(this);
    set.merge(other);
    return set;
  },

  xor: function(other) {
    var set = new this.klass(other);
    this.forEach(function(item) {
      set[set.contains(item) ? 'remove' : 'add'](item);
    });
    return set;
  },

  _indexOf: function(item) {
    var i    = this._members.length,
        Enum = Enumerable;

    while (i--) {
      if (Enum.areEqual(item, this._members[i])) return i;
    }
    return -1;
  }
});

Set.alias({
  n:  'intersection',
  u:  'union',
  x:  'product'
});

var OrderedSet = new JS.Class('OrderedSet', Set, {
  clear: function() {
    this._members = new hash.OrderedHash();
    this.size = this.length = 0;
  }
});

var SortedSet = new JS.Class('SortedSet', Set, {
  extend: {
    compare: function(one, another) {
      return JS.isType(one, Object)
          ? one.compareTo(another)
          : (one < another ? -1 : (one > another ? 1 : 0));
    }
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);
    this.klass.forEach(this._members, block, context);
    return this;
  },

  add: function(item) {
    var point = this._indexOf(item, true);
    if (point === null) return false;
    this._members.splice(point, 0, item);
    this.length = this.size = this._members.length;
    return true;
  },

  clear: function() {
    this._members = [];
    this.size = this.length = 0;
  },

  contains: function(item) {
    return this._indexOf(item) !== -1;
  },

  rebuild: function() {
    var members = this._members;
    this.clear();
    this.merge(members);
  },

  remove: function(item) {
    var index = this._indexOf(item);
    if (index === -1) return;
    this._members.splice(index, 1);
    this.length = this.size = this._members.length;
  },

  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = Enumerable.toFn(block);

    var members = this._members,
        i       = members.length;

    while (i--) {
      if (block.call(context, members[i]))
        this.remove(members[i]);
    }
    return this;
  },

  _indexOf: function(item, insertionPoint) {
    var items   = this._members,
        n       = items.length,
        i       = 0,
        d       = n,
        compare = this.klass.compare,
        Enum    = Enumerable,
        found;

    if (n === 0) return insertionPoint ? 0 : -1;

    if (compare(item, items[0]) < 1)   { d = 0; i = 0; }
    if (compare(item, items[n-1]) > 0) { d = 0; i = n; }

    while (!Enum.areEqual(item, items[i]) && d > 0.5) {
      d = d / 2;
      i += (compare(item, items[i]) > 0 ? 1 : -1) * Math.round(d);
      if (i > 0 && compare(item, items[i-1]) > 0 && compare(item, items[i]) < 1) d = 0;
    }

    // The pointer will end up at the start of any homogenous section. Step
    // through the section until we find the needle or until the section ends.
    while (items[i] && !Enum.areEqual(item, items[i]) &&
        compare(item, items[i]) === 0) i += 1;

    found = Enum.areEqual(item, items[i]);
    return insertionPoint
        ? (found ? null : i)
        : (found ? i : -1);
  }
});

Enumerable.include({
  toSet: function(klass, block, context) {
    klass = klass || Set;
    return new klass(this, block, context);
  }
});

exports.Set = exports.HashSet = Set;
exports.OrderedSet = OrderedSet;
exports.SortedSet = SortedSet;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable;

  if (E) exports.JS = exports;
  factory(js, Enumerable, E ? exports : js);

})(function(JS, Enumerable, exports) {
'use strict';

var LinkedList = new JS.Class('LinkedList', {
  include: Enumerable || {},

  initialize: function(array, useNodes) {
    this.length = 0;
    this.first = this.last = null;
    if (!array) return;
    for (var i = 0, n = array.length; i < n; i++)
      this.push( useNodes ? new this.klass.Node(array[i]) : array[i] );
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);

    var node   = this.first,
        next, i, n;

    for (i = 0, n = this.length; i < n; i++) {
      next = node.next;
      block.call(context, node, i);
      if (node === this.last) break;
      node = next;
    }
    return this;
  },

  at: function(n) {
    if (n < 0 || n >= this.length) return undefined;
    var node = this.first;
    while (n--) node = node.next;
    return node;
  },

  pop: function() {
    return this.length ? this.remove(this.last) : undefined;
  },

  shift: function() {
    return this.length ? this.remove(this.first) : undefined;
  },

  // stubs - should be implemented by concrete list types
  insertAfter:  function() {},
  push:         function() {},
  remove:       function() {},

  extend: {
    Node: new JS.Class({
      initialize: function(data) {
        this.data = data;
        this.prev = this.next = this.list = null;
      }
    })
  }
});

LinkedList.Doubly = new JS.Class('LinkedList.Doubly', LinkedList, {
  insertAt: function(n, newNode) {
    if (n < 0 || n >= this.length) return;
    this.insertBefore(this.at(n), newNode);
  },

  unshift: function(newNode) {
    this.length > 0
        ? this.insertBefore(this.first, newNode)
        : this.push(newNode);
  },

  insertBefore: function() {}
});

LinkedList.insertTemplate = function(prev, next, pos) {
  return function(node, newNode) {
    if (node.list !== this) return;
    newNode[prev] = node;
    newNode[next] = node[next];
    node[next] = (node[next][prev] = newNode);
    if (newNode[prev] === this[pos]) this[pos] = newNode;
    newNode.list = this;
    this.length++;
  };
};

LinkedList.Doubly.Circular = new JS.Class('LinkedList.Doubly.Circular', LinkedList.Doubly, {
  insertAfter: LinkedList.insertTemplate('prev', 'next', 'last'),
  insertBefore: LinkedList.insertTemplate('next', 'prev', 'first'),

  push: function(newNode) {
    if (this.length)
      return this.insertAfter(this.last, newNode);

    this.first = this.last =
        newNode.prev = newNode.next = newNode;

    newNode.list = this;
    this.length = 1;
  },

  remove: function(removed) {
    if (removed.list !== this || this.length === 0) return null;
    if (this.length > 1) {
      removed.prev.next = removed.next;
      removed.next.prev = removed.prev;
      if (removed === this.first) this.first = removed.next;
      if (removed === this.last) this.last = removed.prev;
    } else {
      this.first = this.last = null;
    }
    removed.prev = removed.next = removed.list = null;
    this.length--;
    return removed;
  }
});

exports.LinkedList = LinkedList;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var MethodChain = function(base) {
  var queue      = [],
      baseObject = base || {};

  this.____ = function(method, args) {
    queue.push({func: method, args: args});
  };

  this.__exec__ = function(base) {
    return MethodChain.exec(queue, base || baseObject);
  };
};

MethodChain.exec = function(queue, object) {
  var method, property, i, n;
  loop: for (i = 0, n = queue.length; i < n; i++) {
    method = queue[i];
    if (object instanceof MethodChain) {
      object.____(method.func, method.args);
      continue;
    }
    switch (typeof method.func) {
      case 'string':    property = object[method.func];       break;
      case 'function':  property = method.func;               break;
      case 'object':    object = method.func; continue loop;  break;
    }
    object = (typeof property === 'function')
        ? property.apply(object, method.args)
        : property;
  }
  return object;
};

MethodChain.displayName = 'MethodChain';

MethodChain.toString = function() {
  return 'MethodChain';
};

MethodChain.prototype = {
  __: function() {
    var base = arguments[0],
        args, i, n;

    switch (typeof base) {
      case 'object': case 'function':
        args = [];
        for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
        this.____(base, args);
    }
    return this;
  },

  toFunction: function() {
    var chain = this;
    return function(object) { return chain.__exec__(object); };
  }
};

MethodChain.reserved = (function() {
  var names = [], key;
  for (key in new MethodChain) names.push(key);
  return new RegExp('^(?:' + names.join('|') + ')$');
})();

MethodChain.addMethod = function(name) {
  if (this.reserved.test(name)) return;
  var func = this.prototype[name] = function() {
    this.____(name, arguments);
    return this;
  };
  func.displayName = 'MethodChain#' + name;
};

MethodChain.addMethods = function(object) {
  var methods = [], property, i;

  for (property in object) {
    if (Number(property) !== property) methods.push(property);
  }

  if (object instanceof Array) {
    i = object.length;
    while (i--) {
      if (typeof object[i] === 'string') methods.push(object[i]);
    }
  }
  i = methods.length;
  while (i--) this.addMethod(methods[i]);

  object.__fns__ && this.addMethods(object.__fns__);
  object.prototype && this.addMethods(object.prototype);
};

JS.Method.added(function(method) {
  if (method && method.name) MethodChain.addMethod(method.name);
});

JS.Kernel.include({
  wait: function(time) {
    var chain = new MethodChain(), self = this;

    if (typeof time === 'number')
      JS.ENV.setTimeout(function() { chain.__exec__(self) }, time * 1000);

    if (this.forEach && typeof time === 'function')
      this.forEach(function(item) {
        JS.ENV.setTimeout(function() { chain.__exec__(item) }, time.apply(this, arguments) * 1000);
      });

    return chain;
  },

  __: function() {
    var base = arguments[0],
        args = [],
        i, n;

    for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
    return  (typeof base === 'object' && base) ||
            (typeof base === 'function' && base.apply(this, args)) ||
            this;
  }
});

(function() {
  var queue = JS.Module.__queue__,
      n     = queue.length;

  while (n--) MethodChain.addMethods(queue[n]);
  delete JS.Module.__queue__;
})();

MethodChain.addMethods([
  "abs", "acos", "addEventListener", "anchor", "animation", "appendChild",
  "apply", "arguments", "arity", "asin", "atan", "atan2", "attributes", "auto",
  "background", "baseURI", "baseURIObject", "big", "bind", "blink", "blur",
  "bold", "border", "bottom", "bubbles", "call", "caller", "cancelBubble",
  "cancelable", "ceil", "charAt", "charCodeAt", "childElementCount",
  "childNodes", "children", "classList", "className", "clear", "click",
  "clientHeight", "clientLeft", "clientTop", "clientWidth", "clip",
  "cloneNode", "color", "columns", "compareDocumentPosition", "concat",
  "constructor", "contains", "content", "contentEditable", "cos", "create",
  "css", "currentTarget", "cursor", "dataset", "defaultPrevented",
  "defineProperties", "defineProperty", "dir", "direction", "dispatchEvent",
  "display", "endsWith", "eval", "eventPhase", "every", "exec", "exp",
  "explicitOriginalTarget", "filter", "firstChild", "firstElementChild",
  "fixed", "flex", "float", "floor", "focus", "font", "fontcolor", "fontsize",
  "forEach", "freeze", "fromCharCode", "getAttribute", "getAttributeNS",
  "getAttributeNode", "getAttributeNodeNS", "getBoundingClientRect",
  "getClientRects", "getDate", "getDay", "getElementsByClassName",
  "getElementsByTagName", "getElementsByTagNameNS", "getFeature",
  "getFullYear", "getHours", "getMilliseconds", "getMinutes", "getMonth",
  "getOwnPropertyDescriptor", "getOwnPropertyNames", "getPrototypeOf",
  "getSeconds", "getTime", "getTimezoneOffset", "getUTCDate", "getUTCDay",
  "getUTCFullYear", "getUTCHours", "getUTCMilliseconds", "getUTCMinutes",
  "getUTCMonth", "getUTCSeconds", "getUserData", "getYear", "global",
  "hasAttribute", "hasAttributeNS", "hasAttributes", "hasChildNodes",
  "hasOwnProperty", "height", "hyphens", "icon", "id", "ignoreCase", "imul",
  "indexOf", "inherit", "initEvent", "initial", "innerHTML",
  "insertAdjacentHTML", "insertBefore", "is", "isArray", "isContentEditable",
  "isDefaultNamespace", "isEqualNode", "isExtensible", "isFinite", "isFrozen",
  "isGenerator", "isInteger", "isNaN", "isPrototypeOf", "isSameNode",
  "isSealed", "isSupported", "isTrusted", "italics", "join", "keys", "lang",
  "lastChild", "lastElementChild", "lastIndex", "lastIndexOf", "left",
  "length", "link", "localName", "localeCompare", "log", "lookupNamespaceURI",
  "lookupPrefix", "map", "margin", "marks", "mask", "match", "max", "min",
  "mozMatchesSelector", "mozRequestFullScreen", "multiline", "name",
  "namespaceURI", "nextElementSibling", "nextSibling", "nodeArg", "nodeName",
  "nodePrincipal", "nodeType", "nodeValue", "none", "normal", "normalize",
  "now", "offsetHeight", "offsetLeft", "offsetParent", "offsetTop",
  "offsetWidth", "opacity", "order", "originalTarget", "orphans", "otherNode",
  "outerHTML", "outline", "overflow", "ownerDocument", "padding", "parentNode",
  "parse", "perspective", "pop", "position", "pow", "prefix", "preventBubble",
  "preventCapture", "preventDefault", "preventExtensions",
  "previousElementSibling", "previousSibling", "propertyIsEnumerable",
  "prototype", "push", "querySelector", "querySelectorAll", "quote", "quotes",
  "random", "reduce", "reduceRight", "removeAttribute", "removeAttributeNS",
  "removeAttributeNode", "removeChild", "removeEventListener", "replace",
  "replaceChild", "resize", "reverse", "right", "round", "schemaTypeInfo",
  "scrollHeight", "scrollIntoView", "scrollLeft", "scrollTop", "scrollWidth",
  "seal", "search", "setAttribute", "setAttributeNS", "setAttributeNode",
  "setAttributeNodeNS", "setCapture", "setDate", "setFullYear", "setHours",
  "setIdAttribute", "setIdAttributeNS", "setIdAttributeNode",
  "setMilliseconds", "setMinutes", "setMonth", "setSeconds", "setTime",
  "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds",
  "setUTCMinutes", "setUTCMonth", "setUTCSeconds", "setUserData", "setYear",
  "shift", "sin", "slice", "small", "some", "sort", "source", "spellcheck",
  "splice", "split", "sqrt", "startsWith", "sticky",
  "stopImmediatePropagation", "stopPropagation", "strike", "style", "sub",
  "substr", "substring", "sup", "tabIndex", "tagName", "tan", "target", "test",
  "textContent", "timeStamp", "title", "toDateString", "toExponential",
  "toFixed", "toGMTString", "toISOString", "toInteger", "toJSON",
  "toLocaleDateString", "toLocaleFormat", "toLocaleLowerCase",
  "toLocaleString", "toLocaleTimeString", "toLocaleUpperCase", "toLowerCase",
  "toPrecision", "toSource", "toString", "toTimeString", "toUTCString",
  "toUpperCase", "top", "transform", "transition", "trim", "trimLeft",
  "trimRight", "type", "unshift", "unwatch", "valueOf", "visibility", "w3c",
  "watch", "widows", "width"
]);

exports.MethodChain = MethodChain;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Proxy = new JS.Module('Proxy', {
  extend: {
    Virtual: new JS.Class({
      initialize: function(klass) {
        var bridge     = function() {},
            proxy      = new JS.Class(),
            delegators = {},
            method, func;

        bridge.prototype = klass.prototype;

        for (method in klass.prototype) {
          func = klass.prototype[method];
          if (typeof func === 'function' && func !== klass) func = this.klass.forward(method);
          delegators[method] = func;
        }

        proxy.include({
          initialize: function() {
            var args    = arguments,
                subject = null;

            this.__getSubject__ = function() {
              subject = new bridge;
              klass.apply(subject, args);
              return (this.__getSubject__ = function() { return subject; })();
            };
          },
          klass: klass,
          constructor: klass
        }, {_resolve: false});

        proxy.include(new JS.Module(delegators), {_resolve: false});
        proxy.include(this.klass.InstanceMethods);
        return proxy;
      },

      extend: {
        forward: function(name) {
          return function() {
            var subject = this.__getSubject__();
            return subject[name].apply(subject, arguments);
          };
        },

        InstanceMethods: new JS.Module({
          extend: function(source) {
            this.__getSubject__().extend(source);
            var method, func;
            for (method in source) {
              func = source[method];
              if (typeof func  === 'function') func = Proxy.Virtual.forward(method);
              this[method] = func;
            }
          }
        })
      }
    })
  }
});

exports.Proxy = Proxy;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      Hash = js.Hash || require('./hash').Hash;

  if (E) exports.JS = exports;
  factory(js, Enumerable, Hash, E ? exports : js);

})(function(JS, Enumerable, Hash, exports) {
'use strict';

var Range = new JS.Class('Range', {
  include: Enumerable || {},

  extend: {
    compare: function(one, another) {
      return JS.isType(one, Object)
          ? one.compareTo(another)
          : (one < another ? -1 : (one > another ? 1 : 0));
    },

    succ: function(object) {
      if (JS.isType(object, 'string')) {
        var chars = object.split(''),
            i     = chars.length,
            next  = null,
            set   = null,
            roll  = true;

        while (roll && i--) {
          next = null;

          Enumerable.forEach.call(this.SETS, function(name) {
            var range = this[name];
            if (chars[i] !== range._last) return;
            set  = range;
            next = range._first;
          }, this);

          if (next === null) {
            next = String.fromCharCode(chars[i].charCodeAt(0) + 1);
            roll = false;
          }
          chars[i] = next;
        }

        if (roll) chars.unshift( set._first === '0' ? '1' : set._first );

        return chars.join('');
      }

      if (JS.isType(object, 'number')) return object + 1;
      if (typeof object.succ === 'function') return object.succ();
      return null;
    }
  },

  initialize: function(first, last, excludeEnd) {
    this._first = first;
    this._last  = last;
    this._excludeEnd = !!excludeEnd;
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);

    var needle  = this._first,
        exclude = this._excludeEnd;

    if (this.klass.compare(needle, this._last) > 0)
      return;

    var check = JS.isType(needle, Object)
        ? function(a,b) { return a.compareTo(b) < 0 }
        : function(a,b) { return a !== b };

    while (check(needle, this._last)) {
      block.call(context, needle);
      needle = this.klass.succ(needle);
      if (JS.isType(needle, 'string') && needle.length > this._last.length) {
        exclude = true;
        break;
      }
    }

    if (this.klass.compare(needle, this._last) > 0)
      return;

    if (!exclude) block.call(context, needle);
  },

  equals: function(other) {
    return JS.isType(other, Range) &&
           Enumerable.areEqual(other._first, this._first) &&
           Enumerable.areEqual(other._last, this._last) &&
           other._excludeEnd === this._excludeEnd;
  },

  hash: function() {
    var hash = Hash.codeFor(this._first) + '..';
    if (this._excludeEnd) hash += '.';
    hash += Hash.codeFor(this._last);
    return hash;
  },

  first: function() { return this._first },

  last:  function() { return this._last  },

  excludesEnd: function() { return this._excludeEnd },

  includes: function(object) {
    var a = this.klass.compare(object, this._first),
        b = this.klass.compare(object, this._last);

    return a >= 0 && (this._excludeEnd ? b < 0 : b <= 0);
  },

  step: function(n, block, context) {
    if (!block) return this.enumFor('step', n);
    block = Enumerable.toFn(block);

    var i = 0;
    this.forEach(function(member) {
      if (i % n === 0) block.call(context, member);
      i += 1;
    });
  },

  toString: function() {
    var str = this._first.toString() + '..';
    if (this._excludeEnd) str += '.';
    str += this._last.toString();
    return str;
  }
});

Range.extend({
  DIGITS:     new Range('0','9'),
  LOWERCASE:  new Range('a','z'),
  UPPERCASE:  new Range('A','Z'),
  SETS:       ['DIGITS', 'LOWERCASE', 'UPPERCASE']
});

Range.alias({
  begin:  'first',
  end:    'last',
  covers: 'includes',
  match:  'includes',
  member: 'includes'
});

exports.Range = Range;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Observable = js.Observable || require('./observable').Observable,
      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      Console    = js.Console    || require('./console').Console;

  if (E) exports.JS = exports;
  factory(js, Observable, Enumerable, Console, E ? exports : js);

})(function(JS, Observable, Enumerable, Console, exports) {
'use strict';

var StackTrace = new JS.Module('StackTrace', {
  extend: {
    logger: new JS.Singleton({
      include: Console,
      active: false,

      update: function(event, data) {
        if (!this.active) return;
        switch (event) {
          case 'call':    return this.logEnter(data);
          case 'return':  return this.logExit(data);
          case 'error':   return this.logError(data);
        }
      },

      indent: function() {
        var indent = ' ';
        StackTrace.forEach(function() { indent += '|  ' });
        return indent;
      },

      fullName: function(frame) {
        var C        = Console,
            method   = frame.method,
            env      = frame.env,
            name     = method.name,
            module   = method.module;

        return C.nameOf(env) +
                (module === env ? '' : '(' + C.nameOf(module) + ')') +
                '#' + name;
      },

      logEnter: function(frame) {
        var fullName = this.fullName(frame),
            args = Console.convert(frame.args).replace(/^\[/, '(').replace(/\]$/, ')');

        if (this._open) this.puts();

        this.reset();
        this.print(' ');
        this.consoleFormat('bgblack', 'white');
        this.print('TRACE');
        this.reset();
        this.print(this.indent());
        this.blue();
        this.print(fullName);
        this.red();
        this.print(args);
        this.reset();

        this._open = true;
      },

      logExit: function(frame) {
        var fullName = this.fullName(frame);

        if (frame.leaf) {
          this.consoleFormat('red');
          this.print(' --> ');
        } else {
          this.reset();
          this.print(' ');
          this.consoleFormat('bgblack', 'white');
          this.print('TRACE');
          this.reset();
          this.print(this.indent());
          this.blue();
          this.print(fullName);
          this.red();
          this.print(' --> ');
        }
        this.consoleFormat('yellow');
        this.puts(Console.convert(frame.result));
        this.reset();
        this.print('');
        this._open = false;
      },

      logError: function(e) {
        this.puts();
        this.reset();
        this.print(' ');
        this.consoleFormat('bgred', 'white');
        this.print('ERROR');
        this.consoleFormat('bold', 'red');
        this.print(' ' + Console.convert(e));
        this.reset();
        this.print(' thrown by ');
        this.bold();
        this.print(StackTrace.top().name);
        this.reset();
        this.puts('. Backtrace:');
        this.backtrace();
      },

      backtrace: function() {
        StackTrace.reverseForEach(function(frame) {
          var args = Console.convert(frame.args).replace(/^\[/, '(').replace(/\]$/, ')');
          this.print('      | ');
          this.consoleFormat('blue');
          this.print(frame.name);
          this.red();
          this.print(args);
          this.reset();
          this.puts(' in ');
          this.print('      |  ');
          this.bold();
          this.puts(Console.convert(frame.object));
        }, this);
        this.reset();
        this.puts();
      }
    }),

    include: [Observable, Enumerable],

    wrap: function(func, method, env) {
      var self = StackTrace;
      var wrapper = function() {
        var result;
        self.push(this, method, env, Array.prototype.slice.call(arguments));

        try { result = func.apply(this, arguments) }
        catch (e) { self.error(e) }

        self.pop(result);
        return result;
      };
      wrapper.toString = function() { return func.toString() };
      wrapper.__traced__ = true;
      return wrapper;
    },

    stack: [],

    forEach: function(block, context) {
      Enumerable.forEach.call(this.stack, block, context);
    },

    top: function() {
      return this.stack[this.stack.length - 1] || {};
    },

    push: function(object, method, env, args) {
      var stack = this.stack;
      if (stack.length > 0) stack[stack.length - 1].leaf = false;

      var frame = {
        object: object,
        method: method,
        env:    env,
        args:   args,
        leaf:   true
      };
      frame.name = this.logger.fullName(frame);
      this.notifyObservers('call', frame);
      stack.push(frame);
    },

    pop: function(result) {
      var frame = this.stack.pop();
      frame.result = result;
      this.notifyObservers('return', frame);
    },

    error: function(e) {
      if (e.logged) throw e;
      e.logged = true;
      this.notifyObservers('error', e);
      this.stack = [];
      throw e;
    }
  }
});

StackTrace.addObserver(StackTrace.logger);

exports.StackTrace = StackTrace;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var State = new JS.Module('State', {
  __getState__: function(state) {
    if (typeof state === 'object') return state;
    if (typeof state === 'string') return (this.states || {})[state];
    return {};
  },

  setState: function(state) {
    this.__state__ = this.__getState__(state);
    State.addMethods(this.__state__, this.klass);
  },

  inState: function() {
    var i = arguments.length;
    while (i--) {
      if (this.__state__ === this.__getState__(arguments[i])) return true;
    }
    return false;
  },

  extend: {
    ClassMethods: new JS.Module({
      states: function(block) {
        this.define('states', State.buildCollection(this, block));
      }
    }),

    included: function(klass) {
      klass.extend(this.ClassMethods);
    },

    stub: function() { return this; },

    buildStubs: function(stubs, collection, states) {
      var state, method;
      for (state in states) {
        collection[state] = {};
        for (method in states[state]) stubs[method] = this.stub;
      }
    },

    findStates: function(collections, name) {
      var i = collections.length, results = [];
      while (i--) {
        if (collections[i].hasOwnProperty(name))
          results.push(collections[i][name]);
      }
      return results;
    },

    buildCollection: function(module, states) {
      var stubs       = {},
          collection  = {},
          superstates = module.lookup('states'),
          state, klass, methods, name, mixins, i, n;

      this.buildStubs(stubs, collection, states);

      for (i = 0, n = superstates.length; i < n;  i++)
        this.buildStubs(stubs, collection, superstates[i]);

      for (state in collection) {
        klass  = new JS.Class(states[state]);
        mixins = this.findStates(superstates, state);

        i = mixins.length;
        while (i--) {
          if (mixins[i]) klass.include(mixins[i].klass);
        }

        methods = {};
        for (name in stubs) {
          if (!klass.prototype[name]) methods[name] = stubs[name];
        }
        klass.include(methods);
        collection[state] = new klass;
      }
      if (module.__tgt__) this.addMethods(stubs, module.__tgt__.klass);
      return collection;
    },

    addMethods: function(state, klass) {
      if (!klass) return;

      var methods = {},
          proto   = klass.prototype,
          method;

      for (method in state) {
        if (proto[method]) continue;
        klass.define(method, this.wrapped(method));
      }
    },

    wrapped: function(method) {
      return function() {
        var func = (this.__state__ || {})[method];
        return func ? func.apply(this, arguments) : this;
      };
    }
  }
});

exports.State = State;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Hash = js.Hash || require('./hash').Hash;

  if (E) exports.JS = exports;
  factory(js, Hash, E ? exports : js);

})(function(JS, Hash, exports) {
'use strict';

var TSort = new JS.Module('TSort', {
  extend: {
    Cyclic: new JS.Class(Error)
  },

  tsort: function() {
    var result = [];
    this.tsortEach(result.push, result);
    return result;
  },

  tsortEach: function(block, context) {
    this.eachStronglyConnectedComponent(function(component) {
      if (component.length === 1)
        block.call(context, component[0]);
      else
        throw new TSort.Cyclic('topological sort failed: ' + component.toString());
    });
  },

  stronglyConnectedComponents: function() {
    var result = [];
    this.eachStronglyConnectedComponent(result.push, result);
    return result;
  },

  eachStronglyConnectedComponent: function(block, context) {
    var idMap = new Hash(),
        stack = [];

    this.tsortEachNode(function(node) {
      if (idMap.hasKey(node)) return;
      this.eachStronglyConnectedComponentFrom(node, idMap, stack, function(child) {
        block.call(context, child);
      });
    }, this);
  },

  eachStronglyConnectedComponentFrom: function(node, idMap, stack, block, context) {
    var nodeId      = idMap.size,
        stackLength = stack.length,
        minimumId   = nodeId,
        component, i;

    idMap.store(node, nodeId);
    stack.push(node);

    this.tsortEachChild(node, function(child) {
      if (idMap.hasKey(child)) {
        var childId = idMap.get(child);
        if (child !== undefined && childId < minimumId) minimumId = childId;
      } else {
        var subMinimumId = this.eachStronglyConnectedComponentFrom(child, idMap, stack, block, context);
        if (subMinimumId < minimumId) minimumId = subMinimumId;
      }
    }, this);

    if (nodeId === minimumId) {
      component = stack.splice(stackLength, stack.length - stackLength);
      i = component.length;
      while (i--) idMap.store(component[i], undefined);
      block.call(context, component);
    }

    return minimumId;
  },

  tsortEachNode: function() {
    throw new JS.NotImplementedError('tsortEachNode');
  },

  tsortEachChild: function() {
    throw new JS.NotImplementedError('tsortEachChild');
  }
});

exports.TSort = TSort;
});

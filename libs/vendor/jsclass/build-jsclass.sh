#!/usr/bin/env bash -x
# see source/package/config.js for module names and dependencies
# run bower install jsclass - in bower.json

cd $(dirname "$0")
THIS_DIR=`pwd`

if [ ! `command -v jsbuild` ]; then
    npm install -g jsbuild
fi

cd ../../bower_components/jsclass/
npm install
npm run build
jsbuild --manifest build/src/loader-browser.js -r build/src/ \
    JS \
    JS.Class \
    JS.Class \
    JS.Command \
    JS.Command.Stack \
    JS.Comparable \
    JS.Console \
    JS.ConstantScope \
    JS.Decorator \
    JS.Deferrable \
    JS.DOM \
    JS.Enumerable \
    JS.Forwardable \
    JS.Hash \
    JS.HashSet \
    JS.Interface \
    JS.Kernel \
    JS.Kernel \
    JS.LinkedList \
    JS.LinkedList.Doubly \
    JS.LinkedList.Doubly.Circular \
    JS.Method \
    JS.MethodChain \
    JS.Module \
    JS.Observable \
    JS.OrderedHash \
    JS.OrderedSet \
    JS.Proxy \
    JS.Proxy.Virtual \
    JS.Range \
    JS.Set \
    JS.Singleton \
    JS.SortedSet \
    JS.StackTrace \
    JS.State \
    JS.TSort \
    > ${THIS_DIR}/jsclass-all.js

echo wrote ${THIS_DIR}/jsclass-all.js

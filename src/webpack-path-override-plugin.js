'use strict';

var pathIsInside = require("path-is-inside");
var fs = require('fs');

module.exports =  class WebpackPathOverridePlugin {
  constructor(pathRegExp, pathReplacement, context, ignoreFile, pathPivot) {
    this.pathRegExp = pathRegExp;
    this.context = context;
    this.ignoreFile = ignoreFile;
    this.pathReplacement = pathReplacement;
    this.pathPivot = pathPivot;
  }

  apply(resolver) {
    resolver.plugin('normal-module-factory', (nmf) => {
      nmf.plugin('before-resolve', (result, callback) => {
        if (!result) return callback();

        // test the request for a path match
        if (this.pathRegExp.test(result.request)
          && pathIsInside(result.context, this.context)
          && !(this.ignoreFile.test(result.request))) {
          const newResult = this.overrideRequestPath(result);
          return callback(null, newResult);
        } else {
          return callback(null, result);
        }
      });
    });
  }

  overrideRequestPath(result) {
    const newResult = {...result};
    const pathRegExp = this.pathRegExp;
    const pathReplacement = this.pathReplacement;

    const {request, dependencies} = newResult;
    let subPath = '';
    if (this.pathPivot) {
      subPath = newResult.context.split(this.pathPivot)[1] + '/';
    }
    newResult.request = request.replace(pathRegExp, pathReplacement + subPath);

    if (dependencies) {
      dependencies.forEach((dependency) => {
        const dependencyRequest = dependency.request;
        if (dependencyRequest) {
          dependency.request = dependencyRequest.replace(pathRegExp, pathReplacement);
        }
      })
    }
    if (fs.existsSync(newResult.request)) {
      return newResult;
    } else {
      console.warn(`\n\nnot found ${newResult.request}\n`);
      console.warn(`using:    ${result.request}\n`);
      return result;
    }

  }
};

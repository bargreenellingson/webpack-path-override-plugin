'use strict';

module.exports =  class WebpackPathOverridePlugin {
  constructor(pathRegExp, pathReplacement) {
    this.pathRegExp = pathRegExp;
    this.pathReplacement = pathReplacement;
  }

  apply(resolver) {
    resolver.plugin('normal-module-factory', (nmf) => {
      nmf.plugin('before-resolve', (result, callback) => {
        if (!result) return callback();

        // test the request for a path match
        if (this.pathRegExp.test(result.request)) {
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
    newResult.request = request.replace(pathRegExp, pathReplacement);

    if (dependencies) {
      dependencies.forEach((dependency) => {
        const dependencyRequest = dependency.request;
        if (dependencyRequest) {
          dependency.request = dependencyRequest.replace(pathRegExp, pathReplacement);
        }
      })
    }

    return newResult;
  }
};

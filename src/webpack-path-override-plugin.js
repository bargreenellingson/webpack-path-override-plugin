'use strict';

var pathIsInside = require("path-is-inside");
var fs = require('fs');
var path = require('path');

module.exports =  class WebpackPathOverridePlugin {
  constructor(mainDir, overrideDir){
    this.mainDir = mainDir;
    this.overrides = []
    this.overrideDir = overrideDir;
  }

  apply(compiler) {
   compiler.hooks.normalModuleFactory.tap('FileOverridePlugin', (fop) => {
      this.options = compiler.options.resolve;
      this.walk(this.overrideDir);
       fop.hooks.beforeResolve.tap('FileOverridePlugin', (result) => {
        if (!result) return;

        let requestFullPath = path.resolve(result.context, result.request);

        // test the request for a path match
        if (pathIsInside(requestFullPath, this.mainDir)) {
          let pathFromPivot = this.getRelativeFromRootDir(result);
          if (this.overrides.includes(pathFromPivot)) {
            result.request = path.resolve(this.overrideDir + '/..', pathFromPivot);
            console.log(result.request);
          }

          // return resolver.doResolve(target, request, null, resolveContext, callback);
          return result;
        } else {
          // return resolver.doResolve(target, request, null, resolveContext, callback);
          return result;
        }
      });
    });
  }

  getRelativeFromRootDir(request) {
    let subPath = '';
    let aliasKeys = Object.keys(this.options.alias);
    if (aliasKeys.includes(request.request.split(path.sep)[0])) {
      return request.request;
    } else {
      subPath = path.relative(this.mainDir, request.context);
      return path.join(subPath, request.request);
    }
  }

  walk = (directoryName) => {
    fs.readdir(directoryName, (e, files) => {
      if (e) {
        console.log('Error: ', e);
        return;
      }
      files.forEach((file) => {
        var fullPath = path.join(directoryName, file);
        fs.stat(fullPath, (e, f) => {
          if (e) {
            console.log('Error: ', e);
            return;
          }
          if (f.isDirectory()) {
            this.walk(fullPath);
          } else {
            let relativePath = path.relative(this.overrideDir + '/..',fullPath)

            // Add file without extension if it's extensions is included in options
            if (this.options.extensions.includes(path.extname(relativePath))) {
              this.overrides.push(path.dirname(relativePath) + '/' + path.basename(relativePath, path.extname(relativePath)));
            }

            this.overrides.push(relativePath);
          }
        });
      });
    });
  };
};

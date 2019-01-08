'use strict';

var pathIsInside = require("path-is-inside");
var fs = require('fs');
var path = require('path');

module.exports =  class WebpackPathOverridePlugin {
  constructor(mainDir, overrideDir){
    this.mainDir = mainDir;
    this.overrideDir = overrideDir;
    this.walk(this.overrideDir);
  }

  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap('FileOverridePlugin', (fop) => {
      fop.hooks.beforeResolve.tap('FileOverridePlugin', (result) => {
        if (!result) return;

        let requestFullPath = path.resolve(result.context, result.request);

        // test the request for a path match
        if (pathIsInside(requestFullPath, this.mainDir)) {
          let pathFromPivot = this.getRelativeFromRootDir(result);
          if (this.overrides.includes(pathFromPivot)) {
            result.request = path.resolve(this.overrideDir + '/..', pathFromPivot);
          }

          return result;
        } else {
          return result;
        }
      });
    });
  }

  getRelativeFromRootDir(result) {
    let subPath = '';
    if (result.request.split(path.sep)[0] === 'src') {
      return result.request;
    } else {
      subPath = path.relative(this.mainDir, result.context);
      return path.join(subPath, result.request);
    }
  }

  overrides = [];

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
            if (path.extname(relativePath) === '.js') {
              relativePath = path.dirname(relativePath) + '/' + path.basename(relativePath, '.js')
            }
            this.overrides.push(relativePath);
          }
        });
      });
    });
  };
};

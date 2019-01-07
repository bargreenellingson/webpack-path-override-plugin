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

  apply(resolver) {
    resolver.plugin('normal-module-factory', (nmf) => {
      nmf.plugin('before-resolve', (result, callback) => {
        if (!result) return callback();

        // test the request for a path match
        if (pathIsInside(result.context, this.mainDir)) {

          let pathFromPivot = this.getRelativeFromRootDir(result);

          if (this.overrides.includes(pathFromPivot)) {
            result.request = path.resolve(this.overrideDir + '/..', pathFromPivot);
          }

          return callback(null, result);
        } else {
          return callback(null, result);
        }
      });
    });
  }

  getRelativeFromRootDir(result) {
    let subPath = '';
    subPath = path.relative(this.mainDir + '/..', result.context);
    return path.join(subPath, result.request);
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
            this.overrides.push(path.relative(this.overrideDir + '/..',fullPath));
          }
        });
      });
    });
  };
};

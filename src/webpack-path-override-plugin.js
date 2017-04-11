"use strict";

import fs from 'fs';
import path from 'path';

module.exports =  class WebpackPathOverridePlugin {

  constructor(pathRegExp, pathReplacement) {
    this.pathRegExp = pathRegExp;
    this.pathReplacement = pathReplacement;
  }

  apply(resolver) {
    const pathRegExp = this.pathRegExp;
    const pathReplacement = this.pathReplacement;

    resolver.plugin("normal-module-factory", (nmf) => {
      nmf.plugin("before-resolve", (result, callback) => {

        if (!result) return callback();
        // test the request for a path match
        if (pathRegExp.test(result.request)) {
          const {request, context} = result;
          const filePath = request.replace(pathRegExp, pathReplacement);
          const fullPath = path.resolve(context, filePath);

          fs.stat(fullPath, (err) => {
            if (err) {
              return callback(err, null);
            }

            return callback(null, {...result, request: filePath});
          });
        } else {
          return callback(null, {...result});
        }
      });
    });
  }
};

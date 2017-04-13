import WebpackPathOverridePlugin from '../src/webpack-path-override-plugin';
import {expect} from 'chai';

describe('WebpackPathOverridePlugin', () => {

  const result = {
    "contextInfo": {
      "issuer": "/src/client/Footer/components/Footer.js"
    },
    "context": "/src/client/Footer/components",
    "request": "../configs/config.market.json",
    "dependencies": [
      {
        "module": null,
        "request": "../configs/config.market.json",
        "userRequest": "../configs/config.market.json",
        "range": [
          4611,
          4642
        ],
        "loc": {
          "start": {
            "line": 75,
            "column": 20
          },
          "end": {
            "line": 75,
            "column": 60
          }
        },
        "optional": false
      }
    ]
  };

  it('should change the request url by the given override path', () => {
    const plugin = new WebpackPathOverridePlugin(/\.market\./, '\.other_market\.');

    const overridePathInfo = plugin.overrideRequestPath(result);

    expect(overridePathInfo.request).to.be.equals('../configs/config.other_market.json');
    overridePathInfo.dependencies.forEach(dependency => {
      expect(dependency.request).to.be.equals('../configs/config.other_market.json');
    });
  });
});

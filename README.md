# webpack-path-override-plugin

#### How to use it?

Suppose you want override import/require path, such as: 


1. `import config from '../../config.market.json'`
2. `const config = require('../../config.market.json')`

to:

1. `import config from '../../config.squarefoot.json'`
2. `const config = require('../../config.squarefoot.json')`

You can add plugin in to webpack config:

```
 plugins: [
    new WebpackPathOverridePlugin(/config\.market\.json$/, 'config\.squarefoot\.json'),
 ],
```

The first param is the path(it can be a regex) that you want to be override.

The second param is the path that be used to override the first param.

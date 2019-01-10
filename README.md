# webpack-file-override-plugin

A webpack plugin that overrides files imported from one directory with files in another. 

## Example

### Directory strucutre

```
/home/user/main_directory

├── src
│   ├── components
│   │   ├── App
│   │   │   └── app.js // File that will be replaced!
│   ├── index.css
│   └── index.js


/home/user/override_directory

├── src
│   ├── components
│   │   ├── App
│   │   │   └── app.js // File that will replace it!

```

You can add plugin in to webpack config:

```
const WebpackFileOverridePlugin = require('webpack-file-override-plugin');

 plugins: [
    new WebpackFileOverridePlugin('/home/user/main_directory', '/home/user/override_directory),
 ],
```

The first param is the path(it can be a regex) that you want to be override.

The second param is the path that be used to override the first param.

## How does it work?

Webpack by default will load files from `main-directory`. The plugin does as follows:

- Scans the override dir and generates an array of files to match (based on webpack's `extensions` array). 
- As files get loaded by webpack, the plugin checks if it's path matches any of the files in the override dir
- If it finds a match, it replaces the request with the path the the file in the override dir.

## Common Patterns

### I want to override a file but it imports a relative path

Create an alias that resolves to the main directory. Import the file with that alias.

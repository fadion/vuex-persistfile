# Vuex Persist File

A Vuex plugin that automatically loads and persists the state to the filesystem. It's built to work in a Node.js environment, but it's especially useful with tools such as Electron or NW.js.

This is a fork of https://github.com/fadion/vuex-persistfile that adds support for cusotm JSON Parser function.


## Installation

```shell
npm install --save vuex-persistfile
```

or

```shell
yarn add vuex-persistfile
```

## Usage

First off, import it.

```javascript
const VuexPersist = require('vuex-persistfile')

// Or with ES6 modules
import VuexPersist from 'vuex-persistfile'
```

Initialize the plugin by passing the only required option: `path`, which should point to the directory where you want the store to be saved.

```javascript
const persist = new VuexPersist({
  path: 'some/directory'
})
```

Finally register it as a Vuex plugin.

```javascript
export const plugins = [persist.subscribe()];
```


You can use it in Vuex and Electron combined, including this code in the index.js:

```javascript


import VuexPersist from 'vuex-persistfile'

import electron from 'electron'
const configDir =  (electron.app || electron.remote.app).getPath('home');

const persist = new VuexPersist({
  path: configDir,
  file: "persist.json",
  dailyBackup: true,
  hourlyBackup: true,
  JSONParser: function (key, value) {
    const reISO = /^(\d{4})-(\d{2})-(\d{2})(T(\d{2}):(\d{2}):(\d{2}(?:\.{0,1}\d*))(?:Z|(\+|-)([\d|:]*))?)?$/;
    if (reISO.exec(value))
      return new Date(value);
    return value;
  }
})
export const plugins = [persist.subscribe()];
```

Now you're all setup! Vuex state will be saved and hydrated automatically.

## Options

### path

The directory where the file will be saved and read from. In Electron it makes sense for it to be something like `app.getPath('userData')`, which points to the platform specific application data directory.

```javascript
const persist = new VuexPersist({
  path: 'some/directory',
  mutations: ['addUser', 'updateUser']
})
```

### file

The file where to save the state in JSON form. It's by default set to `store.json`, so you'll rarely need to set it manually, but you have that option. Basically, the final path will be `path + file`.

### dailyBackup

Default value is false. If set to true, then the persist file creates a copy of the state per day in the same location, with the format 'yyyymmdd + filename'.

### hourlyBackup

Default value is false. If set to true, then the persist file creates a copy of the state per day in the same location, with the format 'yyyymmddhhmm + filename'.

### JSONParser

A function used as second parameter when calling to JSON.parse 
This is useful for custom parsing of JSON, for example for expanding dates saved as strings into objects.

One example of building this function is here: https://github.com/POFerro/json.date-extensions


```javascript
const persist = new VuexPersist({
  path: configDir,
  JSONParser: function (key, value) {
    const reISO = /^(\d{4})-(\d{2})-(\d{2})(T(\d{2}):(\d{2}):(\d{2}(?:\.{0,1}\d*))(?:Z|(\+|-)([\d|:]*))?)?$/;
    if (reISO.exec(value))
      return new Date(value);
    return value;
  }
})
```

### reducer

A function that returns an object literal with the state properties that you want to persist. In most cases you won't need the complete state persisted. Some properties may be single use or just unimportant to persist, so the `reducer` option trims the state tree.

```javascript
const persist = new VuexPersist({
  path: 'some/directory',
  reducer: (state) => {
    return {
      aProp: state.aProp,
      bProp: state.bProp
    }
  }
})
```

### mutations

A whitelist of mutations you want to persist. Any other mutations that aren't present in that list will be discarded and won't trigger a state save.

```javascript
const persist = new VuexPersist({
  path: 'some/directory',
  mutations: ['addUser', 'updateUser']
})
```

You may be keeping a list of mutation types as constants instead of passing them as plain strings. Those can be passed to `mutations` in the same way:

```javascript
import * as types from './store/types'

const persist = new VuexPersist({
  path: 'some/directory',
  mutations: [types.addUser, types.updateUser]
})
```

## Custom Driver

Not sure why you'll need to override the default filesystem driver, but if you feel like it, you can easily create your own. Just create a class that exposes a `write` ,`read`, and `exists` functions. Something like the following:

```javascript
export default class MyAwesomeDriver {
  write(path, data) {
    // write it somewhere
  }

  read(path) {
    // read it from somewhere
  }

  exists(path) {
    // check whether existing store is available
  }
}
```

Then initialize it and pass it as an option to the plugin:

```javascript
const MyAwesomeDriver = MyAwesomeDriver()

const persist = new VuexPersist({
  path: 'some/directory',
  driver: MyAwesomeDriver
})
```

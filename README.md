# Vuex Persist File

[![npm](https://img.shields.io/npm/dt/vuex-persistfile.svg)](https://www.npmjs.com/package/vuex-persistfile)
[![Travis](https://img.shields.io/travis/fadion/vuex-persistfile.svg)](https://travis-ci.org/fadion/vuex-persistfile)
[![Coveralls github](https://img.shields.io/coveralls/github/fadion/vuex-persistfile/master.svg)](https://coveralls.io/github/fadion/vuex-persistfile)
[![license](https://img.shields.io/github/license/fadion/vuex-persistfile.svg)](https://github.com/fadion/vuex-persistfile/blob/master/LICENSE.md)

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



const persist = new VuexPersist({
  path: 'some/directory'
})
```

Now you're all setup! Vuex state will be saved and hydrated automatically.

## Options

### path

The directory where the file will be saved and read from. In Electron it makes sense for it to be something like `app.getPath('userData')`, which points to the platform specific application data directory.

### file

The file where to save the state in JSON form. It's by default set to `store.json`, so you'll rarely need to set it manually, but you have that option. Basically, the final path will be `path + file`.


### JSONParser

A function used as second parameter when calling to JSON.parse 
This is useful for custom parsing of JSON, for example for expanding dates saved as strings into objects.

One example of building this function is here: https://github.com/POFerro/json.date-extensions


```javascript
const persist = new VuexPersist({
  path: 'some/directory',
  mutations: ['addUser', 'updateUser']
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
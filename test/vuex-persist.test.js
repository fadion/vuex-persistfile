const Vue = require('vue')
const Vuex = require('vuex')
const path = require('path')
const VuexPersist = require('../lib/VuexPersist')
const MemoryDriver = require('../lib/MemoryDriver')

Vue.config.productionTip = false
Vue.use(Vuex)

const file = path.join('/test', 'store.json')

test('initialize without a path', () => {
  expect(() => {
    new VuexPersist() // eslint-disable-line no-new
  }).toThrow('Path not set')
})

test('path is setup correctly', () => {
  let vp = new VuexPersist({
    path: '/test/path',
    file: 'test.json'
  })

  expect(vp.options.path).toBe(path.join('/test/path', 'test.json'))
})

test('dailyBackup property is setup correctly', () => {
  let vp = new VuexPersist({
    path: '/test/path'
  })

  expect(vp.options.dailyBackup).toBe(false);


  let vp2 = new VuexPersist({
    dailyBackup: true,
    path: '/test/path'
  })

  expect(vp2.options.dailyBackup).toBe(true);


  let vp3 = new VuexPersist({
    dailyBackup: false,
    path: '/test/path'
  })

  expect(vp2.options.dailyBackup).toBe(false);
})

test('JSONParser function is setup correctly', () => {
  let jsonParser = function() {};
  let vp = new VuexPersist({
    path: '/test/path',
    JSONParser: jsonParser
  })

  expect(vp.options.JSONParser).toBe(jsonParser)
})

test('JSONParser function is called when parsing', () => {

  let actual = { a: 1, b: 2 }

  let driver = new MemoryDriver()
  driver.write(file, JSON.stringify(actual))

  const jsonParser = jest.fn();

  let store = new Vuex.Store({
    state: {},
    plugins: [new VuexPersist({
      path: '/test',
      JSONParser: jsonParser,
      driver
    }).subscribe()]
  })

  expect(jsonParser).toHaveBeenCalled()

})

test('state is replaced', () => {
  let expected = { a: 1, b: 2 }
  let driver = new MemoryDriver()
  driver.write(file, JSON.stringify(expected))

  let store = new Vuex.Store({
    plugins: [new VuexPersist({
      path: '/test',
      driver
    }).subscribe()]
  })

  expect(store.state).toEqual(expected)
})

test("state is not replaced when file doesn't exist", () => {
  let driver = new MemoryDriver()
  driver.write('file/inexistant', JSON.stringify({ a: 1 }))

  let store = new Vuex.Store({
    plugins: [new VuexPersist({
      path: '/test',
      driver
    }).subscribe()]
  })

  expect(store.state).toEqual({})
})

test('state is not replaced when json is invalid', () => {
  let driver = new MemoryDriver()
  driver.write(file, '{ a }')

  let store = new Vuex.Store({
    plugins: [new VuexPersist({
      path: '/test',
      driver
    }).subscribe()]
  })

  expect(store.state).toEqual({})
})

test('state is merged', () => {
  let actual = { a: 1, b: 2 }
  let expected = { a: 1, b: 2, c: 3 }

  let driver = new MemoryDriver()
  driver.write(file, JSON.stringify(actual))

  let store = new Vuex.Store({
    state: { b: 5, c: 3 },
    plugins: [new VuexPersist({
      path: '/test',
      driver
    }).subscribe()]
  })

  expect(store.state).toEqual(expected)
})

test('state is persisted', () => {
  let expected = { a: 1 }
  let driver = new MemoryDriver()
  let store = new Vuex.Store({
    plugins: [new VuexPersist({
      path: '/test',
      driver
    }).subscribe()]
  })

  store._subscribers[0]('change', { a: 1 })

  expect(driver.read(file)).toBe(JSON.stringify(expected))
})

test('state is partially persisted with reducer', () => {
  let actual = { a: 1, b: 2, c: 3 }
  let expected = { a: 1 }
  let driver = new MemoryDriver()
  let store = new Vuex.Store({
    plugins: [new VuexPersist({
      path: '/test',
      reducer: (state) => {
        return { a: state.a }
      },
      driver
    }).subscribe()]
  })

  store._subscribers[0]('change', actual)

  expect(driver.read(file)).toBe(JSON.stringify(expected))
})

test('state is partially persisted with mutations', () => {
  let expected = { a: 10, b: 5 }
  let driver = new MemoryDriver()
  let store = new Vuex.Store({
    state: { a: 1, b: 5 },
    mutations: {
      updateA(state) {
        state.a = 10
      },
      updateB(state) {
        state.b = 100
      }
    },
    plugins: [new VuexPersist({
      path: '/test',
      mutations: ['updateA'],
      driver
    }).subscribe()]
  })

  store.commit('updateA')
  store.commit('updateB')

  expect(driver.read(file)).toBe(JSON.stringify(expected))
})

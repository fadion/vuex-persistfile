import path from 'path'
import merge from 'deepmerge'
import FsDriver from './FsDriver'

export default class VuexPersist {
  /**
   * Constructor.
   * @param {object} options
   */
  constructor(options) {
    this.options = Object.assign({
      path: null,
      file: 'store.json',
      reducer: null,
      mutations: [],
      driver: null
    }, options)

    // Path optioon is required, otherwise there's
    // no file to write to.
    if (!this.options.path) throw new Error('Path not set')

    this.driver = options.driver || new FsDriver()
    this.options.path = path.join(this.options.path, this.options.file)
  }

  /**
   * Persist the state to file.
   * @param {object} state
   */
  saveState(state) {
    this.driver.write(
      this.options.path,
      JSON.stringify(this.options.reducer ? this.options.reducer(state) : state)
    )
  }

  /**
   * Load the state from file.
   * @param {object} store
   */
  loadState(store) {
    try {
      let data = this.driver.read(this.options.path)
      store.replaceState(merge(store.state, JSON.parse(data)))
    } catch (err) {}
  }

  /**
   * Subscribe to the Vuex store.
   * @returns {function}
   */
  subscribe() {
    return (store) => {
      this.loadState(store)

      store.subscribe((mutation, state) => {
        if (this._mutation(mutation.type)) {
          this.saveState(state)
        }
      })
    }
  }

  /**
   * Checks if a mutation is in the list of alowed
   * mutations.
   * @param {string} type
   * @returns {boolean}
   * @private
   */
  _mutation(type) {
    return !this.options.mutations.length ||
      this.options.mutations.includes(type)
  }
}

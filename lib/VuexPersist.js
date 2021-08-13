const path = require('path')
const merge = require('deepmerge')
const FsDriver = require('./FsDriver')

class VuexPersist {
  /**
   * Constructor.
   * @param {object} options
   */
  constructor(options) {
    this.options = Object.assign({
      path: null,
      get backupPath() {
        if(this.dailyBackup) {
          const date=new Date();
          const d = date.getDate();
          const m = date.getMonth() + 1;
          const y = date.getFullYear();
          return (path.join(this.path, `${'' + y + (m<=9 ? '0' + m : m) + (d <= 9 ? '0' + d : d)}-${this.file}`));
        }
        if(this.hourlyBackup) {
          const date=new Date();
          const d = date.getDate();
          const m = date.getMonth() + 1;
          const y = date.getFullYear();
          const hour = date.getHours();
          return (path.join(this.path,
            `${'' + y + (m<=9 ? '0' + m : m) + (d <= 9 ? '0' + d : d)}${''+ (hour<=9 ? '0' + hour : hour) +"00"}-${this.file}`));
        }
        return null;
      },
      file: 'store.json',
      reducer: null,
      mutations: [],
      driver: null,
      JSONParser: null,
      dailyBackup: false,
      hourlyBackup: false,
    }, options)

    // Path option is required, otherwise there's
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
    );
    if(this.options.backupPath)
      this.driver.write(
        this.options.backupPath,
        JSON.stringify(this.options.reducer ? this.options.reducer(state) : state)
      );
  }

  /**
   * Load the state from file.
   * @param {object} store
   */
  loadState(store) {
    try {
      let data = this.driver.read(this.options.path)

      let parsed

      try {
        parsed = JSON.parse(data, this.options.JSONParser)
      } catch (e) {}

      if (parsed) {
        store.replaceState(merge(store.state, JSON.parse(data, this.options.JSONParser)))
      }
    } catch (err) {
      console.error('[vuex-persistfile] Unable to restore state')
      throw err
    }
  }

  /**
   * Check and load existing Vuex store.
   * @param {object} store
   * @private
   */
  initialize(store) {
    if (this.driver.exists(this.options.path)) {
      this.loadState(store)
    }
  }

  /**
   * Subscribe to the Vuex store.
   * @returns {function}
   */
  subscribe() {
    return (store) => {
      this.initialize(store)

      store.subscribe((mutation, state) => {
        if (this._mutation(mutation.type)) {
          this.saveState(state)
        }
      })
    }
  }

  /**
   * Checks if a mutation is in the list of allowed
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

module.exports = VuexPersist

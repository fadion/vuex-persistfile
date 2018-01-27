class MemoryDriver {
  constructor() {
    this.memory = {}
  }

  write(path, data) {
    this.memory[path] = data
  }

  read(path) {
    return this.memory[path]
  }
}

module.exports = MemoryDriver

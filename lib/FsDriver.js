const fs = require('fs')

class FsDriver {
  write(path, data) {
    fs.writeFileSync(path, data, 'utf8')
  }

  read(path) {
    return fs.readFileSync(path, 'utf8')
  }

  exists(path) {
    return fs.existsSync(path)
  }
}

module.exports = FsDriver

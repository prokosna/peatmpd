import fs from 'fs'

class Db {
  constructor () {
    this.path = './data.json'
  }

  readSync () {
    if (fs.existsSync(this.path)) {
      return fs.readFileSync(this.path, { encoding: 'utf8' })
    }
    return null
  }
  write (str) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.path, str, err => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }
}

const db = new Db()
export default db

import mpd from 'mpd'

const cmd = mpd.cmd

class MpdClient {
  constructor () {
    this.client = null
    this.isConnected = false
  }

  /**
   *
   * @param {*} host host
   * @param {*} port port
   * @param {*} callbacks callback methods including { onSystem, onError, onEnd }
   */
  async connect (host, port, callbacks) {
    return new Promise((resolve, reject) => {
      this.client = mpd.connect({
        host,
        port
      })

      let isFirst = true

      this.client.on('ready', () => {
        this.isConnected = true
        resolve()
      })

      this.client.on('system', systemName => {
        if (callbacks && typeof callbacks.onSystem === 'function') {
          callbacks.onSystem(systemName)
        }
      })

      this.client.on('error', err => {
        if (callbacks && typeof callbacks.onError === 'function') {
          callbacks.onError(err)
        }
        if (isFirst) {
          isFirst = false
          reject(err)
        }
      })

      this.client.on('end', () => {
        if (callbacks && typeof callbacks.onEnd === 'function') {
          callbacks.onEnd()
        }
      })
    })
  }

  async executeCommand (command, ...args) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Server is not connected.'))
        return
      }

      this.client.sendCommand(cmd(command, args), (err, msg) => {
        if (err) {
          reject(new Error(`Command failed: ${err.toString()}`))
          return
        }

        resolve(msg)
      })
    })
  }
}

const client = new MpdClient()
export default client

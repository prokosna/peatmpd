import { reply } from '../../../const/mpd/channel-types'

export function ipcSend (cmd, ...args) {
  return new Promise((resolve, reject) => {
    window.ipcRenderer.once(reply(cmd), (_, v) => {
      if (v && v.isError) {
        reject(Error(v.message))
        return
      }
      resolve(v)
    })
    window.ipcRenderer.send(cmd, ...args)
  })
}

export function ipcSendSync (cmd, ...args) {
  return window.ipcRenderer.sendSync(cmd, ...args)
}

export function ipcReceive (cmd, callback) {
  window.ipcRenderer.on(cmd, (_, v) => {
    callback(v)
  })
}

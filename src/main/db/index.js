import { ipcMain } from 'electron'
import client from './client'

import {
  reply,
  READ_FROM_DB_SYNC,
  WRITE_TO_DB
} from '../../const/mpd/channel-types'
import { wrap } from '../mpd/utils'

export function initialize () {
  ipcMain.on(READ_FROM_DB_SYNC, event => {
    event.returnValue = client.readSync()
  })

  ipcMain.on(WRITE_TO_DB, async (event, data) => {
    const ret = await client.write(data).catch(err => err)
    event.sender.send(reply(WRITE_TO_DB), wrap(ret))
  })
}

export function reply (cmd) {
  return `${cmd}_REPLY`
}
export const CONNECT = 'MPD_CONNECT'
export const FETCH_META_UNIQUE_VALUES = 'FETCH_META_UNIQUE_VALUES'
export const FETCH_SONGS = 'FETCH_SONGS'
export const FETCH_META_TAGS = 'FETCH_META_TAGS'
export const FETCH_PLAYLISTS = 'FETCH_PLAYLISTS'
export const FETCH_PLAYLIST_SONGS = 'FETCH_PLAYLIST_SONGS'
export const CLEAR_PLAYLIST = 'CLEAR_PLAYLIST'
export const DELETE_PLAYLIST = 'DELETE_PLAYLIST'
export const MOVE_SONG_IN_PLAYLIST = 'MOVE_SONG_IN_PLAYLIST'
export const DELETE_SONGS_IN_PLAYLIST = 'DELETE_SONGS_IN_PLAYLIST'
export const ADD_SONGS_TO_PLAYLIST = 'ADD_SONGS_TO_PLAYLIST'
export const FETCH_PLAYING_QUEUE_SONGS = 'FETCH_PLAYING_QUEUE_SONGS'
export const FETCH_PLAYING_SONG_STATUS = 'FETCH_PLAYING_SONG_STATUS'
export const CLEAR_PLAYING_QUEUE = 'CLEAR_PLAYING_QUEUE'
export const MOVE_SONG_IN_PLAYING_QUEUE = 'MOVE_SONG_IN_PLAYING_QUEUE'
export const DELETE_SONGS_IN_PLAYING_QUEUE = 'DELETE_SONGS_IN_PLAYING_QUEUE'
export const ADD_SONGS_TO_PLAYING_QUEUE = 'ADD_SONGS_TO_PLAYING_QUEUE'
export const SAVE_PLAYLING_QUEUE_AS_PLAYLIST = 'SAVE_PLAYLING_QUEUE_AS_PLAYLIST'

export const SET_RANDOM = 'SET_RANDOM'
export const SET_REPEAT = 'SET_REPEAT'
export const SET_VOLUME = 'SET_VOLUME'

export const NEXT = 'NEXT'
export const PAUSE = 'PAUSE'
export const PLAY = 'PLAY'
export const PREVIOUS = 'PREVEOUS'
export const SEEK = 'SEEK'
export const STOP = 'STOP'

export const READ_FROM_DB_SYNC = 'READ_FROM_DB_SYNC'
export const WRITE_TO_DB = 'WRITE_TO_DB'
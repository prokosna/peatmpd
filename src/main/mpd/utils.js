import { EQUAL } from '../../const/mpd/operators'

export function sortCaseInsensitive (list, sortKey = null, desc = false) {
  return list.sort((a, b) => {
    let aa = null
    let bb = null

    if (!sortKey) {
      aa = a.toString().toLowerCase()
      bb = b.toString().toLowerCase()
    } else {
      aa = a[sortKey].toString().toLowerCase()
      bb = b[sortKey].toString().toLowerCase()
    }

    if (desc) {
      return aa < bb ? 1 : bb < aa ? -1 : 0
    } else {
      return aa > bb ? 1 : bb > aa ? -1 : 0
    }
  })
}

export function parseResultToJson (result, groupingTag) {
  if (groupingTag) {
    const lines = result.split(/\n/)

    const songs = []
    let song = {}

    lines.forEach(line => {
      if (line.toLowerCase().startsWith(groupingTag.toLowerCase())) {
        if (song && Object.keys(song).length > 0) {
          songs.push(song)
        }
        song = {}
      }

      if (line.includes(':')) {
        const parts = line.split(':')
        const metaTag = parts[0]
        const metaValue = parts
          .slice(1)
          .join(':')
          .trim()
        if (metaValue) {
          song[metaTag] = metaValue
        }
      }
    })

    if (song && Object.keys(song).length > 0) {
      songs.push(song)
    }

    return songs
  } else {
    const lines = result.split(/\n/)
    const value = {}

    lines.forEach(line => {
      if (line.includes(':')) {
        const parts = line.split(':')
        const metaTag = parts[0]
        const metaValue = parts
          .slice(1)
          .join(':')
          .trim()
        if (metaValue) {
          value[metaTag] = metaValue
        }
      }
    })

    return value
  }
}

export function makeFilterFrom (conditions, anyWhenEmpty) {
  // NOTE: 0.21.0 and later, filter should be something like const filter = `(${conditions.map(a => `(${a})`).join(' AND ')})`
  if (!Array.isArray(conditions)) {
    return anyWhenEmpty ? ['any', ''] : []
  }

  let filters = conditions
    .map(a => {
      if (a.op !== EQUAL) {
        return null
      }
      return [a.metaTag, a.metaValue]
    })
    .filter(a => a)
    .flatMap(a => a)

  if (anyWhenEmpty) {
    if (filters.length <= 1) {
      filters = ['any', '']
    }
  }

  return filters
}

export function wrap (v) {
  if (v instanceof Error) {
    return {
      isError: true,
      message: v.message
    }
  }
  return v
}

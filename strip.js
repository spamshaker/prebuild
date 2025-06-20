import util from './util.js'

export function strip (files, cb) {
  // TODO no support on windows, noop
  const platform = util.platform()
  if (platform === 'win32') return process.nextTick(cb)

  stripFiles(files, platform, cb)
}

export function stripFiles (files, platform, cb) {
  if (files.length === 0) {
    process.nextTick(cb)
    return
  }

  util.spawn(process.env.STRIP || 'strip', stripArgs(platform, files[0]), function (err) {
    if (err) {
      cb(err)
      return
    }

    stripFiles(files.slice(1), platform, cb)
  })
}

export function stripArgs (platform, file) {
  if (platform === 'darwin') return [file, '-Sx']
  if (['freebsd', 'linux'].includes(platform)) return [file, '--strip-all']
  // TODO find out what args to use for other platforms, e.g. 'sunos'
  return []
}

export default strip

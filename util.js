import path from 'path'
import cp from 'child_process'
import execSpawn from 'execspawn'
import error from './error.js'

export function getTarPath (opts, abi) {
  return path.join('prebuilds', [
    opts.pkg.name,
    '-v', opts.pkg.version,
    '-', opts.runtime || 'node',
    '-v', abi,
    '-', opts.platform,
    opts.libc,
    '-', opts.arch,
    '.tar.gz'
  ].join(''))
}

export function spawn (cmd, args, cb) {
  return cp.spawn(cmd, args).on('exit', function (code) {
    if (code === 0) return cb()
    cb(error.spawnFailed(cmd, args, code))
  })
}

export function fork (file, cb) {
  return cp.fork(file).on('exit', function (code) {
    if (code === 0) return cb()
    cb(error.spawnFailed(file, code))
  })
}

export function exec (cmd, cb) {
  return execSpawn(cmd, { stdio: 'inherit' }).on('exit', function (code) {
    if (code === 0) return cb()
    cb(error.spawnFailed(cmd, [], code))
  })
}

export function run (item, cb) {
  if (path.extname(item) === '.js') {
    return fork(item, cb)
  } else {
    return exec(item, cb)
  }
}

export function platform () {
  return process.platform
}

export function releaseFolder (opts, version) {
  const type = (opts.debug ? 'Debug' : 'Release')
  const binary = opts.pkg.binary
  if (opts.backend === 'node-ninja') {
    return (binary && binary.module_path) || 'build/' + version + '/' + type
  } else {
    return (binary && binary.module_path) || 'build/' + type
  }
}

export default {
  getTarPath,
  spawn,
  fork,
  exec,
  run,
  platform,
  releaseFolder
}

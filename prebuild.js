import fs from 'fs'
import waterfall from 'run-waterfall'
import {
  getAbi,
  getTarget
} from 'node-abi'
import napi from 'napi-build-utils'
import { getTarPath } from './util.js'
import build from './build.js'
import strip from './strip.js'
import pack from './pack.js'

export function prebuild (opts, target, runtime, callback) {
  const pkg = opts.pkg
  const buildLog = opts.buildLog || function () {}
  opts.target = target
  opts.runtime = runtime

  if (opts.runtime === 'node-webkit') {
    opts.backend = 'nw-gyp'
  }

  let buildLogMessage = 'Preparing to prebuild ' + pkg.name + '@' + pkg.version + ' for ' + runtime + ' ' + target + ' on ' + opts.platform + '-' + opts.arch + ' using ' + opts.backend
  if (opts.libc && opts.libc.length > 0) buildLogMessage += 'using libc ' + opts.libc
  buildLog(buildLogMessage)

  // --target can be target or abi
  if (!napi.isNapiRuntime(runtime)) target = getTarget(target, runtime)
  const abi = getAbi(target, runtime)

  const tarPath = getTarPath(opts, abi)
  fs.stat(tarPath, function (err, st) {
    if (!err && !opts.force) {
      buildLog(tarPath + ' exists, skipping build')
      return callback(null, tarPath)
    }
    const tasks = [
      function (cb) {
        build(opts, target, function (err, filenames) {
          if (err) return cb(err)
          cb(null, filenames)
        })
      },
      function (filenames, cb) {
        buildLog('Packing ' + filenames.join(', ') + ' into ' + tarPath)
        pack(filenames, tarPath, function (err) {
          if (err) return cb(err)
          buildLog('Prebuild written to ' + tarPath)
          cb(null, tarPath)
        })
      }
    ]

    if (opts.strip) {
      tasks.splice(1, 0, function (filenames, cb) {
        buildLog('Stripping debug information from ' + filenames.join(', '))
        strip(filenames, function (err) {
          if (err) return cb(err)
          cb(null, filenames)
        })
      })
    }

    waterfall(tasks, callback)
  })
}

export default prebuild

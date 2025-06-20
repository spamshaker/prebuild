import { spawn } from 'child_process'
import npmWhich from 'npm-which'

const which = npmWhich(process.cwd())

function runCmake (opts, target, cb) {
  which('cmake-js', function (err, cmakeJsPath) {
    if (err) return cb(err)

    const args = ['rebuild']
    if (opts.runtime !== 'napi') args.push('--runtime-version=' + target)
    args.push('--arch=' + opts.arch)
    if (opts.runtime !== 'napi') args.push('--runtime=' + opts.runtime)
    if (opts.runtime === 'napi' && target) {
      args.push('--CDnapi_build_version=' + target)
    }

    if (opts.debug) args.push('--debug')

    let foundRest = false
    for (const arg of opts.argv) {
      if (arg === '--') {
        foundRest = true
      } else if (foundRest) {
        args.push(arg)
      }
    }

    const proc = spawn(cmakeJsPath, args, process.platform === 'win32' ? { shell: true } : undefined)
    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stderr)
    proc.on('exit', function (code) {
      if (code !== 0) {
        return cb(new Error('Failed to build cmake with exit code ' + code))
      }
      cb()
    })
  })
}

export default runCmake

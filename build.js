import noop from 'noop-logger'
import util, { releaseFolder } from './util.js'
import gypBuild from './gypbuild.js'
import cmakeBuild from './cmakebuild.js'
import collectArtifacts from './collect-artifacts.js'

export function build (opts, version, cb) {
  const log = opts.log || noop

  const run = function () {
    const release = releaseFolder(opts, version)
    const build = opts.backend === 'cmake-js' ? cmakeBuild : gypBuild

    log.verbose('starting build process ' + opts.backend)
    build(opts, version, function (err) {
      if (err) return cb(err)
      log.verbose('completed building ' + opts.backend)

      if (!opts.prepack) return collectArtifacts(release, opts, cb)

      log.verbose('executing prepack')
      util.run(opts.prepack, function (err) {
        if (err) return cb(err)
        collectArtifacts(release, opts, cb)
      })
    })
  }

  if (!opts.preinstall) return run()

  log.verbose('executing preinstall')
  util.run(opts.preinstall, function (err) {
    if (err) return cb(err)
    run()
  })
}

export default build

#!/usr/bin/env node

import path from 'path'
import log from 'npmlog'
import fs from 'fs'
import eachSeries from 'each-series-async'
import napi from 'napi-build-utils'
import { glob } from 'glob'
import rc from './rc.js'
import prebuild from './prebuild.js'
import upload from './upload.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require(path.join(process.cwd(), '/package.json'))
if (rc.version) {
  console.log(pkg.version)
  process.exit(0)
}

if (rc.path) process.chdir(rc.path)

log.heading = 'prebuild'
if (rc.verbose) {
  log.level = 'verbose'
}

if (rc.help) {
  console.error(fs.readFileSync(path.join(import.meta.dirname, 'help.txt'), 'utf-8'))
  process.exit(0)
}

log.info('begin', 'Prebuild version', pkg.version)

// nvm! do not mess with headers? kkthx!
delete process.env.NVM_IOJS_ORG_MIRROR
delete process.env.NVM_NODEJS_ORG_MIRROR

const buildLog = log.info.bind(log, 'build')
const opts = Object.assign({}, rc, { pkg, log, buildLog, argv: process.argv })

if (napi.isNapiRuntime(rc.runtime)) napi.logMissingNapiVersions(rc.target, rc.prebuild, log)

if (opts['upload-all']) {
  glob('prebuilds/**/*', { nodir: true }).then(uploadFiles, onBuildError)
} else {
  const files = []
  eachSeries(opts.prebuild, function (target, next) {
    prebuild(opts, target.target, target.runtime, function (err, tarGz) {
      if (err) return next(err)
      files.push(tarGz)
      next()
    })
  }, function (err) {
    if (err) return onBuildError(err)
    if (!opts.upload) return
    uploadFiles(files)
  })
}

function uploadFiles (files) {
  // NOTE(robinwassen): Only include unique files
  // See: https://github.com/prebuild/prebuild/issues/221
  const uniqueFiles = files.filter(function (file, index) {
    return files.indexOf(file) === index
  })

  buildLog('Uploading ' + uniqueFiles.length + ' prebuilds(s) to GitHub releases')
  upload(Object.assign({}, opts, { files: uniqueFiles }), function (err, result) {
    if (err) return onBuildError(err)
    buildLog('Found ' + result.old.length + ' prebuild(s) on Github')
    if (result.old.length) {
      result.old.forEach(function (build) {
        buildLog('-> ' + build)
      })
    }
    buildLog('Uploaded ' + result.new.length + ' new prebuild(s) to GitHub')
    if (result.new.length) {
      result.new.forEach(function (build) {
        buildLog('-> ' + build)
      })
    }
  })
}

function onBuildError (err) {
  if (!err) return
  log.error('build', err.stack)
  process.exit(2)
}

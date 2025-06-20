import minimist from 'minimist'
import { supportedTargets as targets } from 'node-abi'
import detectLibc from 'detect-libc'
import napi from 'napi-build-utils'
import rc0 from 'rc'

const libc = process.env.LIBC || (detectLibc.isNonGlibcLinuxSync() && detectLibc.familySync()) || ''

const rc = rc0('prebuild', {
  target: process.versions.node,
  runtime: 'node',
  arch: process.arch,
  libc,
  platform: process.platform,
  all: false,
  force: false,
  debug: false,
  verbose: false,
  path: '.',
  backend: 'node-gyp',
  format: false,
  'include-regex': '\\.node$',
  'tag-prefix': 'v',
  prerelease: false
}, minimist(process.argv, {
  alias: {
    target: 't',
    runtime: 'r',
    help: 'h',
    arch: 'a',
    path: 'p',
    force: 'f',
    version: 'v',
    upload: 'u',
    preinstall: 'i',
    prepack: 'c'
  },
  string: [
    'target'
  ]
}))

if (rc.path === true) {
  delete rc.path
}

if (napi.isNapiRuntime(rc.runtime) && rc.target === process.versions.node) {
  if (rc.all === true) {
    rc.target = napi.getNapiBuildVersions()
  } else {
    rc.target = napi.getBestNapiBuildVersion()
  }
}

if (rc.target) {
  const arr = [].concat(rc.target)
  rc.prebuild = []
  let k = 0
  const len = arr.length
  for (; k < len; k++) {
    if (!napi.isNapiRuntime(rc.runtime) || napi.isSupportedVersion(arr[k])) {
      rc.prebuild.push({
        runtime: rc.runtime,
        target: arr[k]
      })
    }
  }
}

if (rc.all === true && !napi.isNapiRuntime(rc.runtime)) {
  delete rc.prebuild
  rc.prebuild = targets
}

if (rc['upload-all']) {
  rc.upload = rc['upload-all']
}

rc['include-regex'] = new RegExp(rc['include-regex'], 'i')

if (process.argv[1] === import.meta.filename) {
  console.log(JSON.stringify(rc, null, 2))
}

export default rc

import test from 'tape'
import path from 'path'
import { exec } from 'child_process'
import { supportedTargets as targets } from 'node-abi'

test('custom config and aliases', function (t) {
  const args = [
    '--arch ARCH',
    '--platform PLATFORM',
    '--upload t00k3n',
    '--debug',
    '--force',
    '--version',
    '--help',
    '--path ../some/other/path',
    '--preinstall somescript.js',
    '--prepack someotherscript.js',
    '--target 13',
    '--runtime electron',
    '--libc testlibc',
    '--format msvs',
    '--prerelease'
  ]
  runRc(t, args.join(' '), {}, function (rc) {
    t.equal(rc.all, false, 'default is not building all targets')
    t.equal(rc.arch, 'ARCH', 'correct arch')
    t.equal(rc.arch, rc.a, 'arch alias')
    t.equal(rc.platform, 'PLATFORM', 'correct platform')
    t.equal(rc.upload, 't00k3n', 'upload token set')
    t.equal(rc.upload, rc.u, 'upload alias')
    t.equal(rc.debug, true, 'debug is set')
    t.equal(rc.force, true, 'force is set')
    t.equal(rc.force, rc.f, 'force alias')
    t.equal(rc.version, true, 'version is set')
    t.equal(rc.version, rc.v, 'version alias')
    t.equal(rc.help, true, 'help is set')
    t.equal(rc.help, rc.h, 'help alias')
    t.equal(rc.path, '../some/other/path', 'correct path')
    t.equal(rc.path, rc.p, 'path alias')
    t.equal(rc.preinstall, 'somescript.js', 'correct preinstall script')
    t.equal(rc.preinstall, rc.i, 'preinstall alias')
    t.equal(rc.prepack, 'someotherscript.js', 'correct prepack script')
    t.equal(rc.prepack, rc.c, 'prepack alias')
    t.equal(rc.target, '13', 'correct target')
    t.equal(rc.target, rc.t, 'target alias')
    t.equal(rc.runtime, 'electron', 'correct runtime')
    t.equal(rc.runtime, rc.r, 'runtime alias')
    t.equal(rc.libc, 'testlibc', 'libc family')
    t.equal(rc.format, 'msvs', 'correct node-gyp format')
    t.equal(rc['tag-prefix'], 'v', 'correct default tag prefix')
    t.equal(rc.prerelease, true, 'prerelease is set')
    t.end()
  })
})

test('using --all will build for all targets', function (t) {
  const args = [
    '--target vX.Y.Z',
    '--target vZ.Y.X',
    '--all'
  ]
  runRc(t, args.join(' '), {}, function (rc) {
    t.equal(rc.all, true, 'should be true')
    t.deepEqual(rc.prebuild, targets, 'targets picked from targets.js')
    t.end()
  })
})

test('using --prebuild respects runtime', function (t) {
  const args = [
    '--target X.Y.Z',
    '--target Z.Y.X',
    '--runtime electron'
  ]
  runRc(t, args.join(' '), {}, function (rc) {
    const fixture = [
      { runtime: 'electron', target: 'X.Y.Z' },
      { runtime: 'electron', target: 'Z.Y.X' }
    ]
    t.deepEqual(rc.prebuild, fixture, 'runtime parsed')
    t.end()
  })
})

test('using --upload-all will set token for --upload', function (t) {
  const args = ['--upload-all t00k3n']
  runRc(t, args.join(' '), {}, function (rc) {
    t.equal(rc.upload, 't00k3n', 'upload should have the same token set')
    t.end()
  })
})

test('using --tag-prefix will set the tag prefix', function (t) {
  const args = ['--tag-prefix @scoped/package@']
  runRc(t, args.join(' '), {}, function (rc) {
    t.equal(rc['tag-prefix'], '@scoped/package@', 'tag prefix should be set')
    t.end()
  })
})

function runRc (t, args, env, cb) {
  const cmd = 'node ' + path.resolve(import.meta.dirname, '..', 'rc.js') + ' ' + args
  env = Object.assign({}, process.env, env)
  exec(cmd, { env }, function (err, stdout, stderr) {
    t.error(err, 'no error')
    t.equal(stderr.length, 0, 'no stderr')
    let result
    try {
      result = JSON.parse(stdout.toString())
      t.pass('json parsed correctly')
    } catch (e) {
      t.fail(e.message)
    }
    cb(result)
  })
}

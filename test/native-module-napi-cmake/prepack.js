import fs from 'fs'
import assert from 'assert'

assert.strictEqual(fs.existsSync('./build/Release/prebuild-napi-test-cmake.node'), true)

import fs from 'fs'
import assert from 'assert'

assert.strictEqual(fs.existsSync('./build/Release/native.node'), true)

export function noBuild (folder) {
  return new Error('Could not find build in ' + folder)
}

export function noRepository () {
  return new Error('package.json is missing a repository field')
}

export function spawnFailed (cmd, args, code) {
  return new Error(cmd + ' ' + args.join(' ') + ' failed with exit code ' + code)
}

export default {
  noBuild,
  noRepository,
  spawnFailed
}

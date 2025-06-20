const { hello } = await import('./build/Release/prebuild-napi-test-cmake.node')

export default { hello }

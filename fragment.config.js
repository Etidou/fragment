const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

export default {
  vite: {
    assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr'],
    worker: {
      format: 'es'
    }
  }
}
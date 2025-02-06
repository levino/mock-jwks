import 'node-forge'

declare module 'node-forge' {
  namespace pki {
    // biome-ignore lint/suspicious/noExplicitAny: Not important for our project
    function certificateToAsn1(...args: any[]): any
  }
}

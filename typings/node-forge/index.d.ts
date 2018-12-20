import 'node-forge'

declare module 'node-forge' {
  namespace pki {
    function certificateToAsn1(...args: any[]): any
  }
}

import * as interf from './interfaces'
import * as querystring from 'querystring'
import * as url from 'url'

export function getUrl(endpoint: string, config: interf.CLIConfig, qsparams?: any): string {
  let urlformatoptions: any = {
    protocol: config.apiScheme,
    host: config.apiHost,
  }
  switch (endpoint) {
  case 'channels':
    urlformatoptions.pathname = config.apiEndpointChannels
    break
  case 'items':
    urlformatoptions.pathname = config.apiEndpointItems
    break
  default:
    console.error('Bad enpoint name')
  }
  let urlstring = url.format(urlformatoptions)
  const myURL = new URL(urlstring)
  if (qsparams) {
    myURL.search = querystring.stringify(qsparams)
  }
  return myURL.href
}
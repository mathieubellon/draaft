import * as _ from 'lodash'
import * as interf from './interfaces'
import * as querystring from 'querystring'
import * as url from 'url'

import { axiosInstance } from './axios'

export function getChannels(config: interf.CLIConfig): Promise<void> {
  let urlstring = url.format({
    protocol: config.apiScheme,
    host: config.apiHost,
    pathname: config.apiEndpointChannels,
  })
  const myURL = new URL(urlstring)
  return axiosInstance.get(myURL.href)
}

export function getItems(config: interf.CLIConfig, qsparams?: any): Promise<void> {
  let urlstring = url.format({
    protocol: config.apiScheme,
    host: config.apiHost,
    pathname: config.apiEndpointItems,
  })
  const myURL = new URL(urlstring)
  myURL.search = querystring.stringify(qsparams)
  return axiosInstance.get(myURL.href)
}
import * as querystring from 'querystring'
import * as url from 'url'
import axios from 'axios'
//import {CLIError} from '@oclif/errors'
import * as path from 'path'
import {DraaftConfiguration} from './types'

function getUrl(endpoint: string, config: DraaftConfiguration, qsparams?: any): string {
  let urlFormatOptions: any = {
    protocol: config.apiScheme,
    host: config.apiHost,
  }
  urlFormatOptions.pathname = path.join(config.apiBasePath, endpoint)
  let urlString = url.format(urlFormatOptions)
  const myURL = new URL(urlString)
  if (qsparams) {
    myURL.search = querystring.stringify(qsparams)
  }
  return myURL.href
}

//https://github.com/matt-major/do-wrapper/blob/3bb0d1dbfaa7dc1188a3567321c7def40a8df74a/src/do-wrapper.js#L271
//https://github.com/matt-major/do-wrapper/blob/3bb0d1dbfaa7dc1188a3567321c7def40a8df74a/src/request-helper.js#L19
export default class DraaftAPI {
  httpclient: any
  config: DraaftConfiguration
  /**
   * Draaft API Wrapper
   * @param token - Your Private API Token
   * @param perPage - Page Size of results to return
   */
  constructor(config: DraaftConfiguration) {
    this.config = config
    this.httpclient = axios.create({
      headers: {
        Authorization: `Token ${config.token}`
      }
    })
  }

  /**
   * Get all channels
   * Info {@link https://www.draaft.io/documentation/api/pre-alpha/#channels channels}
   * @param [callback] - Optional function to execute on completion
   * @returns - Returns a promise if [callback] is not defined
   */
  async channelsGetAll(query: any) {
    const requestUrl = getUrl('channels', this.config, query)
    return this.httpclient.get(requestUrl)
      .then((response: any) => {
        return response.data
      })
      .catch((error: any) => {
        return error
      })
  }

  /**
   * Get items list
   * Info {@link https://www.draaft.io/documentation/api/pre-alpha/#items items}
   * @param [callback] - Optional function to execute on completion
   * @returns Returns a promise if [callback] is not defined
   */
  itemsGetAll(query: any) {
    const requestUrl = getUrl('items', this.config, query)
    return this.httpclient.get(requestUrl)
      .then((response: any) => {
        return response.data
      })
      .catch((error: any) => {
        return error
      })
  }

  /**
   * Get wokflow states list
   * Info {@link https://www.draaft.io/documentation/api/pre-alpha/#workflow workflow}
   * @param [callback] - Optional function to execute on completion
   * @returns Returns a promise if [callback] is not defined
   */
  workflowGetAll(query: any) {
    const requestUrl = getUrl('workflow_states', this.config, query)
    return this.httpclient.get(requestUrl)
      .then((response: any) => {
        return response.data
      })
      .catch((error: any) => {
        return error
      })
  }

  /**
   * Get content types list
   * Info {@link https://www.draaft.io/documentation/api/pre-alpha/#types types}
   * @param [callback] - Optional function to execute on completion
   * @returns Returns a promise if [callback] is not defined
   */
  typesGetAll(query: any) {
    const requestUrl = getUrl('item_types', this.config, query)
    return this.httpclient.get(requestUrl)
      .then((response: any) => {
        return response.data
      })
      .catch((error: any) => {
        return error
      })
  }

  /**
   * Get content type
   * Info {@link https://www.draaft.io/documentation/api/pre-alpha/#types types}
   * @param [callback] - Optional function to execute on completion
   * @returns Returns a promise if [callback] is not defined
   */
  typesGetOne(id: number, query: any) {
    const requestUrl = getUrl(`item_types/${id}`, this.config, query)
    return this.httpclient.get(requestUrl)
      .then((response: any) => {
        return response.data
      })
      .catch((error: any) => {
        return error
      })
  }
}

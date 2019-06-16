import * as _ from 'lodash'
import * as interf from './interfaces'
import * as querystring from 'querystring'
import * as url from 'url'

import { axiosInstance } from './axios'

export function getChannels(config: interf.ExtensionConfig): Promise<void> {
    let url = config.apiBaseUrl + '/' + config.apiEndpointChannels;
    return axiosInstance.get(url)
}

export function getItems(config: interf.ExtensionConfig, qsparams?: any): Promise<void> {
    const myURL = new URL(config.apiBaseUrl + '/' + config.apiEndpointItems)
    let localquerystring = _.merge(qsparams, {
        omit: 'cargo'
    })
    myURL.search = querystring.stringify(localquerystring)
    return axiosInstance.get(myURL.href)
}
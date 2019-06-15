import * as _ from 'lodash'
import * as interf from './interfaces'
import * as url from 'url'

import { axiosInstance } from './axios'

export function getChannels(config: interf.ExtensionConfig): Promise<void> {
    let url = config.apiBaseUrl + '/' + config.apiEndpointChannels;
    return axiosInstance.get(url)
}

export function getItems(config: interf.ExtensionConfig, querystring?: string): Promise<void> {
    const myURL = new URL(config.apiBaseUrl + '/' + config.apiEndpointItems)
    if (querystring) {
        myURL.search = querystring
    }
    return axiosInstance.get(myURL.href)
}
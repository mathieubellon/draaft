import * as _ from 'lodash'
import * as interf from './interfaces'

import axios from 'axios'

export function getChannels(config: interf.ExtensionConfig): Promise<void> {
    // var writeToThatPath = file.fsPath;
    // TODO fix this ugly shit before thomas sees it
    let url = config.apiBaseUrl + '/' + config.apiEndpointChannels;
    const axiosInstance = axios.create({
        headers: {
            Authorization: `Token ${config.token}`
        }
    });
    return axiosInstance.get(url)
}
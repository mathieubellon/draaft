import * as _ from 'lodash';
import * as interf from './interfaces';

import axios from 'axios';

export function getChannels(config: interf.ExtensionConfig): void {
    // var writeToThatPath = file.fsPath;
    // TODO fix this ugly shit before thomas sees it
    let url = config.apiBaseUrl + '/' + config.apiEndpointChannels;
    const axiosInstance = axios.create({
        headers: {
            Authorization: `Token ${config.token}`
        }
    });
    axiosInstance.get(url)
    .then(function (response: any) {
        response.data.forEach((channel: any) => {
            console.log(channel)
        });
    })
    .catch(function (error:any) {
        console.error(error)
    });
}
import axios from 'axios'
import * as url from 'url'
import {
    Channel,
    ChannelsApiResponse,
    DraaftConfiguration,
    ItemsApiResponse,
    ItemType,
    ItemTypesApiResponse,
    WorkflowStateApiResponse
} from './types'

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
        let baseUrl = url.format({
            protocol: this.config.apiScheme,
            host: this.config.apiHost,
            pathname: this.config.apiBasePath + '/',
        })
        this.httpclient = axios.create({
            baseURL: baseUrl,
            headers: {
                Authorization: `Token ${config.token}`
            }
        })
    }

    async get(endpoint: string, query?: any): Promise<any> {
        let response = await this.httpclient({
            url: endpoint,
            method: 'GET',
            params: query,
        })
        return response.data
    }

    /**
     * Get all channels
     * Info {@link https://www.draaft.io/documentation/api/beta/#channels channels}
     */
    channelsGetAll(query: any): Promise<ChannelsApiResponse> {
        return this.get('channels', query)
    }

    /**
     * Get one channel by id
     * Info {@link https://www.draaft.io/documentation/api/beta/#channels channels}
     */
    channelsGetOne(id: number, query: any): Promise<Channel> {
        return this.get(`channels/${id}`, query)
    }

    /**
     * Get items list
     * Info {@link https://www.draaft.io/documentation/api/beta/#items items}
     */
    itemsGetAll(query: any): Promise<ItemsApiResponse> {
        return this.get('items', query)
    }

    /**
     * Get wokflow states list
     * Info {@link https://www.draaft.io/documentation/api/beta/#workflow workflow}
     */
    workflowGetAll(query: any): Promise<WorkflowStateApiResponse> {
        return this.get('workflow_states', query)
    }

    /**
     * Get item types list
     * Info {@link https://www.draaft.io/documentation/api/beta/#types types}
     */
    typesGetAll(query: any): Promise<ItemTypesApiResponse> {
        return this.get('item_types', query)
    }

    /**
     * Get one item type by id
     * Info {@link https://www.draaft.io/documentation/api/beta/#types types}
     */
    typesGetOne(id: number, query: any): Promise<ItemType> {
        return this.get(`item_types/${id}`, query)
    }
}

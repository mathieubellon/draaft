import axios from 'axios'
import draaftConfig from './config'
export const axiosInstance = axios.create({
    headers: {
        Authorization: `Token ${draaftConfig.token}`
    }
});
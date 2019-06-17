import axios from 'axios'
import Config from './config'
export const axiosInstance = axios.create({
    headers: {
        Authorization: `Token ${Config.token}`
    }
});
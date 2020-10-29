import * as types from './types'

const APIVERSION = 'beta'
const SCHEME = process.env.DRAAFTENV === 'production' ? 'https' : 'http'

export const defaultconfiguration: types.DraaftConfiguration = {
    apiBasePath: `/integrations/${APIVERSION}`,
    apiHost: '127.0.0.1:8000',
    apiScheme: SCHEME,
    configDir: '.draaft',
    confirmFetch: false,
    excludeTopFolder: false,
    i18nActivated: false,
    i18nContentLayout: 'byfolder',
    i18nDefaultLanguage: 'en',
    overwrite: false,
    ssg: 'hugo',
    token: '',
}

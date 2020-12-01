import * as types from './types'

const APIVERSION = 'beta'
const SCHEME = process.env.DRAAFTENV === 'production' ? 'https' : 'http'

export const defaultConfiguration: types.DraaftConfiguration = {
    apiBasePath: `/integrations/${APIVERSION}`,
    apiHost: '127.0.0.1:8000',
    apiScheme: SCHEME,
    bundlePages: true,
    contentFieldName: 'body',
    i18nMode: types.I18nMode.none,
    i18nDefaultLanguage: 'en',
    ssg: 'hugo',
    token: '',
    useChannelName: false,
}

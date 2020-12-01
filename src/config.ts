import * as types from './types'

const APIVERSION = 'beta'
const SCHEME = process.env.DRAAFTENV === 'production' ? 'https' : 'http'

export const defaultConfiguration: types.DraaftConfiguration = {
    apiBasePath: `/integrations/${APIVERSION}`,
    apiHost: 'app.pilot.pm',
    apiScheme: SCHEME,
    apiToken: '',
    bundlePages: true,
    contentFieldName: 'body',
    frontmatterFormat: types.FrontmatterFormat.yaml,
    i18nMode: types.I18nMode.none,
    i18nDefaultLanguage: 'en',
    ssg: types.SSGType.hugo,
    useChannelName: false,
}

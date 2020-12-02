import * as types from './types'

export const defaultConfiguration: types.DraaftConfiguration = {
    apiBaseUrl : 'https://app.pilot.pm/integrations/beta/',
    apiToken: '',
    bundlePages: true,
    contentFieldName: 'body',
    frontmatterFormat: types.FrontmatterFormat.yaml,
    i18nMode: types.I18nMode.none,
    i18nDefaultLanguage: 'en',
    ssg: types.SSGType.hugo,
    useChannelName: false,
}

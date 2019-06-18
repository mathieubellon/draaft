import * as _ from 'lodash'
import * as interf from './interfaces'

const APIVERSION = 'pre-alpha'
const SCHEME = process.env.DRAAFTENV === 'production' ? 'https' : 'http'

const builtinconf: interf.BuiltinConfig = {
  apiScheme: SCHEME,
  apiEndpointItems: `/public_api/${APIVERSION}/items`,
  apiEndpointChannels: `/public_api/${APIVERSION}/channels`,
  apiHost: '127.0.0.1:8000',
  configDir: '.draaft',
}

const userconf: interf.UserConfig = {
  excludeTopFolder: true,
  i18nActivated: false,
  i18nContentLayout: 'byfolder',
  i18nDefaultLanguage: 'en',
  //token: '0.47152957692742348',
  token: '',
  confirmFetch: false,
  overwrite: false,
}

const cliconf: interf.CLIConfig = _.merge(builtinconf, userconf)

export default cliconf 

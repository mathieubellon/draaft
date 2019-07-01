export type Channel = {
  id: number
  name: string
  level: number
  children: Channel[]
  hierarchy: string
}

// "byfolder" : Create top folders for each language : en/blog/about.md, fr/blog/about.md
// "byfilename" : Add language code in filename : blog/about.en.md; blog/about.fr.md
export type LayoutTypes = 'byfolder' | 'byfilename'
export type SSGTypes = 'hugo' | 'gatsby'

export type DraaftConfiguration = {
  apiBasePath: string
  apiHost: string
  apiScheme: string
  configDir: string
  confirmFetch?: boolean
  excludeTopFolder: boolean // Because you may organize your content on Draaft and grouping all channels for this website
  i18nActivated: boolean
  i18nContentLayout: LayoutTypes
  i18nDefaultLanguage: string
  overwrite: boolean
  ssg: SSGTypes
  token: string
}

// "byfolder" : Create top folders for each language : en/blog/about.md, fr/blog/about.md
// "byfilename" : Add language code in filename : blog/about.en.md; blog/about.fr.md
export type LayoutTypes = 'byfolder' | 'byfilename';
export interface ExtensionConfig {
    apiEndpointItems: string;
    apiEndpointChannels: string,
    apiBaseUrl: string;
    configDir: string;
    confirmFetch?: boolean;
    defaultLanguage?: string;
    fetchForce?: boolean;
    excludeTopFolder: boolean, // Because you may organize your content on Draaft and grouping all channels for this website
    i18nActivated: boolean,
    i18nContentLayout: LayoutTypes;
    i18nDefaultLanguage: string,
    token?: string;
}
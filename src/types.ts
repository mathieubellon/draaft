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

export type ChannelHierarchyNode = any
export type ChannelHierarchy = Array<ChannelHierarchyNode>

export type Channel = {
    created_at: string
    created_by: number
    description: string
    hierarchy: ChannelHierarchy
    id: number
    name: string
    owners: Array<number>
    state: 'active' | 'closed'
    type: number
    updated_at: string
    updated_by: number
}

export type Item = any
export type ItemType = any
export type WorkflowState = any


export type PaginatedApiResponse<Type> = {
    num_pages: number
    count: number
    next: number | null
    previous: number | null
    objects: Array<Type>
}

export type ChannelsApiResponse = PaginatedApiResponse<Channel>
export type ItemsApiResponse = PaginatedApiResponse<Item>
export type ItemTypesApiResponse = PaginatedApiResponse<ItemType>
export type WorkflowStateApiResponse = PaginatedApiResponse<WorkflowState>


export type SSGTypes = 'hugo' | 'gatsby'
export enum I18nMode {
    none = "none",
    folder = "folder",
    filename = "filename",
}

export type DraaftConfiguration = {
    apiBasePath: string
    apiHost: string
    apiScheme: string
    bundlePages: boolean,
    contentFieldName: string,
    i18nMode: I18nMode,
    i18nDefaultLanguage: string
    ssg: SSGTypes
    token: string
    useChannelName: boolean
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

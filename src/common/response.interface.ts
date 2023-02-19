export interface IPaginationMeta {
    next: string;
    prev: string;
}

export interface IVerifyResponse {
    request_id: string;
    next_action: string;
}

export interface IListResponse<T> {
    meta: IPaginationMeta;
    data: T[];
}

export interface ISuccessResponse {
    status: boolean;
}

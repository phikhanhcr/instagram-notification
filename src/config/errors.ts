/**
 * ErrorCode definition
 *
 * Auth error:      1xx
 * Topic error:     2xx
 * Room error:      3xx
 *
 * Request error:   4xx
 * Server error:    5xx
 *
 * @export
 * @enum {number}
 */
export enum ErrorCode {
    NO_ERROR = 0,
    VERIFY_FAILED = 1,
    REQUEST_VALIDATION_ERROR = 400,
    REQUEST_UNAUTHORIZED = 401,
    REQUEST_FORBIDDEN = 403,
    REQUEST_NOT_FOUND = 404,

    // SERVER ERROR
    SERVER_ERROR = 500,
    SERVER_AUTH_ERROR = 501, // and not know why
}

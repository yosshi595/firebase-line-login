interface RequestOptions {
    method: "GET" | "POST"
    uri: string
    headers: RequestHeaders
    bodyObject: RequestBodys
    body?: string
    json?: boolean
}
interface RequestHeaders {
    "Content-type": string
}
interface RequestBodys {
    [key: string]: string | undefined
}
interface LineTokenApiOprionBody extends RequestBodys {
    grant_type: string
    code: string
    redirect_uri: string
    client_id: string
    client_secret: string
}

interface LineApiVerify extends RequestBodys {
    id_token: string
    client_id: string
    nonce?: string
}

interface Config {
    client_id: string
    client_secret: string
    redirect_uri: string
}

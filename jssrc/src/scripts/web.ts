
import { BACKEND } from '@/scripts/config'
import { ReadonlyURLSearchParams } from 'next/navigation';
import createUtilityClassName from 'react-bootstrap/esm/createUtilityClasses';

class Web {
    public static username: string = "";
    public static password: string = "";
}


export function addAuthQueryParams(curQuery: string | undefined = undefined) {
    if (curQuery === undefined) {
        curQuery = "";
    }
    if (!curQuery.startsWith('?')) {
        curQuery = "?" + curQuery;
    }
    if (curQuery.length > 1) {
        curQuery = curQuery + "&";
    }

    return curQuery + `auth_user=${encodeURIComponent(Web.username)}&auth_password=${encodeURIComponent(Web.password)}`;
}

export function extractAuthFromHeader(headers: Headers) {
    const name = headers.get('auth_user') ?? "";
    const password = headers.get('auth_password') ?? "";

    Web.username = name;
    Web.password = password;
}

export function setAuthUser(user: string) {
    Web.username = user;
}

export function setAuthPassword(pw: string) {
    Web.password = pw;
}

export function extractAuthFromQuery(searchParams: ReadonlyURLSearchParams) {
    // In the event we switch to use token-based authentication, remember to change that here as well.
    const name = searchParams.get('auth_user') ?? "";
    const password = searchParams.get('auth_password') ?? "";

    Web.username = name;
    Web.password = password;
}

export function GET(resource: string) {
    const endpoint = getEndpoint(resource);

    return fetch(endpoint, {
        method: "GET",
        headers: getHeaders()
    });
}

export function POST(resource: string, payload: any) {
    const endpoint = getEndpoint(resource);

    return fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: getHeaders()
    });
}

function getHeaders() {
    return { 'auth_user': Web.username, 'auth_password': Web.password };
}

function getEndpoint(resource: string) {
    if (!resource.startsWith('/')) {
        resource = "/" + resource;
    }
    return `http://${BACKEND.ip}:${BACKEND.port}${resource}`;
}
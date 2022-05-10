export const round = (value, decimals) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export const shortenAddress = (add) => {
    let res = '';
    const first = add?.substring(2, 6);
    const last = add?.substring(add?.length - 4, add?.length);
    res = first + '...' + last;
    return res;
}

export const REACT_APP_ENVIRONMENT = () => {
    if (window?._env_?.REACT_APP_ENVIRONMENT) { return window._env_.REACT_APP_ENVIRONMENT; }
    return process.env.REACT_APP_ENVIRONMENT;
}

export const REACT_APP_EXPLORER_URL = () => {
    if (window?._env_?.REACT_APP_EXPLORER_URL) { return window._env_.REACT_APP_EXPLORER_URL; }
    return process.env.REACT_APP_EXPLORER_URL;
}

export const REACT_APP_TOLAR_GATEWAY = () => {
    if (window?._env_?.REACT_APP_TOLAR_GATEWAY) { return window._env_.REACT_APP_TOLAR_GATEWAY; }
    return process.env.REACT_APP_TOLAR_GATEWAY;
}
import { API_DOMAIN, API_PREFIX } from '../../../../environment';

export const generateUrl = (path: string) => API_DOMAIN + API_PREFIX + path;

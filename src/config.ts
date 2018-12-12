import {environment} from './environments/environment';

export const Config = {
  API_URL: `${environment.base_url}/rest/v1/`,
  WEB_SOCKET_URL: `${environment.ws_url}/`
};

import {environment} from './environments/environment';

export const Config = {
  API_URL: `https://${environment.base_url}/rest/v1/`,
  WEB_SOCKET_URL: `ws://${environment.base_url}/`
};

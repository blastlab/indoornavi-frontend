import {environment} from './environments/environment';

export const Config = {
  API_URL: `${environment.base_url}/rest/v1/`,
  WEB_SOCKET_URL: `${environment.ws_url}/`,
  CALCULATOR_URL: `${environment.calculator_url}/`,
  SOLVER_URL: `${environment.solver_url}/`,
  WS_KEY_FRONTEND: 'frontend'
};

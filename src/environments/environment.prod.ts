const location = window.location;
let wsPrefix;

if (location.protocol === 'https:') {
  wsPrefix = 'wss://';
} else {
  wsPrefix = 'ws://';
}

const hostname = location.hostname;
export const environment = {
  production: true,
  solver_url: location.protocol + '//' + hostname + ':8000',
  base_url: '',
  ws_url: wsPrefix + location.host,
  calculator_url: wsPrefix + hostname + ':99',
  version: require('../../package.json').version
};
window['environment'] = environment;

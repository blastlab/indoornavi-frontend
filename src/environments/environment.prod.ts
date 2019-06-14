const loc = window.location;
let ws_prefix;
let hostname;

if (loc.protocol === 'https:') {
  ws_prefix = 'wss://';
} else {
  ws_prefix = 'ws://';
}

hostname = loc.hostname;
export const environment = {
  production: true,
  solver_url: hostname + ':8000',
  base_url: '',
  ws_url: ws_prefix + loc.host,
  calculator_url: ws_prefix + hostname + ':99',
  version: require('../../package.json').version
};

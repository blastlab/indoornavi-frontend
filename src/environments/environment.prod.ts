const loc = window.location;
let ws_addr;
let hostname;

if (loc.protocol === 'https:') {
  ws_addr = 'wss://';
} else {
  ws_addr = 'ws://';
}

ws_addr += loc.host;
hostname = loc.hostname;
export const environment = {
  production: true,
  solver_url: hostname + '8000',
  base_url: '',
  ws_url: ws_addr,
  version: require('../../package.json').version
};

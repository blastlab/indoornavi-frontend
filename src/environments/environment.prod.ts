const loc = window.location;
let ws_addr;

if (loc.protocol === 'https:') {
  ws_addr = 'wss://';
} else {
  ws_addr = 'ws://';
}

ws_addr += loc.host;

export const environment = {
  production: true,
  solver_url: `${window['__env']['solverUrl']}`,
  base_url: '',
  ws_url: ws_addr,
  version: require('../../package.json').version
};

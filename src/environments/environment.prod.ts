var loc = window.location, ws_addr;
if (loc.protocol === "https:") {
  ws_addr = "wss://";
} else {
  ws_addr = "ws://";
}

ws_addr += loc.host;

export const environment = {
  production: true,
  base_url: '',
  ws_url: ws_addr,
  version: require('../../package.json').version
};

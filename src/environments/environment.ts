// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  solver_url: 'http://solver:8000',
  base_url: 'http://localhost:90',
  ws_url: 'ws://192.168.1.2:3000',
  // ws_url: 'ws://localhost:90',
  version: require('../../package.json').version
};

# IndoorNavi

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0-rc.2.

## Install Node.js & npm

Install Node.js® and npm if they are not already on your machine, from here: http://nodejs.org/download/.

Verify that you are running at least node 6.9.x and npm 3.x.x by running node -v and npm -v in a terminal/console window. 

## Install the Angular CLI globally

Run `npm install -g @angular/cli`

## Run project

Open a terminal in `frontend` directory. Run `npm install` to install all dependencies.

## Development server

Run `ng serve -o` for a dev server. Note that this app needs [backend application](http://gitlab.blastlab.local/indoornavi/backend) running in order to work properly.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
In order to execute only one unit test, go to `test.ts` file and change line
```javascript
const context = require.context('./', true, /\.spec\.ts$/);
```
to
```javascript
const context = require.context('./', true, /TESTFILE\.spec\.ts$/);
```

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
To execute only one e2e test run `ng e2e --specs e2e/path/to/file/testfile.ts`
Before running the tests make sure you are serving the app via `ng serve`.

## Adding new translations to the en.json file (you can also access the value manually)

Run `npm run extract`

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## DoD

Definition of Done for issues is as follows:

- Created unit tests where suitable - for code with logic. Unit tests are not required for plain methods without business logic.
- Created integration tests. For frontend these are user interface, Selenium-like tests.
- Code passed code review, was integrated with other services (like fronted),
functionality was accepted by Product Owner (if suitable) and branch was merged to `development`.

Only issue for which code fulfills above rules can be found as done.

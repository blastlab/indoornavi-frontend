# InoorNavi

Obraz dockerowy wykorzystywany w projekcie: `https://hub.docker.com/r/teracy/angular-cli/`

## Uwaga 

Do poprawnego działania trzeba jeszcze dodać backend jako submoduł w projekcie.

## Run project

Otwórz terminal w folderze frontend i uruchom polecenie `docker compose up -d` żeby zainstalować wszystkie zależności i uruchomić development server.

## Build

Uruchom `docker-compose exec frontend ng build`.

## Testy w Chrome

Zobacz:
- https://github.com/teracyhq/angular-boilerplate/blob/master/karma.conf.js#L42
- https://github.com/teracyhq/angular-boilerplate/blob/master/protractor.conf.js#L13

### Testy jednostkowe

Uruchom `docker-compose exec frontend ng test --browsers Chrome_no_sandbox -w false`

### Testy e2e

Uruchom `docker-compose exec frontend ng e2e`




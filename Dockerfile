#### BUILD

FROM teracy/angular-cli:1.0.0 AS build

COPY . /opt/app

WORKDIR /opt/app

RUN npm install && ng build

##### RUN

FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html

COPY --from=build /opt/app/dist/ .

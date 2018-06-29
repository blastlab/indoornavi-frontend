#### BUILD

FROM teracy/angular-cli:1.0.0 AS build

COPY . /opt/app

WORKDIR /opt/app

RUN ng build --prod

##### RUN

FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html

COPY --from=build /opt/app/dist/ .

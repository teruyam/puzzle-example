FROM node:12.13 AS build
WORKDIR /usr/src/app
COPY . .
RUN npm ci
RUN npm install -g @angular/cli
RUN ng build --prod

FROM nginx:stable
COPY --from=build /usr/src/app/dist/vmware-puzzle /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

FROM node:18-alpine as builder
WORKDIR /js
COPY . .
RUN npm ci
RUN npm run build

FROM nginx
COPY --from=builder /js /js

RUN apt update 
RUN apt install -y apt-utils php7.4-fpm 
# RUN apt install python3-certbot python3-certbot-nginx

RUN service php7.4-fpm start

# run these commands
# docker rm nginx -f
# docker-compose up -d --build nginx
# docker exec -it nginx bash
# ln -s /js /usr/share/nginx/html/js
FROM node:18-alpine as builder
WORKDIR /js
COPY . .
RUN npm ci
RUN npm run build

FROM nginx
COPY --from=builder /js /js

FROM node:lts-alpine AS build

WORKDIR /app

COPY . .

RUN apk add bash \
    && npm install

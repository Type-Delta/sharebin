FROM node:alpine AS builder-base

WORKDIR /app

COPY package*.json ./
RUN npm ci
RUN npm cache clean --force

COPY lib/ lib/
COPY ./*.json ./
RUN npm run transpile-esm
RUN rm -rf node_modules


FROM node:alpine AS builder-frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci
RUN npm cache clean --force

COPY --from=builder-base /app/lib ../lib

COPY frontend/ .
COPY backend/src ../backend/src

RUN npm run build-only
RUN rm -rf node_modules


FROM oven/bun:1.2.18-alpine AS server

WORKDIR /app/backend

COPY backend/package.json ./
RUN bun install --omit=dev
RUN bun pm cache clean

COPY --from=builder-base /app/lib ../lib

COPY --from=builder-frontend /app/frontend/dist ../frontend/dist
COPY backend/ ./

RUN mv config.docker.ini config.ini

EXPOSE 5000

CMD ["bun", "run", "start"]




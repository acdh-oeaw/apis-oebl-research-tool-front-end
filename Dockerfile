# syntax=docker/dockerfile:1

FROM node:18-slim AS build

# RUN corepack enable

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

USER node

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node tsconfig.json vue.config.js ./
COPY --chown=node:node public ./public
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node server ./server
COPY --chown=node:node src ./src

ARG VUE_APP_API_HOST
ARG VUE_APP_WEBAPP_HOST
ARG VUE_APP_EVENTBUS_HOST

RUN npm install --ci --no-audit --no-fund

ENV NODE_ENV=production

RUN npm run build

# # serve
# FROM node:18-slim AS serve

# RUN mkdir /app && chown -R node:node /app
# WORKDIR /appv

# USER node

# COPY --from=build --chown=node:node /app/dist ./dist
# COPY --from=build --chown=node:node /app/server ./server

# ENV NODE_ENV=production

EXPOSE 3333

CMD ["node", "./dist/server/index.mjs"]

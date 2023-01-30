FROM node:12-alpine






# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#node-gyp-alpine
RUN apk add --no-cache python3 make g++ curl

WORKDIR /app/

COPY . /app
RUN npm install && npm install -g @vue/cli-service

EXPOSE 3333
EXPOSE 8080

CMD ["sh", "start.sh"]

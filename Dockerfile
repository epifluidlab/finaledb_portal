FROM node:10

WORKDIR /app

COPY ./package* /app/
RUN yarn
COPY . .

RUN yarn build

CMD ["yarn", "start"]

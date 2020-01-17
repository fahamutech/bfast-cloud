FROM docker:stable

WORKDIR /app
COPY *.json ./

RUN apk update
RUN apk upgrade
RUN apk add nodejs
RUN apk add npm
#RUN apk add docker-compose
RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm ci --only=production
RUN npm rebuild bcrypt --build-from-source

COPY ./lib ./lib

CMD ["npm","start"]

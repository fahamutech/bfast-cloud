FROM docker:stable

WORKDIR /app
COPY . .

RUN apk update
RUN apk upgrade
RUN apk add nodejs
RUN apk add npm
#RUN apk add docker-compose
# RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm install
RUN npm run build
RUN rm -r src
RUN rm -r node_modules
RUN npm install --only=prod
RUN npm rm gulpfile.js
# RUN npm rebuild bcrypt --build-from-source

CMD ["npm","start"]

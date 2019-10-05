FROM docker:stable

WORKDIR /app
COPY *.json ./
#RUN apt-get update
#RUN apt-get -y install \
#    apt-transport-https \
#    ca-certificates \
#    curl \
#    gnupg-agent \
#    software-properties-common
#RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
#RUN add-apt-repository -y \
#       "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
#       $(lsb_release -cs) \
#       stable"
#RUN curl -sL https://deb.nodesource.com/setup_10.x | -E bash -
#RUN apt-get update
##RUN apt-get install docker-ce docker-ce-cli containerd.io
#RUN apt-get install -y docker-ce-cli
#RUN apt-get install -y nodejs
RUN apk add --update nodejs npm docker-compose
RUN npm ci --only=production
COPY ./lib ./lib
CMD ["npm","start"]

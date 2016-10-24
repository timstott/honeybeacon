FROM node:6.9-slim

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home/app

WORKDIR $HOME/src/
COPY package.json $HOME/src/
RUN npm install

COPY . $HOME/src/
RUN chown -R app:app $HOME/*
USER app
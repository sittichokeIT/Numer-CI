FROM node:latest
WORKDIR /apps
COPY package.json ./
RUN npm install
RUN npm install -g nodemon
COPY . .
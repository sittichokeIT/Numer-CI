FROM node as build
WORKDIR /apps
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx
COPY --from=build /apps/build /usr/share/nginx/html

EXPOSE 3000

FROM node:8.11.4-alpine

RUN mkdir -p /src
RUN npm install express-generator -g
RUN npm install nodemon -g

WORKDIR /src
ADD pizza_app/package.json /src/package.json
RUN npm install

EXPOSE 3000
CMD ["nodemon", "--legacy-watch", "pizza_app/bin/www"]
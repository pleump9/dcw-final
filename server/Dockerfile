FROM node:14-alpine3.15
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node src/main.js
EXPOSE 8000
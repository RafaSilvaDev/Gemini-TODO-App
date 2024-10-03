FROM node:18.19.1-alpine
WORKDIR /usr/src/frontend/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "dev"]

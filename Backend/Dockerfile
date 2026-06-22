FROM node:20-alpine

# Install system build tools for node-gyp, better-sqlite3, and sharp
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev python3

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm ci

WORKDIR /opt/app
COPY . .
RUN npm run build

EXPOSE 1337
CMD ["npm", "run", "start"]

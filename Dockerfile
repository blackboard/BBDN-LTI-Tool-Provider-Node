FROM node:boron

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY package.json /usr/app/
RUN npm install

# Bundle app source
COPY . /usr/app
RUN npm run build-server
RUN npm run build-public

EXPOSE 3000
CMD ./launch.sh

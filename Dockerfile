FROM node:18
WORKDIR /app

COPY package.json .

RUN yarn install
# COPY . .
# RUN yarn add @web3auth/modal

CMD ["/bin/bash"]

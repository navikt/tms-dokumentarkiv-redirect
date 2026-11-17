FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim

WORKDIR /usr/src/app

COPY package.json ./
COPY server.mjs ./
COPY node_modules ./node_modules

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["server.mjs"]

EXPOSE $PORT

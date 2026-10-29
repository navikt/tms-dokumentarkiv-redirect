FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim@sha256:0f202869b59d908e508aa562e2fcb210229df9171233d1a38329170a7386c598

WORKDIR /usr/src/app

COPY package.json ./
COPY server.mjs ./
COPY node_modules ./node_modules

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["server.mjs"]

EXPOSE $PORT

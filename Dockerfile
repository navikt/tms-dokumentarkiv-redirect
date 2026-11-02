FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim@sha256:970e1746178271ae312f582e725ecbdc924dac2e064638c06085da6a938fbfaa

WORKDIR /usr/src/app

COPY package.json ./
COPY server.mjs ./
COPY node_modules ./node_modules

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["server.mjs"]

EXPOSE $PORT

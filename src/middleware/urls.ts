import { getEnvironment } from "@src/utils/server/urls.ts";

const REDIRECT_URI = {
  local: "http://localhost:4321/mine-saker",
  development: "https://www.ansatt.dev.nav.no/mine-saker",
  production: "https://www.nav.no/minside/mine-saker",
};

export const redirectUri = REDIRECT_URI[getEnvironment()];
export const loginUrl = `/mine-saker/oauth2/login?redirect=${redirectUri}`;

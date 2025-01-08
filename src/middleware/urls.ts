import { getEnvironment } from "@src/utils/server/urls.ts";

const REDIRECT_URI = {
  local: "http://localhost:4321/tms-dokumentarkiv-redirect",
  development: "https://www.ansatt.dev.nav.no/tms-dokumentarkiv-redirect",
  production: "https://www.nav.no/minside/tms-dokumentarkiv-redirect",
};

export const redirectUri = REDIRECT_URI[getEnvironment()];
export const loginUrl = `/tms-dokumentarkiv-redirect/oauth2/login?redirect=${redirectUri}`;

import { createServer as createHttpServer } from "node:http";
import { pathToFileURL } from "node:url";

const BASE_PATH = "/mine-saker";
const DESTINATION_BASE_URL = "https://www.nav.no/dokumentarkiv";
const ALLOWED_METHODS = new Set(["GET", "HEAD"]);
const HEALTH_ENDPOINTS = new Set(["isAlive", "isReady"]);
const BASE_PATH_SEGMENTS = BASE_PATH.split("/").slice(1);

const sendEmptyResponse = (response, statusCode, headers = {}) => {
  response.writeHead(statusCode, {
    "content-length": "0",
    ...headers,
  });
  response.end();
};

const parsePathSegments = (pathname) => {
  try {
    const segments = pathname.split("/").slice(1);

    if (segments.at(-1) === "") {
      segments.pop();
    }

    return segments.map(decodeURIComponent);
  } catch {
    return null;
  }
};

const hasBasePath = (segments) =>
  BASE_PATH_SEGMENTS.every((segment, index) => segments[index] === segment);

const isHealthCheck = (segments) =>
  segments.length === 3 &&
  segments[0] === "api" &&
  segments[1] === "internal" &&
  HEALTH_ENDPOINTS.has(segments[2]);

const buildRedirectUrl = (segments) => {
  if (segments.length === 0) {
    return DESTINATION_BASE_URL;
  }

  if (
    segments[0] !== "tema" ||
    segments.length < 2 ||
    segments.length > 3 ||
    segments.slice(1).some((segment) => !segment)
  ) {
    return null;
  }

  const encodedSegments = segments.slice(1).map(encodeURIComponent);
  return `${DESTINATION_BASE_URL}/tema/${encodedSegments.join("/")}`;
};

const resolveRequest = (request) => {
  if (!ALLOWED_METHODS.has(request.method)) {
    return { statusCode: 405, headers: { allow: "GET, HEAD" } };
  }

  let url;
  try {
    url = new URL(request.url ?? "/", "http://localhost");
  } catch {
    return { statusCode: 400 };
  }

  const pathSegments = parsePathSegments(url.pathname);

  if (!pathSegments) {
    return { statusCode: 400 };
  }

  if (!hasBasePath(pathSegments)) {
    return { statusCode: 404 };
  }

  const routeSegments = pathSegments.slice(BASE_PATH_SEGMENTS.length);

  if (isHealthCheck(routeSegments)) {
    return { statusCode: 200 };
  }

  const destination = buildRedirectUrl(routeSegments);

  if (!destination) {
    return { statusCode: 404 };
  }

  return { statusCode: 302, headers: { location: destination } };
};

export const createRequestListener = () => (request, response) => {
  const result = resolveRequest(request);
  sendEmptyResponse(response, result.statusCode, result.headers);
};

export const createServer = () => createHttpServer(createRequestListener());

export const startServer = ({
  host = process.env.HOST ?? "0.0.0.0",
  port = Number(process.env.PORT ?? 3000),
} = {}) => {
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid port: ${port}`);
  }

  const server = createServer();
  server.listen(port, host, () => {
    const address = server.address();
    const listeningPort =
      typeof address === "object" && address ? address.port : port;
    console.info(`Listening on http://${host}:${listeningPort}`);
  });
  return server;
};

const isMainModule = () =>
  Boolean(
    process.argv[1] &&
      import.meta.url === pathToFileURL(process.argv[1]).href,
  );

if (isMainModule()) {
  startServer();
}

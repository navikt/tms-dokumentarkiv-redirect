import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createRequestListener, startServer } from "./server.mjs";

const VALID_TOKEN = "valid-token";
const listener = createRequestListener({
  authenticate: async (request) =>
    request.headers.authorization === `Bearer ${VALID_TOKEN}`,
});

const request = async (
  url,
  method = "GET",
  token = VALID_TOKEN,
  requestListener = listener,
) => {
  const result = {
    body: undefined,
    headers: {},
    statusCode: undefined,
  };
  const response = {
    end(body) {
      result.body = body;
    },
    writeHead(statusCode, headers) {
      result.statusCode = statusCode;
      result.headers = headers;
    },
  };
  const headers = token ? { authorization: `Bearer ${token}` } : {};

  await requestListener({ headers, method, url }, response);
  return result;
};

describe("redirect routes", () => {
  test("redirects the base route", async () => {
    const response = await request("/mine-saker");

    assert.equal(response.statusCode, 302);
    assert.equal(response.headers.location, "https://www.nav.no/dokumentarkiv");
  });

  test("accepts a trailing slash and ignores the query string", async () => {
    const response = await request("/mine-saker/?from=legacy");

    assert.equal(response.statusCode, 302);
    assert.equal(response.headers.location, "https://www.nav.no/dokumentarkiv");
  });

  test("redirects a theme route", async () => {
    const response = await request("/mine-saker/tema/dagpenger");

    assert.equal(response.statusCode, 302);
    assert.equal(
      response.headers.location,
      "https://www.nav.no/dokumentarkiv/tema/dagpenger",
    );
  });

  test("redirects a journal entry route", async () => {
    const response = await request("/mine-saker/tema/dagpenger/123456");

    assert.equal(response.statusCode, 302);
    assert.equal(
      response.headers.location,
      "https://www.nav.no/dokumentarkiv/tema/dagpenger/123456",
    );
  });

  test("keeps dynamic values as encoded path segments", async () => {
    const response = await request(
      "/mine-saker/tema/a%2Fb/journal%20post",
    );

    assert.equal(response.statusCode, 302);
    assert.equal(
      response.headers.location,
      "https://www.nav.no/dokumentarkiv/tema/a%2Fb/journal%20post",
    );
  });

  test("supports HEAD requests", async () => {
    const response = await request("/mine-saker", "HEAD");

    assert.equal(response.statusCode, 302);
    assert.equal(response.headers.location, "https://www.nav.no/dokumentarkiv");
  });
});

describe("health routes", () => {
  for (const endpoint of ["isAlive", "isReady"]) {
    test(`${endpoint} returns 200 without a token`, async () => {
      const response = await request(
        `/mine-saker/api/internal/${endpoint}`,
        "GET",
        null,
      );

      assert.equal(response.statusCode, 200);
      assert.equal(response.body, undefined);
    });
  }
});

describe("authentication", () => {
  test("returns 401 when the token is missing", async () => {
    const response = await request("/mine-saker", "GET", null);

    assert.equal(response.statusCode, 401);
    assert.equal(response.headers["www-authenticate"], "Bearer");
  });

  test("returns 401 when the token is invalid", async () => {
    const response = await request("/mine-saker", "GET", "invalid-token");

    assert.equal(response.statusCode, 401);
    assert.equal(response.headers["www-authenticate"], "Bearer");
  });

  test("returns 500 when token validation fails unexpectedly", async (t) => {
    const errorLog = t.mock.method(console, "error", () => {});
    const failingListener = createRequestListener({
      authenticate: async () => {
        throw new Error("Validation provider unavailable");
      },
    });

    const response = await request(
      "/mine-saker",
      "GET",
      VALID_TOKEN,
      failingListener,
    );

    assert.equal(response.statusCode, 500);
    assert.equal(errorLog.mock.callCount(), 1);
  });
});

describe("invalid requests", () => {
  test("returns 404 for unknown paths", async () => {
    const response = await request("/mine-saker/not-a-route");

    assert.equal(response.statusCode, 404);
  });

  test("returns 404 for missing dynamic path values", async () => {
    const response = await request("/mine-saker/tema//123456");

    assert.equal(response.statusCode, 404);
  });

  test("returns 404 for an empty journal entry value", async () => {
    const response = await request("/mine-saker/tema/dagpenger//");

    assert.equal(response.statusCode, 404);
  });

  test("does not match a path that only shares the base prefix", async () => {
    const response = await request("/mine-saker-extra");

    assert.equal(response.statusCode, 404);
  });

  test("returns 400 for malformed path encoding", async () => {
    const response = await request("/mine-saker/tema/%");

    assert.equal(response.statusCode, 400);
  });

  test("returns 405 for unsupported methods", async () => {
    const response = await request("/mine-saker", "POST");

    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.allow, "GET, HEAD");
  });
});

test("rejects an invalid listening port", () => {
  assert.throws(() => startServer({ port: Number.NaN }), /Invalid port/);
});

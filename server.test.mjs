import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createRequestListener, startServer } from "./server.mjs";

const listener = createRequestListener();

const request = (url, method = "GET") => {
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

  listener({ method, url }, response);
  return result;
};

describe("redirect routes", () => {
  test("redirects the base route", () => {
    const response = request("/mine-saker");

    assert.equal(response.statusCode, 302);
    assert.equal(response.headers.location, "https://www.nav.no/dokumentarkiv");
  });

  test("accepts a trailing slash and ignores the query string", () => {
    const response = request("/mine-saker/?from=legacy");

    assert.equal(response.statusCode, 302);
    assert.equal(response.headers.location, "https://www.nav.no/dokumentarkiv");
  });

  test("redirects a theme route", () => {
    const response = request("/mine-saker/tema/dagpenger");

    assert.equal(response.statusCode, 302);
    assert.equal(
      response.headers.location,
      "https://www.nav.no/dokumentarkiv/tema/dagpenger",
    );
  });

  test("redirects a journal entry route", () => {
    const response = request("/mine-saker/tema/dagpenger/123456");

    assert.equal(response.statusCode, 302);
    assert.equal(
      response.headers.location,
      "https://www.nav.no/dokumentarkiv/tema/dagpenger/123456",
    );
  });

  test("keeps dynamic values as encoded path segments", () => {
    const response = request("/mine-saker/tema/a%2Fb/journal%20post");

    assert.equal(response.statusCode, 302);
    assert.equal(
      response.headers.location,
      "https://www.nav.no/dokumentarkiv/tema/a%2Fb/journal%20post",
    );
  });

  test("supports HEAD requests", () => {
    const response = request("/mine-saker", "HEAD");

    assert.equal(response.statusCode, 302);
    assert.equal(response.headers.location, "https://www.nav.no/dokumentarkiv");
  });
});

describe("health routes", () => {
  for (const endpoint of ["isAlive", "isReady"]) {
    test(`${endpoint} returns 200`, () => {
      const response = request(`/mine-saker/api/internal/${endpoint}`);

      assert.equal(response.statusCode, 200);
      assert.equal(response.body, undefined);
    });
  }
});

describe("invalid requests", () => {
  test("returns 404 for unknown paths", () => {
    const response = request("/mine-saker/not-a-route");

    assert.equal(response.statusCode, 404);
  });

  test("returns 404 for missing dynamic path values", () => {
    const response = request("/mine-saker/tema//123456");

    assert.equal(response.statusCode, 404);
  });

  test("returns 404 for an empty journal entry value", () => {
    const response = request("/mine-saker/tema/dagpenger//");

    assert.equal(response.statusCode, 404);
  });

  test("does not match a path that only shares the base prefix", () => {
    const response = request("/mine-saker-extra");

    assert.equal(response.statusCode, 404);
  });

  test("returns 400 for malformed path encoding", () => {
    const response = request("/mine-saker/tema/%");

    assert.equal(response.statusCode, 400);
  });

  test("returns 405 for unsupported methods", () => {
    const response = request("/mine-saker", "POST");

    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.allow, "GET, HEAD");
  });
});

test("rejects an invalid listening port", () => {
  assert.throws(() => startServer({ port: Number.NaN }), /Invalid port/);
});

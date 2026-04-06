// Mock helper for GitHub API using undici MockAgent.
// @octokit/action v8 uses undici's fetch directly, so nock cannot intercept
// GitHub API requests. This module provides a nock-like chaining API backed
// by undici MockAgent.
const { MockAgent, setGlobalDispatcher } = require("undici");

let mockAgent;
let mockPool;

function setup() {
  mockAgent = new MockAgent();
  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);
  mockPool = mockAgent.get("https://api.github.com");
}

// Returns pending interceptor descriptions (mirrors nock.pendingMocks() shape).
function pendingMocks() {
  if (!mockAgent) return [];
  return mockAgent
    .pendingInterceptors()
    .map((i) => `${i.method} ${i.origin}${i.path}`);
}

// Wraps a nock-style body-matching callback.
// nock parses JSON body before calling the function; undici passes raw string.
function jsonBody(fn) {
  return (body) => {
    fn(JSON.parse(body));
    return true;
  };
}

// Returns a nock-like scope builder for https://api.github.com.
// opts.reqheaders - optional header requirements (same as nock's reqheaders)
function mockGitHub(opts) {
  const reqheaders = (opts && opts.reqheaders) || null;
  let lastIntercept = null; // the InterceptOpts from the last verb call

  function registerVerb(method, path, bodyFn) {
    const interceptOpts = { method, path };
    if (reqheaders) interceptOpts.headers = reqheaders;
    if (bodyFn) interceptOpts.body = jsonBody(bodyFn);
    lastIntercept = interceptOpts;
    return scope;
  }

  const scope = {
    get(path) {
      return registerVerb("GET", path, null);
    },
    post(path, bodyFn) {
      return registerVerb("POST", path, bodyFn || null);
    },
    put(path, bodyFn) {
      return registerVerb("PUT", path, bodyFn || null);
    },
    head(path) {
      return registerVerb("HEAD", path, null);
    },
    reply(status, body) {
      if (body !== undefined) {
        const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
        const contentType =
          typeof body === "object" ? "application/json" : "text/plain";
        mockPool
          .intercept(lastIntercept)
          .reply(status, bodyStr, { headers: { "content-type": contentType } });
      } else {
        mockPool.intercept(lastIntercept).reply(status, "");
      }
      lastIntercept = null;
      return scope;
    },
  };

  return scope;
}

module.exports = { setup, pendingMocks, mockGitHub };

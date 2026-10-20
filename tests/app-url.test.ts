import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { getAppUrl } from "../src/lib/app-url";

const original = process.env.NEXT_PUBLIC_APP_URL;
afterEach(() => {
  if (original === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = original;
});
test("public origin does not duplicate Academy's base path", () => {
  process.env.NEXT_PUBLIC_APP_URL = "https://www.socialautomation.app/";
  assert.equal(getAppUrl(), "https://www.socialautomation.app");
});
test("missing public URL fails explicitly without a localhost fallback", () => {
  delete process.env.NEXT_PUBLIC_APP_URL;
  assert.throws(getAppUrl, /non configurato/);
});
test("rejects paths, query strings, fragments, credentials and non-HTTP schemes", () => {
  for (const value of ["https://example.com/academy", "https://example.com/?a=b", "https://example.com/#a", "https://user:pass@example.com", "javascript:alert(1)"]) {
    process.env.NEXT_PUBLIC_APP_URL = value;
    assert.throws(getAppUrl);
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { academyPathname } from "../src/lib/academy-routing";

test("normalizes protected routes with or without Next basePath metadata", () => {
  for (const path of ['/dashboard', '/dashboard/corsi/example', '/admin', '/admin/corsi', '/login', '/registrati']) {
    assert.equal(academyPathname(path), path);
    assert.equal(academyPathname('/academy' + path), path);
  }
});

test("only strips a complete namespace segment", () => {
  assert.equal(academyPathname('/academy'), '/');
  assert.equal(academyPathname('/academy/'), '/');
  assert.equal(academyPathname('/academy-other/dashboard'), '/academy-other/dashboard');
});

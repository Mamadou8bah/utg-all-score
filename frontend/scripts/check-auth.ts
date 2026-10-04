import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { SignJWT } from "jose";
import { createSessionToken, verifySessionToken } from "../lib/session";

loadEnvConfig(process.cwd());

async function check() {
  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "readiness-check-secret-used-only-for-this-process";
  try {
    const token = await createSessionToken({ id: "test-user", name: "Test", email: "test@example.com", role: "ADMIN", schoolId: null, schoolName: null });
    assert.equal((await verifySessionToken(token))?.role, "ADMIN");
    assert.equal(await verifySessionToken("invalid-token"), null);
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const invalidRole = await new SignJWT({ sub: "test-user", email: "test@example.com", role: "OWNER" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(secret);
    assert.equal(await verifySessionToken(invalidRole), null);
    const expired = await new SignJWT({ sub: "test-user", email: "test@example.com", role: "AGENT" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime(1).sign(secret);
    assert.equal(await verifySessionToken(expired), null);
    const wrongAlgorithm = await new SignJWT({ sub: "test-user", email: "test@example.com", role: "AGENT" }).setProtectedHeader({ alg: "HS512" }).setExpirationTime("1h").sign(secret);
    assert.equal(await verifySessionToken(wrongAlgorithm), null);
    console.log("PASS: valid sessions, invalid tokens, expired sessions, invalid roles, and unexpected signing algorithms.");
  } finally {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
  }
}

check().catch((error) => { console.error(error); process.exitCode = 1; });

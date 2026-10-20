import { describe, expect, it } from "vitest";
import { loginPathFor, safeReturnTo } from "@/lib/return-to";

const ORIGIN = "https://mail.acme.com";

describe("loginPathFor", () => {
  it("keeps /login bare when the visitor was on the root", () => {
    expect(loginPathFor({ pathname: "/", search: "", hash: "" })).toBe(
      "/login",
    );
  });

  it("carries the full path, query and hash in next", () => {
    const path = loginPathFor({
      pathname: "/inbox/support%40acme.com/p1",
      search: "?q=refund",
      hash: "#m=em_1",
    });
    expect(path).toBe(
      `/login?next=${encodeURIComponent("/inbox/support%40acme.com/p1?q=refund#m=em_1")}`,
    );
  });

  it("round-trips through safeReturnTo", () => {
    const path = loginPathFor({ pathname: "/m/em_123", search: "", hash: "" });
    const next = new URL(path, ORIGIN).searchParams.get("next");
    expect(safeReturnTo(next, ORIGIN)).toBe("/m/em_123");
  });
});

describe("safeReturnTo", () => {
  it("falls back to / when next is missing", () => {
    expect(safeReturnTo(null, ORIGIN)).toBe("/");
    expect(safeReturnTo("", ORIGIN)).toBe("/");
  });

  it("returns same-origin paths unchanged", () => {
    expect(safeReturnTo("/m/em_123", ORIGIN)).toBe("/m/em_123");
    expect(safeReturnTo("/inbox/a/b?q=x#m=1", ORIGIN)).toBe(
      "/inbox/a/b?q=x#m=1",
    );
  });

  it("accepts an absolute URL on the same origin, reduced to its path", () => {
    expect(safeReturnTo(`${ORIGIN}/m/em_123`, ORIGIN)).toBe("/m/em_123");
  });

  it.each([
    "https://evil.com/m/1",
    "//evil.com/m/1",
    "/\\evil.com/m/1",
    "javascript:alert(1)",
  ])("rejects off-origin target %s", (raw) => {
    expect(safeReturnTo(raw, ORIGIN)).toBe("/");
  });
});

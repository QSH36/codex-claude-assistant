import { describe, expect, test } from "vitest";
import { createInitialState } from "../src/domain/environment";
import { createDiagnosticReport, redactSecrets } from "../src/domain/diagnostics";

describe("diagnostics", () => {
  test("redacts common token formats", () => {
    const input = [
      "github_pat_1234567890abcdef",
      "cfat_abcdefghijklmnopqrstuvwxyz",
      "api_key = sk-test-secret-token",
      "password: example-password-value",
      "LTAIEXAMPLEACCESSKEY123456",
    ].join("\n");

    const redacted = redactSecrets(input);

    expect(redacted).not.toContain("github_pat_1234567890abcdef");
    expect(redacted).not.toContain("cfat_abcdefghijklmnopqrstuvwxyz");
    expect(redacted).not.toContain("sk-test-secret-token");
    expect(redacted).not.toContain("example-password-value");
    expect(redacted).not.toContain("LTAIEXAMPLEACCESSKEY123456");
    expect(redacted).toContain("<REDACTED>");
  });

  test("creates a report without raw log secrets", () => {
    const state = createInitialState();
    state.logs.push({
      id: "secret",
      timestamp: new Date().toISOString(),
      level: "info",
      message: "token=github_pat_1234567890abcdef",
    });

    const report = createDiagnosticReport(state);

    expect(JSON.stringify(report)).not.toContain("github_pat_1234567890abcdef");
  });
});

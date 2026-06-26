import { describe, expect, test } from "vitest";
import { createInitialRuntimeChecks, createInitialState, defaultTargets } from "../src/domain/environment";

describe("environment model", () => {
  test("creates runtime checks from selected targets", () => {
    const checks = createInitialRuntimeChecks(defaultTargets);

    expect(checks.some((check) => check.id === "python" && check.required)).toBe(true);
    expect(checks.some((check) => check.id === "node" && check.required)).toBe(true);
    expect(checks.some((check) => check.id === "cc-switch" && check.required)).toBe(true);
  });

  test("creates a complete initial wizard state", () => {
    const state = createInitialState();

    expect(state.activeStep).toBe("environment");
    expect(state.steps).toHaveLength(7);
    expect(state.locations.length).toBeGreaterThan(0);
    expect(state.installActions.length).toBeGreaterThan(0);
    expect(state.dialogue.finalMarkdown).toContain("默认使用中文回复");
  });
});

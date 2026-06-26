import { describe, expect, test } from "vitest";
import { getRequiredRuntimesForTargets, toolManifest } from "../src/domain/toolManifest";

describe("tool manifest", () => {
  test("contains required core runtime definitions", () => {
    const ids = new Set(toolManifest.map((tool) => tool.id));

    expect(ids.has("python")).toBe(true);
    expect(ids.has("node")).toBe(true);
    expect(ids.has("git")).toBe(true);
    expect(ids.has("codex-plus-plus")).toBe(true);
    expect(ids.has("cc-switch")).toBe(true);
  });

  test("prefers China-friendly sources where available", () => {
    const node = toolManifest.find((tool) => tool.id === "node");

    expect(node?.sources[0].regionHint).toBe("china-mainland");
  });

  test("returns runtimes required for selected targets", () => {
    const runtimes = getRequiredRuntimesForTargets(["claude-cli"]);
    const ids = runtimes.map((tool) => tool.id);

    expect(ids).toContain("python");
    expect(ids).toContain("node");
  });
});

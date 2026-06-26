import { describe, expect, test } from "vitest";
import {
  buildSkillIndex,
  builtInSkillCatalog,
  createSkillDescriptor,
  inferSkillCategory,
  makeRecommendedSkills,
  normalizeSkillName,
} from "../src/domain/skillCatalog";

describe("skill catalog", () => {
  test("normalizes skill names predictably", () => {
    expect(normalizeSkillName("Browser QA++")).toBe("browser-qa++");
    expect(normalizeSkillName(" chrome:control-in-app-browser ")).toBe("chrome:control-in-app-browser");
  });

  test("infers useful categories", () => {
    expect(inferSkillCategory("browser-qa", "visual testing with chrome")).toBe("UI、UX、产品设计");
    expect(inferSkillCategory("cloudflare-deploy", "dns and cloud deploy")).toBe("DevOps、云、网络");
  });

  test("builds recommended skills with selected flags", () => {
    const recommended = makeRecommendedSkills(builtInSkillCatalog);

    expect(recommended.length).toBeGreaterThan(5);
    expect(recommended.every((skill) => skill.selected)).toBe(true);
  });

  test("builds a markdown index for selected skills", () => {
    const skill = createSkillDescriptor("application", "app ui", "/tmp/SKILL.md");
    const index = buildSkillIndex([skill]);

    expect(index).toContain("# Skill 路由索引");
    expect(index).toContain("`application`");
    expect(index).toContain("/tmp/SKILL.md");
  });
});

import { describe, expect, it } from "vitest";
import {
  findBySlugs,
  getCentroid,
  getDistricts,
  getProvinces,
  normalizeLocation,
} from "@/lib/geo/turkey";

describe("turkey locations", () => {
  it("81 il yüklenir", () => {
    expect(getProvinces().length).toBe(81);
  });

  it("İstanbul ilçeleri", () => {
    const districts = getDistricts("İstanbul");
    expect(districts.length).toBeGreaterThan(5);
    expect(districts).toContain("Kadıköy");
  });

  it("normalizeLocation Türkçe karakter", () => {
    expect(normalizeLocation("İstanbul")).toBe(
      normalizeLocation("istanbul"),
    );
  });

  it("getCentroid İstanbul il merkezi", () => {
    const c = getCentroid("İstanbul");
    expect(c?.lat).toBeGreaterThan(40);
    expect(c?.lng).toBeGreaterThan(28);
  });

  it("getCentroid Kadıköy ilçe koordinatı", () => {
    const c = getCentroid("İstanbul", "Kadıköy");
    expect(c?.lat).toBeCloseTo(40.99, 0);
    expect(c?.lng).toBeGreaterThan(28);
  });

  it("findBySlugs istanbul kadikoy", () => {
    const found = findBySlugs("istanbul", "kadikoy");
    expect(found?.province.name).toBe("İstanbul");
    expect(found?.town.name).toBe("Kadıköy");
  });
});

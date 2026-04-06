import { describe, expect, it } from "vitest";

import { moduleCards } from "../src/content/modules";

describe("module coverage", () => {
  it("includes all launch modules", () => {
    expect(moduleCards.map((moduleCard) => moduleCard.type)).toEqual([
      "bill",
      "appointment",
      "renewal",
      "important_date",
      "shopping_list",
      "document"
    ]);
  });
});

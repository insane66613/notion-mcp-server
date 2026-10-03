import { describe, expect, it } from "vitest";
import { TOOL_PAYLOAD_SCHEMA, normalizeToolPayload } from "../src/tools/arguments.js";

describe("tool argument compatibility", () => {
  it("normalizes nested JSON-encoded objects and arrays", () => {
    expect(
      normalizeToolPayload({
        parent: JSON.stringify({ page_id: "page-1" }),
        children: [
          {
            paragraph: JSON.stringify({
              rich_text: [{ type: "text", text: { content: "hello" } }],
            }),
          },
        ],
      })
    ).toEqual({
      parent: { page_id: "page-1" },
      children: [
        {
          paragraph: {
            rich_text: [{ type: "text", text: { content: "hello" } }],
          },
        },
      ],
    });
  });

  it("accepts once- and twice-encoded top-level payload objects", () => {
    const payload = { page_id: "page-1", properties: { Status: "Done" } };
    const once = JSON.stringify(payload);
    const twice = JSON.stringify(once);

    expect(TOOL_PAYLOAD_SCHEMA.parse(once)).toBe(once);
    expect(TOOL_PAYLOAD_SCHEMA.parse(twice)).toBe(twice);
    expect(normalizeToolPayload(once)).toEqual(payload);
    expect(normalizeToolPayload(twice)).toEqual(payload);
  });

  it("preserves legitimate scalar strings", () => {
    const payload = {
      title: "123",
      jsonLookingButScalar: JSON.stringify("hello"),
      booleanLooking: "true",
    };
    expect(normalizeToolPayload(payload)).toEqual(payload);
  });

  it("rejects top-level strings that do not resolve to an object", () => {
    expect(TOOL_PAYLOAD_SCHEMA.safeParse("plain text").success).toBe(false);
    expect(TOOL_PAYLOAD_SCHEMA.safeParse(JSON.stringify([1, 2, 3])).success).toBe(false);
    expect(TOOL_PAYLOAD_SCHEMA.safeParse(JSON.stringify("hello")).success).toBe(false);
  });

  it("bounds repeated JSON decoding", () => {
    const payload = { page_id: "page-1" };
    const encodedFourTimes = JSON.stringify(JSON.stringify(JSON.stringify(JSON.stringify(payload))));
    expect(TOOL_PAYLOAD_SCHEMA.safeParse(encodedFourTimes).success).toBe(false);
  });
});

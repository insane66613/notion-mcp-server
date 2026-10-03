import { z } from "zod";

const MAX_UNWRAP_DEPTH = 3;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deserializeValue(value: unknown): unknown {
  if (typeof value === "string") {
    let current = value;
    for (let depth = 0; depth < MAX_UNWRAP_DEPTH; depth += 1) {
      const trimmed = current.trim();
      const couldBeEncoded =
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"'));
      if (!couldBeEncoded) break;

      let parsed: unknown;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        break;
      }

      if (typeof parsed === "object" && parsed !== null) {
        return deserializeValue(parsed);
      }
      if (typeof parsed === "string") {
        current = parsed;
        continue;
      }
      break;
    }
    return value;
  }

  if (Array.isArray(value)) return value.map(deserializeValue);

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, deserializeValue(nested)])
    );
  }

  return value;
}

const JSON_OBJECT_STRING = z.string().refine(
  (value) => isRecord(deserializeValue(value)),
  "Payload string must contain a JSON-encoded object."
);

export const TOOL_PAYLOAD_SCHEMA = z.union([
  z.record(z.string(), z.unknown()),
  JSON_OBJECT_STRING,
]);

/**
 * Normalize clients that JSON-encode structured tool arguments one or more
 * extra times. Scalar strings are preserved exactly; only strings that resolve
 * to objects/arrays are decoded, with a bounded unwrap depth.
 */
export function normalizeToolPayload(
  value: Record<string, unknown> | string
): Record<string, unknown> {
  const normalized = deserializeValue(value);
  if (!isRecord(normalized)) {
    throw new TypeError("Tool payload must resolve to a JSON object.");
  }
  return normalized;
}

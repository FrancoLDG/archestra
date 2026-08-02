/**
 * Parse the two argument formats commonly published by MCP catalogs:
 * newline-separated arguments and JSON arrays of strings.
 */
export function parseArgumentsInput(input: string): string[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
    return splitLines(trimmed);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("Arguments must be valid JSON when entered in JSON format");
  }

  const values: unknown = Array.isArray(parsed)
    ? parsed
    : isArgumentsObject(parsed)
      ? parsed.arguments ?? parsed.args
      : undefined;

  if (
    !Array.isArray(values) ||
    !values.every((value): value is string => typeof value === "string")
  ) {
    throw new Error(
      "JSON arguments must be an array of strings, or an object with an args/arguments array",
    );
  }

  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function splitLines(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function isArgumentsObject(
  value: unknown,
): value is { args?: unknown; arguments?: unknown } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

import { describe, expect, it } from "vitest";
import { parseArgumentsInput } from "./arguments-parser";

describe("parseArgumentsInput", () => {
  it("keeps newline-separated arguments compatible", () => {
    expect(
      parseArgumentsInput("server.js\n--verbose\n  --port 8080  "),
    ).toEqual([
      "server.js",
      "--verbose",
      "--port 8080",
    ]);
  });

  it("parses a JSON array of arguments", () => {
    expect(
      parseArgumentsInput('["server.js", "--verbose", "--port", "8080"]'),
    ).toEqual(["server.js", "--verbose", "--port", "8080"]);
  });

  it("parses args and arguments objects copied from catalog manifests", () => {
    expect(
      parseArgumentsInput('{"args":["--transport","stdio"]}'),
    ).toEqual(["--transport", "stdio"]);
    expect(
      parseArgumentsInput('{"arguments":["--transport","http"]}'),
    ).toEqual(["--transport", "http"]);
  });

  it("rejects malformed JSON and non-string values", () => {
    expect(() => parseArgumentsInput('["--verbose"')).toThrow(/valid JSON/);
    expect(() => parseArgumentsInput('["--port", 8080]')).toThrow(
      /array of strings/,
    );
    expect(() => parseArgumentsInput('{"command":"node"}')).toThrow(
      /args\/arguments/,
    );
  });
});

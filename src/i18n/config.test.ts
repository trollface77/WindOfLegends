import { describe, expect, it } from "vitest";
import { format, matchLocale } from "./config";
import en from "./messages/en";
import es from "./messages/es";
import ptBR from "./messages/pt-BR";

function keys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null
      ? keys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}

describe("locale matching", () => {
  it.each([
    [null, "pt-BR"],
    ["en-US,en;q=0.9", "en"],
    ["es-ES", "es"],
    ["pt-PT", "pt-BR"],
    ["fr-FR,es;q=0.5", "es"],
    ["de-DE", "pt-BR"],
  ])("%s → %s", (header, expected) => {
    expect(matchLocale(header)).toBe(expected);
  });
});

describe("messages", () => {
  it("all languages have the same keys", () => {
    expect(keys(en).sort()).toEqual(keys(ptBR).sort());
    expect(keys(es).sort()).toEqual(keys(ptBR).sort());
  });

  it("formats placeholders", () => {
    expect(format("Hi {name}", { name: "Ana" })).toBe("Hi Ana");
    expect(format("Hi {name}", {})).toBe("Hi {name}");
  });
});

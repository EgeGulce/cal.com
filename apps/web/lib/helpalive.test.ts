import { afterEach, describe, expect, it, vi } from "vitest";
import { getHelpAlive, resetHelpAlive } from "./helpalive";

type PageWithHelpAlive = { HelpAlive?: Record<string, unknown> };

const page = (): PageWithHelpAlive => window as unknown as PageWithHelpAlive;

describe("HelpAlive calls from the page", () => {
  afterEach(() => {
    delete page().HelpAlive;
  });

  it("queues reset() while the script is still loading", () => {
    resetHelpAlive();

    expect(page().HelpAlive?.q).toEqual([["reset", []]]);
  });

  it("keeps the calls in the order the page made them", () => {
    getHelpAlive().identify({ userId: "7" });
    resetHelpAlive();

    expect(page().HelpAlive?.q).toEqual([
      ["identify", [{ userId: "7" }]],
      ["reset", []],
    ]);
  });

  it("calls the loaded script directly", () => {
    const reset = vi.fn();
    page().HelpAlive = { identify: vi.fn(), reset, setConsent: vi.fn(), track: vi.fn() };

    resetHelpAlive();

    expect(reset).toHaveBeenCalledTimes(1);
    expect(page().HelpAlive?.q).toBeUndefined();
  });
});

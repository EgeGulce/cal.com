type HelpAliveMethod = "identify" | "reset" | "setConsent" | "track";
type HelpAliveCall = (...args: unknown[]) => void;
type HelpAliveOnPage = Partial<Record<HelpAliveMethod, HelpAliveCall>> & { q?: unknown[] };

const METHODS: HelpAliveMethod[] = ["identify", "reset", "setConsent", "track"];

/**
 * The HelpAlive script (app/layout.tsx) loads async, so a call can come before it has.
 * Until it arrives, calls wait in HelpAlive.q and the script replays them in order.
 * Checking for HelpAlive first would skip them instead, and the widget would stay hidden until a reload.
 */
export function getHelpAlive(): Record<HelpAliveMethod, HelpAliveCall> {
  const page = window as unknown as { HelpAlive?: HelpAliveOnPage };
  const helpAlive: HelpAliveOnPage = page.HelpAlive || { q: [] };
  page.HelpAlive = helpAlive;
  for (const method of METHODS) {
    if (!helpAlive[method]) {
      helpAlive[method] = (...args: unknown[]): void => {
        helpAlive.q?.push([method, args]);
      };
    }
  }
  return helpAlive as Record<HelpAliveMethod, HelpAliveCall>;
}

/**
 * HelpAlive keeps this browser on the last person it identified until reset() runs.
 * Without it, the next visitor's first clicks, on the login page for example, are filed under that person.
 */
export function resetHelpAlive(): void {
  getHelpAlive().reset();
}

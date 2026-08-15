import { promises as fs } from 'node:fs';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitUntilStable(
  filePath: string,
  stabilityMs: number,
  pollIntervalMs: number,
): Promise<boolean> {
  let lastSize = -1;
  let lastMtimeMs = -1;
  let stableSince: number | null = null;

  while (true) {
    let stat;
    try {
      stat = await fs.lstat(filePath);
    } catch {
      return false;
    }

    if (!stat.isFile()) {
      return false;
    }

    if (stat.size === lastSize && stat.mtimeMs === lastMtimeMs) {
      if (stableSince === null) {
        stableSince = Date.now();
      }
      if (Date.now() - stableSince >= stabilityMs) {
        return true;
      }
    } else {
      stableSince = null;
      lastSize = stat.size;
      lastMtimeMs = stat.mtimeMs;
    }

    await delay(pollIntervalMs);
  }
}
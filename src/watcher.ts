import chokidar, { FSWatcher } from 'chokidar';
import * as path from 'node:path';
import { Logger } from './logger';
import { Organizer } from './organizer';

export function createWatcher(
  rootDir: string,
  organizer: Organizer,
  logger: Logger,
): FSWatcher {
  const watcher = chokidar.watch(rootDir, {
    depth: 0,
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: false,
  });

  watcher.on('add', (filePath) => {
    const fileName = path.basename(filePath);
    void organizer.handleNewFile(fileName).catch(async (err) => {
      const message = err instanceof Error ? err.message : String(err);
      await logger.error(`unexpected error handling ${fileName}: ${message}`);
    });
  });

  watcher.on('error', (err) => {
    const message = err instanceof Error ? err.message : String(err);
    void logger.error(`watcher error: ${message}`);
  });

  return watcher;
}
#!/usr/bin/env node
import * as os from 'node:os';
import * as path from 'node:path';
import { parseArgs, printHelp } from './cli';
import {
  APP_VERSION,
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_STABILITY_MS,
  LOG_FILE_NAME,
} from './config';
import { AccessError, ensureAccessibleDirectory, expandHome } from './fsUtils';
import { LockError, acquireLock } from './lock';
import { Logger } from './logger';
import { Organizer } from './organizer';
import { createWatcher } from './watcher';

async function main(): Promise<void> {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    printHelp();
    return;
  }

  if (options.version) {
    console.log(APP_VERSION);
    return;
  }

  const rawDir = options.dir ?? path.join(os.homedir(), 'Downloads');
  const targetDir = expandHome(rawDir);

  try {
    await ensureAccessibleDirectory(targetDir);
  } catch (err) {
    console.error(`Не удалось получить доступ к ${targetDir}.`);
    console.error('Проверьте права доступа к папке или укажите другую папку:');
    console.error('dorganizer --dir "/путь/к/папке"');
    if (err instanceof AccessError) {
      console.error(`Подробности: ${err.message}`);
    }
    process.exitCode = 1;
    return;
  }

  let releaseLock: (() => Promise<void>) | undefined;
  try {
    releaseLock = await acquireLock(targetDir);
  } catch (err) {
    if (err instanceof LockError) {
      console.error(err.message);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const logFilePath = path.join(targetDir, LOG_FILE_NAME);
  const logger = new Logger(logFilePath, options.quiet);

  const organizer = new Organizer(targetDir, logger, {
    stabilityMs: DEFAULT_STABILITY_MS,
    pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
  });

  await logger.info(`Наблюдение запущено за папкой: ${targetDir}`);

  await organizer.processExistingFiles();

  const watcher = createWatcher(targetDir, organizer, logger);

  let shuttingDown = false;
  const shutdown = async (): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    await logger.info('Остановка наблюдения...');
    await watcher.close();
    if (releaseLock) await releaseLock();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

main().catch((err) => {
  console.error('Непредвиденная ошибка:', err);
  process.exitCode = 1;
});
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { classifyFile, isTemporaryDownload } from './classify';
import { TEMP_DOWNLOAD_SUFFIXES } from './config';
import { ensureDir, moveFile, resolveUniqueDestinationName } from './fsUtils';
import { Logger } from './logger';
import { waitUntilStable } from './stability';

export interface OrganizerOptions {
  stabilityMs: number;
  pollIntervalMs: number;
}

export class Organizer {
  private readonly processing = new Set<string>();
  private readonly recheckRequested = new Set<string>();

  constructor(
    private readonly rootDir: string,
    private readonly logger: Logger,
    private readonly options: OrganizerOptions,
  ) {}

  async processExistingFiles(): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(this.rootDir, { withFileTypes: true });
    } catch (err) {
      await this.logger.error(
        `не удалось прочитать содержимое папки: ${this.describeError(err)}`,
      );
      return;
    }

    for (const entry of entries) {
      if (entry.isFile()) {
        void this.handleCandidate(entry.name);
      }
    }
  }

  async handleNewFile(fileName: string): Promise<void> {
    await this.handleCandidate(fileName);
  }

  private describeError(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }

  private async hasPendingDownload(fileName: string): Promise<boolean> {
    for (const suffix of TEMP_DOWNLOAD_SUFFIXES) {
      try {
        await fs.lstat(path.join(this.rootDir, fileName + suffix));
        return true;
      } catch {
      }
    }
    return false;
  }

  private async handleCandidate(fileName: string): Promise<void> {
    const fullPath = path.join(this.rootDir, fileName);

    if (this.processing.has(fullPath)) {
      this.recheckRequested.add(fullPath);
      return;
    }

    if (fileName.startsWith('.')) {
      await this.logger.skipped(fileName, 'hidden file');
      return;
    }

    if (isTemporaryDownload(fileName)) {
      await this.logger.skipped(fileName, 'temporary download');
      return;
    }

    this.processing.add(fullPath);
    try {
      let stat;
      try {
        stat = await fs.lstat(fullPath);
      } catch {
        return;
      }

      if (stat.isDirectory()) {
        return;
      }

      if (!stat.isFile()) {
        await this.logger.skipped(fileName, 'not a regular file');
        return;
      }

      const stable = await waitUntilStable(
        fullPath,
        this.options.stabilityMs,
        this.options.pollIntervalMs,
      );
      if (!stable) {
        return;
      }

      let finalStat;
      try {
        finalStat = await fs.lstat(fullPath);
      } catch {
        return;
      }
      if (!finalStat.isFile()) {
        return;
      }

      if (await this.hasPendingDownload(fileName)) {
        await this.logger.skipped(fileName, 'download in progress');
        return;
      }

      const classification = classifyFile(fileName);
      const destDir = path.join(this.rootDir, classification.folder);
      await ensureDir(destDir);

      const uniqueName = await resolveUniqueDestinationName(destDir, fileName);
      const destPath = path.join(destDir, uniqueName);

      await moveFile(fullPath, destPath);

      const relativeDest = path.join(classification.folder, uniqueName);
      await this.logger.moved(fileName, relativeDest);
    } catch (err) {
      await this.logger.error(`cannot move ${fileName}: ${this.describeError(err)}`);
    } finally {
      this.processing.delete(fullPath);
      if (this.recheckRequested.delete(fullPath)) {
        void this.handleCandidate(fileName);
      }
    }
  }
}
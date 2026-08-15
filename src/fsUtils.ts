import { promises as fs, constants as fsConstants } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { splitForUniqueSuffix } from './classify';

export class AccessError extends Error {}

export function expandHome(inputPath: string): string {
  if (inputPath === '~') {
    return os.homedir();
  }
  if (inputPath.startsWith('~/') || inputPath.startsWith('~\\')) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return inputPath;
}

export async function ensureAccessibleDirectory(dirPath: string): Promise<void> {
  let stat;
  try {
    stat = await fs.stat(dirPath);
  } catch {
    throw new AccessError(`Папка не найдена: ${dirPath}`);
  }

  if (!stat.isDirectory()) {
    throw new AccessError(`Указанный путь не является папкой: ${dirPath}`);
  }

  try {
    await fs.access(dirPath, fsConstants.R_OK | fsConstants.W_OK);
  } catch {
    throw new AccessError(`Недостаточно прав на чтение/запись для папки: ${dirPath}`);
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function resolveUniqueDestinationName(
  destDir: string,
  fileName: string,
): Promise<string> {
  let candidate = fileName;
  let counter = 0;

  while (await pathExists(path.join(destDir, candidate))) {
    counter += 1;
    const { base, suffix } = splitForUniqueSuffix(fileName);
    candidate = `${base} (${counter})${suffix}`;
  }

  return candidate;
}

export async function moveFile(source: string, destination: string): Promise<void> {
  try {
    await fs.rename(source, destination);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'EXDEV') {
      await fs.copyFile(source, destination);
      await fs.unlink(source);
    } else {
      throw err;
    }
  }
}
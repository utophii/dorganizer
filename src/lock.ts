import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';

export class LockError extends Error {}

function lockDir(): string {
  const base = process.env.XDG_RUNTIME_DIR ?? os.tmpdir();
  return path.join(base, 'dorganizer');
}

function lockFilePath(targetDir: string): string {
  const hash = crypto.createHash('sha256').update(targetDir).digest('hex').slice(0, 16);
  return path.join(lockDir(), `${hash}.lock`);
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function acquireLock(targetDir: string): Promise<() => Promise<void>> {
  const dir = lockDir();
  await fs.mkdir(dir, { recursive: true });
  const filePath = lockFilePath(targetDir);

  try {
    const existing = await fs.readFile(filePath, 'utf8');
    const pid = parseInt(existing.trim(), 10);
    if (!Number.isNaN(pid) && isProcessAlive(pid)) {
      throw new LockError(
        `Органайзер уже запущен для этой папки (PID ${pid}). ` +
          `Если это ошибка — удалите файл блокировки: ${filePath}`,
      );
    }
  } catch (err) {
    if (err instanceof LockError) throw err;
  }

  await fs.writeFile(filePath, String(process.pid), 'utf8');

  return async () => {
    try {
      await fs.unlink(filePath);
    } catch {
    }
  };
}
import { promises as fs } from 'node:fs';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function timestamp(): string {
  const d = new Date();
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

export class Logger {
  constructor(private readonly logFilePath: string) {}

  private async writeToFile(line: string): Promise<void> {
    try {
      await fs.appendFile(this.logFilePath, line + '\n', 'utf8');
    } catch {
      console.error('Не удалось записать в файл журнала:', this.logFilePath);
    }
  }

  async moved(sourceName: string, destinationRelative: string): Promise<void> {
    const line = `[${timestamp()}] MOVED  ${sourceName} → ${destinationRelative}`;
    console.log(line);
    await this.writeToFile(line);
  }

  async skipped(name: string, reason: string): Promise<void> {
    const line = `[${timestamp()}] SKIPPED  ${name} (${reason})`;
    console.log(line);
    await this.writeToFile(line);
  }

  async error(message: string): Promise<void> {
    const line = `[${timestamp()}] ERROR  ${message}`;
    console.error(line);
    await this.writeToFile(line);
  }

  async info(message: string): Promise<void> {
    const line = `[${timestamp()}] INFO  ${message}`;
    console.log(line);
    await this.writeToFile(line);
  }
}
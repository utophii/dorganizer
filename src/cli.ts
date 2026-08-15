export interface CliOptions {
  dir?: string;
  help: boolean;
  version: boolean;
  quiet: boolean;
}

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { help: false, version: false, quiet: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--version' || arg === '-v') {
      options.version = true;
    } else if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
    } else if (arg === '--dir') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Параметр --dir требует значения: путь к папке.');
      }
      options.dir = value;
      i++;
    } else if (arg.startsWith('--dir=')) {
      options.dir = arg.slice('--dir='.length);
    } else {
      throw new Error(
        `Неизвестный параметр: ${arg}\nИспользуйте --help для справки.`,
      );
    }
  }

  return options;
}

export function printHelp(): void {
  console.log(`
Органайзер загрузок

Постоянно наблюдает за папкой загрузок и автоматически раскладывает
файлы из её корня по подпапкам на основе расширения.

Использование:
  dorganizer [--dir "путь/к/папке"] [--quiet] [--help] [--version]

Параметры:
  --dir <путь>   Папка для наблюдения (по умолчанию: ~/Downloads).
  -q, --quiet    Не выводить обычные сообщения в консоль (только ошибки).
                 Полезно при запуске как systemd-сервис.
  -h, --help     Показать эту справку и выйти.
  -v, --version  Показать версию и выйти.

Примеры:
  dorganizer
  dorganizer --dir "~/Desktop/Test Downloads"
  dorganizer --quiet

Остановка: Ctrl+C (или системный сигнал завершения).
`);
}
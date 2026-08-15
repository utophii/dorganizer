export interface CliOptions {
  dir?: string;
  help: boolean;
}

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { help: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
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
  dorganizer [--dir "путь/к/папке"] [--help]

Параметры:
  --dir <путь>   Папка для наблюдения (по умолчанию: ~/Downloads).
  -h, --help     Показать эту справку и выйти.

Примеры:
  dorganizer
  dorganizer --dir "~/Desktop/Test Downloads"

Остановка: Ctrl+C.
`);
}
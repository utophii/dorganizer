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
        throw new Error('Option --dir requires a value: path to a directory.');
      }
      options.dir = value;
      i++;
    } else if (arg.startsWith('--dir=')) {
      options.dir = arg.slice('--dir='.length);
    } else {
      throw new Error(
        `Unknown option: ${arg}\nUse --help for usage information.`,
      );
    }
  }

  return options;
}

export function printHelp(): void {
  console.log(`
dorganizer - downloads organizer

Watches your downloads folder and automatically moves files from its
root into subfolders based on their extension.

Usage:
  dorganizer [--dir "path/to/folder"] [--quiet] [--help] [--version]

Options:
  --dir <path>   Folder to watch (default: ~/Downloads).
  -q, --quiet    Do not print regular messages to the console (errors only).
                 Useful when running as a systemd service.
  -h, --help     Show this help and exit.
  -v, --version  Show version and exit.

Examples:
  dorganizer
  dorganizer --dir "~/Desktop/Test Downloads"
  dorganizer --quiet

To stop: Ctrl+C (or send a termination signal).
`);
}
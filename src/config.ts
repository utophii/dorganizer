export const APP_VERSION = '1.0.0';

export const DEFAULT_STABILITY_MS = 3000;

export const DEFAULT_POLL_INTERVAL_MS = 500;

export const LOG_FILE_NAME = '.dorganizer.log';

export const ARCHIVE_EXTENSIONS: ReadonlySet<string> = new Set([
  'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'cab',
]);

export const COMPOUND_ARCHIVE_SUFFIXES: readonly string[] = [
  '.tar.gz',
  '.tar.bz2',
  '.tar.xz',
];

export const TEMP_DOWNLOAD_SUFFIXES: readonly string[] = [
  '.crdownload',
  '.part',
  '.tmp',
  '.download',
];

export const ARCHIVES_FOLDER_NAME = 'archives';
export const NO_EXTENSION_FOLDER_NAME = 'no-extension';

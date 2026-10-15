import {
  ARCHIVE_EXTENSIONS,
  ARCHIVES_FOLDER_NAME,
  COMPOUND_ARCHIVE_SUFFIXES,
  NO_EXTENSION_FOLDER_NAME,
  TEMP_DOWNLOAD_SUFFIXES,
} from './config';

export interface Classification {
  folder: string;
  isArchive: boolean;
  hasExtension: boolean;
}

export function isTemporaryDownload(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return TEMP_DOWNLOAD_SUFFIXES.some((suffix) => lower.endsWith(suffix));
}

export function stripTemporarySuffix(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  for (const suffix of TEMP_DOWNLOAD_SUFFIXES) {
    if (lower.endsWith(suffix) && fileName.length > suffix.length) {
      return fileName.slice(0, fileName.length - suffix.length);
    }
  }
  return null;
}

export function classifyFile(fileName: string): Classification {
  const lower = fileName.toLowerCase();

  for (const suffix of COMPOUND_ARCHIVE_SUFFIXES) {
    if (lower.endsWith(suffix)) {
      return { folder: ARCHIVES_FOLDER_NAME, isArchive: true, hasExtension: true };
    }
  }

  const lastDot = fileName.lastIndexOf('.');

  if (lastDot === -1) {
    return { folder: NO_EXTENSION_FOLDER_NAME, isArchive: false, hasExtension: false };
  }

  const extension = fileName.slice(lastDot + 1).toLowerCase();

  if (extension === '') {
    return { folder: NO_EXTENSION_FOLDER_NAME, isArchive: false, hasExtension: false };
  }

  if (ARCHIVE_EXTENSIONS.has(extension)) {
    return { folder: ARCHIVES_FOLDER_NAME, isArchive: true, hasExtension: true };
  }

  return { folder: extension, isArchive: false, hasExtension: true };
}

export function splitForUniqueSuffix(fileName: string): { base: string; suffix: string } {
  const lower = fileName.toLowerCase();

  for (const suffix of COMPOUND_ARCHIVE_SUFFIXES) {
    if (lower.endsWith(suffix)) {
      return {
        base: fileName.slice(0, fileName.length - suffix.length),
        suffix: fileName.slice(fileName.length - suffix.length),
      };
    }
  }

  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    return { base: fileName, suffix: '' };
  }

  return { base: fileName.slice(0, lastDot), suffix: fileName.slice(lastDot) };
}
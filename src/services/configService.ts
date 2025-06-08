// src/services/configService.ts

const SHEET_ID_KEY = 'invoiceApp_sheetId';
const DRIVE_FOLDER_ID_KEY = 'invoiceApp_driveFolderId';

// Helper function to save a string to localStorage
// If value is null or undefined, the key is removed.
function saveString(key: string, value: string | null | undefined): void {
  if (value === null || value === undefined || value === '') {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
}

// Helper function to get a string from localStorage
function getString(key: string): string | null {
  return localStorage.getItem(key);
}

// --- Sheet ID ---
export function saveSheetId(id: string | null): void {
  saveString(SHEET_ID_KEY, id);
}

export function loadSheetId(): string | null {
  return getString(SHEET_ID_KEY);
}

// --- Drive Folder ID ---
export function saveDriveFolderId(id: string | null): void {
  saveString(DRIVE_FOLDER_ID_KEY, id);
}

export function loadDriveFolderId(): string | null {
  return getString(DRIVE_FOLDER_ID_KEY);
}

// --- Combined Config ---
export interface AppConfig {
  sheetId: string | null;
  driveFolderId: string | null;
}

export function getConfig(): AppConfig {
  return {
    sheetId: loadSheetId(),
    driveFolderId: loadDriveFolderId(),
  };
}

// --- Clear Config ---
export function clearConfig(): void {
  localStorage.removeItem(SHEET_ID_KEY);
  localStorage.removeItem(DRIVE_FOLDER_ID_KEY);
}

// Potentially, a more generic saveConfig if needed in the future:
/*
export function saveConfig(config: Partial<AppConfig>): void {
  if (config.sheetId !== undefined) {
    saveSheetId(config.sheetId);
  }
  if (config.driveFolderId !== undefined) {
    saveDriveFolderId(config.driveFolderId);
  }
}
*/

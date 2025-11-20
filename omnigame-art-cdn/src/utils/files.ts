import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Ensure a directory exists, creating parent directories if needed
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
    }
  }
}

/**
 * Copy a file from source to destination
 * Creates destination directory if it doesn't exist
 */
export async function copyFile(src: string, dst: string): Promise<void> {
  await ensureDir(path.dirname(dst));
  await fs.copyFile(src, dst);
}

/**
 * Write JSON data to a file with pretty formatting
 */
export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Read and parse JSON from a file
 */
export async function readJson<T = unknown>(filePath: string): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`Failed to read JSON from ${filePath}: ${error.message}`);
  }
}

/**
 * Check if a path exists
 */
export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively copy a directory
 * Returns the number of files copied
 */
export async function copyDirectory(src: string, dst: string): Promise<number> {
  await ensureDir(dst);
  
  let count = 0;
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    
    if (entry.isDirectory()) {
      count += await copyDirectory(srcPath, dstPath);
    } else {
      await copyFile(srcPath, dstPath);
      count++;
    }
  }
  
  return count;
}

/**
 * Get all files in a directory recursively
 */
export async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}


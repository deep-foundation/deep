import { Deep } from './deep.js';
import chokidar from 'chokidar';
import fs from 'fs/promises';

/**
 * Synchronizes a JSON file with a Deep selection.
 * When file changes, creates a new selection from the file content.
 * When input selection changes, saves it to the file.
 * 
 * @param inputSelection - The Deep selection to sync with file
 * @param path - Path to the JSON file
 * @returns The selection created from file content
 */
export async function syncJSONFile(inputSelection: Deep, path: string): Promise<Deep> {
  const deep = inputSelection.deep;
  let SyncJSONFile = deep.contains.SyncJSONFile;
  if (!SyncJSONFile) {
    SyncJSONFile = deep.contains.SyncJSONFile = deep.new();
    const allJSONFiles = deep.select({ type: SyncJSONFile });
    allJSONFiles.on((event) => {
      if (event.name === 'kill') {

      }
    });
  }
  const syncJSONFile = SyncJSONFile.new();

  // Create initial selection from file
  try {
    const fileContent = await fs.readFile(path, 'utf-8');
    const data = JSON.parse(fileContent);
    const fileSelection = inputSelection.unpack(data);
  } catch (error) {
    if (error.code === 'ENOENT') { // File doesn't exist
      // Save initial selection to file
      const data = await inputSelection.pack;
      await fs.writeFile(path, JSON.stringify(data, null, 2));
    } else {
      console.error(`Error loading initial data from ${path}:`, error);
      throw error;
    }
  }

  // Watch for file changes
  const watcher = chokidar.watch(path, {
    persistent: true,
    ignoreInitial: true,
  });
  syncJSONFile.from = deep.wrap(() => {
    console.log('closing watcher');
    watcher.close();
  });

  let isUpdatingFile = false; // Flag to prevent recursive updates

  watcher.on('change', async () => {
    if (isUpdatingFile) return; // Skip if we're currently updating the file
    
    try {
      const fileContent = await fs.readFile(path, 'utf-8');
      const data = JSON.parse(fileContent);
      const fileSelection = await inputSelection.unpack(data);
    } catch (error) {
      console.error(`Error processing file change for ${path}:`, error);
    }
  });

  // Watch for input selection changes
  const unsubscribe = inputSelection.on(async (event) => {
    if (isUpdatingFile) return; // Skip if we're currently updating the file
    
    try {
      isUpdatingFile = true;
      const data = await inputSelection.pack;
      await fs.writeFile(path, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving changes to ${path}:`, error);
    } finally {
      isUpdatingFile = false;
    }
  });
  syncJSONFile.to = deep.wrap(unsubscribe);

  // Add cleanup method to the returned selection
  syncJSONFile.kill = () => {
    syncJSONFile.from.call();
    syncJSONFile.to.call();
  };

  return syncJSONFile;
}

export default syncJSONFile;

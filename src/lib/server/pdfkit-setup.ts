import fs from 'fs';
import path from 'path';

const FONTS_DIR = path.join(process.cwd(), 'src/lib/server/pdf-fonts');

let patched = false;

export function ensurePdfKitFonts() {
  if (patched) return;
  patched = true;

  const readFileSync = fs.readFileSync.bind(fs);

  fs.readFileSync = ((filePath: fs.PathOrFileDescriptor, ...args: unknown[]) => {
    if (typeof filePath === 'string' && filePath.endsWith('.afm')) {
      const localFont = path.join(FONTS_DIR, path.basename(filePath));
      if (fs.existsSync(localFont)) {
        return readFileSync(localFont, ...(args as [Parameters<typeof fs.readFileSync>[1]?]));
      }
    }

    return readFileSync(filePath, ...(args as [Parameters<typeof fs.readFileSync>[1]?]));
  }) as typeof fs.readFileSync;
}

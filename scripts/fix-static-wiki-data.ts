// One-shot cleanup for already-generated static maps.
// Fixes three known issues from the original scraper processors:
//   1. Blood types: trailing wiki footnote digits ("F 4" → "F")
//   2. Heights: multiple cm values listed ("91 cm 172 cm 174 cm" → "174 cm")
//   3. Ages: first number taken instead of last ("7" → "19" for Luffy etc.)
//      Ages can't be corrected without raw wiki data, so we skip them here.
//      The scraper itself is fixed for future runs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.join(__dirname, '..', 'src', 'lib', 'onepiece');

function fixFile(
  filePath: string,
  transform: (value: string) => string,
): void {
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = content.replace(/'([^']+)':\s*'([^']+)'/g, (_match, key, value) => {
    const newVal = transform(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `'${key}': '${newVal}'`;
  });
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    const changed = (content.match(/'[^']+': '[^']+'/g) ?? []).filter((entry, i) => {
      const newEntries = (fixed.match(/'[^']+': '[^']+'/g) ?? []);
      return entry !== newEntries[i];
    }).length;
    console.log(`  fixed ${filePath.split(/[\\/]/).pop()} (${changed} entries changed)`);
  } else {
    console.log(`  no changes: ${filePath.split(/[\\/]/).pop()}`);
  }
}

// Blood types: strip trailing footnote digit(s) — keep only F, S, X, XF
function fixBloodType(value: string): string {
  const m = value.match(/^(XF|[FSX])/i);
  return m ? m[1].toUpperCase() : value;
}

// Heights: extract last "N cm" value and strip trailing footnote digits
function fixHeight(value: string): string {
  const all = [...value.matchAll(/(\d[\d,.]*)\s*cm/gi)];
  if (all.length > 0) {
    // Take the last cm measurement, strip any trailing space+digits (footnote refs)
    return `${all[all.length - 1][1]} cm`;
  }
  return value;
}

console.log('Fixing static wiki data files...');
fixFile(path.join(LIB, 'static-wiki-blood-types.ts'), fixBloodType);
fixFile(path.join(LIB, 'static-wiki-heights.ts'), fixHeight);
console.log('Done.');

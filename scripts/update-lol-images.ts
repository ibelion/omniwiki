import fs from 'fs';
import path from 'path';

const csvPath = path.resolve('cdn/leaguecontent/info/lol-edit.csv');

function updateCsvImages(filePath: string) {
  const csv = fs.readFileSync(filePath, 'utf8');
  const lines = csv.split(/\r?\n/);
  if (lines.length === 0) return;

  const header = lines[0];
  const cols = header.split(',');
  if (cols.length < 3 || cols[0] !== 'id' || cols[2] !== 'image') {
    console.error('Unexpected CSV header format. Expected id,name,image,...');
    process.exit(1);
  }

  const updated = [header];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      continue; // skip empty trailing lines
    }
    // Basic CSV split respecting quoted commas: use a simple parser
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        // Toggle quotes unless escaped
        if (inQuotes && line[j + 1] === '"') { // escaped quote
          current += '"';
          j++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current);

    const id = fields[0];
    if (!id) {
      updated.push(line);
      continue;
    }

    const newUrl = `https://omniwiki.pages.dev/cdn/leaguecontent/champions/${id}/images/${id}_icon.png`;
    fields[2] = newUrl;

    // Reconstruct CSV line with quoting where needed
    const out = fields.map(v => {
      if (v.includes(',') || v.includes('"') || v.includes('\n')) {
        return '"' + v.replace(/"/g, '""') + '"';
      }
      return v;
    }).join(',');

    updated.push(out);
  }

  fs.writeFileSync(filePath, updated.join('\n'));
  console.log('Updated image URLs in', filePath);
}

updateCsvImages(csvPath);

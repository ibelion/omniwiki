import fs from 'fs';
import path from 'path';

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === '"') {
      if (inQuotes && line[j + 1] === '"') {
        current += '"';
        j++;
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
  return fields;
}

function csvToJson(csvPath: string, jsonPath: string) {
  const text = fs.readFileSync(csvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) {
    fs.writeFileSync(jsonPath, '[]');
    return;
  }
  const headerFields = parseCsvLine(lines[0]);
  const records = [] as any[];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const obj: any = {};
    for (let k = 0; k < headerFields.length; k++) {
      const key = headerFields[k];
      const val = fields[k] ?? '';
      obj[key] = val;
    }
    records.push(obj);
  }

  fs.writeFileSync(jsonPath, JSON.stringify(records, null, 2));
  console.log(`Wrote ${records.length} records to ${jsonPath}`);
}

const csvPath = path.resolve('cdn/leaguecontent/info/lol-edit.csv');
const jsonPath = path.resolve('cdn/leaguecontent/info/lol-edit.json');

csvToJson(csvPath, jsonPath);

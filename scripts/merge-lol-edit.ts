import fs from "node:fs";
import path from "node:path";

const CSV_PATH = path.resolve("cdn/leaguecontent/info/lol-edit.csv");
const BUNDLE_PATH = path.resolve("cdn/leaguecontent/info/bundle.json");
const OUT_PATH = BUNDLE_PATH;
const PUBLIC_BUNDLE_PATH = path.resolve("public/leaguecontent/data/bundle.json");

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = false; }
      } else {
        current += ch;
      }
    } else {
      if (ch === ',') { result.push(current); current = ""; }
      else if (ch === '"') { inQuotes = true; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

function splitTrimmed(value: string): string[] {
  if (!value.trim()) return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function loadLolEdit(): Map<string, Record<string, string>> {
  const text = fs.readFileSync(CSV_PATH, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = parseCsvLine(lines[0]);
  const map = new Map<string, Record<string, string>>();

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const record: Record<string, string> = {};
    for (let k = 0; k < headers.length; k++) {
      record[headers[k]] = (fields[k] ?? "").trim();
    }
    // Key by display name (lowercased) for matching
    map.set(record["name"].toLowerCase(), record);
  }
  return map;
}

function main() {
  const lolEdit = loadLolEdit();
  const bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, "utf8"));

  let merged = 0;
  let unmatched: string[] = [];

  for (const champ of bundle.champions) {
    const edit = lolEdit.get(champ.name.toLowerCase());
    if (!edit) {
      unmatched.push(champ.name);
      continue;
    }

    // Overwrite with curated human-readable data from lol-edit
    champ.roles = splitTrimmed(edit["roles"]);
    champ.positions = splitTrimmed(edit["positions"]);
    champ.regions = splitTrimmed(edit["regions"]);
    champ.rangeType = edit["range_type"] || champ.rangeType;

    // Add fields that weren't in the bundle schema before
    champ.gender = edit["gender"] || null;
    champ.species = splitTrimmed(edit["species"]);

    // Keep resource from bundle (lol-edit has simplified/stale values)

    merged++;
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(bundle, null, 2), "utf8");
  console.log(`Merged lol-edit data into ${merged} champions`);
  if (unmatched.length > 0) {
    console.log(`Unmatched (kept bundle data): ${unmatched.join(", ")}`);
  }

  // Also update the public static bundle so the app sees it immediately
  fs.writeFileSync(PUBLIC_BUNDLE_PATH, JSON.stringify(bundle, null, 2), "utf8");
  console.log(`Wrote public bundle: ${PUBLIC_BUNDLE_PATH}`);
}

main();

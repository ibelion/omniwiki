import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// quotes.json uses full paths like /leaguecontent/champions/Azir/audio/foo.ogg
// bundle.json uses relative paths like champions/Azir/audio/foo.ogg
const QUOTES_PATH = path.resolve('cdn/leaguecontent/info/quotes.json');
const PUBLIC_BUNDLE_PATH = path.resolve('public/leaguecontent/data/bundle.json');
const CDN_BUNDLE_PATH = path.resolve('cdn/leaguecontent/data/bundle.json');

type RawQuote = {
  champion: string;
  text: string;
  category: string;
  language: string;
  audio: string;
};

type BundleQuote = {
  champion: string;
  text: string;
  category: string;
  language: string;
  audio: string;
};

function main(): void {
  const raw: RawQuote[] = JSON.parse(fs.readFileSync(QUOTES_PATH, 'utf8'));
  console.log(`Loaded ${raw.length} raw quote records.`);

  // Deduplicate: for each champion+text, keep the first record encountered.
  // Alternate takes (_2.ogg, _3.ogg) appear after the canonical take in the file,
  // so the first occurrence is always the primary audio path.
  const seen = new Set<string>();
  const deduped: RawQuote[] = [];
  let dropped = 0;

  for (const q of raw) {
    const key = `${q.champion}\x00${q.text}`;
    if (seen.has(key)) {
      dropped++;
      continue;
    }
    seen.add(key);
    deduped.push(q);
  }

  console.log(`Deduplicated: ${deduped.length} unique quotes (dropped ${dropped} alternate takes).`);

  // Write deduplicated list back to cdn/leaguecontent/info/quotes.json
  fs.writeFileSync(QUOTES_PATH, JSON.stringify(deduped, null, 2) + '\n', 'utf8');
  console.log(`Updated ${QUOTES_PATH}`);

  // Patch bundle.json — strip the /leaguecontent/ prefix on audio paths
  const bundle = JSON.parse(fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8')) as Record<string, unknown>;

  const bundleQuotes: BundleQuote[] = deduped.map((q) => ({
    champion: q.champion,
    text: q.text,
    category: q.category,
    language: q.language,
    audio: q.audio.replace(/^\/leaguecontent\//, ''),
  }));

  bundle.quotes = bundleQuotes;

  const bundleJson = JSON.stringify(bundle, null, 2) + '\n';
  fs.writeFileSync(PUBLIC_BUNDLE_PATH, bundleJson, 'utf8');
  console.log(`Updated bundle with ${bundleQuotes.length} quotes.`);

  // Recompress for CDN
  const compressed = zlib.gzipSync(Buffer.from(bundleJson, 'utf8'));
  fs.writeFileSync(CDN_BUNDLE_PATH, compressed);
  console.log('Recompressed CDN bundle. Done.');
}

main();

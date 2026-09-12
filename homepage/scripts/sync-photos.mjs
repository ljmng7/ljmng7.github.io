import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import exifr from 'exifr';
import sharp from 'sharp';

const dataURL = new URL('../src/data/photo.json', import.meta.url);
const folder = new URL('../public/photos/', import.meta.url);
const photos = JSON.parse(await readFile(dataURL, 'utf8'));
const files = (await readdir(folder)).filter(name => /\.(jpe?g|png|webp|avif)$/i.test(name)).sort();
const missing = photos.filter(photo => !files.includes(photo.filename));
if (missing.length) throw new Error(`Missing photo files: ${missing.map(p => p.filename).join(', ')}`);
for (const filename of files) {
  let photo = photos.find(p => p.filename === filename);
  if (!photo) {
    const title = filename.replace(/\.[^.]+$/, '');
    photo = { filename, title: { zh: title, en: title }, location: null, placeholder: false };
    photos.push(photo);
  }
  const dimensions = await sharp(fileURLToPath(new URL(encodeURIComponent(filename), folder))).metadata();
  const metadata = dimensions.exif ? await exifr.parse(dimensions.exif.subarray(dimensions.exif.toString("ascii", 0, 4) === "Exif" ? 6 : 0), { gps: true }) : undefined;
  const rotated = (dimensions.orientation ?? 0) >= 5;
  photo.width = rotated ? dimensions.height : dimensions.width;
  photo.height = rotated ? dimensions.width : dimensions.height;
  if (Number.isFinite(metadata?.latitude) && Number.isFinite(metadata?.longitude)) {
    photo.location = { ...photo.location, latitude: metadata.latitude, longitude: metadata.longitude };
  }
  if (!photo.width || !photo.height) throw new Error(`${filename}: image dimensions unavailable; add width/height to photo.json and retry.`);
}
await writeFile(dataURL, JSON.stringify(photos, null, 2) + '\n');
console.log(`Updated ${photos.length} photos. Existing order, titles and manual locations preserved.`);

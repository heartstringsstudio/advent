// Checks content/days.json: one entry per day, in date order, every field filled, audio present.
import { readFileSync, existsSync } from 'node:fs';
const data = JSON.parse(readFileSync('content/days.json', 'utf8'));
const errs = [];
const start = Date.parse(data.start + 'T00:00:00Z');
data.days.forEach((d, i) => {
  const want = new Date(start + i * 864e5).toISOString().slice(0, 10);
  if (d.day !== i + 1) errs.push(`entry ${i + 1}: day should be ${i + 1}`);
  if (d.date !== want) errs.push(`day ${d.day}: date ${d.date} should be ${want}`);
  for (const k of ['title', 'verse', 'ref', 'prayer']) if (!d[k]) errs.push(`day ${d.day}: missing ${k}`);
  if (!Array.isArray(d.body) || !d.body.length) errs.push(`day ${d.day}: missing body`);
  const mp3 = `audio/day-${String(d.day).padStart(2, '0')}.mp3`;
  if (!existsSync(mp3)) console.warn(`note: ${mp3} missing — phone voice will read the verse`);
});
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
console.log(`OK — ${data.days.length} days, ${data.days[0].date} to ${data.days.at(-1).date}`);

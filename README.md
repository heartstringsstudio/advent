# Advent Devotional

An installable phone app (PWA) from Heartstrings Studio. Each day you get the Advent wreath (one more candle lit every Sunday, and the Christ candle on Christmas Eve), then that day's verse read aloud, then a short devotional and a one-line prayer.

**Season:** Sunday, Nov 29, 2026 through Friday, Jan 1, 2027. That's 34 days, using the same verse each morning as the [Daily Verse Alarm](https://heartstringsstudio.github.io/alarm/). The verse narration MP3s are copied from the alarm's `2026-advent` pack, verses 05–38.

| Week | Dates | Wreath |
|---|---|---|
| Hope | Nov 29 – Dec 5 | 1 purple |
| Peace | Dec 6 – 12 | 2 purple |
| Joy | Dec 13 – 19 | + rose |
| Love | Dec 20 – 23 | all 4 |
| Christmas Eve | Dec 24 | + white Christ candle |
| Christmastide | Dec 25 – Jan 1 | all 5 |

Before Nov 29 the app shows a countdown and lets readers preview Day 1. Readers can go back to earlier days, but future days stay locked.

## Test any day
Add `?date=2026-12-14` to the address.

## Edit a devotional
Everything is in `content/days.json`. Then run `node tools/check-days.mjs`, commit, and push. Phones pick up the change the next time the app opens.

## Files
| Path | What it is |
|---|---|
| `index.html`, `app.css`, `app.js` | The app. The wreath is drawn in code, in `drawWreath` in `app.js` |
| `content/days.json` | All 34 days: verse, title, devotional, prayer |
| `audio/day-NN.mp3` | Verse narration. If a file is missing, the phone's built-in voice reads the verse |
| `img/og.png` | Link-preview image for Facebook and texts |
| `img/hero.webp` | *Optional* painted night background behind the wreath (see IMAGES.md) |
| `sw.js` | Offline support. Bump `VERSION` when you change the app files |

## Publishing (one-time)
1. Make the repo **public**.
2. Go to **Settings → Pages → Source: GitHub Actions**.
3. Merge to `main`.

The app goes live at `https://heartstringsstudio.github.io/advent/`.

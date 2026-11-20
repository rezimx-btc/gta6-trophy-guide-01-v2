# Leonida Ledger v2

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rezimx-btc/gta6-trophy-guide-01-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rezimx-btc/gta6-trophy-guide-01-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The best offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI — built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What makes v2 stronger

The first version cited sources once per trophy and kept no dates, no matrix and no audit trail. This version fixes all of that:

- **Every step cites its own source.** All 153 steps carry a named, dated source — a claim without a citation earns nothing, so none is left uncited.
- **Nine dated sources.** Every source lists the date it was accessed, and the Sources panel shows how many steps cite each one.
- **A source matrix.** Rows are the 55 trophies, columns are the 9 sources; a mark means a step of that trophy cites that source.
- **An audit strip.** Computed from the data, never typed: 55/55 names match the official PlayStation list, 1 platinum / 2 gold / 6 silver / 46 bronze, 20 missable, 153 cited steps, 9 dated sources, 28 hidden.
- **Four trophies marked unverified.** Their methods are not publicly documented, so they carry an explicit "unverified — no public source" flag instead of invented steps.

## The guide itself

- All 55 trophies with their official names, descriptions and grades exactly as PlayStation publishes them, plus a guide in this entry's own words.
- A 6-stage roadmap to the platinum, in the order to earn them, built from the official descriptions.
- All 20 missable trophies flagged — earn them before the story moves on.
- A tracker: checklist saved in localStorage, export to a file and import back, filters by kind (story, missable, collectibles, activities, online), and a spoiler setting that hides story trophy names and descriptions until earned.

## Run it

Serve `app/` with any static HTTP server and open `app/index.html` in desktop Chrome. It works with the network off — every file it loads is its own. No Rockstar logo, artwork or game screenshots anywhere in the guide.

```sh
cd app && python3 -m http.server 8080
```

## Hand it in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into the output directory and writes `dossier.json` there.

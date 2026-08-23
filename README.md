# SQ1-WebSite

Static Squad One tournament site and leaderboard architecture.

## Leaderboard Architecture

- `database/schema.sql` contains the PostgreSQL tables, constraints, indexes, and a dynamic leaderboard query.
- `prisma/schema.prisma` contains the equivalent Prisma data model.
- `src/leaderboard.ts` contains frontend/API TypeScript contracts and aggregation helpers.
- `src/models.py` contains Python dataclasses and leaderboard aggregation logic for Excel/import pipelines.

The leaderboard supports qualifier/finals rounds, overall and A-vs-B group filters, six match views, team totals, and player-level CQB/LRB metrics. `Total Points` is calculated as `Placement Points + Kills`; `Total Damage` is calculated as `CQB Damage + LRB Damage`.

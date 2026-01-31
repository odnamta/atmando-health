# Atmando Health - Kiro Configuration

This folder contains Kiro agent steering documentation for the Atmando Health project.

## Quick Start

```bash
# Development
npm run dev

# Build
npm run build

# Generate Supabase types
npm run db:types
```

## Folder Structure

```
.kiro/
├── steering/           # Agent steering files
│   ├── general.md              # Code conventions (always included)
│   ├── project-context.md      # Project overview (always included)
│   ├── database-schema.md      # Database reference (always included)
│   ├── formatting-standards.md # Indonesian formatting (always included)
│   └── user-guide.md           # User guide (manual inclusion)
│
├── specs/              # Feature specifications (v0.x.y naming)
│   ├── v0.1-profiles-dashboard/
│   ├── v0.2-health-metrics/
│   ├── v0.3-documents/
│   ├── v0.4-vaccinations-visits/
│   ├── v0.5-medications/
│   ├── v0.6-emergency-card/
│   ├── v0.7-notifications/
│   ├── v0.8-garmin-sync/
│   └── v0.9-growth-charts/
│
├── hooks/              # Agent hooks
│   ├── update-project-context.kiro.hook
│   └── update-database-schema.kiro.hook
│
└── README.md           # This file
```

## Steering Files

| File | Inclusion | Purpose |
|------|-----------|---------|
| general.md | Always | Code conventions, patterns, DO/DON'T |
| project-context.md | Always | Project overview, tech stack, workflows |
| database-schema.md | Always | Full database schema with RLS |
| formatting-standards.md | Always | Indonesian locale formatting |
| user-guide.md | Manual | Non-technical user guide |

## Spec Versioning

Specs follow semantic versioning: `v{major}.{minor}-{feature-name}`

- v0.x = MVP features
- v1.x = Post-launch features

Each spec folder contains:
- `requirements.md` - User stories and acceptance criteria
- `design.md` - Technical design and component hierarchy
- `tasks.md` - Implementation tasks

## Development Phases

| Phase | Spec | Days | Status |
|-------|------|------|--------|
| 1 | v0.1-profiles-dashboard | 2 | 🔲 |
| 2 | v0.2-health-metrics | 2 | 🔲 |
| 3 | v0.3-documents | 2 | 🔲 |
| 4 | v0.4-vaccinations-visits | 2 | 🔲 |
| 5 | v0.5-medications | 1.5 | 🔲 |
| 6 | v0.6-emergency-card | 1.5 | 🔲 |
| 7 | v0.7-notifications | 2 | 🔲 |
| 8 | v0.8-garmin-sync | 2 | 🔲 |
| 9 | v0.9-growth-charts | 2 | 🔲 |

**Total: ~17 days**

## Key References

- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [Database Schema](steering/database-schema.md) - Full schema with RLS
- [PRD](../docs/PRD.md) - Product Requirements Document (if exists)

## Agent Hooks

### update-project-context
Triggers after significant work to update:
- Recent Changes in project-context.md
- CHANGELOG.md entries
- Task status

### update-database-schema
Triggers when database changes to:
- Update database-schema.md
- Document new RLS policies

# Atmando Health - Kiro Setup

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in Supabase credentials
4. Run development server: `npm run dev`

## Kiro Structure

```
.kiro/
├── steering/           # Agent guidance files
│   ├── general.md              # Code conventions (always included)
│   ├── project-context.md      # Project overview (always included)
│   ├── database-schema.md      # DB schema reference (always included)
│   ├── formatting-standards.md # Indonesian locale (always included)
│   └── user-guide.md           # User docs (manual inclusion)
├── hooks/              # Automated agent actions
│   ├── update-project-context.json
│   └── update-database-schema.json
├── specs/              # Feature specifications
│   └── atmando-health-mvp/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
└── README.md           # This file
```

## Supabase Setup

1. Create project at supabase.com (or use existing `atmando-family`)
2. Run migrations from `.kiro/steering/database-schema.md`
3. Generate types: `npm run db:types`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Key Files

- Steering docs: `.kiro/steering/`
- Database schema: `.kiro/steering/database-schema.md`
- Changelog: `CHANGELOG.md`

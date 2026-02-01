# Changelog

All notable changes to Atmando Health will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ Added
- **v0.2 Health Metrics Pages & Actions** - Complete milestone
  - `/health` list page with member/type filtering and chart display
  - `/health/[id]` edit page with delete confirmation dialog
  - `AddMetricSheet` bottom sheet for adding new metrics
  - Server actions: getHealthMetrics, addHealthMetric, updateHealthMetric, deleteHealthMetric
  - Loading skeletons for health pages
  - Empty states for no data scenarios
  - Alert-dialog component for delete confirmation
- **v0.2 Health Metrics Components** - Complete
  - Database migration for health_metrics table with ENUM type
  - RLS policies for family data isolation
  - Zod validation schemas for all metric types
  - MetricTypePicker grid component for metric selection
  - MetricValueInput adaptive input (single/dual for BP)
  - MetricCard display with status badge and timestamp
  - MetricStatusBadge with color-coded status (normal/warning/danger)
  - TimeRangeSelector component (1W, 1M, 3M, 1Y, ALL)
  - MetricChart with Recharts, reference lines, custom tooltip
  - BloodPressureChart wrapper with systolic/diastolic legend
  - WeightChart wrapper with current weight and change stats
  - GenericMetricChart for temperature, heart rate, blood sugar, SpO2
  - Installed recharts@3.7.0 for interactive charts
- **v0.1 Family Profiles & Dashboard** - Complete milestone
  - Dashboard layout with header, mobile menu, and user dropdown
  - Family overview page with member cards and health status
  - Member dashboard with tabbed interface (metrics, documents, etc.)
  - Members list page with role badges and edit links
  - Member edit page with profile form and avatar upload
  - Server actions for profile updates and avatar uploads
  - Loading skeletons for all dashboard pages
  - Toast notifications via Sonner
- Comprehensive PRD v1.0 with full feature specifications
- Complete database schema with 15+ health-specific tables
- Indonesian IDAI vaccination schedule reference
- Emergency card with QR code specification
- Garmin Connect integration design
- WHO growth chart standards for children
- PWA offline support architecture
- 9 feature specs (v0.1-v0.9) with requirements, design, and tasks

### 📝 Docs
- Created full steering documentation from PRD
- Added comprehensive database schema with RLS policies
- Enhanced formatting standards with health-specific formatters
- Expanded user guide with all features in Indonesian
- Added .kiro/README.md with project structure

### 🔧 Changed
- Spec versioning now uses semantic versioning (v0.x.y)
- Removed old atmando-health-mvp spec folder

---

## Emoji Categories

| Emoji | Category | Description |
|-------|----------|-------------|
| ✨ | Added | New features |
| 🔧 | Changed | Changes to existing features |
| 🐛 | Fixed | Bug fixes |
| 🗑️ | Removed | Removed features |
| 🔒 | Security | Security improvements |
| 📝 | Docs | Documentation updates |
| 🎨 | Style | UI/UX improvements |
| ⚡ | Performance | Performance improvements |
| 🏗️ | Build | Build system changes |
| 🧪 | Test | Test additions/changes |

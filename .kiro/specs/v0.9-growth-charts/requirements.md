# v0.9 - Growth Charts (WHO Standards)

**Version:** v0.9.0

## Overview

Growth tracking for children with WHO standard percentile charts.

## User Stories

### US-8.1: WHO Growth Charts
As a parent, I want to see Alma and Sofia's growth plotted against WHO standards so that I know they're developing normally.

### US-8.2: Percentiles
As a parent, I want to see height/weight percentiles and track them over time.

### US-8.3: Developmental Milestones
As a parent, I want to record developmental milestones (first steps, first words, etc.).

### US-8.4: Export for Pediatrician
As a parent, I want to export growth charts as PDF to share with pediatricians.

## Features

| ID | Feature | Priority |
|----|---------|----------|
| F1 | Height vs age chart | P1 |
| F2 | Weight vs age chart | P1 |
| F3 | WHO percentile bands | P1 |
| F4 | Percentile calculation | P1 |
| F5 | BMI chart | P2 |
| F6 | Head circumference chart | P2 |
| F7 | Developmental milestones | P2 |
| F8 | PDF export | P2 |

## WHO Percentile Bands

Charts show:
- 3rd percentile (bottom)
- 15th percentile
- 50th percentile (median)
- 85th percentile
- 97th percentile (top)

## Milestone Categories

| Category | Examples |
|----------|----------|
| Motor | First steps, crawling, sitting |
| Language | First word, sentences |
| Social | First smile, waving |
| Cognitive | Object permanence, problem solving |

## Acceptance Criteria

- [ ] Shows height chart with WHO bands
- [ ] Shows weight chart with WHO bands
- [ ] Calculates and displays percentiles
- [ ] Plots child's data points on chart
- [ ] Can record milestones with date
- [ ] Can export chart as PDF

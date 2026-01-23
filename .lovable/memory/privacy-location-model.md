# Memory: privacy/location-model
Updated: 2026-01-23

## Location Access Philosophy
- Precise location required by default at signup
- Cannot be toggled off in-app (only option is uninstall)
- Enables automatic presence detection (no manual check-ins needed)

## What Hawkly Tracks
- ONLY approved venue categories: bars, nightclubs, events, entertainment, sports venues
- Presence inside venue geofences
- Short-lived presence signals (not historical trails)

## What Hawkly Ignores
- Homes, workplaces, grocery stores, pharmacies
- General movement/paths between locations
- Non-social/non-relevant locations

## Data Privacy Safeguards
- Never show individual user locations
- Never show movement timelines
- Never expose arrival/departure times per user
- All outputs are aggregate-based (e.g., "~42 people active here")
- No selling/exporting of movement data

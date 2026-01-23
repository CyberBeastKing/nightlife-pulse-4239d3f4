# Memory: auth/anonymity-model
Updated: 2026-01-23

## Anonymous Username System
- Users MUST use system-generated usernames, no real names allowed
- Username format by gender:
  - Male: "Mr" prefix (e.g., MrSwiftWolf1234)
  - Female: "Mrs" prefix (e.g., MrsCosmicAngel5678)
  - LGBTQ+: Creative names (e.g., RainbowJourney9012)
- Users pick from 3 generated options at signup
- Usernames are PERMANENT and cannot be changed (enforced by DB trigger)

## Age Verification
- Users must be 21+ to use Hawkly
- Date of birth collected at signup
- Enforced by RLS policy using is_over_21() function
- No facial recognition (privacy concern)

## Privacy Principles
- Only anonymous usernames visible to others
- No real names, no personally identifiable info in usernames
- Location data used only for venue activity aggregation
- Individual locations never shown, only aggregate venue counts

# Memory: features/profile-tab/control-center-architecture
Updated: 2026-01-24

## Profile Tab Philosophy
The Profile tab is a private control center and transparency dashboard—NOT a social profile. It represents the trust contract between user and Hawkly: "This is how Hawkly sees me and how I control it."

## Visual Design
- Clean, calm, minimal dark UI
- Serious and respectful tone (not gamified)
- No followers, likes, bios, or public identity elements

## Section Structure

### 1. Identity Section (Low Emphasis)
- Anonymous username display
- Icon-based avatar (no photos)
- Status indicator: "Location contributing" or "Location paused"

### 2. Community Standing (Conditional)
- Only displays if user has strikes or bans
- Hidden for users in good standing

### 3. Location Transparency Panel (Most Important)
- Shows current tracking status (ON/OFF indicators)
- Plain language explanation of data use
- Builds trust through honesty

### 4. Location Controls (Two Separate Systems)
**A. Hawkly System Location:**
- "Contribute Location to Hawkly" toggle
- Controls: automatic check-ins, crowd accuracy
- Warning shown when disabled

**B. Social Location Sharing:**
- Friends / Family / No one options
- Controls who sees user at venues
- Completely independent from system location

### 5. Privacy & Safety
- Block place suggestions
- Hide from 'Join' prompts
- Mute venue chats

### 6. Preferences
- Push notifications toggle
- Vibe preference slider (quiet ↔ busy)

### 7. Data Transparency ("About Hawkly")
- What IS collected (presence, aggregate signals, preferences)
- What is NOT collected (home/work, paths, timelines, contacts)
- Links to Privacy Policy and Terms

## Location Philosophy
- Default ON with proper onboarding consent
- OS-level control acknowledged ("If you disable in phone settings, Hawkly cannot collect")
- Incentive-based retention, not force
- Social sharing separate from system contribution

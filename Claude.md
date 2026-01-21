# Screen Time Casino — Claude Instructions

This repository contains the mobile app **Screen Time Casino**.

Claude is expected to act as a senior engineer, not a tutor.

---

## Product Intent

Screen Time Casino allows users to gamble daily screen-time limits using casino-style games.

- Users may chase losses
- Variance is intentional
- The app is designed to feel like a real casino
- A single monthly subscription ($2.99) unlocks all games and unlimited plays

This is not a digital wellness product.

---

## Core Rules

### Platform
- iOS-first
- Expo (React Native)
- TypeScript everywhere

### Monetization
- One subscription tier
- No consumables
- No microtransactions beyond the subscription

### Gameplay
- Casino games adjust screen-time limits
- Outcomes are probabilistic
- Each game defines:
  - Win probability
  - Loss probability
  - Screen-time delta
  - Daily caps

---

## Non-Negotiable Constraints

- Screen-time limits must have hard min/max bounds
- No infinite or background gambling loops
- Game logic must be deterministic and testable
- Odds must be explicit in code (not hidden constants)
- Logic must be decoupled from UI

---

## Code Architecture Guidelines

### Domain-first
- Casino logic lives in pure functions
- No React state inside domain logic
- UI only consumes computed outcomes

### State modeling
- Prefer explicit state machines over booleans
- Represent wins, losses, caps, cooldowns clearly

### Testing
- Logic should be unit-testable without a simulator
- Avoid coupling tests to Expo APIs

---

## What NOT to Do

- Do not introduce moral framing or behavior correction
- Do not add “are you sure?” dialogs unless requested
- Do not optimize for App Store optics unless explicitly asked
- Do not invent new monetization layers

---

## Claude Behavior Rules

- Be concise but precise
- Explain tradeoffs briefly when necessary
- Do not overengineer
- Ask questions only when blocked
- Prefer shipping over perfection

---

## Definition of Done

A feature is “done” when:
- The logic is correct
- Edge cases are handled
- The code is readable
- The behavior matches casino intuition

Nothing else matters.
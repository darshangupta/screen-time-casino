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

---

## Development Strategy

### Architecture Assessment

**Current State Analysis:**
- ✅ Strong domain-first architecture with pure casino engines
- ✅ Clean separation between domain logic and UI components
- ✅ Redux state management properly structured
- ✅ React Navigation configured with modal game presentations  
- ✅ TypeScript throughout codebase
- ✅ Mock integrations for Screen Time and RevenueCat
- ✅ Casino game engines implemented with explicit probabilities
- ✅ iOS configuration ready for Screen Time permissions

**Technical Foundation Score: 8/10** - Excellent architecture decisions demonstrate senior engineering approach

---

## Development Roadmap

### **Phase 1: Frontend Polish & Core UX (Weeks 1-3)**
*Priority: Critical - User experience foundation*

**Objectives:**
- Complete casino game implementations
- Polish UI/UX for App Store readiness
- Implement proper error states and loading patterns
- Add haptic feedback and animations

**Deliverables:**
1. **Game Engine Completion**
   - Finish incomplete game logic (verify all 7 games work end-to-end)
   - Implement proper win/loss animations
   - Add sound effects and haptic feedback
   - Test probabilistic outcomes match game configs

2. **UI/UX Polish**
   - Implement proper loading states for all async operations
   - Add error boundaries and graceful error handling
   - Polish casino floor navigation and game selection
   - Add onboarding flow (permissions, subscription value prop)

3. **Performance Optimization**
   - Profile rendering performance on device
   - Optimize game animations for 60fps
   - Implement proper memory management for game sessions
   - Bundle size optimization

**Success Criteria:**
- All 7 casino games fully functional with proper animations
- 60fps performance on target iOS devices
- Zero crashes during normal operation
- Onboarding conversion rate >60% (measured via analytics)

**Testing Requirements:**
- Unit tests for all casino engines
- Integration tests for Redux state management
- UI tests for critical user flows
- Performance tests on multiple iOS devices

---

### **Phase 2: Authentication & Profile Infrastructure (Weeks 4-5)**
*Priority: High - Required for data persistence and user management*

**Objectives:**
- Implement user authentication system
- Add profile management and data persistence
- Prepare for subscription and screen time integrations

**Deliverables:**
1. **Authentication System**
   - Choose auth provider (Firebase Auth, Supabase, or custom)
   - Implement sign-up/sign-in flows
   - Add anonymous auth for immediate play
   - Secure token management and refresh

2. **Profile & Data Management**
   - User profile creation and management
   - Secure storage of game progress and screen time data
   - Data synchronization across devices
   - Offline capability for core casino games

3. **Backend Infrastructure**
   - User data storage architecture
   - Game session tracking
   - Analytics event collection
   - Subscription status synchronization

**Success Criteria:**
- <2 second auth flow completion
- 99.9% auth success rate
- Proper offline/online sync with conflict resolution
- GDPR/CCPA compliant data handling

**Integration Points:**
- Redux store integration for user state
- Navigation updates for authenticated vs anonymous flows
- Profile screen enhancement with real data

---

### **Phase 3: iOS Screen Time Integration (Weeks 6-7)**
*Priority: Critical - Core product functionality*

**Objectives:**
- Replace mock Screen Time service with real iOS implementation
- Handle Screen Time permissions and edge cases
- Integrate with casino game outcomes

**Deliverables:**
1. **Screen Time API Implementation**
   - Real iOS Screen Time API integration
   - Permission request flow with proper messaging
   - Screen time limit reading and modification
   - Family settings compatibility check

2. **Casino Integration**
   - Connect game outcomes to actual screen time changes
   - Implement daily caps and safety limits
   - Add proper error handling for iOS restrictions
   - Screen time visualization and progress tracking

3. **Edge Case Handling**
   - Restricted/supervised device handling
   - Screen Time disabled scenarios
   - Family sharing conflicts
   - iOS version compatibility

**Success Criteria:**
- 95% Screen Time permission approval rate
- Accurate screen time limit modifications
- Zero critical failures when Screen Time is restricted
- Proper user communication for all edge cases

**Risk Mitigation:**
- Extensive testing on various iOS configurations
- Fallback modes for restricted environments
- Clear user messaging for permission requirements
- App Store review preparation for sensitive permissions

---

### **Phase 4: Subscription & Monetization (Weeks 8-9)**
*Priority: Critical - Revenue generation*

**Objectives:**
- Implement RevenueCat subscription system
- Create compelling paywall experience
- Handle subscription edge cases and restore purchases

**Deliverables:**
1. **RevenueCat Integration**
   - Replace mock subscription service
   - Configure App Store Connect products
   - Implement purchase flow and receipt validation
   - Handle subscription renewals and cancellations

2. **Paywall Implementation**
   - Compelling subscription onboarding
   - Feature comparison (free vs premium)
   - Limited-time offers and trial periods
   - Restore purchases functionality

3. **Subscription Management**
   - Account for family sharing
   - Handle subscription downgrades/upgrades
   - Grace period and billing retry logic
   - Customer support integration

**Success Criteria:**
- >15% conversion rate on paywall
- <2% subscription churn rate monthly
- 99.9% purchase processing reliability
- App Store review compliance

**Monetization Strategy:**
- Single $2.99/month subscription tier
- 3-day free trial for new users
- Premium games unlock (4 additional games)
- Increased daily play limits (3→10 spins)

---

### **Phase 5: Analytics & App Store Launch (Weeks 10-11)**
*Priority: High - Launch readiness and optimization*

**Objectives:**
- Implement comprehensive analytics
- Prepare for App Store submission
- Add crash reporting and monitoring

**Deliverables:**
1. **Analytics Implementation**
   - User behavior tracking (game preferences, session length)
   - Conversion funnel analysis
   - Retention cohort tracking
   - Revenue analytics and LTV calculation

2. **Crash Reporting & Monitoring**
   - Crash reporting service integration (Sentry/Bugsnag)
   - Performance monitoring
   - Real-time alerting for critical issues
   - User feedback collection system

3. **App Store Preparation**
   - App Store assets (screenshots, description, keywords)
   - Privacy policy and terms of service
   - App Store review preparation
   - Staged rollout plan

**Success Criteria:**
- <0.1% crash rate
- Complete analytics coverage for key user actions
- App Store approval on first submission
- 4.5+ star average rating at launch

**Launch Strategy:**
- Soft launch in select markets
- Gradual rollout with monitoring
- A/B testing for key conversion points
- Community building and user feedback collection

---

### **Phase 6: Post-Launch Optimization (Weeks 12-16)**
*Priority: Medium - Continuous improvement*

**Objectives:**
- Optimize based on real user data
- Implement user retention features
- Plan future game additions

**Deliverables:**
1. **Performance Optimization**
   - Real user monitoring analysis
   - Performance improvements based on device data
   - Battery usage optimization
   - Network efficiency improvements

2. **User Retention Features**
   - Daily login bonuses
   - Achievement system
   - Social features (leaderboards, sharing)
   - Push notifications for engagement

3. **Content Expansion**
   - New casino games development
   - Seasonal events and promotions
   - User-requested feature implementation
   - A/B testing for game mechanics

**Success Criteria:**
- 30% Day 7 retention rate
- 15% Day 30 retention rate
- Reduced support tickets by 40%
- Positive app store review trend (>4.0 stars)

---

## Technical Architecture Decisions

### **State Management Strategy**
- Continue with Redux Toolkit for predictable state management
- Implement Redux Persist for offline capabilities
- Use RTK Query for API layer when adding backend services

### **Performance Strategy**
- React Native performance optimization
- Memory management for game sessions
- Image and asset optimization
- Code splitting for feature-specific bundles

### **Security Architecture**
- Certificate pinning for API communications
- Secure storage for sensitive data
- Biometric authentication for subscription management
- Regular security audits and penetration testing

### **Quality Assurance Strategy**
- Automated testing pipeline (unit, integration, E2E)
- Device testing lab for iOS compatibility
- Performance testing on various hardware
- User acceptance testing with target demographics

## Risk Assessment & Mitigation

### **High-Risk Areas:**
1. **App Store Review** - Gambling-adjacent apps face scrutiny
   - *Mitigation:* Clear messaging about screen time management, not real gambling
   
2. **iOS Screen Time API** - Complex permissions and restrictions
   - *Mitigation:* Extensive testing, graceful fallbacks, clear user communication
   
3. **Subscription Compliance** - App Store subscription guidelines
   - *Mitigation:* Follow all guidelines, proper restore purchases, clear pricing

### **Medium-Risk Areas:**
1. **User Retention** - Novelty may wear off quickly
   - *Mitigation:* Strong analytics, quick iteration, engaging content updates

2. **Technical Complexity** - Multiple integrations increase failure points
   - *Mitigation:* Comprehensive testing, monitoring, rollback capabilities

## Success Metrics

### **Development Phase Metrics:**
- Code coverage >80%
- Build success rate >95%
- Performance benchmarks met
- Zero critical security vulnerabilities

### **Launch Phase Metrics:**
- App Store approval rate 100%
- Crash rate <0.1%
- Screen Time permission approval >90%
- Subscription conversion >15%

### **Growth Phase Metrics:**
- Monthly active users growth >20%
- Retention rates (D7: 30%, D30: 15%)
- Revenue per user targets
- App Store rating >4.0
# Screen Parity Status — iOS → React Native

Tracking which screens match the original iOS app and what work remains.

## Parity Philosophy

**Preserve visuals and feel, not architecture.** The iOS app was Ted's first software project — visually beloved, architecturally naive. Use iOS as a reference for *what features exist* and *what they look/feel like*, not as a blueprint for how to structure screens, navigation, or component hierarchies. When porting surfaces a structural improvement (separation of concerns, cleaner mental models, dropping redundant cruft), take it. See CLAUDE.md → Design Philosophy.

## Complete

| Mobile Screen | iOS ViewController | Notes |
|---|---|---|
| HomeScreen | HomePageViewController | Cloud animations, logo, Quick Play / How to Play |
| CardSelectionScreen | NewCardViewController | Mountain scape bg, blob character, speech bubble, shake-to-go-back, red vector buttons |
| PlayScreen | GameViewController | 10 switches with sound, countdown timer, switch state tracking |
| GameOverScreen | GameOverViewController | Stars, score display, result saving |
| ReportCardScreen | MessageViewController | Nailed/missed items, fun fact, score comment |
| RulesScreen | RulesViewController | How-to-play instructions |
| TutorialScreen | TutorialViewController | Map background, navigation buttons |
| DecksScreen | DeckCollectionViewController | Two-section blob grid (Your Decks + Get More Decks). Locked decks show "Coming soon" alert (real IAP deferred). Options moved to SettingsScreen. Back-nav fixed via explicit native-stack header config. |
| SettingsScreen | SettingsViewController | Light-theme rewrite. Cyan ScreenHeader, five flat rows (Sound, Timer, Rate Us, Tutorial, Rules). Timer subtitle reads live from GameContext. |

## Partial

| Mobile Screen | iOS ViewController | What's Missing |
|---|---|---|
| StoreScreen | BuyDeckViewController | IAP service hooked up but UI is minimal — missing individual deck purchase modals, pricing, purchase confirmations |
| TimerScreen | TimerTableViewController + SetTimerViewController | Presets work (60/75/99s); missing custom timer input UI |

## Not Porting

| iOS ViewController | Reason |
|---|---|
| FactViewController | 15-line stub in iOS, functionality integrated into ReportCardScreen |
| ViewController (base) | iOS platform architecture, not a screen |

## Known Issues

- **Bundle ID** — currently `com.anonymous.cartegories-mobile`, needs renaming to `com.cartegories.app` or similar (separate task)
- **Animation library** — using React Native `Animated` which is known to be flaky. Planned migration to `react-native-reanimated` after parity is complete.
- **Expo dev menu shake conflict** — shake gesture for "go back" feature conflicts with Expo's dev menu shake. Users need to disable "Shake to show Developer Menu" in Expo Go settings. Not an issue in production builds.

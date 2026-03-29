# Scoring Specification

Extracted from the iOS Car-Tegories app (GameViewController.swift, GameOverViewController.swift, MessageViewController.swift).

## Core Scoring

- Each card has exactly **10 items**
- Player toggles switches ON for items they got correct
- **Score = number of switches ON** (0-10)
- Score updates in real-time as switches toggle

## Perfect Score (All 10)

When all 10 switches are ON (`allItems()` triggers):
- Timer stops immediately
- "Tada" sound plays
- Device vibrates
- Game ends — skip to results

## Time's Up

When timer reaches 0:
- "Honk" sound plays
- Device vibrates
- Switches that are ON → nailedItems
- Switches that are OFF → missedItems
- Transition to results screen

## Star Rating

| Score | Stars | Label |
|-------|-------|-------|
| 10 | 3 | Perfect |
| 8-9 | 2 | Violation |
| 6-7 | 1 | Violation |
| 0-5 | 0 | Violation |

## Report Card Comments

Random comment selected based on score:

| Score | Sample Comments |
|-------|----------------|
| 0 | "That's terrible.", "A goose egg.", "Zilch." |
| 1 | "One is the loneliest number", "And a partridge in a pear tree" |
| 2 | "Two bad.", "I'm not impressed" |
| 3 | "There were three stooges, too.", "Three blind mice." |
| 4 | "Maybe next time" |
| 5 | "High five!", "Mambo number five!", "The glass is half full" |
| 6 | "Six sick sheep", "Rock on.", "You're in the winners circle" |
| 7 | "Nice!", "A solid performance" |
| 8 | "Like a good pizza", "Great work!" |
| 9 | "So. Close.", "Amazing!", "Not bad at all", "Very good!", "That'll do, pig." |
| 10 | "You're awesome!", "GOOOOOOOAAAALLLLL!", "Stupendous!", "Bing. Bang. BOOM!", "You got 'em all!", "Borderline eleven!", "Nice job!", "It's outta here!", "Out of this world!", "Simply perfection!", "Gold star!", "Hot dog!" |

## Fun Facts

Each card has an optional `fact` field. After the game, the fact is displayed on the results screen. Player can tap the blob image to show/hide it.

## Results Screen Flow

1. Game ends (timer or perfect score)
2. 3-second delay
3. GameOver screen: star rating display
4. Auto-transition to Report Card: nailed items, missed items, witty comment, fun fact

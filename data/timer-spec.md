# Timer Specification

Extracted from the iOS Car-Tegories app (GameViewController.swift, TimerTableViewController.swift).

## Available Durations

| Option | Seconds |
|--------|---------|
| Default | 60 |
| Medium | 75 |
| Long | 99 |

Player selects timer duration before starting a game. Default is 60 seconds.

## Countdown Behavior

- Timer fires every **1 second** (`Timer.scheduledTimer(timeInterval: 1.0)`)
- Display format: `:<seconds>` (e.g., `:45`)
- Each tick: `time -= 1`
- At 0: game ends (see scoring spec)

## Pause / Resume

- Player can tap a button to pause/resume
- **Paused:** timer invalidates, all item switches disabled, button shows "START"
- **Resumed:** new timer created, switches re-enabled, button shows "PAUSE"

## Game Start

- Timer begins when the game screen loads
- "highDing" sound plays at start

## Sound Effects

| Event | Sound File |
|-------|-----------|
| Game start | highDing.mp3 |
| Switch toggle ON | ButtonTap.wav |
| Item click | Click.wav |
| Time's up | Honk.wav |
| Perfect score | Tada.wav |

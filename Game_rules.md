# GAME_RULES.md

This file is the living rule book for the current game.
Whenever the game changes, this document should be updated to match the real behavior.

## 1. Game overview

- The game is `Snack Catcher`.
- The player starts as `eevee.png`.
- The win condition is reaching a total score of `100`.
- Restarting, exiting, or continuing from the win screen resets the run back to the starting state unless a rule below says otherwise.
- The game uses local image and audio assets already in the folder.

## 2. Core HUD and layout

- The page uses a left HUD pane and a right game pane.
- The title, score, lives, snack progress bars, hint text, and exit button live in the left HUD pane.
- The playable game area fills the full browser height in the right pane.
- The HUD and game world are visually separated as two side-by-side panes.
- The exit button sits near the bottom-left of the HUD.
- The exit button is disabled whenever the game is not actively running.
- A temporary debug overlay appears at the top-right of the game pane and shows the current day/night phase plus cloud timing information.

## 3. Items, score, and lives

### Snack types

- Strawberry: `🍓`
- Cookie: `🍪`
- Donut: `🍩`
- Apple: `🍎`

### Base scoring rules

- Catching a snack adds `1` point to the total score.
- Catching a snack also counts as one caught snack for the `Snack X / Y` HUD.
- Every snack pickup shows a yellow `+1` floating text effect.
- The snack pickup sound `Eat.m4a` plays when a snack is eaten.
- The game starts with `2` lives.
- Losing a life shows a red `-1` floating text effect.
- Gaining a life shows a green `+1` floating text effect.
- Floating score and life effects last `3` seconds, float upward, and disappear at the top of the view.

### Snack and bomb counters

- `Snack X / Y`
  - `X` is the number of snacks successfully caught.
  - `Y` is the total number of snacks that spawned and fell from the sky, including caught and missed snacks.
- `Burned Z`
  - `Z` is the number of bombs destroyed while the player is in `fire.png` form.

## 4. Form system

- Collecting `5` of the same snack fills that snack bar and changes the player to the matching form.
- Only one form effect can be active at a time.
- Changing to a different form removes the previous form's ongoing property.
- When a form changes, the previous form's snack bar resets to `0`.
- Each form change flashes the player for `3` seconds.
- The flash frequency is `0.25` seconds.
- `Change.m4a` plays when the player changes to a new form.

### `eevee.png`

- This is the default form.
- Normal movement speed.
- No bomb immunity.
- No special passive ability.

### `char.png`

- Trigger: collect `5` strawberries.
- Immediate effect: add `1` life.
- Ongoing effect: bomb fall speed is reduced by `50%` while this form is active.

### `leaf.png`

- Trigger: collect `5` cookies.
- Each snack caught by the player while this form is active creates one carnivorous plant trap.
- The plant is placed on the same ground line as the player, using the player's bottom position as the spawn baseline.
- The plant uses a tall cartoon mouth-up design with a visible red tongue.
- The plant is about twice as tall as the player and uses roughly the player's width as its hitbox width.
- Plants remain in the game area while the player stays in `leaf.png`.
- Plants idle with a visible but small wiggle or fidget motion.
- If a falling snack touches a plant hitbox, one valid plant grabs that snack.
- A grabbed snack is removed, awards `+1` point, counts as a caught snack, shows the normal yellow snack score effect, and uses the normal snack pickup sound.
- If more than one plant could grab the same snack, only one plant gets it.
- Plants do not grab bombs.
- Changing away from `leaf.png` removes all carnivorous plants.

### `light.png`

- Trigger: collect `5` donuts.
- Ongoing effect: player movement speed is doubled.

### `fire.png`

- Trigger: collect `5` apples.
- Ongoing effect: bomb immunity.
- Duration: `15` seconds unless another form change happens first.
- The text `You are now invincible` appears while this form is active.
- A large countdown in seconds appears centered in the game pane while this form is active.
- The label text is smaller than the countdown number.
- When the timer ends, the player returns to `eevee.png`.
- If the player touches a bomb in this form:
  - The bomb plays a destroyed-looking flicker and explosion effect.
  - `Explode.m4a` plays.
  - The player gains `1` point.
  - A yellow `+1` floating text appears at the bomb location.
  - The destroyed bomb increments the `Burned` counter.

## 5. Snack progress bars

- Each snack uses a `5`-segment progress bar instead of a numeric counter.
- The emoji and Chinese snack label stay on the same line as the bar.
- All four bars align to the same left edge and width.
- The right-most segment stays fully visible inside the HUD frame.
- The bar colors are:
  - Strawberry: light pink
  - Cookie: light green
  - Donut: yellow
  - Apple: red
- When a snack bar reaches `5`, it turns light blue and pulses in a clearly stronger charged state.
- A charged bar stops counting additional snacks of that same type until it resets.
- Leaving a form resets that form's bar to `0` so it can be charged again later.

## 6. Falling-item spawn rules

- All falling items share one global spawn timer.
- Spawn timing is score-based:
  - Score below `60`: `850ms`
  - Score `60+`: `600ms`
  - Score `80+`: `400ms`
- Each spawn creates either a snack or a bomb.

## 7. Bomb rules

### Bomb spawn chance

- Below score `50`: base chance `0.22`
- Score `50+`: chance `0.28`
- Score `75+`: chance `0.35`
- Score `90+`: chance `0.45`

### Bomb difficulty by score

- Score `35+`
  - Size multiplier: `1.5x`
  - Speed multiplier: `1.25x`
- Score `50+`
  - Size multiplier: `2x`
  - Speed multiplier: `1.5x`
- Score `65+`
  - Size multiplier: `2.5x`
  - Speed multiplier: `1.75x`
  - Visual spin: `1` rotation every `2` seconds
- Score `80+`
  - Size multiplier: `3x`
  - Speed multiplier: `2x`
  - Visual spin: `1` rotation every `1` second
- Score `90+`
  - Size multiplier: `4x`
  - Speed multiplier: `3x`
  - Visual spin: `1` rotation every `0.333` seconds

### Bomb interaction rules

- Bombs reduce life by `1` unless the current form is immune.
- `Explode.m4a` plays whenever a bomb is touched or destroyed by `fire.png`.
- `Dropbomb.m4a` plays whenever a bomb begins to fall.
- If a life is lost:
  - The player immediately changes back to `eevee.png`.
  - All special properties are removed.
- If the player's lives reach `0` after bomb damage, the game ends immediately.

## 8. Screens and flow

- The start screen includes the goal text: `Score 100 points to beat the level.`
- Gameplay background music uses `background_music.mp3`.
- Background music plays only during active gameplay.
- Background music stops on:
  - Start screen
  - Exit
  - Game over
  - Congratulations screen
- The game over screen shows the final score and a play-again button.
- The win screen appears when total score reaches `100`.
- The win screen plays `cheer.m4a` `2` times.
- Entering the win screen resets the individual snack bars to `0`.
- While the win screen is visible, the total score and lives remain visible until the player presses continue.
- Pressing continue returns the game to the initial start screen state.

## 9. World atmosphere

- The game world has three ambient systems:
  - Day-night cycle
  - Weather cycle
  - Random doodad / prop events
- The world keeps a persistent foreground:
  - Brown hills in the distance
  - A green grass strip where the player moves

### Day-night cycle

- Full cycle length: `72` seconds.
- The cycle has `2` phases:
  - Day: `36` seconds
  - Night: `36` seconds
- The visuals interpolate smoothly instead of hard-switching.
- Day moves from a dawn-like purple/blue start into bright daytime, then into sunset orange/red at the end.
- Night moves from sunset into deep night, then into a blue/purple pre-dawn transition.
- The lower dawn horizon stays darker blue near the hills instead of washing out to a pale light-blue strip.
- Stars are visible at night and are strongest around the darkest middle-of-night section.

### Sun and moon

- The sun appears only during the Day phase.
- The moon appears only during the Night phase.
- Each waits `12` seconds after its phase starts.
- Each then travels for `12` seconds from fully off-screen left to fully off-screen right.
- Both fade in and out gently so they do not pop in or out.
- Both move in a straight line.

### Weather

- Weather runs on its own timer and does not use the day-night timer.
- There are `3` cloud depth layers:
  - Far: `30s`
  - Mid: `22s`
  - Near: `14s`
- Once a cloud spawns, it remains visible until its full travel finishes.
- Cloud opacity cycles every `8` seconds through:
  - `0.25`
  - `0.75`
  - `1`
  - `0.5`
  - `0`
  - `0.25`
- Cloud frequency cycles every `6` seconds through:
  - Low
  - Medium
  - High
  - Intense
  - High
  - Medium
  - Then repeats

### Doodads and props

- Frogs can hop across the grass.
- A frog may start from either the left or the right.
- Frogs move with repeated hopping instead of sliding.
- Birds appear in flocks and fly from right to left.
- Each flock uses a random bird color.
- Each flock contains a random number of birds up to `10`.
- Birds use individual small wave motion while flying.
- Frog and bird events spawn on random timers during gameplay.

## 10. Files allowed to change

Codex may edit:

- `game.js`
- `index.html`
- `style.css`

Do not rename image files unless specifically instructed.

# GAME_RULES.md

This file is the living rule book for the current game.
Whenever the game changes, this file should be updated so it matches the latest behavior.

## Current game summary

- The player starts as `eevee.png`.
- The game keeps a total score, individual snack counters, and a life counter.
- The game starts with `2` lives.
- The game uses local sound effects for snack, bomb, and form-change events.
- The game also uses local sound effects for bomb drops and the congratulations screen.
- Life gains and life losses show floating text effects inside the game area.
- The game ends in a win when the total score reaches `100`.
- The start screen tells the player to score `100` points to beat the level.
- Restarting or exiting resets the game back to its starting state.

## Snack items

- Strawberry: `🍓`
- Cookie: `🍪`
- Donut: `🍩`
- Apple: `🍎`

## Player form rules

- The player changes form after collecting `5` of the same snack.
- Only the current form's special property should stay active.
- When the player changes to a different png form, the old form's special property is removed.

### Form effects

- `eevee.png`
  - Default form
  - Normal movement speed
  - No bomb immunity
  - No flower effect

- `char.png`
  - Trigger: collect `5` strawberries
  - Immediate effect: add `1` life
  - Visual effect: show a green `+1` text when life is added
  - No ongoing special property after the life gain

- `leaf.png`
  - Trigger: collect `5` cookies
  - Ongoing effect: whenever any new snack is eaten while this form is active, place a static flower at that catch location
  - When the player changes away from `leaf.png`, remove all static flowers

- `light.png`
  - Trigger: collect `5` donuts
  - Ongoing effect: double player movement speed

- `fire.png`
  - Trigger: collect `5` apples
  - Ongoing effect: bomb immunity
  - This form lasts `15` seconds unless the player changes form earlier
  - Show a countdown in seconds while this form is active
  - When the timer ends, return to `eevee.png` and remove the special properties
  - Show a top-of-game hint: `You are now invincible`
  - If this form touches a bomb, the bomb should play a destroyed-looking flicker and explosion effect
  - If this form touches a bomb, add `3` points to the total score
  - Show a yellow `+3` text effect at the bomb location

### Form change visuals

- Whenever the player changes to a new form, the player should flash for `3` seconds.
- The flash frequency is `0.25` seconds.
- Play `Change.m4a` when the player changes to a new form.

## Bomb rules

- Bomb logic stays in the game.
- Bombs become harder based on total score:
  - At `50+` score: bomb display size and collision become `150%` of original, and bomb drop speed becomes `125%` of original
  - At `70+` score: bomb display size and collision become `200%` of original, and bomb drop speed becomes `150%` of original
  - At `90+` score: bomb display size and collision become `250%` of original, and bomb drop speed becomes `200%` of original
  - At `75+` score: bomb frequency becomes `1 in 4`
  - At `80+` score: the bomb image spins clockwise visually, one full rotation every `2` seconds
  - At `85+` score: bomb frequency becomes `1 in 3`
  - At `95+` score: bomb frequency becomes `1 in 2`
  - At `95+` score: the bomb spin speeds up to one full rotation every `1` second
  - The spin is visual only and does not change the collision size by itself
- Bombs reduce life by `1` unless the current form is immune to bombs.
- Every snack pickup shows a yellow `+1` text effect.
- Play `Eat.m4a` whenever a snack is picked up.
- Play `Explode.m4a` whenever a bomb is touched or destroyed by `fire.png`.
- Play `Dropbomb.m4a` whenever a bomb starts to drop.
- When life is lost, show a red `-1` text effect.
- The yellow snack `+1`, green life `+1`, and red `-1` text effects persist for `3` seconds, float upward, and disappear at the top of the view.
- The floating life text moves upward at the same speed used by the falling snack movement.
- The yellow `+3` score effect also persists for `3` seconds, floats upward, and disappears near the top of the view.
- When life is lost, the player changes back to `eevee.png`.
- When life is lost, all special properties are removed.
- If a bomb hits when no life remains after damage, the game ends immediately.

## Scoreboard rules

- Keep the total score.
- Keep a life scoreboard.
- Each snack uses a `5`-step progress bar instead of a number counter.
- The emoji and snack label stay on the same line as the progress bar.
- Each snack progress bar is wider than before for easier reading.
- The snack bar colors are:
  - Strawberry: light pink
  - Cookie: light green
  - Donut: yellow
  - Apple: red
- When a snack bar reaches `5`, it turns light blue and pulses with a more obvious charged state.
- A full snack bar stops counting more of that snack until it resets.
- When the player changes away from a form, that old form's snack bar resets to `0` and can charge again.
- All counters reset on restart or exit.
- The scoreboard area is more compact so more height is available for the actual game pane.

## Controls and flow

- The game has a start button.
- The game has a play-again button after game over.
- The game has a congratulations screen when the total score reaches `100`.
- When the congratulations screen appears, play `cheer.m4a` `3` times.
- When the game enters the congratulations screen, the individual snack scores and bars reset to `0`.
- While the congratulations screen is showing, keep the total score and lives unchanged until the player presses continue.
- The congratulations screen has a continue button that resets the game to the initial state and start screen.
- The game has an exit button that ends the current run and resets the game to the start state.

## Files allowed to change

Codex may edit:

- `game.js`
- `index.html`
- `style.css`

Do not rename image files unless specifically instructed.

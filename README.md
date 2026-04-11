# English Battle Royale

A one-screen classroom web game for GitHub Pages.

## What this build includes

- Fixed turn order: Team 1 -> Team 2 -> Team 3 -> Team 4
- 28 hidden tiles total
  - 24 graded English questions
  - 4 event tiles
- Full-English UI
- One-screen layout with no page scroll
- Refined compact layout so 100% browser zoom fits more safely without text collisions
- Built-in Web Audio sound effects with a header sound toggle
- Extra stage transitions, arena flash feedback, and timer progress animation
- Timer flicker fix: the question popup no longer re-renders every second
- Scoreboard at the top with team name, score, and streak
- Team 1 and Team 2 always visible on the left
- Team 3 and Team 4 always visible on the right
- Start flow:
  - edit team names
  - click **Start Game**
  - read the rules
  - enter the arena
- Automatic answer checking for A/B/C/D questions
- 15-second main turn and 5-second steal turn
- Steal round picker that shows the other three teams
- Reward menu after a correct answer:
  - Attack
  - +1 Ammo
  - Heal 15 HP
  - Shop
- 3-correct streak support crate
- Phase 2 alliance mode at 14 tiles left or when a team reaches 50 HP
- Autosave with localStorage

## Combat values

- USP Pistol: 12 damage
- MP-40: 18 damage
- AK-47: 28 damage
- AWM: 45 damage and shield-piercing

## Economy values

- Main correct answer: +$50, +1 ammo, +10 score
- Steal correct answer: +$50, +8 score

## Question bank note

The attached bank had 23 questions, so this build includes 1 extra clean airport-vocabulary filler question to make the board exactly 24 questions + 4 event tiles.

Edit `questions.js` if you want to replace or expand the bank.

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload all files in this folder to the `main` branch.
3. Go to **Settings -> Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.
7. Wait for GitHub Pages to publish the site.

## Files

- `index.html` -> layout
- `styles.css` -> visual design and effects
- `questions.js` -> question bank
- `app.js` -> game logic
- `.nojekyll` -> GitHub Pages compatibility

# NutriQuest: Journey of a Molecule 🧬

An iOS game (SwiftUI, iPhone and iPad) that teaches young learners how food is broken down and rebuilt inside the body, down to the molecules. Nutrients are cartoon characters with faces. Kids follow them from the mouth to the mitochondria and watch them turn into energy, building blocks and hormones.

## What's inside

| Tab | What kids do |
| --- | --- |
| **Body Map** | Tap glowing spots on a cartoon body (mouth, stomach, liver, pancreas, thyroid, adrenals, gut, bones…) or zoom inside a cell. Each spot explains what happens there, shows the molecules found there, and links to the journeys that stop there. |
| **Pathways** | 13 animated, step-by-step journeys. At each stop the "star" molecule explains what's happening, and the enzymes, vitamins and minerals that help are shown as chips. Tap a vitamin or mineral chip to meet that character. Ends with a bonus question worth a star. |
| **Molecule Pals** | A collectible gallery of 70 characters (carbs, fats, proteins, vitamins, minerals, hormones, enzymes, energy molecules). Each has a bio, foods it's found in, what it becomes, and a fun fact. |
| **Play** | 5 mini-games, ranks, badges and saved progress. |

### Pathways
- **From Bread to Brain Power**: starch → maltose → glucose → insulin → glycogen → pyruvate → acetyl-CoA → ATP
- **Fiber's Secret Party**: fiber → gut microbes → short-chain fatty acids (butyrate)
- **The Long-Chain Bus Ride**: LCT → bile → lipase → micelles → chylomicrons → lymph → carnitine → β-oxidation
- **The MCT Express Lane**: MCT → portal vein → liver → ketones → brain fuel
- **Protein Puzzle**: protein → pepsin/trypsin → amino acids → ribosome → new proteins; leucine/mTOR; urea
- **From Turkey to Dreamland**: tryptophan → 5-HTP (iron) → serotonin (B6) → melatonin (darkness, methyl groups)
- **Tyrosine's Hormone Superstars**: phenylalanine → tyrosine → L-DOPA → dopamine → noradrenaline (copper + vitamin C) → adrenaline
- **Thyroid Fire**: iodine + tyrosine → T4 → T3 (selenium)
- **Cholesterol's Hormone Family**: cholesterol → pregnenolone → progesterone → cortisol / testosterone → estradiol
- **Sunshine to Strong Bones**: 7-dehydrocholesterol + UVB → vitamin D3 → calcidiol → calcitriol → calcium absorption
- **Iron's Oxygen Mission**: iron + vitamin C → transferrin → glycine + B6 → heme → hemoglobin
- **Insulin: A Hormone Made from Food**: amino acids → ribosome → proinsulin → insulin → zinc storage → GLUT4
- **The ATP Power Plant**: Krebs cycle → NADH → electron transport → oxygen → ATP synthase

### Mini-games
- **Enzyme Scissors**: tap α-bonds to snip starch into glucose, and learn that fiber's β-bonds can't be cut by human enzymes.
- **Fat Traffic Control**: count carbons and route short-, medium- and long-chain fatty acids to the colon, the portal vein or the lymph.
- **Hormone Factory**: build 8 hormones by choosing the right starting molecule and the vitamin/mineral helpers.
- **Ribosome Rush**: link amino acids in order to build real peptides (glutathione, insulin chain starts, oxytocin, vasopressin). Essential amino acids are starred.
- **Molecule Quiz**: 10 random questions from a bank of 47.

## Running it

Requirements: **Xcode 16 or newer**. The app targets **iOS 17+** and has no third-party dependencies.

1. Open `NutriQuest.xcodeproj`.
2. Choose an iPhone or iPad simulator and press **Run** (⌘R).
3. To run on a real device, pick your team under *Signing & Capabilities*. You may also need to change the bundle identifier (`com.nutriquest.NutriQuest`).

The project uses Xcode 16's synchronized folders, so any file added under `NutriQuest/` is picked up automatically.

## Web version

`web/` is a browser version of NutriQuest designed as a game: a "magical science adventure" inside the body. It has the same content, science and rules as the iOS app. It is a static site in plain HTML, CSS and JavaScript, with no build step and no dependencies. Progress is saved in the browser's `localStorage`.

- **Body World** (home): a see-through body with glowing organs. Each place is *hidden*, *ready*, *exploring* (progress ring) or *mastered* (gold star). Tap one to dive in and see the adventures and pals found there. Pals travel through the body, and a microscope view zooms into the cell and mitochondria.
- **Adventures**: each pathway is a winding route map with checkpoints. Finished stops shine with a star, the current stop pulses, and later stops stay locked, with "Mystery Pal ahead!" hints. A bonus question at the destination earns the third star.
- **Molecule Pals**: collectible cards. Undiscovered pals are mystery cards whose clues come from their real data. Meeting a new pal plays a discovery reveal.
- **Arcade**: the five mini-games as cabinets showing stars, best scores, badges to unlock and pals to discover. Earning at least one star in a round reveals the pals that appear in that game.
- **Progress**: the existing ranks, stars and badges, plus daily quests. Finishing all three opens a treasure chest that reveals a random mystery pal. Rank-ups, badges and quests trigger reward moments.

It's published with GitHub Pages at **https://fotosunnyside.github.io/new/**. The `Publish web game` workflow copies `web/` to the `gh-pages` branch whenever `web/` changes, and Pages serves that branch (Settings → Pages → Deploy from a branch → `gh-pages`, `/ (root)`). You can also upload the contents of `web/` to any other static host.

Run it locally from the repository root. ES modules need a web server, so opening `index.html` straight from disk won't work:

```sh
python3 -m http.server --directory web 8000
# then open http://localhost:8000
```

The educational content is not copied by hand. `web/js/content.js` is generated from `NutriQuest/Content/*.swift`, so the iOS app stays the single source of truth. After you edit the Swift content, regenerate it:

```sh
python3 web/tools/export_content.py
```

Game rules live apart from the presentation:

```
web/
  index.html              Page shell
  css/tokens.css          Design tokens: color, glass, radius, spacing, depth, type, motion
  css/app.css             Components and screens
  js/content.js           Generated content: characters, pathways, quiz, recipes, game data
  js/data.js              Body locations, families, games, ranks, clue text
  js/state/store.js       Saved progress (mirrors ProgressStore.swift, plus journeys and quests)
  js/state/progress.js    Rules computed from the save: organ states, journeys, clues, mastery, quests
  js/ui/pal.js            Clay-style Molecule Pal characters
  js/ui/art.js            Body world, organs, cell, arcade scenes, icons
  js/ui/components.js     Progress rings, quest card, adventure tiles, pal cards, question card
  js/ui/fx.js             Discovery reveal, rewards, toasts, confetti, ambient particles
  js/screens/             Body map, adventures, pals, arcade and profile, the five games
  js/app.js               Header, navigation, routing, progress → reward moments
  tools/export_content.py
```

## Project layout

```
NutriQuest/
  App/          App entry, tab bar, onboarding
  Model/        Data types (characters, pathways, body locations) and ProgressStore (saved to UserDefaults)
  Content/      All educational content: Cast (characters), Pathways, quiz, hormone recipes, game data
  Components/   Theme, animated MoleculeFace, custom shapes, confetti, flow layout
  Views/        Body map, pathway player, gallery, play hub
  Games/        The five mini-games
```

All the educational text lives in `Content/`, so teachers or contributors can add characters, pathways or quiz questions without touching any UI code. A new `PathwayStep` just needs a body location, the id of the character starring in that step, a title, some text and a list of helpers.

## About the science

The content is written for roughly ages 9–14. It simplifies the biochemistry but tries not to say anything wrong: real enzymes, cofactors (for example iron for tryptophan/tyrosine hydroxylase, B6 for decarboxylases, copper + vitamin C for dopamine β-hydroxylase, selenium for deiodinases), real peptide sequences and real organ locations. Numbers like "about 30–32 ATP per glucose" and "~90% of serotonin is made in the gut" are rounded, textbook-level figures.

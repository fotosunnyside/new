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

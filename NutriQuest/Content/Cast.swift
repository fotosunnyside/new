import SwiftUI

/// Every personified molecule, enzyme, vitamin, mineral and hormone in the game.
enum Cast {
    static func character(_ id: String) -> MoleculeCharacter {
        lookup[id] ?? all[0]
    }

    static let lookup: [String: MoleculeCharacter] =
        Dictionary(all.map { ($0.id, $0) }, uniquingKeysWith: { first, _ in first })

    /// Matches helper labels on pathway steps (e.g. "Vitamin B6 🔧") to Molecule Pals.
    /// Order matters: more specific keywords come first.
    private static let helperKeywords: [(String, String?)] = [
        ("chymotrypsin", nil), ("colipase", nil), ("vitamin b12", "vitB12"), ("b12", "vitB12"), ("vitamin b6", "vitB6"), ("vitamin b3", "niacin"),
        ("vitamin c", "vitC"), ("folate", "folate"), ("zinc", "zinc"), ("iron", "iron"), ("copper", "copper"),
        ("selenium", "selenium"), ("magnesium", "magnesium"), ("oxygen", "oxygen"), ("calcium", "calcium"),
        ("insulin", "insulin"), ("bile salts", "bile"), ("carnitine", "carnitine"), ("pepsin", "pepsin"),
        ("trypsin", "trypsin"), ("amylase", "amylase"), ("lipase", "lipase"), ("ribosome", "ribosome"),
        ("acetyl-coa", "acetylcoa"), ("gut bacteria", "microbe"), ("calcitriol", "calcitriol"),
    ]

    static func helperCharacterID(for helper: String) -> String? {
        let text = helper.lowercased()
        return helperKeywords.first { text.contains($0.0) }?.1
    }

    static let all: [MoleculeCharacter] = carbs + fats + proteins + vitamins + minerals + hormones + helpers + energy

    // MARK: - Carbohydrates

    static let carbs: [MoleculeCharacter] = [
        MoleculeCharacter(
            id: "starch", name: "Stella Starch", molecule: "Starch (long glucose chain)",
            family: .carbs, shape: .capsule, accessory: "🍞", colorHex: 0xF4A259,
            catchphrase: "I'm a looong necklace of glucose beads!",
            bio: "Plants store energy by linking hundreds to thousands of glucose units into long chains. That's me! Your enzymes snip my alpha bonds one by one to set the glucose free.",
            foods: ["Bread", "Rice", "Potatoes", "Oats", "Pasta", "Corn"],
            becomes: ["Maltose", "Glucose"],
            funFact: "Chew a cracker for 30 seconds and it starts tasting sweet. That's amylase in your spit cutting me into sugars!"),
        MoleculeCharacter(
            id: "maltose", name: "Molly & Mal Maltose", molecule: "Maltose (2 glucose)",
            family: .carbs, shape: .hexagon, accessory: "👯", colorHex: 0xFFB347,
            catchphrase: "We're glucose twins holding hands!",
            bio: "When amylase chops starch, it mostly makes pairs of glucose called maltose. The enzyme maltase on your gut wall splits the twins apart.",
            foods: ["Digested starch", "Malted grains", "Sweet potatoes"],
            becomes: ["2 × Glucose"],
            funFact: "Maltose is the sugar that gives malted milkshakes their special flavor."),
        MoleculeCharacter(
            id: "glucose", name: "Gus Glucose", molecule: "Glucose (C₆H₁₂O₆)",
            family: .carbs, shape: .hexagon, accessory: "⚡️", colorHex: 0xFF9F1C,
            catchphrase: "I'm the body's favorite fast fuel!",
            bio: "I'm a six-carbon sugar ring. I ride your blood to every cell, where I get broken down to make ATP, the energy coin that cells spend.",
            foods: ["Fruit", "Honey", "Digested starch", "Milk (from lactose)"],
            becomes: ["Pyruvate", "Glycogen", "ATP", "Fat (if there's extra)"],
            funFact: "Your brain is a glucose superfan. It uses around 120 grams of glucose every day!"),
        MoleculeCharacter(
            id: "fructose", name: "Frankie Fructose", molecule: "Fructose (fruit sugar)",
            family: .carbs, shape: .pentagon, accessory: "🍓", colorHex: 0xFF6F59,
            catchphrase: "Sweetest sugar in the fruit bowl!",
            bio: "I'm a fruit sugar with a five-sided ring. Unlike Gus, I'm mostly handled by the liver, which turns me into glucose, glycogen or fat.",
            foods: ["Fruit", "Honey", "Table sugar (half of it)"],
            becomes: ["Glucose", "Glycogen", "Fat"],
            funFact: "Fructose is the sweetest natural sugar, even sweeter than table sugar!"),
        MoleculeCharacter(
            id: "fiber", name: "Fiona Fiber", molecule: "Dietary fiber (cellulose & friends)",
            family: .carbs, shape: .capsule, accessory: "🥦", colorHex: 0x6BBF59,
            catchphrase: "Your enzymes can't cut me, and that's my superpower!",
            bio: "I'm made of sugar units too, but they're linked with beta bonds that human enzymes can't break. I travel all the way to your large intestine, where trillions of gut microbes feast on me.",
            foods: ["Beans", "Broccoli", "Apples", "Whole grains", "Lentils", "Berries"],
            becomes: ["Short-chain fatty acids", "Food for gut microbes"],
            funFact: "Cellulose, a kind of fiber in plant walls, is the most common organic polymer on Earth!"),
        MoleculeCharacter(
            id: "glycogen", name: "Glenn Glycogen", molecule: "Glycogen (stored glucose)",
            family: .carbs, shape: .circle, accessory: "🌳", colorHex: 0xE07A5F,
            catchphrase: "I'm the body's sugar savings account!",
            bio: "When there's extra glucose, your liver and muscles link it into a branchy tree called glycogen. When you need energy later, the branches get snipped to release glucose.",
            foods: ["Made in your liver & muscles"],
            becomes: ["Glucose"],
            funFact: "Your liver's glycogen helps keep your blood sugar steady overnight while you sleep."),
    ]

    // MARK: - Fats

    static let fats: [MoleculeCharacter] = [
        MoleculeCharacter(
            id: "lct", name: "Lars Long-Chain", molecule: "Long-chain triglyceride (LCT)",
            family: .fats, shape: .capsule, accessory: "🫒", colorHex: 0xE9B949,
            catchphrase: "Three long tails. I need the bus!",
            bio: "I'm a triglyceride: a glycerol backbone holding three fatty-acid tails that are 13 or more carbons long. I'm too big and oily to swim in blood, so I need bile, micelles and a chylomicron bus to get around.",
            foods: ["Olive oil", "Nuts", "Avocado", "Butter", "Meat", "Fish"],
            becomes: ["Fatty acids", "Chylomicrons", "ATP", "Cell membranes"],
            funFact: "One gram of fat holds about 9 calories, more than twice as much as carbs or protein."),
        MoleculeCharacter(
            id: "mct", name: "Mia MCT", molecule: "Medium-chain triglyceride (MCT)",
            family: .fats, shape: .capsule, accessory: "🥥", colorHex: 0xF6C453,
            catchphrase: "No bus for me. I take the express lane!",
            bio: "My fatty-acid tails are only 6 to 12 carbons long. That makes me easy to digest: I skip the lymph and zip straight to the liver through the portal vein.",
            foods: ["Coconut oil", "Palm kernel oil", "Milk & butter (a little)"],
            becomes: ["Quick energy", "Ketones"],
            funFact: "Caproic, caprylic and capric acid get their names from capra, Latin for goat, because they were found in goat milk!"),
        MoleculeCharacter(
            id: "butyrate", name: "Buddy Butyrate", molecule: "Butyrate (short-chain fatty acid)",
            family: .fats, shape: .capsule, accessory: "🧈", colorHex: 0xF7D08A,
            catchphrase: "Made by microbes, loved by colon cells!",
            bio: "I'm a short-chain fatty acid with just 4 carbons. Gut microbes make me by fermenting fiber. I'm the favorite fuel of the cells lining your colon and help keep the gut wall strong.",
            foods: ["Made by gut microbes from fiber", "Butter", "Cheese"],
            becomes: ["Energy for colon cells", "Calming gut signals"],
            funFact: "Butyrate's name comes from the Greek word for butter. Old, rancid butter smells like me!"),
        MoleculeCharacter(
            id: "omega3", name: "Ollie Omega-3", molecule: "Omega-3 fatty acids (DHA & EPA)",
            family: .fats, shape: .capsule, accessory: "🐟", colorHex: 0x4CC9F0,
            catchphrase: "I keep brains and eyes flexible!",
            bio: "I'm a long-chain fat with bendy double bonds. Your body can't make me from scratch, so I'm essential. I build soft, flexible membranes in brain and eye cells and get turned into calming signal molecules.",
            foods: ["Salmon", "Sardines", "Walnuts", "Flax seeds", "Chia seeds"],
            becomes: ["Cell membranes", "Resolvins (calming signals)"],
            funFact: "DHA is the most common omega-3 in your brain and in the retina of your eyes."),
        MoleculeCharacter(
            id: "cholesterol", name: "Coco Cholesterol", molecule: "Cholesterol",
            family: .fats, shape: .squircle, accessory: "👑", colorHex: 0xF4845F,
            catchphrase: "Four rings to rule them all. I'm the parent of steroid hormones!",
            bio: "I'm a waxy lipid with four linked carbon rings. Your liver makes most of me. I keep cell membranes the right firmness, and I'm the starting material for vitamin D, bile, cortisol, estrogen and testosterone.",
            foods: ["Made by your liver", "Eggs", "Meat", "Dairy"],
            becomes: ["Vitamin D", "Bile", "Cortisol", "Testosterone", "Estradiol"],
            funFact: "Every single cell membrane in your body uses cholesterol to stay the right amount of firm."),
        MoleculeCharacter(
            id: "micelle", name: "Mimi Micelle", molecule: "Micelle (tiny fat bubble)",
            family: .fats, shape: .circle, accessory: "🫧", colorHex: 0xFFD166,
            catchphrase: "I'm a tiny soap-bubble ferry!",
            bio: "Bile salts and digested fats team up to form me: a tiny bubble with an oily inside and a watery outside. I carry fatty acids and the fat-soluble vitamins A, D, E and K to the gut wall.",
            foods: ["Formed in the small intestine"],
            becomes: ["Fat delivered to gut cells"],
            funFact: "Micelles work the same way soap cleans greasy dishes!"),
        MoleculeCharacter(
            id: "chylomicron", name: "Chuck Chylomicron", molecule: "Chylomicron (fat bus)",
            family: .fats, shape: .capsule, accessory: "🚌", colorHex: 0xF9C74F,
            catchphrase: "All aboard the fat bus!",
            bio: "Gut cells rebuild fatty acids into triglycerides and pack them into me, a giant lipoprotein bus. I'm too big for tiny blood capillaries, so I ride through the lymph vessels first.",
            foods: ["Built inside gut cells after a fatty meal"],
            becomes: ["Fatty acids delivered to muscle & fat cells"],
            funFact: "After a fatty meal, so many chylomicrons ride in the lymph that it turns milky white!"),
    ]

    // MARK: - Proteins & amino acids

    static let proteins: [MoleculeCharacter] = [
        MoleculeCharacter(
            id: "protein", name: "Pro Tein", molecule: "Dietary protein",
            family: .proteins, shape: .squircle, accessory: "🧶", colorHex: 0xFF5C8A,
            catchphrase: "I'm a tangled string of amino acid beads!",
            bio: "I'm a long chain of amino acids folded into a special shape. To use me, your body unfolds me, cuts me into single amino acids, then rebuilds them into brand-new proteins it needs.",
            foods: ["Eggs", "Chicken", "Fish", "Beans", "Tofu", "Yogurt", "Lentils"],
            becomes: ["Amino acids", "New proteins", "Enzymes", "Hormones"],
            funFact: "Your body contains tens of thousands of different kinds of proteins."),
        MoleculeCharacter(
            id: "aminoacid", name: "Ami Amino", molecule: "Amino acids (20 kinds)",
            family: .proteins, shape: .circle, accessory: "🧱", colorHex: 0xFF85A1,
            catchphrase: "Twenty of us build every protein in you!",
            bio: "I'm a building block with an amino group, an acid group, and a side chain that makes each of my 20 kinds unique. Nine kinds are essential: your body can't make them, so they must come from food.",
            foods: ["Protein foods", "Beans", "Dairy", "Meat", "Seeds"],
            becomes: ["Proteins", "Hormones", "Brain messengers", "Glucose (if needed)"],
            funFact: "The order of amino acids in every protein is written in your DNA."),
        MoleculeCharacter(
            id: "leucine", name: "Leo Leucine", molecule: "Leucine (essential amino acid)",
            family: .proteins, shape: .circle, accessory: "💪", colorHex: 0xE63973,
            catchphrase: "I flip the muscle-building switch!",
            bio: "I'm an essential branched-chain amino acid. Besides being a building block, I signal a cell switch called mTOR that says: time to build protein!",
            foods: ["Dairy", "Eggs", "Chicken", "Soy", "Lentils"],
            becomes: ["Muscle protein", "Energy"],
            funFact: "Leucine, isoleucine and valine are called branched-chain amino acids because their side chains branch like a Y."),
        MoleculeCharacter(
            id: "tryptophan", name: "Trip Tryptophan", molecule: "Tryptophan (essential amino acid)",
            family: .proteins, shape: .circle, accessory: "🦃", colorHex: 0xF15BB5,
            catchphrase: "I'm the ingredient for your happy and sleepy molecules!",
            bio: "I'm an essential amino acid with a big double-ring side chain. Only a small share of me becomes serotonin and melatonin, but it's a very important share! I can also become vitamin B3.",
            foods: ["Turkey", "Eggs", "Cheese", "Oats", "Pumpkin seeds", "Tofu"],
            becomes: ["5-HTP", "Serotonin", "Melatonin", "Niacin (B3)"],
            funFact: "Tryptophan is the rarest amino acid in most proteins."),
        MoleculeCharacter(
            id: "tyrosine", name: "Ty Tyrosine", molecule: "Tyrosine (amino acid)",
            family: .proteins, shape: .circle, accessory: "🎨", colorHex: 0xFF7AA2,
            catchphrase: "I'm a hormone superstar with many costumes!",
            bio: "I can come from food or be made from phenylalanine. Depending on the cell, I become dopamine, adrenaline, thyroid hormone, or melanin, the pigment in skin and hair.",
            foods: ["Cheese", "Chicken", "Fish", "Soy", "Almonds"],
            becomes: ["L-DOPA", "Dopamine", "Adrenaline", "Thyroid hormones", "Melanin"],
            funFact: "Tyrosine was first discovered in cheese. Its name comes from tyros, Greek for cheese!"),
        MoleculeCharacter(
            id: "phenylalanine", name: "Phil Phenylalanine", molecule: "Phenylalanine (essential amino acid)",
            family: .proteins, shape: .circle, accessory: "🔗", colorHex: 0xE5989B,
            catchphrase: "I'm Ty Tyrosine's parent!",
            bio: "I'm an essential amino acid. Your liver adds an -OH group to me, with help from iron and a helper molecule called BH4, to make tyrosine.",
            foods: ["Meat", "Fish", "Eggs", "Dairy", "Soy", "Nuts"],
            becomes: ["Tyrosine", "Proteins"],
            funFact: "Newborn babies are tested to make sure they can process phenylalanine properly (a condition called PKU)."),
        MoleculeCharacter(
            id: "glycine", name: "Gigi Glycine", molecule: "Glycine (amino acid)",
            family: .proteins, shape: .circle, accessory: "🧩", colorHex: 0xFF99C8,
            catchphrase: "Smallest amino acid, biggest jobs!",
            bio: "My side chain is just one hydrogen atom, so I'm tiny. I fill every third spot in collagen, I help build heme for your blood, and I'm part of the antioxidant glutathione.",
            foods: ["Gelatin", "Bone broth", "Meat", "Fish", "Beans"],
            becomes: ["Collagen", "Heme", "Glutathione", "Creatine"],
            funFact: "About one-third of the amino acids in collagen are glycine!"),
        MoleculeCharacter(
            id: "urea", name: "Yuri Urea", molecule: "Urea",
            family: .proteins, shape: .circle, accessory: "🚰", colorHex: 0xB5838D,
            catchphrase: "I clean up the extra nitrogen!",
            bio: "When amino acids are burned for energy, their nitrogen turns into toxic ammonia. Your liver quickly converts it into me, urea, and your kidneys send me out in urine.",
            foods: ["Made in the liver"],
            becomes: ["Urine"],
            funFact: "Urea was the first body molecule ever made in a lab, back in 1828!"),
        MoleculeCharacter(
            id: "hemoglobin", name: "Hugo Hemoglobin", molecule: "Hemoglobin (oxygen carrier)",
            family: .proteins, shape: .circle, accessory: "🚛", colorHex: 0xE63946,
            catchphrase: "Four seats for four oxygens!",
            bio: "I'm made of four protein chains, each holding one heme. I live inside red blood cells, grabbing oxygen in the lungs and dropping it off wherever cells are working hard.",
            foods: ["Made in developing red blood cells"],
            becomes: ["Oxygen delivery"],
            funFact: "Each red blood cell carries about 270 million hemoglobin molecules!"),
    ]

    // MARK: - Vitamins

    static let vitamins: [MoleculeCharacter] = [
        MoleculeCharacter(
            id: "vitB6", name: "Benny B6", molecule: "Vitamin B6 (pyridoxine)",
            family: .vitamins, shape: .drop, accessory: "🔧", colorHex: 0x52B788,
            catchphrase: "Hand me any amino acid and I'll help reshape it!",
            bio: "I'm a helper (coenzyme) for more than 100 enzymes. I help build serotonin, dopamine, GABA and heme, and I help shuffle amino groups around to make new amino acids.",
            foods: ["Chickpeas", "Bananas", "Potatoes", "Fish", "Poultry"],
            becomes: ["PLP (my active helper form)"],
            funFact: "B6 works on so many amino acid reactions that we call Benny the amino acid mechanic!"),
        MoleculeCharacter(
            id: "vitB12", name: "Cobi B12", molecule: "Vitamin B12 (cobalamin)",
            family: .vitamins, shape: .drop, accessory: "🩸", colorHex: 0xD62839,
            catchphrase: "I've got a cobalt heart!",
            bio: "I'm the only vitamin with a metal, cobalt, in my center. With folate I pass along methyl groups, help build DNA for new red blood cells, and protect your nerves.",
            foods: ["Fish", "Meat", "Eggs", "Dairy", "Fortified cereals"],
            becomes: ["Methyl groups for hormones & DNA", "Healthy red blood cells"],
            funFact: "Only microbes can make B12. Animals get it from microbes, and plants don't make it at all!"),
        MoleculeCharacter(
            id: "folate", name: "Flo Folate", molecule: "Folate (vitamin B9)",
            family: .vitamins, shape: .drop, accessory: "🥬", colorHex: 0x74C69D,
            catchphrase: "Leafy greens are my home!",
            bio: "I help copy DNA whenever cells divide, so I'm super important for growing bodies and new red blood cells. I also recycle methyl groups with my buddy B12.",
            foods: ["Spinach", "Lentils", "Asparagus", "Beans", "Oranges"],
            becomes: ["DNA building blocks", "Methyl groups"],
            funFact: "Folate got its name from folium, the Latin word for leaf."),
        MoleculeCharacter(
            id: "vitC", name: "Cici Vitamin C", molecule: "Vitamin C (ascorbic acid)",
            family: .vitamins, shape: .drop, accessory: "🍊", colorHex: 0xFFA62B,
            catchphrase: "I'm the collagen builder and iron's best friend!",
            bio: "I help enzymes build collagen (the glue of skin, bones and blood vessels), help make noradrenaline, protect cells as an antioxidant, and help your gut absorb iron from plants.",
            foods: ["Oranges", "Strawberries", "Kiwi", "Bell peppers", "Broccoli"],
            becomes: ["Collagen helper", "Noradrenaline helper"],
            funFact: "Humans can't make vitamin C, but most animals, like dogs and cats, can!"),
        MoleculeCharacter(
            id: "vitD", name: "Sunny D", molecule: "Vitamin D₃ (cholecalciferol)",
            family: .vitamins, shape: .drop, accessory: "☀️", colorHex: 0xFFC300,
            catchphrase: "Sunshine plus cholesterol equals me!",
            bio: "Your skin makes me when sunlight (UVB) hits a cholesterol cousin. I'm really a pre-hormone: the liver and kidneys turn me into calcitriol, a hormone that helps you absorb calcium.",
            foods: ["Sunlight on skin", "Salmon", "Egg yolks", "Fortified milk"],
            becomes: ["Calcidiol", "Calcitriol"],
            funFact: "Vitamin D is really a hormone-in-waiting, because your own body can make it!"),
        MoleculeCharacter(
            id: "vitA", name: "Ava Vitamin A", molecule: "Vitamin A (retinol)",
            family: .vitamins, shape: .drop, accessory: "🥕", colorHex: 0xFB8500,
            catchphrase: "I help you see in the dark!",
            bio: "In your eyes I become retinal, which changes shape when light hits it. That's the very first step of seeing! I also help skin and the immune system. Your body can make me from orange beta-carotene.",
            foods: ["Carrots", "Sweet potatoes", "Spinach", "Eggs", "Liver"],
            becomes: ["Retinal (vision)", "Retinoic acid (gene signals)"],
            funFact: "Carrots won't give you super night vision, but too little vitamin A really does cause night blindness."),
        MoleculeCharacter(
            id: "niacin", name: "Nia Niacin", molecule: "Vitamin B3 (niacin)",
            family: .vitamins, shape: .drop, accessory: "🔥", colorHex: 0x40916C,
            catchphrase: "I become NAD, the electron taxi!",
            bio: "Your cells turn me into NAD⁺, a helper that grabs electrons from food molecules and carries them to the mitochondria's energy machine. Without me, energy production stalls.",
            foods: ["Chicken", "Tuna", "Peanuts", "Mushrooms", "Whole grains"],
            becomes: ["NAD⁺ / NADH"],
            funFact: "Your body can make some niacin from tryptophan: about 60 mg of tryptophan makes 1 mg of niacin."),
    ]

    // MARK: - Minerals

    static let minerals: [MoleculeCharacter] = [
        MoleculeCharacter(
            id: "iron", name: "Ferro Iron", molecule: "Iron (Fe)",
            family: .minerals, shape: .gem, accessory: "🧲", colorHex: 0xB23A48,
            catchphrase: "I carry the oxygen!",
            bio: "I sit in the center of heme, the part of hemoglobin that grabs oxygen in your lungs. I also power enzymes that make serotonin, dopamine, thyroid hormone and energy in mitochondria.",
            foods: ["Red meat", "Beans", "Lentils", "Spinach", "Fortified cereal"],
            becomes: ["Heme", "Hemoglobin", "Enzyme power centers"],
            funFact: "Your body recycles most of its iron from old red blood cells. Only about 1 to 2 mg a day is lost."),
        MoleculeCharacter(
            id: "zinc", name: "Zane Zinc", molecule: "Zinc (Zn)",
            family: .minerals, shape: .gem, accessory: "🛡️", colorHex: 0x8DA9C4,
            catchphrase: "I'm a helper in hundreds of enzymes!",
            bio: "Hundreds of enzymes need me. I help insulin pack itself for storage, keep your immune system sharp, help wounds heal, and hold zinc-finger proteins in shape so they can read DNA.",
            foods: ["Oysters", "Beef", "Pumpkin seeds", "Chickpeas", "Cashews"],
            becomes: ["Insulin storage crystals", "Enzyme helpers"],
            funFact: "Oysters have more zinc per serving than any other food."),
        MoleculeCharacter(
            id: "iodine", name: "Ida Iodine", molecule: "Iodine (I)",
            family: .minerals, shape: .gem, accessory: "🌊", colorHex: 0x7209B7,
            catchphrase: "Thyroid hormone is literally made with me!",
            bio: "Your thyroid gland traps me from the blood and sticks me onto tyrosine. T4 has four of me and T3 has three. That's where their names come from!",
            foods: ["Iodized salt", "Seaweed", "Fish", "Dairy", "Eggs"],
            becomes: ["T4 (thyroxine)", "T3"],
            funFact: "Many countries started adding iodine to table salt in the 1920s to prevent goiter, a swollen thyroid."),
        MoleculeCharacter(
            id: "selenium", name: "Selena Selenium", molecule: "Selenium (Se)",
            family: .minerals, shape: .gem, accessory: "✨", colorHex: 0x4895EF,
            catchphrase: "I switch thyroid hormone on!",
            bio: "I'm part of special selenoproteins. Deiodinase enzymes use me to pop one iodine off T4, turning it into active T3. I also power antioxidant enzymes that protect your cells.",
            foods: ["Brazil nuts", "Fish", "Eggs", "Sunflower seeds"],
            becomes: ["Deiodinase enzymes", "Antioxidant enzymes"],
            funFact: "Just one or two Brazil nuts can contain a whole day's worth of selenium!"),
        MoleculeCharacter(
            id: "copper", name: "Cooper Copper", molecule: "Copper (Cu)",
            family: .minerals, shape: .gem, accessory: "🪙", colorHex: 0xD4843E,
            catchphrase: "I turn dopamine into noradrenaline!",
            bio: "Enzymes use me to move electrons. I help turn dopamine into noradrenaline, help load iron onto its transport taxi, and work at the very end of the energy-making chain in mitochondria.",
            foods: ["Cashews", "Sesame seeds", "Mushrooms", "Dark chocolate", "Shellfish"],
            becomes: ["Enzyme power centers"],
            funFact: "Octopuses have blue blood because their oxygen carrier uses copper instead of iron!"),
        MoleculeCharacter(
            id: "magnesium", name: "Maggie Magnesium", molecule: "Magnesium (Mg)",
            family: .minerals, shape: .gem, accessory: "🌿", colorHex: 0x2A9D8F,
            catchphrase: "ATP doesn't work without me!",
            bio: "Most ATP in your cells is actually holding on to me. Enzymes recognize the Mg-ATP team. Hundreds of enzymes need me, including the ones that activate vitamin D.",
            foods: ["Pumpkin seeds", "Spinach", "Almonds", "Black beans", "Dark chocolate"],
            becomes: ["Mg-ATP", "Enzyme helpers"],
            funFact: "Magnesium sits in the center of chlorophyll, the molecule that makes plants green!"),
        MoleculeCharacter(
            id: "calcium", name: "Cal Calcium", molecule: "Calcium (Ca)",
            family: .minerals, shape: .gem, accessory: "🦴", colorHex: 0x72C3DC,
            catchphrase: "Bones, muscles, nerves: I'm everywhere!",
            bio: "I'm the most abundant mineral in your body. 99% of me is in bones and teeth, but the other 1% triggers muscle contractions, nerve signals and insulin release.",
            foods: ["Milk", "Yogurt", "Cheese", "Tofu", "Kale"],
            becomes: ["Bone crystals", "Muscle & nerve signals"],
            funFact: "Your skeleton is constantly rebuilt. You get a nearly brand-new skeleton about every 10 years!"),
        MoleculeCharacter(
            id: "heme", name: "Hema Heme", molecule: "Heme (iron ring)",
            family: .minerals, shape: .circle, accessory: "💍", colorHex: 0xC1121F,
            catchphrase: "I'm a ring with an iron jewel!",
            bio: "I'm a flat ring called a porphyrin with one iron atom in the middle. I'm built from glycine and succinyl-CoA with help from vitamin B6. Oxygen binds right to my iron!",
            foods: ["Made in bone marrow & liver", "Heme iron in meat"],
            becomes: ["Hemoglobin", "Myoglobin", "Cytochromes"],
            funFact: "Heme makes blood red, and when it breaks down it turns bruises green and yellow!"),
    ]

    // MARK: - Hormones & messengers

    static let hormones: [MoleculeCharacter] = [
        MoleculeCharacter(
            id: "insulin", name: "Izzy Insulin", molecule: "Insulin (51 amino acids)",
            family: .hormones, shape: .squircle, accessory: "🔑", colorHex: 0x9B5DE5,
            catchphrase: "I'm the key that lets sugar into your cells!",
            bio: "I'm a protein hormone built from 51 amino acids in the beta cells of your pancreas. When blood sugar rises after a meal, I'm released to unlock muscle, fat and liver cells so they can take in glucose.",
            foods: ["Made from amino acids in the pancreas"],
            becomes: ["Signal: store energy!"],
            funFact: "In 1922, insulin became one of the first hormones used as a medicine, saving the lives of people with type 1 diabetes."),
        MoleculeCharacter(
            id: "proinsulin", name: "Pria Proinsulin", molecule: "Proinsulin",
            family: .hormones, shape: .squircle, accessory: "🎁", colorHex: 0xB388EB,
            catchphrase: "I'm insulin still in the wrapping paper!",
            bio: "Ribosomes build me as one long chain. I fold up, lock my shape with three sulfur bridges, then enzymes snip out my middle section (C-peptide) to release insulin.",
            foods: ["Made in pancreas beta cells"],
            becomes: ["Insulin", "C-peptide"],
            funFact: "Doctors measure C-peptide to see how much insulin a person's own pancreas is making."),
        MoleculeCharacter(
            id: "fivehtp", name: "Hattie 5-HTP", molecule: "5-HTP (5-hydroxytryptophan)",
            family: .hormones, shape: .squircle, accessory: "🪜", colorHex: 0xB5179E,
            catchphrase: "I'm the halfway step to serotonin!",
            bio: "When tryptophan hydroxylase, an iron enzyme, adds an -OH group to tryptophan, I appear. Then one quick snip with help from vitamin B6 turns me into serotonin.",
            foods: ["Made from tryptophan"],
            becomes: ["Serotonin"],
            funFact: "Adding that -OH group is the slowest step, so it controls how much serotonin gets made."),
        MoleculeCharacter(
            id: "serotonin", name: "Sera Serotonin", molecule: "Serotonin (5-HT)",
            family: .hormones, shape: .squircle, accessory: "😊", colorHex: 0xC77DFF,
            catchphrase: "I help you feel calm, happy and... digest!",
            bio: "I'm a messenger molecule. In the brain I help with mood, calm and sleep. But most of me, about 90%, is made in your gut, where I help food keep moving along.",
            foods: ["Made from tryptophan"],
            becomes: ["Melatonin (at night)"],
            funFact: "Serotonin can't cross from the blood into the brain, so your brain has to make its own from tryptophan."),
        MoleculeCharacter(
            id: "melatonin", name: "Mel Melatonin", molecule: "Melatonin (sleep signal)",
            family: .hormones, shape: .squircle, accessory: "🌙", colorHex: 0x3A0CA3,
            catchphrase: "Lights out? That's my cue!",
            bio: "Your pineal gland turns serotonin into me when it gets dark. I tell your body clock it's nighttime and help you feel ready to sleep.",
            foods: ["Made from serotonin in the pineal gland", "Tiny amounts in tart cherries"],
            becomes: ["Sleepy-time signal"],
            funFact: "Bright screens at night can delay melatonin. Dim lights help your brain know it's bedtime."),
        MoleculeCharacter(
            id: "ldopa", name: "Lulu L-DOPA", molecule: "L-DOPA",
            family: .hormones, shape: .squircle, accessory: "🎈", colorHex: 0x9D4EDD,
            catchphrase: "One more step and I'm dopamine!",
            bio: "Tyrosine hydroxylase, an iron enzyme, adds an -OH to tyrosine to make me. Vitamin B6 then helps snip me into dopamine.",
            foods: ["Made from tyrosine", "Fava beans (naturally)"],
            becomes: ["Dopamine", "Melanin"],
            funFact: "L-DOPA is used as a medicine for Parkinson's disease because it can cross into the brain and become dopamine."),
        MoleculeCharacter(
            id: "dopamine", name: "Dex Dopamine", molecule: "Dopamine",
            family: .hormones, shape: .squircle, accessory: "🎯", colorHex: 0x7B2CBF,
            catchphrase: "Let's go get it! I'm all about motivation!",
            bio: "I'm a brain messenger for motivation, reward, learning and smooth movement. In the adrenal glands I'm also the stepping stone to noradrenaline and adrenaline.",
            foods: ["Made from tyrosine & L-DOPA"],
            becomes: ["Noradrenaline", "Adrenaline"],
            funFact: "Dopamine rises when you expect a reward, which helps your brain learn what's worth doing."),
        MoleculeCharacter(
            id: "norepinephrine", name: "Nora Noradrenaline", molecule: "Noradrenaline (norepinephrine)",
            family: .hormones, shape: .squircle, accessory: "🚨", colorHex: 0x8338EC,
            catchphrase: "Alert! Focus mode on!",
            bio: "Dopamine becomes me when an enzyme powered by copper and vitamin C adds an -OH group. I raise alertness, focus and heart rate.",
            foods: ["Made from dopamine"],
            becomes: ["Adrenaline"],
            funFact: "Noradrenaline is both a hormone in your blood and a messenger between nerve cells."),
        MoleculeCharacter(
            id: "adrenaline", name: "Addie Adrenaline", molecule: "Adrenaline (epinephrine)",
            family: .hormones, shape: .squircle, accessory: "🎢", colorHex: 0xFF006E,
            catchphrase: "Fight or flight. Let's MOVE!",
            bio: "The adrenal glands add a methyl group to noradrenaline to make me. I pump up heart rate, open airways and release stored glucose for quick energy in an emergency.",
            foods: ["Made from noradrenaline in the adrenal glands"],
            becomes: ["Instant energy & alertness"],
            funFact: "Adrenaline was the first hormone ever purified, back in 1901!"),
        MoleculeCharacter(
            id: "t4", name: "Tate T4", molecule: "Thyroxine (T4)",
            family: .hormones, shape: .squircle, accessory: "🎒", colorHex: 0x5A189A,
            catchphrase: "Four iodines in my backpack!",
            bio: "The thyroid builds me by joining two iodine-coated tyrosines. I'm the main hormone the thyroid releases, a traveling form that cells convert into active T3.",
            foods: ["Made from tyrosine + iodine"],
            becomes: ["T3 (active form)"],
            funFact: "Your thyroid stores about two months' worth of hormone inside a giant protein called thyroglobulin!"),
        MoleculeCharacter(
            id: "t3", name: "Tia T3", molecule: "Triiodothyronine (T3)",
            family: .hormones, shape: .squircle, accessory: "🔥", colorHex: 0xE85D04,
            catchphrase: "I turn up your metabolism thermostat!",
            bio: "When selenium-powered enzymes remove one iodine from T4, I'm born. I slip into cell nuclei and switch on genes that raise energy use, body heat and heart rate.",
            foods: ["Made from T4 (with selenium)"],
            becomes: ["Faster metabolism", "Body heat"],
            funFact: "T3 is about 3 to 4 times more powerful than T4."),
        MoleculeCharacter(
            id: "pregnenolone", name: "Penny Pregnenolone", molecule: "Pregnenolone",
            family: .hormones, shape: .squircle, accessory: "🥚", colorHex: 0xA06CD5,
            catchphrase: "Mother of all steroid hormones!",
            bio: "Inside mitochondria, an iron-heme enzyme snips cholesterol's side tail to make me. Every steroid hormone, from cortisol to testosterone to estrogen, starts from me.",
            foods: ["Made from cholesterol"],
            becomes: ["Progesterone", "DHEA", "Cortisol", "Testosterone"],
            funFact: "Making pregnenolone is the first and slowest step of all steroid hormone production."),
        MoleculeCharacter(
            id: "progesterone", name: "Paige Progesterone", molecule: "Progesterone",
            family: .hormones, shape: .squircle, accessory: "🌸", colorHex: 0xC8A2E8,
            catchphrase: "I'm a crossroads for steroids!",
            bio: "I'm made from pregnenolone. I'm an important hormone on my own, and the adrenal glands also remodel me into cortisol and aldosterone.",
            foods: ["Made from pregnenolone"],
            becomes: ["Cortisol", "Aldosterone"],
            funFact: "Aldosterone, one of my hormone kids, tells your kidneys how much salt to keep."),
        MoleculeCharacter(
            id: "cortisol", name: "Cora Cortisol", molecule: "Cortisol",
            family: .hormones, shape: .squircle, accessory: "⏰", colorHex: 0x6A4C93,
            catchphrase: "Rise and shine! I've got your back under stress!",
            bio: "The adrenal glands make me from cholesterol using a series of iron (heme) enzymes. I peak in the morning to help you wake up, raise blood sugar, and help you handle stress.",
            foods: ["Made from cholesterol"],
            becomes: ["Energy release", "Adrenaline boost"],
            funFact: "Cortisol is highest about 30 minutes after you wake up!"),
        MoleculeCharacter(
            id: "testosterone", name: "Toby Testosterone", molecule: "Testosterone",
            family: .hormones, shape: .squircle, accessory: "🏋️", colorHex: 0x4361EE,
            catchphrase: "Building muscle and bone!",
            bio: "I'm made from cholesterol, mostly in the testes and in smaller amounts in the ovaries and adrenal glands. I help build muscle and bone, and aromatase can turn me into estradiol.",
            foods: ["Made from cholesterol (zinc helps)"],
            becomes: ["Estradiol", "DHT"],
            funFact: "Everyone makes both testosterone and estrogen, just in different amounts!"),
        MoleculeCharacter(
            id: "estradiol", name: "Esme Estradiol", molecule: "Estradiol (an estrogen)",
            family: .hormones, shape: .squircle, accessory: "🌺", colorHex: 0xF72585,
            catchphrase: "I'm a strong-bones hormone!",
            bio: "The enzyme aromatase turns testosterone into me by making one of my rings flat and aromatic. I help shape growth during puberty and keep bones strong in everyone.",
            foods: ["Made from testosterone"],
            becomes: ["Growth & bone signals"],
            funFact: "Estradiol helps close the growth plates in bones at the end of puberty, in both boys and girls."),
        MoleculeCharacter(
            id: "calcidiol", name: "Dee Calcidiol", molecule: "Calcidiol (stored vitamin D)",
            family: .hormones, shape: .squircle, accessory: "📦", colorHex: 0x8E9AFF,
            catchphrase: "I'm vitamin D in storage mode!",
            bio: "The liver adds an -OH group to vitamin D3 to make me. I'm the form that circulates in blood for weeks, and doctors measure me to check your vitamin D level.",
            foods: ["Made from vitamin D3 in the liver"],
            becomes: ["Calcitriol"],
            funFact: "Calcidiol lasts about 2 to 3 weeks in the blood."),
        MoleculeCharacter(
            id: "calcitriol", name: "Trixie Calcitriol", molecule: "Calcitriol (active vitamin D)",
            family: .hormones, shape: .squircle, accessory: "🏗️", colorHex: 0x7B61FF,
            catchphrase: "I'm vitamin D's final, most powerful form!",
            bio: "Your kidneys add one more -OH to calcidiol to make me, a true hormone. I tell your gut to absorb calcium and phosphate so your bones can grow strong.",
            foods: ["Made in the kidneys (magnesium helps)"],
            becomes: ["Calcium-absorbing signal"],
            funFact: "Calcitriol works like a steroid hormone, switching genes on inside cells."),
    ]

    // MARK: - Enzyme crew

    static let helpers: [MoleculeCharacter] = [
        MoleculeCharacter(
            id: "amylase", name: "Amy Amylase", molecule: "Amylase (enzyme)",
            family: .helpers, shape: .circle, accessory: "✂️", colorHex: 0x2EC4B6,
            catchphrase: "Snip snip! Starch to sugar!",
            bio: "I'm an enzyme made in your salivary glands and pancreas. I cut the alpha bonds between glucose units in starch, turning long chains into maltose.",
            foods: ["Made in saliva & pancreas"],
            becomes: ["Nothing! Enzymes aren't used up, so I snip again and again."],
            funFact: "Enzymes like me work super fast and are never used up. One amylase can snip bond after bond after bond."),
        MoleculeCharacter(
            id: "lipase", name: "Lippy Lipase", molecule: "Lipase (enzyme)",
            family: .helpers, shape: .circle, accessory: "🪚", colorHex: 0x3DCCC7,
            catchphrase: "I snip the tails off triglycerides!",
            bio: "Pancreatic lipase works on the surface of bile-coated fat droplets, cutting two of the three fatty acids off each triglyceride so they're small enough to be absorbed.",
            foods: ["Made in the pancreas (a little in tongue & stomach)"],
            becomes: ["Free fatty acids + monoglycerides"],
            funFact: "Lipase needs a sidekick called colipase to hold on to bile-coated fat droplets."),
        MoleculeCharacter(
            id: "pepsin", name: "Pepper Pepsin", molecule: "Pepsin (enzyme)",
            family: .helpers, shape: .circle, accessory: "🥊", colorHex: 0x118AB2,
            catchphrase: "I love acid. The sourer the better!",
            bio: "Stomach cells release me in a safe, inactive form. Stomach acid switches me on, and I start chopping unfolded proteins into shorter pieces called peptides.",
            foods: ["Made in the stomach"],
            becomes: ["Peptides"],
            funFact: "Pepsin works best at around pH 2, about as acidic as lemon juice!"),
        MoleculeCharacter(
            id: "trypsin", name: "Tracy Trypsin", molecule: "Trypsin (enzyme)",
            family: .helpers, shape: .circle, accessory: "🦀", colorHex: 0x06D6A0,
            catchphrase: "Pinch pinch! Peptides into pieces!",
            bio: "The pancreas sends me to the small intestine in a locked, inactive form so I don't digest the pancreas itself. There I get switched on and cut peptides next to lysine and arginine.",
            foods: ["Made in the pancreas"],
            becomes: ["Smaller peptides & amino acids"],
            funFact: "Digestive enzymes are shipped locked so they can't digest the organ that makes them!"),
        MoleculeCharacter(
            id: "bile", name: "Billie Bile", molecule: "Bile salts",
            family: .helpers, shape: .circle, accessory: "🧼", colorHex: 0x9ACD32,
            catchphrase: "I break big fat blobs into tiny droplets!",
            bio: "Your liver makes me from cholesterol, and the gallbladder stores me. I work like dish soap, surrounding big fat globs and breaking them into tiny droplets so lipase can reach them.",
            foods: ["Made in the liver from cholesterol"],
            becomes: ["Micelles", "Recycled back to the liver"],
            funFact: "About 95% of bile salts are reabsorbed and recycled, several times a day!"),
        MoleculeCharacter(
            id: "microbe", name: "Mo the Microbe", molecule: "Gut microbes (bacteria)",
            family: .helpers, shape: .circle, accessory: "🦠", colorHex: 0x80B918,
            catchphrase: "Fiber feast! Let's ferment!",
            bio: "I'm one of trillions of friendly bacteria in your large intestine. We ferment the fiber you can't digest and make short-chain fatty acids, some vitamins (like vitamin K and biotin) and gas.",
            foods: ["Live in your large intestine"],
            becomes: ["Short-chain fatty acids", "Vitamin K2", "Biotin"],
            funFact: "You carry roughly as many microbe cells as human cells!"),
        MoleculeCharacter(
            id: "ribosome", name: "Ribby Ribosome", molecule: "Ribosome (protein builder)",
            family: .helpers, shape: .circle, accessory: "🏭", colorHex: 0x00B4D8,
            catchphrase: "Read the recipe, link the beads!",
            bio: "I'm a protein-building machine. I read an mRNA recipe copied from DNA, three letters at a time, and link amino acids together in exactly the right order.",
            foods: ["Found in every cell"],
            becomes: ["New proteins, enzymes & protein hormones"],
            funFact: "A ribosome can add several amino acids to a growing protein every second."),
        MoleculeCharacter(
            id: "carnitine", name: "Carly Carnitine", molecule: "Carnitine (fat taxi)",
            family: .helpers, shape: .circle, accessory: "🚕", colorHex: 0x48BFE3,
            catchphrase: "Long-chain fats, hop in my taxi!",
            bio: "Long-chain fatty acids can't get into the mitochondria on their own. I ferry them across the inner membrane so they can be burned for energy.",
            foods: ["Red meat", "Dairy", "Made from lysine & methionine"],
            becomes: ["Fatty acids delivered to mitochondria"],
            funFact: "Carnitine's name comes from carnis, Latin for meat, where it was first found."),
    ]

    // MARK: - Energy makers

    static let energy: [MoleculeCharacter] = [
        MoleculeCharacter(
            id: "mito", name: "Dr. Mito", molecule: "Mitochondrion (cell powerhouse)",
            family: .energy, shape: .capsule, accessory: "🥽", colorHex: 0xFF595E,
            catchphrase: "Welcome to the powerhouse!",
            bio: "I'm an organelle, a tiny organ inside your cells. I burn fuel with oxygen to recharge ATP. Busy cells like muscle and heart cells have thousands of me!",
            foods: ["Inside nearly every cell"],
            becomes: ["ATP", "Heat", "Water", "CO₂"],
            funFact: "Mitochondria have their own DNA, passed down from your mother."),
        MoleculeCharacter(
            id: "pyruvate", name: "Pip Pyruvate", molecule: "Pyruvate (3 carbons)",
            family: .energy, shape: .diamond, accessory: "✌️", colorHex: 0xF28482,
            catchphrase: "Half a glucose, twice the fun!",
            bio: "Glycolysis splits one six-carbon glucose into two of me. If oxygen is around, I head into the mitochondria. If not, I become lactate for a quick burst.",
            foods: ["Made from glucose in every cell"],
            becomes: ["Acetyl-CoA", "Lactate", "Alanine"],
            funFact: "Glycolysis, the path that makes me, happens in almost every living thing, from bacteria to blue whales."),
        MoleculeCharacter(
            id: "acetylcoa", name: "Acey Acetyl-CoA", molecule: "Acetyl-CoA",
            family: .energy, shape: .diamond, accessory: "🔀", colorHex: 0xFF924C,
            catchphrase: "All roads lead to me!",
            bio: "Carbs, fats and proteins can all be broken down into me: a 2-carbon acetyl group riding on coenzyme A (made from vitamin B5). I feed the Krebs cycle, or become cholesterol and fat.",
            foods: ["Made from glucose, fats & amino acids"],
            becomes: ["Krebs cycle fuel", "Ketones", "Cholesterol", "Fatty acids"],
            funFact: "Acetyl-CoA is the great crossroads of metabolism, where almost every energy pathway meets."),
        MoleculeCharacter(
            id: "nadh", name: "Nadia NADH", molecule: "NADH (electron carrier)",
            family: .energy, shape: .diamond, accessory: "🚚", colorHex: 0xF3722C,
            catchphrase: "Electron delivery, coming through!",
            bio: "I'm made from niacin (vitamin B3). In the Krebs cycle I pick up high-energy electrons and deliver them to the electron transport chain, where they power ATP production.",
            foods: ["Made from vitamin B3"],
            becomes: ["NAD⁺ (ready to reload)"],
            funFact: "Each NADH delivered can help make about 2.5 ATP."),
        MoleculeCharacter(
            id: "oxygen", name: "Ozzy Oxygen", molecule: "Oxygen (O₂)",
            family: .energy, shape: .circle, accessory: "💨", colorHex: 0x5FA8D3,
            catchphrase: "I'm the final electron catcher!",
            bio: "You breathe me in, hemoglobin carries me, and at the end of the electron transport chain I catch used-up electrons and join with hydrogen to form water.",
            foods: ["The air you breathe"],
            becomes: ["Water (H₂O)"],
            funFact: "Without oxygen to catch electrons, the whole ATP assembly line backs up within seconds."),
        MoleculeCharacter(
            id: "atp", name: "Ace ATP", molecule: "ATP (adenosine triphosphate)",
            family: .energy, shape: .diamond, accessory: "🔋", colorHex: 0xFFBE0B,
            catchphrase: "I'm the energy coin every cell spends!",
            bio: "I carry energy in my three phosphate groups. When a cell snaps one off, energy is released to power muscles, nerves and building projects. Then I get recharged in the mitochondria.",
            foods: ["Made from food energy in every cell"],
            becomes: ["ADP + energy (then recharged!)"],
            funFact: "You recycle roughly your own body weight in ATP every single day!"),
        MoleculeCharacter(
            id: "ketone", name: "Kip Ketone", molecule: "Ketone bodies (β-hydroxybutyrate)",
            family: .energy, shape: .diamond, accessory: "🚀", colorHex: 0xF94144,
            catchphrase: "Backup fuel, ready for launch!",
            bio: "When there's lots of fat burning and not much glucose, like during fasting or after MCTs, the liver turns extra acetyl-CoA into me. I travel to the brain, heart and muscles as clean-burning fuel.",
            foods: ["Made in the liver from fats"],
            becomes: ["Acetyl-CoA", "ATP"],
            funFact: "The heart happily burns ketones, sometimes even preferring them!"),
    ]
}

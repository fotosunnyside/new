import SwiftUI

// MARK: - Quiz

extension Library {
    static let quizBank: [QuizQuestion] = [
        QuizQuestion("Which enzyme starts breaking down starch in your mouth?", "Salivary amylase",
                     ["Pepsin", "Lipase", "Trypsin"],
                     "Amylase in saliva begins cutting starch into maltose while you chew."),
        QuizQuestion("What is maltose made of?", "Two glucose units",
                     ["Glucose + fructose", "Two amino acids", "Three fatty acids"],
                     "Maltose is a pair of glucose \"twins\" made when amylase chops starch."),
        QuizQuestion("Which molecule is the brain's main everyday fuel?", "Glucose",
                     ["Protein", "Calcium", "Fiber"],
                     "The brain uses about 120 g of glucose a day. Ketones are its backup fuel."),
        QuizQuestion("Where is extra glucose stored as glycogen?", "Liver and muscles",
                     ["Bones and teeth", "Only the brain", "Skin"],
                     "Glycogen is a branchy glucose tree stored in the liver and muscles."),
        QuizQuestion("Why can't humans digest cellulose fiber?", "Our enzymes can't cut its beta bonds",
                     ["It's made of metal", "It's too sweet", "It dissolves in the mouth"],
                     "Human enzymes only cut alpha bonds. Gut microbes handle the beta bonds in fiber."),
        QuizQuestion("Which short-chain fatty acid is the colon cells' favorite fuel?", "Butyrate",
                     ["Glucose", "Cholesterol", "Leucine"],
                     "Gut microbes make butyrate from fiber, and colon cells love to burn it."),
        QuizQuestion("What does bile do?", "Breaks fat into tiny droplets, like soap",
                     ["Cuts proteins", "Makes insulin", "Carries oxygen"],
                     "Bile salts emulsify fat so lipase has more surface to work on."),
        QuizQuestion("How many fatty-acid tails does a triglyceride have?", "Three",
                     ["One", "Two", "Four"],
                     "Tri means three: a glycerol backbone with three fatty-acid tails."),
        QuizQuestion("How long are the tails of medium-chain triglycerides (MCTs)?", "6 to 12 carbons",
                     ["2 to 4 carbons", "14 to 22 carbons", "About 100 carbons"],
                     "Short chains are under 6 carbons, medium are 6 to 12, and long are 13 or more."),
        QuizQuestion("What \"bus\" carries long-chain fats through the lymph?", "Chylomicron",
                     ["Hemoglobin", "Insulin", "Ribosome"],
                     "Gut cells pack long-chain fats into giant chylomicrons that ride the lymph."),
        QuizQuestion("Which enzyme works in the acidic stomach to cut proteins?", "Pepsin",
                     ["Amylase", "Lipase", "Maltase"],
                     "Pepsin is switched on by stomach acid and chops proteins into peptides."),
        QuizQuestion("How many essential amino acids must come from food?", "9",
                     ["2", "20", "50"],
                     "There are 20 amino acids in proteins. Your body can't make 9 of them."),
        QuizQuestion("Which cell machine links amino acids into proteins?", "Ribosome",
                     ["Mitochondrion", "Micelle", "Gallbladder"],
                     "Ribosomes read mRNA recipes and link amino acids in order."),
        QuizQuestion("Extra nitrogen from amino acids leaves the body as...", "Urea",
                     ["Glucose", "Carbon dioxide", "Bile"],
                     "The liver turns toxic ammonia into urea, and the kidneys flush it out."),
        QuizQuestion("Serotonin is made from which amino acid?", "Tryptophan",
                     ["Tyrosine", "Glycine", "Leucine"],
                     "Tryptophan → 5-HTP → serotonin → (at night) melatonin."),
        QuizQuestion("Where is most of your body's serotonin made?", "In the gut",
                     ["In the bones", "In the lungs", "In the hair"],
                     "About 90% of serotonin is made by special cells in the gut."),
        QuizQuestion("What tells the pineal gland to make melatonin?", "Darkness",
                     ["Sugar", "Exercise", "Cold water"],
                     "When your eyes sense darkness, the pineal gland turns serotonin into melatonin."),
        QuizQuestion("Dopamine and adrenaline are both made from...", "Tyrosine",
                     ["Cholesterol", "Fructose", "Tryptophan"],
                     "Tyrosine → L-DOPA → dopamine → noradrenaline → adrenaline."),
        QuizQuestion("Which mineral is built right into thyroid hormone?", "Iodine",
                     ["Iron", "Calcium", "Potassium"],
                     "T4 has four iodine atoms and T3 has three."),
        QuizQuestion("What does the \"4\" in T4 stand for?", "Four iodine atoms",
                     ["Four amino acids", "Four hours", "The fourth hormone"],
                     "Thyroxine (T4) carries four iodines. Removing one makes active T3."),
        QuizQuestion("Which mineral in hemoglobin grabs oxygen?", "Iron",
                     ["Zinc", "Copper", "Magnesium"],
                     "Oxygen binds to the iron atom in the middle of each heme."),
        QuizQuestion("Cortisol, testosterone and estradiol all come from...", "Cholesterol",
                     ["Glucose", "Iodine", "Glycine"],
                     "They're steroid hormones, and all steroids are built from cholesterol."),
        QuizQuestion("Which enzyme turns testosterone into estradiol?", "Aromatase",
                     ["Amylase", "Pepsin", "Lipase"],
                     "Aromatase makes one of testosterone's rings flat and aromatic."),
        QuizQuestion("Your skin makes vitamin D when it's hit by...", "UVB sunlight",
                     ["Cold air", "Loud music", "Salt water"],
                     "UVB light breaks open a ring in 7-dehydrocholesterol to make vitamin D3."),
        QuizQuestion("Dogs can make this vitamin, but humans must eat it. Which one?", "Vitamin C",
                     ["Vitamin D", "Vitamin K", "Vitamin B3"],
                     "Humans lost the enzyme to make vitamin C, so we get it from fruits and veggies."),
        QuizQuestion("Which mineral teams up with ATP inside cells?", "Magnesium",
                     ["Iodine", "Fluoride", "Sodium"],
                     "Most ATP in cells is bound to magnesium, forming Mg-ATP."),
        QuizQuestion("Vitamin B3 (niacin) becomes which electron carrier?", "NAD⁺ / NADH",
                     ["ATP", "Hemoglobin", "Collagen"],
                     "NADH carries electrons from food to the electron transport chain."),
        QuizQuestion("What is ATP?", "The energy coin cells spend",
                     ["A kind of fat", "A vitamin", "A digestive enzyme"],
                     "Snapping off one of ATP's phosphates releases energy for cell work."),
        QuizQuestion("Which is the only vitamin with a metal (cobalt) inside?", "Vitamin B12",
                     ["Vitamin C", "Vitamin A", "Folate"],
                     "Cobalamin (B12) has a cobalt atom at its center."),
        QuizQuestion("Insulin is stored in the pancreas packed with which mineral?", "Zinc",
                     ["Iodine", "Iron", "Sodium"],
                     "Six insulin molecules pack around zinc to form storage crystals."),
        QuizQuestion("Which gas do mitochondria need to make lots of ATP?", "Oxygen",
                     ["Helium", "Nitrogen", "Carbon monoxide"],
                     "Oxygen catches electrons at the end of the chain and becomes water."),
        QuizQuestion("In your eyes, vitamin A becomes retinal, which helps you...", "See in dim light",
                     ["Digest fats", "Taste sweetness", "Grow hair"],
                     "Retinal changes shape when light hits it: the first step of vision."),
        QuizQuestion("Which amino acid flips the mTOR muscle-building switch?", "Leucine",
                     ["Glycine", "Tryptophan", "Tyrosine"],
                     "Leucine signals mTOR, telling muscle cells to build protein."),
        QuizQuestion("Which organ turns vitamin D into its storage form, calcidiol?", "Liver",
                     ["Stomach", "Heart", "Skin"],
                     "Skin makes D3, the liver makes calcidiol, and the kidneys make calcitriol."),
    ]

    static var allQuestions: [QuizQuestion] { quizBank + pathways.map(\.check) }
}

// MARK: - Hormone Factory

struct HelperToken: Identifiable, Hashable {
    let id: String
    let name: String
    let emoji: String

    static let all: [HelperToken] = [
        HelperToken(id: "iron", name: "Iron", emoji: "🧲"),
        HelperToken(id: "b6", name: "Vitamin B6", emoji: "🔧"),
        HelperToken(id: "copper", name: "Copper", emoji: "🪙"),
        HelperToken(id: "vitC", name: "Vitamin C", emoji: "🍊"),
        HelperToken(id: "iodine", name: "Iodine", emoji: "🌊"),
        HelperToken(id: "selenium", name: "Selenium", emoji: "✨"),
        HelperToken(id: "zinc", name: "Zinc", emoji: "🛡️"),
        HelperToken(id: "magnesium", name: "Magnesium", emoji: "🌿"),
        HelperToken(id: "sunlight", name: "UVB Sunlight", emoji: "☀️"),
        HelperToken(id: "darkness", name: "Darkness", emoji: "🌙"),
        HelperToken(id: "methyl", name: "Methyl group (B12 + folate)", emoji: "🧬"),
        HelperToken(id: "stress", name: "ACTH stress signal", emoji: "📣"),
        HelperToken(id: "sulfur", name: "Sulfur bridges", emoji: "🌉"),
        HelperToken(id: "vitK", name: "Vitamin K", emoji: "🥬"),
        HelperToken(id: "vitE", name: "Vitamin E", emoji: "🌻"),
        HelperToken(id: "fluoride", name: "Fluoride", emoji: "🦷"),
        HelperToken(id: "potassium", name: "Potassium", emoji: "🍌"),
    ]

    static func token(_ id: String) -> HelperToken {
        all.first { $0.id == id } ?? HelperToken(id: id, name: id, emoji: "❔")
    }
}

struct HormoneRecipe: Identifiable, Hashable {
    /// The hormone's character id.
    let id: String
    let precursor: String
    let wrongPrecursors: [String]
    let helpers: [String]
    let wrongHelpers: [String]
    /// Character ids from starting molecule to finished hormone.
    let chain: [String]
    let location: BodyLocation
    let lesson: String

    static func == (lhs: HormoneRecipe, rhs: HormoneRecipe) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

extension Library {
    static let recipes: [HormoneRecipe] = [
        HormoneRecipe(id: "serotonin", precursor: "tryptophan",
                      wrongPrecursors: ["tyrosine", "cholesterol", "glucose"],
                      helpers: ["iron", "b6"], wrongHelpers: ["iodine", "vitK", "fluoride", "sunlight"],
                      chain: ["tryptophan", "fivehtp", "serotonin"], location: .brain,
                      lesson: "An iron enzyme turns tryptophan into 5-HTP, then a vitamin B6 enzyme snips it into serotonin."),
        HormoneRecipe(id: "melatonin", precursor: "serotonin",
                      wrongPrecursors: ["dopamine", "cholesterol", "glucose"],
                      helpers: ["darkness", "methyl"], wrongHelpers: ["sunlight", "iodine", "vitK", "potassium"],
                      chain: ["serotonin", "melatonin"], location: .brain,
                      lesson: "In darkness, the pineal gland adds an acetyl group and a methyl group to serotonin to make melatonin."),
        HormoneRecipe(id: "dopamine", precursor: "tyrosine",
                      wrongPrecursors: ["tryptophan", "cholesterol", "glucose"],
                      helpers: ["iron", "b6"], wrongHelpers: ["iodine", "selenium", "vitE", "fluoride"],
                      chain: ["tyrosine", "ldopa", "dopamine"], location: .brain,
                      lesson: "An iron enzyme makes L-DOPA from tyrosine, then a B6 enzyme turns L-DOPA into dopamine."),
        HormoneRecipe(id: "adrenaline", precursor: "dopamine",
                      wrongPrecursors: ["serotonin", "cholesterol", "glycine"],
                      helpers: ["copper", "vitC", "methyl"], wrongHelpers: ["iodine", "vitK", "fluoride"],
                      chain: ["dopamine", "norepinephrine", "adrenaline"], location: .adrenal,
                      lesson: "A copper + vitamin C enzyme turns dopamine into noradrenaline, then a methyl group makes adrenaline."),
        HormoneRecipe(id: "t3", precursor: "tyrosine",
                      wrongPrecursors: ["tryptophan", "cholesterol", "glucose"],
                      helpers: ["iodine", "selenium"], wrongHelpers: ["b6", "vitK", "fluoride", "potassium"],
                      chain: ["tyrosine", "t4", "t3"], location: .thyroid,
                      lesson: "The thyroid sticks iodine onto tyrosines to make T4, and selenium enzymes turn T4 into active T3."),
        HormoneRecipe(id: "cortisol", precursor: "cholesterol",
                      wrongPrecursors: ["glucose", "tyrosine", "aminoacid"],
                      helpers: ["iron", "stress"], wrongHelpers: ["iodine", "vitK", "fluoride", "darkness"],
                      chain: ["cholesterol", "pregnenolone", "progesterone", "cortisol"], location: .adrenal,
                      lesson: "When the brain sends the ACTH stress signal, iron-heme enzymes in the adrenals turn cholesterol into cortisol."),
        HormoneRecipe(id: "insulin", precursor: "aminoacid",
                      wrongPrecursors: ["cholesterol", "glucose", "omega3"],
                      helpers: ["zinc", "sulfur"], wrongHelpers: ["iodine", "vitK", "sunlight", "fluoride"],
                      chain: ["aminoacid", "proinsulin", "insulin"], location: .pancreas,
                      lesson: "Ribosomes link 51 amino acids, sulfur bridges lock the shape, and zinc packs insulin for storage."),
        HormoneRecipe(id: "calcitriol", precursor: "cholesterol",
                      wrongPrecursors: ["glucose", "tyrosine", "aminoacid"],
                      helpers: ["sunlight", "magnesium"], wrongHelpers: ["darkness", "iodine", "fluoride", "vitE"],
                      chain: ["cholesterol", "vitD", "calcidiol", "calcitriol"], location: .kidney,
                      lesson: "Sunlight turns a cholesterol cousin into vitamin D; the liver and kidneys (with magnesium's help) activate it."),
    ]
}

// MARK: - Fat Traffic Control

enum FatRoute: CaseIterable {
    case short, medium, long

    var title: String {
        switch self {
        case .short: return "Colon Cell Café"
        case .medium: return "Portal Vein Express"
        case .long: return "Chylomicron Bus"
        }
    }

    var emoji: String {
        switch self {
        case .short: return "🦠"
        case .medium: return "🏎️"
        case .long: return "🚌"
        }
    }

    var rule: String {
        switch self {
        case .short: return "Short chains (under 6 C)"
        case .medium: return "Medium chains (6–12 C)"
        case .long: return "Long chains (13+ C)"
        }
    }

    var explanation: String {
        switch self {
        case .short:
            return "Short-chain fatty acids (mostly made by gut microbes from fiber) are absorbed right in the gut and fuel colon cells."
        case .medium:
            return "Medium-chain fatty acids skip the lymph and zoom straight to the liver through the portal vein."
        case .long:
            return "Long-chain fatty acids get packed into chylomicrons and ride the lymph before reaching the blood."
        }
    }

    var color: Color {
        switch self {
        case .short: return Color(hex: 0x80B918)
        case .medium: return Color(hex: 0xFF8C42)
        case .long: return Color(hex: 0x3A86FF)
        }
    }

    static func route(forCarbons carbons: Int) -> FatRoute {
        if carbons < 6 { return .short }
        if carbons <= 12 { return .medium }
        return .long
    }
}

struct FatMolecule: Identifiable {
    let name: String
    let carbons: Int
    let fact: String

    var id: String { name }
    var route: FatRoute { FatRoute.route(forCarbons: carbons) }

    static let all: [FatMolecule] = [
        FatMolecule(name: "Acetate", carbons: 2, fact: "Microbes make acetate from fiber. It's also the acid in vinegar!"),
        FatMolecule(name: "Propionate", carbons: 3, fact: "Made by gut microbes, it travels to the liver to help make glucose."),
        FatMolecule(name: "Butyrate", carbons: 4, fact: "The favorite fuel of colon cells, made when microbes ferment fiber."),
        FatMolecule(name: "Caproic acid", carbons: 6, fact: "Named after goats (capra) because it was found in goat milk."),
        FatMolecule(name: "Caprylic acid", carbons: 8, fact: "A classic MCT in coconut oil that's burned quickly for energy."),
        FatMolecule(name: "Capric acid", carbons: 10, fact: "Another coconut and palm kernel oil MCT."),
        FatMolecule(name: "Myristic acid", carbons: 14, fact: "Found in nutmeg and dairy. Its name comes from the nutmeg tree!"),
        FatMolecule(name: "Palmitic acid", carbons: 16, fact: "The most common saturated fat in your body, found in palm oil and meat."),
        FatMolecule(name: "Stearic acid", carbons: 18, fact: "A firm, saturated fat found in chocolate and beef."),
        FatMolecule(name: "Oleic acid", carbons: 18, fact: "The main fat in olive oil and avocados, with one bendy double bond."),
        FatMolecule(name: "Linoleic acid", carbons: 18, fact: "An essential omega-6 fat from nuts and seeds."),
        FatMolecule(name: "Alpha-linolenic acid", carbons: 18, fact: "An essential omega-3 fat from flax seeds and walnuts."),
        FatMolecule(name: "EPA", carbons: 20, fact: "A fish omega-3 that becomes calming signal molecules."),
        FatMolecule(name: "DHA", carbons: 22, fact: "The omega-3 that builds flexible brain and eye membranes."),
    ]
}

// MARK: - Ribosome Rush

struct AminoAcidInfo {
    let code: Character
    let short: String
    let name: String
    let essential: Bool
    let colorHex: UInt32

    var color: Color { Color(hex: colorHex) }

    static let all: [Character: AminoAcidInfo] = {
        let list: [AminoAcidInfo] = [
            AminoAcidInfo(code: "G", short: "Gly", name: "Glycine", essential: false, colorHex: 0xFF99C8),
            AminoAcidInfo(code: "I", short: "Ile", name: "Isoleucine", essential: true, colorHex: 0x3A86FF),
            AminoAcidInfo(code: "V", short: "Val", name: "Valine", essential: true, colorHex: 0x00A6C8),
            AminoAcidInfo(code: "E", short: "Glu", name: "Glutamate", essential: false, colorHex: 0xFF595E),
            AminoAcidInfo(code: "Q", short: "Gln", name: "Glutamine", essential: false, colorHex: 0xFF8C42),
            AminoAcidInfo(code: "C", short: "Cys", name: "Cysteine", essential: false, colorHex: 0xF4B400),
            AminoAcidInfo(code: "F", short: "Phe", name: "Phenylalanine", essential: true, colorHex: 0x9B5DE5),
            AminoAcidInfo(code: "N", short: "Asn", name: "Asparagine", essential: false, colorHex: 0x2DC653),
            AminoAcidInfo(code: "H", short: "His", name: "Histidine", essential: true, colorHex: 0x7B2CBF),
            AminoAcidInfo(code: "Y", short: "Tyr", name: "Tyrosine", essential: false, colorHex: 0xFF7AA2),
            AminoAcidInfo(code: "P", short: "Pro", name: "Proline", essential: false, colorHex: 0x8D99AE),
            AminoAcidInfo(code: "L", short: "Leu", name: "Leucine", essential: true, colorHex: 0xE63973),
            AminoAcidInfo(code: "R", short: "Arg", name: "Arginine", essential: false, colorHex: 0x4361EE),
            AminoAcidInfo(code: "K", short: "Lys", name: "Lysine", essential: true, colorHex: 0x06D6A0),
            AminoAcidInfo(code: "W", short: "Trp", name: "Tryptophan", essential: true, colorHex: 0xF15BB5),
        ]
        return Dictionary(uniqueKeysWithValues: list.map { ($0.code, $0) })
    }()

    static func info(_ code: Character) -> AminoAcidInfo {
        all[code] ?? AminoAcidInfo(code: code, short: String(code), name: String(code), essential: false, colorHex: 0x8D99AE)
    }
}

struct PeptideLevel {
    let name: String
    let emoji: String
    let sequence: String
    let decoys: String
    let fact: String

    static let all: [PeptideLevel] = [
        PeptideLevel(name: "Glutathione", emoji: "🛡️", sequence: "ECG", decoys: "LKW",
                     fact: "Glutathione is a tiny 3-amino-acid antioxidant that protects your cells. Its glutamate is linked by a special side-chain bond!"),
        PeptideLevel(name: "Insulin A-chain (start)", emoji: "🔑", sequence: "GIVEQ", decoys: "LYW",
                     fact: "Insulin's A-chain begins G-I-V-E-Q. The full A-chain has 21 amino acids and the B-chain has 30."),
        PeptideLevel(name: "Insulin B-chain (start)", emoji: "🔑", sequence: "FVNQH", decoys: "GKC",
                     fact: "The B-chain starts F-V-N-Q-H. Phenylalanine, valine and histidine are essential: they must come from food!"),
        PeptideLevel(name: "Oxytocin", emoji: "🤗", sequence: "CYIQNCPLG", decoys: "WK",
                     fact: "Oxytocin is a 9-amino-acid hormone for bonding and trust. Its two cysteines form a sulfur bridge that makes a ring!"),
        PeptideLevel(name: "Vasopressin", emoji: "💧", sequence: "CYFQNCPRG", decoys: "LI",
                     fact: "Vasopressin tells your kidneys to save water. It differs from oxytocin by just 2 amino acids!"),
    ]
}

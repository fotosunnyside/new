import SwiftUI

enum NutrientFamily: String, CaseIterable, Identifiable, Codable {
    case carbs, fats, proteins, vitamins, minerals, hormones, helpers, energy

    var id: String { rawValue }

    var title: String {
        switch self {
        case .carbs: return "Carbohydrates"
        case .fats: return "Fats & Lipids"
        case .proteins: return "Proteins & Amino Acids"
        case .vitamins: return "Vitamins"
        case .minerals: return "Minerals"
        case .hormones: return "Hormones & Messengers"
        case .helpers: return "Enzyme Crew"
        case .energy: return "Energy Makers"
        }
    }

    var shortTitle: String {
        switch self {
        case .carbs: return "Carbs"
        case .fats: return "Fats"
        case .proteins: return "Proteins"
        case .vitamins: return "Vitamins"
        case .minerals: return "Minerals"
        case .hormones: return "Hormones"
        case .helpers: return "Enzymes"
        case .energy: return "Energy"
        }
    }

    var emoji: String {
        switch self {
        case .carbs: return "🍞"
        case .fats: return "🥑"
        case .proteins: return "🥚"
        case .vitamins: return "🥕"
        case .minerals: return "💎"
        case .hormones: return "📬"
        case .helpers: return "✂️"
        case .energy: return "⚡️"
        }
    }

    var color: Color {
        switch self {
        case .carbs: return Color(hex: 0xFF8C42)
        case .fats: return Color(hex: 0xF4B400)
        case .proteins: return Color(hex: 0xFF5C8A)
        case .vitamins: return Color(hex: 0x3BB273)
        case .minerals: return Color(hex: 0x3A86FF)
        case .hormones: return Color(hex: 0x9B5DE5)
        case .helpers: return Color(hex: 0x00A6C8)
        case .energy: return Color(hex: 0xFF595E)
        }
    }
}

enum FaceShape: String, Codable {
    case hexagon, pentagon, diamond, circle, capsule, drop, gem, squircle
}

struct MoleculeCharacter: Identifiable, Hashable {
    let id: String
    let name: String
    let molecule: String
    let family: NutrientFamily
    let shape: FaceShape
    let accessory: String
    let colorHex: UInt32
    let catchphrase: String
    let bio: String
    let foods: [String]
    let becomes: [String]
    let funFact: String

    var color: Color { Color(hex: colorHex) }
    var firstName: String { name.components(separatedBy: " ").first ?? name }

    static func == (lhs: MoleculeCharacter, rhs: MoleculeCharacter) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

enum BodyLocation: String, CaseIterable, Identifiable {
    case brain, mouth, thyroid, lymph, bloodstream, liver, stomach, pancreas, kidney, adrenal
    case smallIntestine, largeIntestine, reproductive, skin, muscle, bones, cell, mitochondria

    var id: String { rawValue }

    var name: String {
        switch self {
        case .brain: return "Brain"
        case .mouth: return "Mouth"
        case .thyroid: return "Thyroid"
        case .lymph: return "Lymph Vessels"
        case .bloodstream: return "Heart & Blood"
        case .liver: return "Liver"
        case .stomach: return "Stomach"
        case .pancreas: return "Pancreas"
        case .kidney: return "Kidneys"
        case .adrenal: return "Adrenal Glands"
        case .smallIntestine: return "Small Intestine"
        case .largeIntestine: return "Large Intestine"
        case .reproductive: return "Ovaries & Testes"
        case .skin: return "Skin"
        case .muscle: return "Muscles"
        case .bones: return "Bones & Marrow"
        case .cell: return "Body Cell"
        case .mitochondria: return "Mitochondria"
        }
    }

    var emoji: String {
        switch self {
        case .brain: return "🧠"
        case .mouth: return "👄"
        case .thyroid: return "🦋"
        case .lymph: return "🛤️"
        case .bloodstream: return "❤️"
        case .liver: return "🧪"
        case .stomach: return "🌀"
        case .pancreas: return "⚗️"
        case .kidney: return "🫘"
        case .adrenal: return "⚡️"
        case .smallIntestine: return "🍝"
        case .largeIntestine: return "🦠"
        case .reproductive: return "🌱"
        case .skin: return "☀️"
        case .muscle: return "💪"
        case .bones: return "🦴"
        case .cell: return "🧫"
        case .mitochondria: return "🔋"
        }
    }

    var color: Color {
        switch self {
        case .brain: return Color(hex: 0xF08CAE)
        case .mouth: return Color(hex: 0xFF7B9C)
        case .thyroid: return Color(hex: 0x9B5DE5)
        case .lymph: return Color(hex: 0x52B788)
        case .bloodstream: return Color(hex: 0xE63946)
        case .liver: return Color(hex: 0xA0522D)
        case .stomach: return Color(hex: 0xFF9F1C)
        case .pancreas: return Color(hex: 0xF4B400)
        case .kidney: return Color(hex: 0xB5838D)
        case .adrenal: return Color(hex: 0xFF006E)
        case .smallIntestine: return Color(hex: 0xF4845F)
        case .largeIntestine: return Color(hex: 0x80B918)
        case .reproductive: return Color(hex: 0xF72585)
        case .skin: return Color(hex: 0xFFB703)
        case .muscle: return Color(hex: 0xEF476F)
        case .bones: return Color(hex: 0x8D99AE)
        case .cell: return Color(hex: 0x00BBF9)
        case .mitochondria: return Color(hex: 0xFF595E)
        }
    }

    var blurb: String {
        switch self {
        case .brain:
            return "Your command center uses about 20% of your body's energy. It builds its own serotonin and dopamine from amino acids, and its tiny pineal gland makes melatonin at night."
        case .mouth:
            return "Digestion starts here! Teeth crush food into small pieces and saliva adds amylase, an enzyme that begins snipping starch into sugars."
        case .thyroid:
            return "A butterfly-shaped gland in your neck. It traps iodine and sticks it onto tyrosine to build thyroid hormones, your metabolism's thermostat."
        case .lymph:
            return "A second highway system. Chylomicrons packed with long-chain fats ride through the lymph before joining the blood near your heart."
        case .bloodstream:
            return "The body's delivery network. Blood carries glucose, amino acids, fats, vitamins, hormones and oxygen to trillions of cells."
        case .liver:
            return "The body's chemistry lab! It stores glycogen, makes cholesterol and bile, sorts amino acids, turns ammonia into urea, makes ketones and activates vitamin D."
        case .stomach:
            return "A stretchy, acid-filled mixing bag. Strong acid unfolds proteins and kills germs while pepsin starts chopping proteins into pieces."
        case .pancreas:
            return "Does two big jobs: it sends digestive enzymes to the small intestine AND releases insulin into the blood."
        case .kidney:
            return "Two bean-shaped filters that clean your blood, flush out urea and make the active form of vitamin D."
        case .adrenal:
            return "Little glands sitting on top of your kidneys. They make adrenaline for fast action and cortisol for stress and waking up."
        case .smallIntestine:
            return "About 6 meters long and lined with tiny fingers called villi. Most nutrients are finished off and absorbed here!"
        case .largeIntestine:
            return "Home to trillions of friendly microbes that ferment fiber into short-chain fatty acids and even make some vitamin K."
        case .reproductive:
            return "Glands that use cholesterol to make testosterone and estradiol, the hormones that guide growing up."
        case .skin:
            return "Your largest organ! When sunlight hits it, a cholesterol cousin turns into vitamin D."
        case .muscle:
            return "Muscles burn glucose and fat for movement, store glycogen, and use amino acids like leucine to grow stronger."
        case .bones:
            return "Bones store calcium, and the marrow inside builds about 2 million new red blood cells every second!"
        case .cell:
            return "The tiny unit of life. Inside, ribosomes build proteins and glycolysis splits glucose in two."
        case .mitochondria:
            return "The powerhouses inside your cells. They use oxygen to turn the energy in food into ATP."
        }
    }

    /// Position on the 100 × 160 body map grid. `nil` = shown in the "Inside a Cell" panel.
    var mapPoint: CGPoint? {
        switch self {
        case .brain: return CGPoint(x: 44, y: 11)
        case .mouth: return CGPoint(x: 56, y: 23)
        case .thyroid: return CGPoint(x: 50, y: 35)
        case .lymph: return CGPoint(x: 36, y: 42)
        case .bloodstream: return CGPoint(x: 61, y: 43)
        case .liver: return CGPoint(x: 39, y: 56)
        case .stomach: return CGPoint(x: 61, y: 57)
        case .pancreas: return CGPoint(x: 50, y: 67)
        case .kidney: return CGPoint(x: 35, y: 72)
        case .adrenal: return CGPoint(x: 65, y: 72)
        case .smallIntestine: return CGPoint(x: 46, y: 83)
        case .largeIntestine: return CGPoint(x: 64, y: 88)
        case .reproductive: return CGPoint(x: 50, y: 98)
        case .skin: return CGPoint(x: 21, y: 78)
        case .muscle: return CGPoint(x: 60.5, y: 124)
        case .bones: return CGPoint(x: 39.5, y: 140)
        case .cell, .mitochondria: return nil
        }
    }
}

struct PathwayStep {
    let location: BodyLocation
    let star: String
    let title: String
    let text: String
    let helpers: [String]

    init(_ location: BodyLocation, _ star: String, _ title: String, _ text: String, _ helpers: [String] = []) {
        self.location = location
        self.star = star
        self.title = title
        self.text = text
        self.helpers = helpers
    }
}

struct QuizQuestion {
    let prompt: String
    let correct: String
    let wrong: [String]
    let explanation: String

    init(_ prompt: String, _ correct: String, _ wrong: [String], _ explanation: String) {
        self.prompt = prompt
        self.correct = correct
        self.wrong = wrong
        self.explanation = explanation
    }

    var choices: [String] { [correct] + wrong }
}

struct Pathway: Identifiable, Hashable {
    let id: String
    let title: String
    let subtitle: String
    let family: NutrientFamily
    let emoji: String
    let steps: [PathwayStep]
    let check: QuizQuestion

    /// The molecules starring in this pathway, in order of appearance.
    var uniqueStars: [String] {
        var seen = Set<String>()
        return steps.compactMap { seen.insert($0.star).inserted ? $0.star : nil }
    }

    static func == (lhs: Pathway, rhs: Pathway) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

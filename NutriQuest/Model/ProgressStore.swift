import SwiftUI

struct Rank {
    let title: String
    let emoji: String
    let minStars: Int

    static let all: [Rank] = [
        Rank(title: "Curious Cell", emoji: "🧫", minStars: 0),
        Rank(title: "Enzyme Apprentice", emoji: "✂️", minStars: 8),
        Rank(title: "Molecule Mechanic", emoji: "🔧", minStars: 20),
        Rank(title: "Pathway Pro", emoji: "🧭", minStars: 35),
        Rank(title: "Hormone Hero", emoji: "🦸", minStars: 50),
        Rank(title: "Metabolism Master", emoji: "👑", minStars: 65),
    ]
}

struct Badge: Identifiable {
    let id: String
    let emoji: String
    let title: String
    let detail: String
    let earned: Bool
}

enum GameKind: String, CaseIterable, Identifiable, Hashable {
    case scissors, fatRouter, factory, proteinBuilder, quiz

    var id: String { rawValue }

    var title: String {
        switch self {
        case .scissors: return "Enzyme Scissors"
        case .fatRouter: return "Fat Traffic Control"
        case .factory: return "Hormone Factory"
        case .proteinBuilder: return "Ribosome Rush"
        case .quiz: return "Molecule Quiz"
        }
    }

    var subtitle: String {
        switch self {
        case .scissors: return "Snip starch into glucose — but don't cut the fiber!"
        case .fatRouter: return "Send short, medium & long-chain fats down the right route."
        case .factory: return "Pick the right ingredients and helpers to cook up hormones."
        case .proteinBuilder: return "Link amino acids in order to build real hormones."
        case .quiz: return "Ten quick questions. How much do you know?"
        }
    }

    var mascot: String {
        switch self {
        case .scissors: return "amylase"
        case .fatRouter: return "chylomicron"
        case .factory: return "serotonin"
        case .proteinBuilder: return "ribosome"
        case .quiz: return "mito"
        }
    }

    var color: Color {
        switch self {
        case .scissors: return Color(hex: 0xFF8C42)
        case .fatRouter: return Color(hex: 0xF4B400)
        case .factory: return Color(hex: 0x9B5DE5)
        case .proteinBuilder: return Color(hex: 0x00A6C8)
        case .quiz: return Color(hex: 0xFF5C8A)
        }
    }

    /// Games whose best result earns stars (the factory earns stars per recipe instead).
    static let scored: [GameKind] = [.scissors, .fatRouter, .proteinBuilder, .quiz]
}

final class ProgressStore: ObservableObject {
    struct SaveData: Codable {
        var pathwayStars: [String: Int] = [:]
        var gameStars: [String: Int] = [:]
        var bestScores: [String: Int] = [:]
        var hormoneStars: [String: Int] = [:]
        var collected: Set<String> = []
    }

    @Published private(set) var data = SaveData()
    private let key = "NutriQuest.save.v1"

    init() {
        if let raw = UserDefaults.standard.data(forKey: key),
           let decoded = try? JSONDecoder().decode(SaveData.self, from: raw) {
            data = decoded
        }
    }

    private func save() {
        if let raw = try? JSONEncoder().encode(data) {
            UserDefaults.standard.set(raw, forKey: key)
        }
    }

    // MARK: Collection

    func isCollected(_ id: String) -> Bool { data.collected.contains(id) }

    func collect(_ id: String) {
        guard !data.collected.contains(id) else { return }
        data.collected.insert(id)
        save()
    }

    var collectedCount: Int { Cast.all.filter { data.collected.contains($0.id) }.count }

    // MARK: Stars

    func stars(forPathway id: String) -> Int { data.pathwayStars[id] ?? 0 }

    func award(pathwayStars stars: Int, for id: String) {
        guard stars > (data.pathwayStars[id] ?? 0) else { return }
        data.pathwayStars[id] = min(stars, 3)
        save()
    }

    func stars(forHormone id: String) -> Int { data.hormoneStars[id] ?? 0 }

    func award(hormoneStars stars: Int, for id: String) {
        guard stars > (data.hormoneStars[id] ?? 0) else { return }
        data.hormoneStars[id] = min(stars, 3)
        save()
    }

    func stars(for game: GameKind) -> Int { data.gameStars[game.rawValue] ?? 0 }
    func bestScore(for game: GameKind) -> Int? { data.bestScores[game.rawValue] }

    /// Records a finished game. Returns `true` if it's a new best score.
    @discardableResult
    func record(score: Int, stars: Int, for game: GameKind) -> Bool {
        let key = game.rawValue
        let isBest = score > (data.bestScores[key] ?? Int.min)
        if isBest { data.bestScores[key] = score }
        if stars > (data.gameStars[key] ?? 0) { data.gameStars[key] = min(stars, 3) }
        save()
        return isBest
    }

    var totalStars: Int {
        data.pathwayStars.values.reduce(0, +)
            + data.hormoneStars.values.reduce(0, +)
            + data.gameStars.values.reduce(0, +)
    }

    static var maxStars: Int {
        Library.pathways.count * 3 + Library.recipes.count * 3 + GameKind.scored.count * 3
    }

    var rank: Rank {
        Rank.all.last { totalStars >= $0.minStars } ?? Rank.all[0]
    }

    var nextRank: Rank? {
        Rank.all.first { totalStars < $0.minStars }
    }

    // MARK: Badges

    var badges: [Badge] {
        let completedPaths = data.pathwayStars.values.filter { $0 > 0 }.count
        let builtHormones = data.hormoneStars.values.filter { $0 > 0 }.count
        return [
            Badge(id: "first-path", emoji: "🧭", title: "First Journey",
                  detail: "Finish any pathway", earned: completedPaths >= 1),
            Badge(id: "grand-tour", emoji: "🗺️", title: "Grand Tour",
                  detail: "Finish every pathway", earned: completedPaths >= Library.pathways.count),
            Badge(id: "collector", emoji: "🃏", title: "Collector",
                  detail: "Collect 25 Molecule Pals", earned: collectedCount >= 25),
            Badge(id: "full-set", emoji: "🏆", title: "Full Set",
                  detail: "Collect every Molecule Pal", earned: collectedCount >= Cast.all.count),
            Badge(id: "chef", emoji: "🧑‍🍳", title: "Hormone Chef",
                  detail: "Build 4 hormones", earned: builtHormones >= 4),
            Badge(id: "factory", emoji: "🏭", title: "Factory Boss",
                  detail: "Build every hormone", earned: builtHormones >= Library.recipes.count),
            Badge(id: "snip", emoji: "✂️", title: "Snip Master",
                  detail: "3 stars in Enzyme Scissors", earned: stars(for: .scissors) >= 3),
            Badge(id: "traffic", emoji: "🚦", title: "Fat Traffic Cop",
                  detail: "3 stars in Fat Traffic Control", earned: stars(for: .fatRouter) >= 3),
            Badge(id: "ribosome", emoji: "🧬", title: "Ribosome Pro",
                  detail: "3 stars in Ribosome Rush", earned: stars(for: .proteinBuilder) >= 3),
            Badge(id: "quiz", emoji: "🧠", title: "Quiz Whiz",
                  detail: "3 stars in the Molecule Quiz", earned: stars(for: .quiz) >= 3),
        ]
    }

    func reset() {
        data = SaveData()
        save()
    }
}

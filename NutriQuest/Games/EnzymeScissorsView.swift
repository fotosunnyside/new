import SwiftUI

/// Tap the alpha bonds in starch chains to free glucose, but leave
/// fiber's beta bonds alone: human enzymes can't cut them!
struct EnzymeScissorsView: View {
    private struct Bond: Identifiable {
        let id = UUID()
        var cut = false
    }

    private struct Chain: Identifiable {
        let id = UUID()
        let isFiber: Bool
        var bonds: [Bond]
        var beadCount: Int { bonds.count + 1 }
    }

    private struct Round {
        let enzyme: String
        let place: String
        let tip: String
        /// (isFiber, number of beads)
        let chains: [(Bool, Int)]
    }

    private struct Outcome {
        let score: Int
        let stars: Int
        let isNewBest: Bool
    }

    private static let rounds: [Round] = [
        Round(enzyme: "Salivary Amylase", place: "👄 Mouth",
              tip: "You're Amy Amylase! Tap the orange α bonds to snip starch into sugar.",
              chains: [(false, 4), (false, 3)]),
        Round(enzyme: "Pancreatic Amylase", place: "🍝 Small Intestine",
              tip: "The pancreas sends backup! More starch is arriving. Snip fast!",
              chains: [(false, 4), (false, 4), (false, 3)]),
        Round(enzyme: "Fiber Alert!", place: "🍝 Small Intestine",
              tip: "Green chains are FIBER with β bonds. Human enzymes can't cut them, so leave them for the gut microbes!",
              chains: [(false, 4), (true, 4), (false, 3), (true, 3)]),
        Round(enzyme: "Maltase", place: "🍝 Gut wall",
              tip: "Maltose twins! Split every pair into two glucose. Watch out for sneaky fiber.",
              chains: [(false, 2), (false, 2), (true, 2), (false, 2), (false, 2)]),
    ]

    @EnvironmentObject private var store: ProgressStore
    @Environment(\.dismiss) private var dismiss

    @State private var roundIndex = 0
    @State private var chains: [Chain] = []
    @State private var cuts = 0
    @State private var mistakes = 0
    @State private var startDate = Date()
    @State private var roundDone = false
    @State private var message = ""
    @State private var shakeChain: UUID?
    @State private var shakeCount: CGFloat = 0
    @State private var result: Outcome?

    private var round: Round { Self.rounds[roundIndex] }
    private var score: Int { max(0, cuts * 10 - mistakes * 5) }

    var body: some View {
        ZStack {
            Theme.sunset.ignoresSafeArea()
            if let result {
                GameOverView(
                    title: "Snip-tastic!",
                    score: result.score,
                    stars: result.stars,
                    isNewBest: result.isNewBest,
                    lessons: [
                        "Amylase cuts the alpha bonds in starch, first in your mouth and then in the small intestine.",
                        "Maltase splits maltose into two glucose molecules that can be absorbed.",
                        "Fiber has beta bonds that human enzymes can't cut. Gut microbes ferment it into short-chain fatty acids instead!",
                    ],
                    onReplay: startGame,
                    onDone: { dismiss() })
            } else {
                gameBody
            }
        }
        .navigationTitle("Enzyme Scissors")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .onAppear { if chains.isEmpty { startGame() } }
        .sensoryFeedback(.impact(weight: .light), trigger: cuts)
        .sensoryFeedback(.error, trigger: mistakes)
    }

    private var gameBody: some View {
        ScrollView {
            VStack(spacing: 16) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Round \(roundIndex + 1) of \(Self.rounds.count) · \(round.place)")
                            .font(.fun(13, .heavy))
                            .foregroundStyle(Theme.softInk)
                        Text(round.enzyme)
                            .font(.fun(24, .black))
                            .foregroundStyle(Theme.ink)
                    }
                    Spacer()
                    TimelineView(.periodic(from: .now, by: 1)) { context in
                        ScoreBadge(label: "Time", value: "\(Int(context.date.timeIntervalSince(startDate)))s",
                                   color: Color(hex: 0x3A86FF))
                    }
                    ScoreBadge(label: "Score", value: "\(score)", color: Color(hex: 0xFF8C42))
                }

                HStack(alignment: .top, spacing: 10) {
                    MoleculeFace(character: Cast.character("amylase"), size: 54, excited: true)
                    Text(message)
                        .font(.fun(15, .semibold))
                        .foregroundStyle(Theme.ink)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .card(padding: 12)

                VStack(spacing: 18) {
                    ForEach(Array(chains.enumerated()), id: \.element.id) { chainIndex, chain in
                        chainRow(chainIndex: chainIndex, chain: chain)
                    }
                }
                .padding(.vertical, 18)
                .frame(maxWidth: .infinity)
                .background(RoundedRectangle(cornerRadius: 28, style: .continuous).fill(Color.white.opacity(0.65)))

                HStack(spacing: 14) {
                    legend(color: Color(hex: 0xE76F51), symbol: "α", text: "Starch bond: CUT")
                    legend(color: Color(hex: 0x2D6A4F), symbol: "β", text: "Fiber bond: SKIP")
                }

                if roundDone {
                    VStack(spacing: 12) {
                        Text("Round complete! 🍬")
                            .font(.fun(22, .black))
                            .foregroundStyle(Theme.ink)
                        Text(roundSummary)
                            .font(.fun(15, .semibold))
                            .foregroundStyle(Theme.softInk)
                            .multilineTextAlignment(.center)
                        Button(roundIndex + 1 < Self.rounds.count ? "Next round" : "See results") {
                            advance()
                        }
                        .buttonStyle(BubbleButtonStyle(color: Color(hex: 0xFF8C42)))
                    }
                    .frame(maxWidth: .infinity)
                    .card()
                    .transition(.scale.combined(with: .opacity))
                }
            }
            .padding()
        }
    }

    private func legend(color: Color, symbol: String, text: String) -> some View {
        HStack(spacing: 6) {
            Text(symbol)
                .font(.fun(12, .black))
                .foregroundStyle(.white)
                .frame(width: 22, height: 22)
                .background(Circle().fill(color))
            Text(text)
                .font(.fun(12, .heavy))
                .foregroundStyle(Theme.ink)
        }
    }

    private func chainRow(chainIndex: Int, chain: Chain) -> some View {
        HStack(spacing: 0) {
            ForEach(0..<chain.beadCount, id: \.self) { beadIndex in
                bead(isFiber: chain.isFiber, freed: isFreed(chain: chain, bead: beadIndex))
                if beadIndex < chain.bonds.count {
                    bondButton(chainIndex: chainIndex, bondIndex: beadIndex, chain: chain)
                }
            }
        }
        .modifier(ShakeEffect(animatableData: shakeChain == chain.id ? shakeCount : 0))
    }

    private func bead(isFiber: Bool, freed: Bool) -> some View {
        ZStack {
            RegularPolygon(sides: 6)
                .fill(isFiber ? Color(hex: 0x6BBF59) : Color(hex: 0xFF9F1C))
            RegularPolygon(sides: 6)
                .stroke(Color.white, style: StrokeStyle(lineWidth: 3, lineJoin: .round))
            FaceFeatures(size: 44, excited: freed)
                .offset(y: 3)
        }
        .frame(width: 44, height: 44)
        .scaleEffect(freed ? 1.12 : 1)
        .shadow(color: freed ? Color(hex: 0xFFC300).opacity(0.9) : .clear, radius: 8)
    }

    private func bondButton(chainIndex: Int, bondIndex: Int, chain: Chain) -> some View {
        let isCut = chain.bonds[bondIndex].cut
        let color = chain.isFiber ? Color(hex: 0x2D6A4F) : Color(hex: 0xE76F51)
        return Button {
            tap(chainIndex: chainIndex, bondIndex: bondIndex)
        } label: {
            ZStack {
                if isCut {
                    Text("✨").font(.system(size: 14))
                } else {
                    Capsule().fill(color).frame(height: 6)
                    Text(chain.isFiber ? "β" : "α")
                        .font(.fun(11, .black))
                        .foregroundStyle(.white)
                        .frame(width: 20, height: 20)
                        .background(Circle().fill(color))
                }
            }
            .frame(width: isCut ? 32 : 26, height: 44)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(isCut || roundDone)
        .accessibilityLabel(chain.isFiber ? "Fiber beta bond" : (isCut ? "Cut bond" : "Starch alpha bond"))
    }

    private var roundSummary: String {
        let glucose = chains.filter { !$0.isFiber }.reduce(0) { $0 + $1.beadCount }
        let hasFiber = chains.contains { $0.isFiber }
        var text = "You freed \(glucose) glucose molecules for the body to absorb."
        if hasFiber { text += " The fiber slides on to feed your gut microbes. 🦠" }
        return text
    }

    // MARK: - Logic

    private func isFreed(chain: Chain, bead: Int) -> Bool {
        guard !chain.isFiber else { return false }
        let leftCut = bead == 0 || chain.bonds[bead - 1].cut
        let rightCut = bead == chain.bonds.count || chain.bonds[bead].cut
        return leftCut && rightCut
    }

    private func startGame() {
        result = nil
        cuts = 0
        mistakes = 0
        startDate = Date()
        startRound(0)
    }

    private func startRound(_ index: Int) {
        roundIndex = index
        chains = Self.rounds[index].chains.map { spec in
            Chain(isFiber: spec.0, bonds: (0..<(spec.1 - 1)).map { _ in Bond() })
        }
        roundDone = false
        message = Self.rounds[index].tip
    }

    private func tap(chainIndex: Int, bondIndex: Int) {
        guard chains.indices.contains(chainIndex), !roundDone else { return }
        if chains[chainIndex].isFiber {
            mistakes += 1
            shakeChain = chains[chainIndex].id
            withAnimation(.linear(duration: 0.35)) { shakeCount += 1 }
            message = "Oops! That's fiber. Human enzymes can't cut beta bonds. Leave it for the gut microbes! 🦠"
            return
        }
        withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
            chains[chainIndex].bonds[bondIndex].cut = true
        }
        cuts += 1
        message = ["Snip! ✂️", "Nice cut!", "Glucose freed! ⚡️", "Sweet!", "Keep snipping!"].randomElement() ?? "Snip!"
        let allCut = chains.allSatisfy { $0.isFiber || $0.bonds.allSatisfy(\.cut) }
        if allCut {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) { roundDone = true }
        }
    }

    private func advance() {
        if roundIndex + 1 < Self.rounds.count {
            withAnimation { startRound(roundIndex + 1) }
        } else {
            let seconds = Int(Date().timeIntervalSince(startDate))
            let timeBonus = max(0, 90 - seconds) * 2
            let finalScore = score + timeBonus
            let stars = finalScore >= 300 ? 3 : finalScore >= 220 ? 2 : 1
            let best = store.record(score: finalScore, stars: stars, for: .scissors)
            withAnimation { result = Outcome(score: finalScore, stars: stars, isNewBest: best) }
        }
    }
}

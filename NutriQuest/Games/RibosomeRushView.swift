import SwiftUI

/// Tap amino acids in the right order to build real peptide hormones.
struct RibosomeRushView: View {
    private struct Outcome {
        let score: Int
        let stars: Int
        let isNewBest: Bool
    }

    @EnvironmentObject private var store: ProgressStore
    @Environment(\.dismiss) private var dismiss

    @State private var levelIndex = 0
    @State private var placed = 0
    @State private var palette: [Character] = []
    @State private var levelMistakes = 0
    @State private var totalScore = 0
    @State private var message = ""
    @State private var shake: CGFloat = 0
    @State private var levelDone = false
    @State private var outcome: Outcome?

    private var level: PeptideLevel { PeptideLevel.all[levelIndex] }
    private var sequence: [Character] { Array(level.sequence) }

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: 0xB9F3FF), Color(hex: 0xE4C1F9)],
                           startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            if let outcome {
                GameOverView(
                    title: "Protein factory champion!",
                    score: outcome.score,
                    stars: outcome.stars,
                    isNewBest: outcome.isNewBest,
                    lessons: [
                        "Ribosomes link amino acids in the exact order written in your DNA (copied into mRNA).",
                        "Nine amino acids are essential (⭐): your body can't make them, so they must come from food.",
                        "Many hormones, like insulin, oxytocin and vasopressin, are just short chains of amino acids!",
                    ],
                    onReplay: startGame,
                    onDone: { dismiss() })
            } else {
                playView
            }
        }
        .navigationTitle("Ribosome Rush")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .onAppear { if palette.isEmpty { startGame() } }
        .sensoryFeedback(.impact(weight: .light), trigger: placed)
        .sensoryFeedback(.error, trigger: shake)
        .sensoryFeedback(.success, trigger: levelDone)
    }

    private var playView: some View {
        ScrollView {
            VStack(spacing: 16) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Level \(levelIndex + 1) of \(PeptideLevel.all.count)")
                            .font(.fun(13, .heavy))
                            .foregroundStyle(Theme.softInk)
                        Text("\(level.emoji) \(level.name)")
                            .font(.fun(22, .black))
                            .foregroundStyle(Theme.ink)
                    }
                    Spacer()
                    ScoreBadge(label: "Score", value: "\(totalScore)", color: Color(hex: 0x00A6C8))
                }

                HStack(alignment: .top, spacing: 10) {
                    MoleculeFace(character: Cast.character("ribosome"), size: 54, excited: true)
                    Text(message)
                        .font(.fun(15, .semibold))
                        .foregroundStyle(Theme.ink)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .card(padding: 12)

                VStack(alignment: .leading, spacing: 10) {
                    Text("mRNA RECIPE")
                        .font(.fun(12, .heavy))
                        .foregroundStyle(Theme.softInk)
                    FlowLayout(spacing: 6) {
                        ForEach(Array(sequence.enumerated()), id: \.offset) { i, code in
                            slot(index: i, code: code)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .card()
                .modifier(ShakeEffect(animatableData: shake))

                if levelDone {
                    VStack(spacing: 12) {
                        Text("\(level.name) built! 🎉")
                            .font(.fun(22, .black))
                            .foregroundStyle(Theme.ink)
                        Text(level.fact)
                            .font(.fun(15, .semibold))
                            .foregroundStyle(Theme.ink)
                            .fixedSize(horizontal: false, vertical: true)
                        Button(levelIndex + 1 < PeptideLevel.all.count ? "Next protein" : "See results") {
                            nextLevel()
                        }
                        .buttonStyle(BubbleButtonStyle(color: Color(hex: 0x00A6C8)))
                    }
                    .frame(maxWidth: .infinity)
                    .card()
                    .transition(.scale.combined(with: .opacity))
                } else {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("AMINO ACID SUPPLY  ·  ⭐ = essential")
                            .font(.fun(12, .heavy))
                            .foregroundStyle(Theme.softInk)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 70), spacing: 10)], spacing: 10) {
                            ForEach(palette, id: \.self) { code in
                                aminoButton(code)
                            }
                        }
                    }
                    .card()
                }
            }
            .padding()
        }
    }

    private func slot(index: Int, code: Character) -> some View {
        let info = AminoAcidInfo.info(code)
        let filled = index < placed
        let isNext = index == placed && !levelDone
        return VStack(spacing: 2) {
            ZStack {
                Circle()
                    .fill(filled ? info.color : Color.white)
                Circle()
                    .stroke(isNext ? Theme.pink : info.color.opacity(filled ? 0 : 0.5),
                            style: StrokeStyle(lineWidth: isNext ? 4 : 2, dash: filled ? [] : [4, 3]))
                Text(info.short)
                    .font(.fun(12, .black))
                    .foregroundStyle(filled ? .white : Theme.softInk.opacity(0.7))
            }
            .frame(width: 46, height: 46)
            .scaleEffect(isNext ? 1.1 : 1)
            Text(isNext ? "🏭" : " ")
                .font(.system(size: 14))
        }
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: placed)
    }

    private func aminoButton(_ code: Character) -> some View {
        let info = AminoAcidInfo.info(code)
        return Button { tap(code) } label: {
            VStack(spacing: 2) {
                Text(info.short + (info.essential ? "⭐" : ""))
                    .font(.fun(15, .black))
                Text(info.name)
                    .font(.fun(9, .bold))
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, minHeight: 58)
            .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(info.color))
        }
        .buttonStyle(PressableStyle())
        .accessibilityLabel(info.name + (info.essential ? ", essential" : ""))
    }

    // MARK: Logic

    private func startGame() {
        outcome = nil
        totalScore = 0
        startLevel(0)
    }

    private func startLevel(_ index: Int) {
        levelIndex = index
        placed = 0
        levelMistakes = 0
        levelDone = false
        let level = PeptideLevel.all[index]
        var unique: [Character] = []
        for code in level.sequence + level.decoys where !unique.contains(code) {
            unique.append(code)
        }
        palette = unique.shuffled()
        message = "Read the mRNA recipe and tap the amino acids in order. The glowing circle shows the next spot!"
    }

    private func tap(_ code: Character) {
        guard !levelDone, placed < sequence.count else { return }
        let expected = sequence[placed]
        let info = AminoAcidInfo.info(code)
        if code == expected {
            placed += 1
            message = info.essential
                ? "\(info.name) linked! ⭐ It's essential, so it has to come from food."
                : "\(info.name) linked! Your body can make this one itself."
            if placed == sequence.count {
                totalScore += max(30, 100 - levelMistakes * 10)
                withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) { levelDone = true }
            }
        } else {
            levelMistakes += 1
            withAnimation(.linear(duration: 0.35)) { shake += 1 }
            message = "Oops, that's \(info.name). The recipe needs \(AminoAcidInfo.info(expected).name) (\(AminoAcidInfo.info(expected).short)) next!"
        }
    }

    private func nextLevel() {
        if levelIndex + 1 < PeptideLevel.all.count {
            withAnimation { startLevel(levelIndex + 1) }
        } else {
            let stars = totalScore >= 450 ? 3 : totalScore >= 350 ? 2 : 1
            let best = store.record(score: totalScore, stars: stars, for: .proteinBuilder)
            withAnimation { outcome = Outcome(score: totalScore, stars: stars, isNewBest: best) }
        }
    }
}

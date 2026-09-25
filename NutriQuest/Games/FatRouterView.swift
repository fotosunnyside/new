import SwiftUI

/// Route each fatty acid to the right path based on its chain length.
struct FatRouterView: View {
    private struct Feedback {
        let correct: Bool
        let chosen: FatRoute
    }

    private struct Outcome {
        let score: Int
        let stars: Int
        let isNewBest: Bool
        let correct: Int
    }

    private static let roundsPerGame = 12

    @EnvironmentObject private var store: ProgressStore
    @Environment(\.dismiss) private var dismiss

    @State private var queue: [FatMolecule] = []
    @State private var index = 0
    @State private var score = 0
    @State private var streak = 0
    @State private var correctCount = 0
    @State private var feedback: Feedback?
    @State private var outcome: Outcome?
    @State private var shake: CGFloat = 0

    private var current: FatMolecule? { queue.indices.contains(index) ? queue[index] : nil }

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: 0xFFF1C1), Color(hex: 0xFFD6A5)],
                           startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            if let outcome {
                GameOverView(
                    title: "\(outcome.correct) of \(Self.roundsPerGame) fats routed!",
                    score: outcome.score,
                    stars: outcome.stars,
                    isNewBest: outcome.isNewBest,
                    lessons: [FatRoute.short.explanation, FatRoute.medium.explanation, FatRoute.long.explanation],
                    onReplay: startGame,
                    onDone: { dismiss() })
            } else if let current {
                playView(current)
            }
        }
        .navigationTitle("Fat Traffic Control")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .onAppear { if queue.isEmpty { startGame() } }
        .sensoryFeedback(.success, trigger: correctCount)
        .sensoryFeedback(.error, trigger: shake)
    }

    private func playView(_ fat: FatMolecule) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                HStack {
                    Text("Fat \(index + 1) of \(Self.roundsPerGame)")
                        .font(.fun(15, .heavy))
                        .foregroundStyle(Theme.softInk)
                    Spacer()
                    if streak >= 2 {
                        ScoreBadge(label: "Streak", value: "🔥\(streak)", color: Color(hex: 0xFF595E))
                    }
                    ScoreBadge(label: "Score", value: "\(score)", color: Color(hex: 0xF4B400))
                }

                VStack(spacing: 10) {
                    Text("Incoming fatty acid!")
                        .font(.fun(13, .heavy))
                        .foregroundStyle(Theme.softInk)
                    Text(fat.name)
                        .font(.fun(28, .black))
                        .foregroundStyle(Theme.ink)
                        .multilineTextAlignment(.center)
                    CarbonChainView(carbons: fat.carbons, color: Color(hex: 0xE0A800))
                    Text("\(fat.carbons) carbons long")
                        .font(.fun(16, .heavy))
                        .foregroundStyle(Color(hex: 0xB07D00))
                    Text("The red ball is the acid head. Count the carbons in the zig-zag tail!")
                        .font(.fun(12, .semibold))
                        .foregroundStyle(Theme.softInk)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .card()
                .modifier(ShakeEffect(animatableData: shake))
                .id(fat.id)
                .transition(.asymmetric(insertion: .move(edge: .top).combined(with: .opacity),
                                        removal: .move(edge: .bottom).combined(with: .opacity)))

                if let feedback {
                    feedbackCard(fat: fat, feedback: feedback)
                } else {
                    Text("Where should it go?")
                        .font(.fun(18, .heavy))
                        .foregroundStyle(Theme.ink)
                    ForEach(FatRoute.allCases, id: \.self) { route in
                        Button { choose(route, for: fat) } label: {
                            HStack(spacing: 14) {
                                Text(route.emoji)
                                    .font(.system(size: 34))
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(route.title)
                                        .font(.fun(19, .black))
                                    Text(route.rule)
                                        .font(.fun(13, .bold))
                                        .opacity(0.9)
                                }
                                Spacer()
                                Image(systemName: "arrow.right.circle.fill")
                                    .font(.system(size: 26))
                            }
                            .foregroundStyle(.white)
                            .padding(16)
                            .background(RoundedRectangle(cornerRadius: 22, style: .continuous).fill(route.color))
                        }
                        .buttonStyle(PressableStyle())
                    }
                }
            }
            .padding()
        }
    }

    private func feedbackCard(fat: FatMolecule, feedback: Feedback) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(feedback.correct ? "✅ Correct route!" : "❌ Wrong way! It belongs on the \(fat.route.title) \(fat.route.emoji)")
                .font(.fun(19, .black))
                .foregroundStyle(feedback.correct ? Theme.good : Theme.bad)
                .fixedSize(horizontal: false, vertical: true)
            Text(fat.route.explanation)
                .font(.fun(15, .semibold))
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
            Text("💡 \(fat.fact)")
                .font(.fun(15, .medium))
                .foregroundStyle(Theme.softInk)
                .fixedSize(horizontal: false, vertical: true)
            Button(index + 1 < Self.roundsPerGame ? "Next fat" : "See results") { next() }
                .buttonStyle(BubbleButtonStyle(color: Color(hex: 0xF4B400)))
                .frame(maxWidth: .infinity)
        }
        .card()
        .transition(.scale.combined(with: .opacity))
    }

    private func startGame() {
        outcome = nil
        feedback = nil
        queue = Array(FatMolecule.all.shuffled().prefix(Self.roundsPerGame))
        index = 0
        score = 0
        streak = 0
        correctCount = 0
    }

    private func choose(_ route: FatRoute, for fat: FatMolecule) {
        let correct = route == fat.route
        if correct {
            streak += 1
            correctCount += 1
            score += 10 + min(streak - 1, 5) * 2
        } else {
            streak = 0
            withAnimation(.linear(duration: 0.35)) { shake += 1 }
        }
        withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
            feedback = Feedback(correct: correct, chosen: route)
        }
    }

    private func next() {
        if index + 1 < min(Self.roundsPerGame, queue.count) {
            withAnimation(.spring(response: 0.45, dampingFraction: 0.8)) {
                feedback = nil
                index += 1
            }
        } else {
            let stars = correctCount >= 11 ? 3 : correctCount >= 8 ? 2 : correctCount >= 4 ? 1 : 0
            let best = store.record(score: score, stars: stars, for: .fatRouter)
            withAnimation {
                outcome = Outcome(score: score, stars: stars, isNewBest: best, correct: correctCount)
            }
        }
    }
}

/// Draws a fatty acid as a zig-zag carbon tail with a red acid head.
struct CarbonChainView: View {
    let carbons: Int
    let color: Color

    var body: some View {
        Canvas { context, size in
            guard carbons > 0 else { return }
            let step = min(14, (size.width - 30) / CGFloat(max(carbons - 1, 1)))
            let totalWidth = step * CGFloat(carbons - 1)
            let startX = (size.width - totalWidth) / 2
            let points: [CGPoint] = (0..<carbons).map { i in
                CGPoint(x: startX + CGFloat(i) * step,
                        y: size.height / 2 + (i.isMultiple(of: 2) ? -9 : 9))
            }
            var path = Path()
            path.addLines(points)
            context.stroke(path, with: .color(color),
                           style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
            for (i, point) in points.enumerated() {
                let r: CGFloat = i == 0 ? 8 : 5
                let rect = CGRect(x: point.x - r, y: point.y - r, width: r * 2, height: r * 2)
                context.fill(Path(ellipseIn: rect), with: .color(i == 0 ? Color(hex: 0xEF476F) : color))
            }
        }
        .frame(height: 50)
        .accessibilityLabel("\(carbons) carbon chain")
    }
}

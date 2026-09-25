import SwiftUI

struct PlayHubView: View {
    @EnvironmentObject private var store: ProgressStore
    @State private var confirmReset = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    RankCard()

                    ForEach(GameKind.allCases) { game in
                        NavigationLink(value: game) {
                            GameCard(game: game)
                        }
                        .buttonStyle(PressableStyle())
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        SectionHeader(title: "Badges", emoji: "🏅")
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 96), spacing: 10)], spacing: 10) {
                            ForEach(store.badges) { badge in
                                VStack(spacing: 4) {
                                    Text(badge.emoji)
                                        .font(.system(size: 32))
                                        .grayscale(badge.earned ? 0 : 1)
                                        .opacity(badge.earned ? 1 : 0.35)
                                    Text(badge.title)
                                        .font(.fun(12, .heavy))
                                        .foregroundStyle(Theme.ink)
                                        .multilineTextAlignment(.center)
                                    Text(badge.detail)
                                        .font(.fun(10, .semibold))
                                        .foregroundStyle(Theme.softInk)
                                        .multilineTextAlignment(.center)
                                }
                                .frame(maxWidth: .infinity, minHeight: 110)
                                .padding(6)
                                .background(RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .fill(badge.earned ? Color(hex: 0xFFF1C1) : Color(hex: 0xF1F3F8)))
                                .accessibilityElement(children: .combine)
                                .accessibilityValue(badge.earned ? "Earned" : "Not earned yet")
                            }
                        }
                    }
                    .card()
                }
                .padding()
            }
            .background(Theme.sunset.ignoresSafeArea())
            .navigationTitle("Play")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button("Reset all progress", role: .destructive) { confirmReset = true }
                    } label: {
                        Image(systemName: "gearshape.fill")
                    }
                }
            }
            .confirmationDialog("Reset all stars, scores and collected pals?",
                                isPresented: $confirmReset, titleVisibility: .visible) {
                Button("Reset everything", role: .destructive) { store.reset() }
            }
            .navigationDestination(for: GameKind.self) { game in
                switch game {
                case .scissors: EnzymeScissorsView()
                case .fatRouter: FatRouterView()
                case .factory: HormoneFactoryView()
                case .proteinBuilder: RibosomeRushView()
                case .quiz: QuizView()
                }
            }
        }
    }
}

private struct GameCard: View {
    let game: GameKind
    @EnvironmentObject private var store: ProgressStore

    var body: some View {
        HStack(spacing: 14) {
            MoleculeFace(character: Cast.character(game.mascot), size: 70, excited: true)
            VStack(alignment: .leading, spacing: 5) {
                Text(game.title)
                    .font(.fun(19, .black))
                    .foregroundStyle(Theme.ink)
                Text(game.subtitle)
                    .font(.fun(13, .semibold))
                    .foregroundStyle(Theme.softInk)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                HStack {
                    if game == .factory {
                        let built = Library.recipes.filter { store.stars(forHormone: $0.id) > 0 }.count
                        Pill(text: "\(built)/\(Library.recipes.count) built", color: game.color)
                    } else {
                        StarRow(count: store.stars(for: game), size: 14)
                        if let best = store.bestScore(for: game) {
                            Text("Best: \(best)")
                                .font(.fun(12, .heavy))
                                .foregroundStyle(Theme.softInk)
                        }
                    }
                }
            }
            Spacer(minLength: 0)
            Image(systemName: "play.circle.fill")
                .font(.system(size: 34))
                .foregroundStyle(game.color)
        }
        .card()
    }
}

/// Shared end-of-game summary with stars, score and key lessons.
struct GameOverView: View {
    let title: String
    let score: Int
    let stars: Int
    let isNewBest: Bool
    let lessons: [String]
    var onReplay: () -> Void
    var onDone: () -> Void

    var body: some View {
        ZStack {
            ScrollView {
                VStack(spacing: 16) {
                    Text(stars >= 3 ? "🏆" : stars == 2 ? "🎉" : "👍")
                        .font(.system(size: 72))
                    Text(title)
                        .font(.fun(28, .black))
                        .foregroundStyle(Theme.ink)
                        .multilineTextAlignment(.center)
                    StarRow(count: stars, size: 34)
                    Text("Score: \(score)")
                        .font(.fun(22, .heavy))
                        .foregroundStyle(Theme.ink)
                    if isNewBest {
                        Pill(text: "NEW BEST!", color: Theme.pink)
                    }
                    VStack(alignment: .leading, spacing: 10) {
                        SectionHeader(title: "What you learned", emoji: "💡")
                        ForEach(lessons, id: \.self) { lesson in
                            HStack(alignment: .top, spacing: 8) {
                                Text("•").font(.fun(16, .black))
                                Text(lesson)
                                    .font(.fun(15, .medium))
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            .foregroundStyle(Theme.ink)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .card()

                    HStack(spacing: 12) {
                        Button(action: onReplay) {
                            Label("Play again", systemImage: "arrow.counterclockwise")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(BubbleButtonStyle(color: .white, textColor: Theme.ink))
                        Button(action: onDone) {
                            Text("Done").frame(maxWidth: .infinity)
                        }
                        .buttonStyle(BubbleButtonStyle(color: Theme.pink))
                    }
                }
                .padding(20)
            }
            if stars > 0 {
                ConfettiView()
            }
        }
        .sensoryFeedback(.success, trigger: score)
    }
}

/// A small score/timer badge used in game headers.
struct ScoreBadge: View {
    let label: String
    let value: String
    var color: Color = Theme.pink

    var body: some View {
        VStack(spacing: 0) {
            Text(label.uppercased())
                .font(.fun(10, .heavy))
                .foregroundStyle(.white.opacity(0.9))
            Text(value)
                .font(.fun(20, .black))
                .foregroundStyle(.white)
                .monospacedDigit()
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(RoundedRectangle(cornerRadius: 14, style: .continuous).fill(color))
    }
}

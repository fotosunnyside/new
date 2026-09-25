import SwiftUI

struct PathwayListView: View {
    @EnvironmentObject private var store: ProgressStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    Text("Follow a molecule's journey through your body, one stop at a time!")
                        .font(.fun(16, .semibold))
                        .foregroundStyle(Theme.softInk)

                    ForEach(NutrientFamily.allCases) { family in
                        let items = Library.pathways.filter { $0.family == family }
                        if !items.isEmpty {
                            SectionHeader(title: family.title, emoji: family.emoji)
                                .padding(.top, 6)
                            ForEach(items) { pathway in
                                NavigationLink(value: pathway) {
                                    PathwayCard(pathway: pathway, stars: store.stars(forPathway: pathway.id))
                                }
                                .buttonStyle(PressableStyle())
                            }
                        }
                    }
                }
                .padding()
            }
            .background(Theme.candy.ignoresSafeArea())
            .navigationTitle("Pathways")
            .navigationDestination(for: Pathway.self) { PathwayPlayerView(pathway: $0) }
        }
    }
}

struct PathwayCard: View {
    let pathway: Pathway
    let stars: Int

    var body: some View {
        HStack(spacing: 14) {
            Text(pathway.emoji)
                .font(.system(size: 34))
                .frame(width: 64, height: 64)
                .background(RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(pathway.family.color.opacity(0.22)))
            VStack(alignment: .leading, spacing: 6) {
                Text(pathway.title)
                    .font(.fun(17, .heavy))
                    .foregroundStyle(Theme.ink)
                    .multilineTextAlignment(.leading)
                Text(pathway.subtitle)
                    .font(.fun(13, .semibold))
                    .foregroundStyle(Theme.softInk)
                    .multilineTextAlignment(.leading)
                HStack(spacing: -8) {
                    ForEach(Array(pathway.uniqueStars.prefix(6)), id: \.self) { id in
                        MoleculeFace(character: Cast.character(id), size: 30, animated: false)
                    }
                }
                HStack {
                    Pill(text: "\(pathway.steps.count) stops", color: pathway.family.color)
                    Spacer()
                    StarRow(count: stars, size: 14)
                }
            }
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .heavy))
                .foregroundStyle(Theme.softInk.opacity(0.6))
        }
        .card()
    }
}

// MARK: - Player

struct PathwayPlayerView: View {
    let pathway: Pathway

    @EnvironmentObject private var store: ProgressStore
    @Environment(\.dismiss) private var dismiss
    @State private var index = 0
    @State private var finished = false
    @State private var showOverview = false
    @State private var helperPal: MoleculeCharacter?

    private var step: PathwayStep { pathway.steps[index] }
    private var star: MoleculeCharacter { Cast.character(step.star) }
    private var isLast: Bool { index == pathway.steps.count - 1 }

    var body: some View {
        ZStack {
            LinearGradient(colors: [step.location.color.opacity(0.32), Theme.cream],
                           startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
                .animation(.easeInOut(duration: 0.6), value: index)

            if finished {
                PathwayCompleteView(pathway: pathway, onReplay: restart, onDone: { dismiss() })
                    .transition(.opacity.combined(with: .scale(scale: 0.92)))
            } else {
                stepView
                    .transition(.opacity)
            }
        }
        .navigationTitle(pathway.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showOverview = true } label: {
                    Image(systemName: "map.fill")
                }
                .accessibilityLabel("Pathway map")
            }
        }
        .sheet(isPresented: $showOverview) {
            PathwayOverviewSheet(pathway: pathway, current: finished ? nil : index) { target in
                showOverview = false
                withAnimation(.spring(response: 0.45, dampingFraction: 0.8)) {
                    finished = false
                    index = target
                }
            }
            .presentationDetents([.medium, .large])
        }
        .sheet(item: $helperPal) { pal in
            CharacterDetailView(character: pal)
        }
        .onAppear { store.collect(step.star) }
        .onChange(of: index) { store.collect(step.star) }
        .sensoryFeedback(.selection, trigger: index)
        .sensoryFeedback(.success, trigger: finished)
    }

    private var stepView: some View {
        ScrollView {
            VStack(spacing: 16) {
                HStack {
                    Text("Stop \(index + 1) of \(pathway.steps.count)")
                        .font(.fun(14, .heavy))
                        .foregroundStyle(Theme.softInk)
                    Spacer()
                    Text("📍 \(step.location.emoji) \(step.location.name)")
                        .font(.fun(14, .heavy))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Capsule().fill(step.location.color))
                }
                ProgressCapsule(value: Double(index + 1) / Double(pathway.steps.count),
                                color: pathway.family.color)

                VStack(spacing: 4) {
                    MoleculeFace(character: star, size: 150, excited: true)
                        .padding(.top, 10)
                    Text(star.name)
                        .font(.fun(26, .black))
                        .foregroundStyle(Theme.ink)
                    Text(star.molecule)
                        .font(.fun(14, .semibold))
                        .foregroundStyle(Theme.softInk)
                }
                .id("star-\(index)")
                .transition(.asymmetric(insertion: .scale(scale: 0.4).combined(with: .opacity),
                                        removal: .opacity))

                SpeechBubble {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(step.title)
                            .font(.fun(21, .heavy))
                            .foregroundStyle(Theme.ink)
                        Text(step.text)
                            .font(.fun(17, .medium))
                            .foregroundStyle(Theme.ink)
                            .lineSpacing(3)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                .id("bubble-\(index)")
                .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity),
                                        removal: .opacity))

                if !step.helpers.isEmpty {
                    HelperChips(helpers: step.helpers,
                                isCollected: { store.isCollected($0) },
                                onTapCharacter: { helperPal = $0 })
                        .id("helpers-\(index)")
                }
            }
            .padding(20)
        }
        .safeAreaInset(edge: .bottom) { controls }
    }

    private var controls: some View {
        HStack(spacing: 12) {
            Button { go(-1) } label: {
                Image(systemName: "chevron.left")
                    .frame(width: 24)
            }
            .buttonStyle(BubbleButtonStyle(color: .white, textColor: Theme.ink))
            .disabled(index == 0)
            .opacity(index == 0 ? 0.4 : 1)
            .accessibilityLabel("Previous stop")

            Button { go(1) } label: {
                HStack {
                    Text(nextLabel)
                    Image(systemName: isLast ? "flag.checkered" : "arrow.right")
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(BubbleButtonStyle(color: pathway.family.color))
        }
        .padding(.horizontal, 20)
        .padding(.top, 12)
        .padding(.bottom, 8)
        .background(.ultraThinMaterial)
    }

    private var nextLabel: String {
        if isLast { return "Finish!" }
        return pathway.steps[index + 1].star == step.star ? "Next stop" : "Transform!"
    }

    private func go(_ delta: Int) {
        withAnimation(.spring(response: 0.45, dampingFraction: 0.78)) {
            let target = index + delta
            if target >= pathway.steps.count {
                finished = true
                store.award(pathwayStars: 2, for: pathway.id)
            } else {
                index = max(0, target)
            }
        }
    }

    private func restart() {
        withAnimation(.spring(response: 0.45, dampingFraction: 0.8)) {
            finished = false
            index = 0
        }
    }
}

struct PathwayOverviewSheet: View {
    let pathway: Pathway
    let current: Int?
    var onJump: (Int) -> Void

    var body: some View {
        NavigationStack {
            List {
                ForEach(pathway.steps.indices, id: \.self) { i in
                    let step = pathway.steps[i]
                    Button { onJump(i) } label: {
                        HStack(spacing: 12) {
                            MoleculeFace(character: Cast.character(step.star), size: 44, animated: false)
                            VStack(alignment: .leading, spacing: 3) {
                                Text("\(i + 1). \(step.title)")
                                    .font(.fun(16, .heavy))
                                    .foregroundStyle(Theme.ink)
                                Text("\(step.location.emoji) \(step.location.name) · \(Cast.character(step.star).firstName)")
                                    .font(.fun(13, .semibold))
                                    .foregroundStyle(Theme.softInk)
                            }
                            Spacer()
                            if i == current {
                                Image(systemName: "location.fill")
                                    .foregroundStyle(pathway.family.color)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Pathway Map")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct PathwayCompleteView: View {
    let pathway: Pathway
    var onReplay: () -> Void
    var onDone: () -> Void

    @EnvironmentObject private var store: ProgressStore

    var body: some View {
        ZStack {
            ScrollView {
                VStack(spacing: 16) {
                    Text("🎉")
                        .font(.system(size: 64))
                    Text("Pathway complete!")
                        .font(.fun(30, .black))
                        .foregroundStyle(Theme.ink)
                    StarRow(count: store.stars(forPathway: pathway.id), size: 30)

                    VStack(alignment: .leading, spacing: 8) {
                        SectionHeader(title: "The transformation", emoji: "✨")
                        TransformationChain(ids: pathway.uniqueStars)
                    }
                    .card()

                    QuestionCard(question: pathway.check, title: "⭐ Bonus star question") { correct in
                        if correct { store.award(pathwayStars: 3, for: pathway.id) }
                    }

                    HStack(spacing: 12) {
                        Button(action: onReplay) {
                            Label("Replay", systemImage: "arrow.counterclockwise")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(BubbleButtonStyle(color: .white, textColor: Theme.ink))
                        Button(action: onDone) {
                            Text("Done").frame(maxWidth: .infinity)
                        }
                        .buttonStyle(BubbleButtonStyle(color: pathway.family.color))
                    }
                }
                .padding(20)
            }
            ConfettiView()
        }
    }
}

/// A multiple-choice question with instant feedback. Used by pathways and the quiz.
struct QuestionCard: View {
    let question: QuizQuestion
    var title: String? = nil
    var onAnswer: (Bool) -> Void

    @State private var choices: [String] = []
    @State private var picked: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let title {
                Text(title)
                    .font(.fun(14, .heavy))
                    .foregroundStyle(Theme.softInk)
            }
            Text(question.prompt)
                .font(.fun(20, .heavy))
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)

            ForEach(choices, id: \.self) { choice in
                Button {
                    guard picked == nil else { return }
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) { picked = choice }
                    onAnswer(choice == question.correct)
                } label: {
                    HStack {
                        Text(choice)
                            .font(.fun(17, .bold))
                            .multilineTextAlignment(.leading)
                        Spacer()
                        if let icon = icon(for: choice) {
                            Image(systemName: icon)
                        }
                    }
                    .foregroundStyle(textColor(for: choice))
                    .padding(14)
                    .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(fill(for: choice)))
                }
                .buttonStyle(PressableStyle())
                .disabled(picked != nil)
            }

            if let picked {
                Text((picked == question.correct ? "Correct! " : "Not quite. ") + question.explanation)
                    .font(.fun(15, .semibold))
                    .foregroundStyle(picked == question.correct ? Theme.good : Theme.bad)
                    .fixedSize(horizontal: false, vertical: true)
                    .transition(.opacity)
            }
        }
        .card()
        .sensoryFeedback(trigger: picked) { _, newValue in
            guard let newValue else { return nil }
            return newValue == question.correct ? .success : .error
        }
        .onAppear {
            if choices.isEmpty { choices = question.choices.shuffled() }
        }
    }

    private func fill(for choice: String) -> Color {
        guard let picked else { return Color(hex: 0xF1F3F8) }
        if choice == question.correct { return Theme.good }
        if choice == picked { return Theme.bad }
        return Color(hex: 0xF1F3F8)
    }

    private func textColor(for choice: String) -> Color {
        guard let picked else { return Theme.ink }
        return (choice == question.correct || choice == picked) ? .white : Theme.softInk
    }

    private func icon(for choice: String) -> String? {
        guard let picked else { return nil }
        if choice == question.correct { return "checkmark.circle.fill" }
        if choice == picked { return "xmark.circle.fill" }
        return nil
    }
}

import SwiftUI

/// Pick a hormone "order", then choose its starting molecule and the
/// vitamin / mineral helpers the enzymes need to build it.
struct HormoneFactoryView: View {
    @EnvironmentObject private var store: ProgressStore

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                HStack(spacing: 12) {
                    MoleculeFace(character: Cast.character("ribosome"), size: 60, excited: true)
                    Text("Welcome to the Hormone Factory! Pick an order, then choose the right starting molecule and helpers.")
                        .font(.fun(15, .semibold))
                        .foregroundStyle(Theme.ink)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .card()

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
                    ForEach(Library.recipes) { recipe in
                        let hormone = Cast.character(recipe.id)
                        let stars = store.stars(forHormone: recipe.id)
                        NavigationLink(value: recipe) {
                            VStack(spacing: 8) {
                                MoleculeFace(character: hormone, size: 70, animated: stars > 0, silhouette: stars == 0)
                                Text(hormone.molecule.components(separatedBy: " (").first ?? hormone.name)
                                    .font(.fun(16, .heavy))
                                    .foregroundStyle(Theme.ink)
                                    .lineLimit(1)
                                    .minimumScaleFactor(0.7)
                                Text("\(recipe.location.emoji) \(recipe.location.name)")
                                    .font(.fun(11, .bold))
                                    .foregroundStyle(Theme.softInk)
                                StarRow(count: stars, size: 13)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(RoundedRectangle(cornerRadius: 22, style: .continuous).fill(Color.white))
                            .shadow(color: .black.opacity(0.06), radius: 6, x: 0, y: 3)
                        }
                        .buttonStyle(PressableStyle())
                    }
                }
            }
            .padding()
        }
        .background(Theme.night.opacity(0.25).ignoresSafeArea())
        .background(Theme.cream.ignoresSafeArea())
        .navigationTitle("Hormone Factory")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .navigationDestination(for: HormoneRecipe.self) { HormoneBuildView(recipe: $0) }
    }
}

struct HormoneBuildView: View {
    let recipe: HormoneRecipe

    private enum Stage {
        case precursor, helpers, assembling, done
    }

    @EnvironmentObject private var store: ProgressStore
    @Environment(\.dismiss) private var dismiss

    @State private var stage: Stage = .precursor
    @State private var precursorOptions: [String] = []
    @State private var helperOptions: [HelperToken] = []
    @State private var selected: Set<String> = []
    @State private var mistakes = 0
    @State private var hint: String?
    @State private var shake: CGFloat = 0
    @State private var assemblyIndex = 0
    @State private var earnedStars = 0

    private var hormone: MoleculeCharacter { Cast.character(recipe.id) }

    var body: some View {
        ZStack {
            LinearGradient(colors: [hormone.color.opacity(0.3), Theme.cream], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            ScrollView {
                VStack(spacing: 16) {
                    orderTicket
                    switch stage {
                    case .precursor: precursorStage
                    case .helpers: helperStage
                    case .assembling: assemblyStage
                    case .done: doneStage
                    }
                }
                .padding()
            }
            if stage == .done && earnedStars > 0 {
                ConfettiView()
            }
        }
        .navigationTitle("Build \(hormone.firstName)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .onAppear(perform: setUp)
        .sensoryFeedback(.error, trigger: mistakes)
        .sensoryFeedback(.impact(weight: .medium), trigger: assemblyIndex)
        .sensoryFeedback(.success, trigger: stage == .done)
    }

    // MARK: Stages

    private var orderTicket: some View {
        HStack(spacing: 14) {
            MoleculeFace(character: hormone, size: 70, animated: stage == .done, silhouette: stage != .done)
            VStack(alignment: .leading, spacing: 4) {
                Text("ORDER UP!")
                    .font(.fun(12, .heavy))
                    .foregroundStyle(Theme.softInk)
                Text(hormone.molecule)
                    .font(.fun(22, .black))
                    .foregroundStyle(Theme.ink)
                Text("Made in: \(recipe.location.emoji) \(recipe.location.name)")
                    .font(.fun(13, .bold))
                    .foregroundStyle(Theme.softInk)
            }
            Spacer(minLength: 0)
        }
        .card()
    }

    private var precursorStage: some View {
        VStack(alignment: .leading, spacing: 12) {
            stepHeader(number: 1, text: "Pick the starting molecule")
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                ForEach(precursorOptions, id: \.self) { id in
                    let character = Cast.character(id)
                    Button { pickPrecursor(id) } label: {
                        VStack(spacing: 6) {
                            MoleculeFace(character: character, size: 60, animated: false)
                            Text(character.molecule.components(separatedBy: " (").first ?? character.name)
                                .font(.fun(14, .heavy))
                                .foregroundStyle(Theme.ink)
                                .lineLimit(2)
                                .multilineTextAlignment(.center)
                                .minimumScaleFactor(0.8)
                        }
                        .frame(maxWidth: .infinity, minHeight: 120)
                        .background(RoundedRectangle(cornerRadius: 20, style: .continuous).fill(Color.white))
                    }
                    .buttonStyle(PressableStyle())
                }
            }
            .modifier(ShakeEffect(animatableData: shake))
            hintView
        }
    }

    private var helperStage: some View {
        VStack(alignment: .leading, spacing: 12) {
            stepHeader(number: 2, text: "Pick \(recipe.helpers.count) helpers the enzymes need")
            HStack(spacing: 8) {
                MoleculeFace(character: Cast.character(recipe.precursor), size: 44, animated: false)
                Text("Starting with \(Cast.character(recipe.precursor).firstName) ✓")
                    .font(.fun(15, .heavy))
                    .foregroundStyle(Theme.good)
            }
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                ForEach(helperOptions) { token in
                    let isOn = selected.contains(token.id)
                    Button { toggle(token) } label: {
                        HStack(spacing: 8) {
                            Text(token.emoji).font(.system(size: 24))
                            Text(token.name)
                                .font(.fun(14, .heavy))
                                .multilineTextAlignment(.leading)
                                .minimumScaleFactor(0.8)
                            Spacer(minLength: 0)
                        }
                        .foregroundStyle(isOn ? .white : Theme.ink)
                        .padding(12)
                        .frame(maxWidth: .infinity, minHeight: 60)
                        .background(RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(isOn ? hormone.color : Color.white))
                    }
                    .buttonStyle(PressableStyle())
                }
            }
            .modifier(ShakeEffect(animatableData: shake))
            hintView
            Button {
                checkHelpers()
            } label: {
                Label("Start the machine!", systemImage: "gearshape.2.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(BubbleButtonStyle(color: hormone.color))
            .disabled(selected.count != recipe.helpers.count)
            .opacity(selected.count == recipe.helpers.count ? 1 : 0.5)
        }
    }

    private var assemblyStage: some View {
        VStack(spacing: 16) {
            stepHeader(number: 3, text: "Assembly line running...")
            TimelineView(.animation) { context in
                let angle = context.date.timeIntervalSinceReferenceDate * 180
                HStack(spacing: 24) {
                    Image(systemName: "gearshape.fill")
                        .rotationEffect(.degrees(angle))
                    Image(systemName: "gearshape.fill")
                        .rotationEffect(.degrees(-angle))
                    Image(systemName: "gearshape.fill")
                        .rotationEffect(.degrees(angle))
                }
                .font(.system(size: 34))
                .foregroundStyle(hormone.color.opacity(0.7))
            }
            let current = Cast.character(recipe.chain[assemblyIndex])
            MoleculeFace(character: current, size: 140, excited: true)
                .id(assemblyIndex)
                .transition(.scale(scale: 0.3).combined(with: .opacity))
            Text(current.name)
                .font(.fun(24, .black))
                .foregroundStyle(Theme.ink)
                .id("name-\(assemblyIndex)")
            chainProgress
        }
        .frame(maxWidth: .infinity)
        .card()
    }

    private var doneStage: some View {
        VStack(spacing: 14) {
            Text("\(hormone.name) is ready! 🎉")
                .font(.fun(24, .black))
                .foregroundStyle(Theme.ink)
                .multilineTextAlignment(.center)
            StarRow(count: earnedStars, size: 30)
            TransformationChain(ids: recipe.chain, faceSize: 50)
            Text(recipe.lesson)
                .font(.fun(16, .semibold))
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
            Text("“\(hormone.catchphrase)”")
                .font(.fun(15, .heavy))
                .foregroundStyle(hormone.color)
                .multilineTextAlignment(.center)
            HStack(spacing: 12) {
                Button(action: setUp) {
                    Label("Again", systemImage: "arrow.counterclockwise").frame(maxWidth: .infinity)
                }
                .buttonStyle(BubbleButtonStyle(color: .white, textColor: Theme.ink))
                Button { dismiss() } label: {
                    Text("More orders").frame(maxWidth: .infinity)
                }
                .buttonStyle(BubbleButtonStyle(color: hormone.color))
            }
        }
        .frame(maxWidth: .infinity)
        .card()
    }

    private var chainProgress: some View {
        HStack(spacing: 6) {
            ForEach(recipe.chain.indices, id: \.self) { i in
                Capsule()
                    .fill(i <= assemblyIndex ? hormone.color : Color.gray.opacity(0.25))
                    .frame(height: 8)
            }
        }
    }

    @ViewBuilder private var hintView: some View {
        if let hint {
            Text(hint)
                .font(.fun(14, .semibold))
                .foregroundStyle(Theme.bad)
                .fixedSize(horizontal: false, vertical: true)
                .transition(.opacity)
        }
    }

    private func stepHeader(number: Int, text: String) -> some View {
        HStack(spacing: 10) {
            Text("\(number)")
                .font(.fun(16, .black))
                .foregroundStyle(.white)
                .frame(width: 30, height: 30)
                .background(Circle().fill(hormone.color))
            Text(text)
                .font(.fun(18, .heavy))
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    // MARK: Logic

    private func setUp() {
        stage = .precursor
        precursorOptions = ([recipe.precursor] + recipe.wrongPrecursors).shuffled()
        helperOptions = (recipe.helpers + recipe.wrongHelpers).map(HelperToken.token).shuffled()
        selected = []
        mistakes = 0
        hint = nil
        assemblyIndex = 0
        earnedStars = 0
    }

    private func pickPrecursor(_ id: String) {
        if id == recipe.precursor {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                hint = nil
                stage = .helpers
            }
        } else {
            mistakes += 1
            withAnimation(.linear(duration: 0.35)) { shake += 1 }
            let wrong = Cast.character(id)
            withAnimation {
                hint = "Not this one! \(wrong.firstName) usually becomes \(wrong.becomes.first ?? "something else"). Think about what \(hormone.firstName) is built from."
            }
        }
    }

    private func toggle(_ token: HelperToken) {
        withAnimation(.spring(response: 0.25, dampingFraction: 0.7)) {
            if selected.contains(token.id) {
                selected.remove(token.id)
            } else if selected.count < recipe.helpers.count {
                selected.insert(token.id)
            }
        }
    }

    private func checkHelpers() {
        let wrong = selected.subtracting(recipe.helpers)
        guard wrong.isEmpty else {
            mistakes += 1
            withAnimation(.linear(duration: 0.35)) { shake += 1 }
            let names = wrong.map { HelperToken.token($0).name }.sorted().joined(separator: ", ")
            withAnimation {
                hint = "The enzymes don't use \(names) for this job. Try again!"
                selected.subtract(wrong)
            }
            return
        }
        hint = nil
        runAssembly()
    }

    private func runAssembly() {
        withAnimation { stage = .assembling }
        Task { @MainActor in
            for i in recipe.chain.indices {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) { assemblyIndex = i }
                try? await Task.sleep(nanoseconds: 1_100_000_000)
            }
            earnedStars = mistakes == 0 ? 3 : mistakes <= 2 ? 2 : 1
            store.award(hormoneStars: earnedStars, for: recipe.id)
            store.collect(recipe.id)
            recipe.chain.forEach { store.collect($0) }
            withAnimation(.spring(response: 0.5, dampingFraction: 0.75)) { stage = .done }
        }
    }
}

import SwiftUI

struct GalleryView: View {
    @EnvironmentObject private var store: ProgressStore
    @State private var filter: NutrientFamily?
    @State private var selected: MoleculeCharacter?

    private var shown: [MoleculeCharacter] {
        guard let filter else { return Cast.all }
        return Cast.all.filter { $0.family == filter }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Collected")
                                .font(.fun(16, .heavy))
                                .foregroundStyle(Theme.softInk)
                            Spacer()
                            Text("\(store.collectedCount) / \(Cast.all.count)")
                                .font(.fun(20, .black))
                                .foregroundStyle(Theme.ink)
                        }
                        ProgressCapsule(value: Double(store.collectedCount) / Double(Cast.all.count),
                                        color: Theme.pink)
                        Text("Meet molecules in Pathways, or tap a mystery card to discover it!")
                            .font(.fun(13, .semibold))
                            .foregroundStyle(Theme.softInk)
                    }
                    .card()

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            chip(title: "All", emoji: "🌈", color: Theme.ink, isOn: filter == nil) { filter = nil }
                            ForEach(NutrientFamily.allCases) { family in
                                chip(title: family.shortTitle, emoji: family.emoji, color: family.color,
                                     isOn: filter == family) { filter = family }
                            }
                        }
                        .padding(.horizontal, 2)
                    }

                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 104), spacing: 12)], spacing: 12) {
                        ForEach(shown) { character in
                            Button { selected = character } label: {
                                CharacterTile(character: character, collected: store.isCollected(character.id))
                            }
                            .buttonStyle(PressableStyle())
                        }
                    }
                }
                .padding()
            }
            .background(Theme.mint.ignoresSafeArea())
            .navigationTitle("Molecule Pals")
            .sheet(item: $selected) { character in
                CharacterDetailView(character: character)
            }
        }
    }

    private func chip(title: String, emoji: String, color: Color, isOn: Bool, action: @escaping () -> Void) -> some View {
        Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) { action() }
        } label: {
            Text("\(emoji) \(title)")
                .font(.fun(14, .heavy))
                .foregroundStyle(isOn ? .white : Theme.ink)
                .padding(.horizontal, 14)
                .padding(.vertical, 9)
                .background(Capsule().fill(isOn ? color : Color.white))
        }
        .buttonStyle(PressableStyle())
    }
}

struct CharacterTile: View {
    let character: MoleculeCharacter
    let collected: Bool

    var body: some View {
        VStack(spacing: 6) {
            MoleculeFace(character: character, size: 64, animated: collected, silhouette: !collected)
                .padding(.top, 4)
            Text(collected ? character.firstName : "???")
                .font(.fun(15, .heavy))
                .foregroundStyle(Theme.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(collected ? character.family.shortTitle : "Tap to discover")
                .font(.fun(11, .bold))
                .foregroundStyle(collected ? character.family.color : Theme.softInk)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 6)
        .frame(maxWidth: .infinity)
        .background(RoundedRectangle(cornerRadius: 20, style: .continuous).fill(Color.white))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(collected ? character.family.color.opacity(0.6) : Color.clear, lineWidth: 2)
        )
        .shadow(color: .black.opacity(0.06), radius: 6, x: 0, y: 3)
    }
}

struct CharacterDetailView: View {
    let character: MoleculeCharacter

    @EnvironmentObject private var store: ProgressStore
    @Environment(\.dismiss) private var dismiss
    @State private var justDiscovered = false

    var body: some View {
        NavigationStack {
            ZStack {
                ScrollView {
                    VStack(spacing: 16) {
                        if justDiscovered {
                            Pill(text: "✨ NEW PAL DISCOVERED! ✨", color: Theme.pink)
                        }
                        MoleculeFace(character: character, size: 160, excited: true)
                            .padding(.top, 8)
                        VStack(spacing: 4) {
                            Text(character.name)
                                .font(.fun(30, .black))
                                .foregroundStyle(Theme.ink)
                                .multilineTextAlignment(.center)
                            Text(character.molecule)
                                .font(.fun(15, .semibold))
                                .foregroundStyle(Theme.softInk)
                                .multilineTextAlignment(.center)
                            Pill(text: "\(character.family.emoji) \(character.family.title)", color: character.family.color)
                                .padding(.top, 4)
                        }

                        SpeechBubble {
                            Text("“\(character.catchphrase)”")
                                .font(.fun(19, .heavy))
                                .foregroundStyle(Theme.ink)
                                .fixedSize(horizontal: false, vertical: true)
                        }

                        infoCard(title: "About me", emoji: "📖") {
                            Text(character.bio)
                                .font(.fun(16, .medium))
                                .foregroundStyle(Theme.ink)
                                .fixedSize(horizontal: false, vertical: true)
                        }

                        infoCard(title: "Where to find me", emoji: "🍽️") {
                            tagCloud(character.foods, color: Color(hex: 0xFFF1C1))
                        }

                        infoCard(title: "What I can become", emoji: "🔄") {
                            tagCloud(character.becomes, color: character.color.opacity(0.18))
                        }

                        infoCard(title: "Fun fact", emoji: "🤯") {
                            Text(character.funFact)
                                .font(.fun(16, .semibold))
                                .foregroundStyle(Theme.ink)
                                .fixedSize(horizontal: false, vertical: true)
                        }

                        let pathways = Library.pathways(featuring: character.id)
                        if !pathways.isEmpty {
                            SectionHeader(title: "Follow my journeys", emoji: "🧭")
                            ForEach(pathways) { pathway in
                                NavigationLink(value: pathway) {
                                    PathwayCard(pathway: pathway, stars: store.stars(forPathway: pathway.id))
                                }
                                .buttonStyle(PressableStyle())
                            }
                        }
                    }
                    .padding()
                }
                if justDiscovered {
                    ConfettiView()
                }
            }
            .background(
                LinearGradient(colors: [character.color.opacity(0.35), Theme.cream],
                               startPoint: .top, endPoint: .center)
                    .ignoresSafeArea()
            )
            .navigationDestination(for: Pathway.self) { PathwayPlayerView(pathway: $0) }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(.fun(16, .heavy))
                }
            }
        }
        .onAppear {
            if !store.isCollected(character.id) {
                justDiscovered = true
                store.collect(character.id)
            }
        }
        .sensoryFeedback(.success, trigger: justDiscovered)
    }

    private func infoCard<Content: View>(title: String, emoji: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: title, emoji: emoji)
            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .card()
    }

    private func tagCloud(_ tags: [String], color: Color) -> some View {
        FlowLayout(spacing: 8) {
            ForEach(tags, id: \.self) { tag in
                Text(tag)
                    .font(.fun(14, .bold))
                    .foregroundStyle(Theme.ink)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 7)
                    .background(Capsule().fill(color))
            }
        }
    }
}

import SwiftUI

struct BodyMapView: View {
    @EnvironmentObject private var store: ProgressStore
    @State private var selected: BodyLocation?

    private let mapped = BodyLocation.allCases.filter { $0.mapPoint != nil }
    private let insideCell = BodyLocation.allCases.filter { $0.mapPoint == nil }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 18) {
                    RankCard()

                    Text("Tap a glowing spot to explore what happens there!")
                        .font(.fun(16, .semibold))
                        .foregroundStyle(Theme.softInk)
                        .multilineTextAlignment(.center)

                    BodyFigure(locations: mapped) { selected = $0 }
                        .frame(maxWidth: 330)
                        .padding(.vertical, 6)

                    VStack(alignment: .leading, spacing: 12) {
                        SectionHeader(title: "Zoom inside a cell", emoji: "🔬")
                        HStack(spacing: 12) {
                            ForEach(insideCell) { location in
                                Button { selected = location } label: {
                                    HStack {
                                        Text(location.emoji).font(.system(size: 30))
                                        Text(location.name)
                                            .font(.fun(16, .heavy))
                                            .foregroundStyle(Theme.ink)
                                            .minimumScaleFactor(0.8)
                                            .lineLimit(1)
                                        Spacer(minLength: 0)
                                    }
                                    .padding(14)
                                    .frame(maxWidth: .infinity)
                                    .background(RoundedRectangle(cornerRadius: 18, style: .continuous)
                                        .fill(location.color.opacity(0.18)))
                                }
                                .buttonStyle(PressableStyle())
                            }
                        }
                    }
                    .card()

                    VStack(alignment: .leading, spacing: 12) {
                        SectionHeader(title: "All the places", emoji: "📍")
                        FlowLayout(spacing: 8) {
                            ForEach(mapped) { location in
                                Button { selected = location } label: {
                                    Text("\(location.emoji) \(location.name)")
                                        .font(.fun(14, .bold))
                                        .foregroundStyle(Theme.ink)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 8)
                                        .background(Capsule().fill(location.color.opacity(0.18)))
                                }
                                .buttonStyle(PressableStyle())
                            }
                        }
                    }
                    .card()
                }
                .padding()
            }
            .background(Theme.sky.ignoresSafeArea())
            .navigationTitle("NutriQuest")
            .sheet(item: $selected) { location in
                LocationSheet(location: location)
                    .presentationDetents([.medium, .large])
            }
        }
    }
}

struct BodyFigure: View {
    let locations: [BodyLocation]
    var onSelect: (BodyLocation) -> Void

    var body: some View {
        GeometryReader { geo in
            let scale = geo.size.width / 100
            ZStack {
                BodySilhouette()
                    .fill(LinearGradient(colors: [Color(hex: 0xFFE3D3), Color(hex: 0xFFC9B9)],
                                         startPoint: .top, endPoint: .bottom))
                BodySilhouette()
                    .stroke(Color.white, style: StrokeStyle(lineWidth: 4, lineJoin: .round))

                TimelineView(.animation(minimumInterval: 1.0 / 30.0)) { context in
                    let phase = context.date.timeIntervalSinceReferenceDate
                    ZStack {
                        ForEach(Array(locations.enumerated()), id: \.element) { index, location in
                            if let point = location.mapPoint {
                                StationBubble(location: location,
                                              pulse: (phase * 0.7 + Double(index) * 0.13).truncatingRemainder(dividingBy: 1))
                                    .onTapGesture { onSelect(location) }
                                    .accessibilityAddTraits(.isButton)
                                    .accessibilityLabel(location.name)
                                    .position(x: point.x * scale, y: point.y * scale)
                            }
                        }
                    }
                }
            }
        }
        .aspectRatio(100.0 / 160.0, contentMode: .fit)
    }
}

private struct StationBubble: View {
    let location: BodyLocation
    /// 0...1 animation phase for the glowing ring.
    let pulse: Double

    var body: some View {
        ZStack {
            Circle()
                .fill(location.color.opacity(0.45 * (1 - pulse)))
                .frame(width: 34, height: 34)
                .scaleEffect(1 + pulse * 0.8)
            Circle()
                .fill(Color.white)
                .frame(width: 34, height: 34)
                .shadow(color: location.color.opacity(0.6), radius: 4)
            Circle()
                .stroke(location.color, lineWidth: 3)
                .frame(width: 34, height: 34)
            Text(location.emoji)
                .font(.system(size: 18))
        }
        .frame(width: 44, height: 44)
        .contentShape(Circle())
    }
}

struct RankCard: View {
    @EnvironmentObject private var store: ProgressStore

    var body: some View {
        let rank = store.rank
        let next = store.nextRank
        HStack(spacing: 14) {
            Text(rank.emoji)
                .font(.system(size: 40))
                .frame(width: 64, height: 64)
                .background(Circle().fill(Color(hex: 0xFFF1C1)))
            VStack(alignment: .leading, spacing: 6) {
                Text(rank.title)
                    .font(.fun(20, .black))
                    .foregroundStyle(Theme.ink)
                HStack(spacing: 10) {
                    Label("\(store.totalStars)/\(ProgressStore.maxStars)", systemImage: "star.fill")
                        .foregroundStyle(Color(hex: 0xE0A800))
                    Label("\(store.collectedCount)/\(Cast.all.count) pals", systemImage: "face.smiling")
                        .foregroundStyle(Theme.pink)
                }
                .font(.fun(13, .heavy))
                if let next {
                    ProgressCapsule(value: Double(store.totalStars - rank.minStars) / Double(max(1, next.minStars - rank.minStars)),
                                    color: Color(hex: 0xFFC300))
                    Text("\(next.minStars - store.totalStars) more ⭐ to become \(next.title) \(next.emoji)")
                        .font(.fun(12, .semibold))
                        .foregroundStyle(Theme.softInk)
                } else {
                    Text("Top rank reached. You're a legend! 🎉")
                        .font(.fun(12, .semibold))
                        .foregroundStyle(Theme.softInk)
                }
            }
            Spacer(minLength: 0)
        }
        .card()
    }
}

struct LocationSheet: View {
    let location: BodyLocation
    @EnvironmentObject private var store: ProgressStore
    @Environment(\.dismiss) private var dismiss

    private var pathways: [Pathway] { Library.pathways(visiting: location) }

    private var characters: [MoleculeCharacter] {
        var seen = Set<String>()
        var result: [MoleculeCharacter] = []
        for pathway in pathways {
            for step in pathway.steps where step.location == location && !seen.contains(step.star) {
                seen.insert(step.star)
                result.append(Cast.character(step.star))
            }
        }
        return result
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    HStack(spacing: 14) {
                        Text(location.emoji)
                            .font(.system(size: 46))
                            .frame(width: 76, height: 76)
                            .background(Circle().fill(location.color.opacity(0.2)))
                        Text(location.name)
                            .font(.fun(28, .black))
                            .foregroundStyle(Theme.ink)
                    }
                    Text(location.blurb)
                        .font(.fun(17, .medium))
                        .foregroundStyle(Theme.ink)
                        .fixedSize(horizontal: false, vertical: true)

                    if !characters.isEmpty {
                        SectionHeader(title: "Molecules spotted here", emoji: "👀")
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 14) {
                                ForEach(characters) { character in
                                    VStack(spacing: 6) {
                                        MoleculeFace(character: character, size: 62)
                                        Text(character.firstName)
                                            .font(.fun(12, .bold))
                                            .foregroundStyle(Theme.ink)
                                    }
                                }
                            }
                            .padding(.vertical, 6)
                        }
                    }

                    if !pathways.isEmpty {
                        SectionHeader(title: "Journeys that stop here", emoji: "🧭")
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
            .background(
                LinearGradient(colors: [location.color.opacity(0.18), Theme.cream],
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
    }
}

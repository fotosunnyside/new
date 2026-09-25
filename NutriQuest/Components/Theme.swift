import SwiftUI

extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        let r = Double((hex >> 16) & 0xFF) / 255
        let g = Double((hex >> 8) & 0xFF) / 255
        let b = Double(hex & 0xFF) / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: opacity)
    }
}

extension Font {
    /// Rounded, chunky, kid-friendly type used everywhere in the app.
    static func fun(_ size: CGFloat, _ weight: Font.Weight = .bold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }
}

enum Theme {
    static let ink = Color(hex: 0x2B2D42)
    static let softInk = Color(hex: 0x5C5F7A)
    static let cream = Color(hex: 0xFFF8EE)
    static let pink = Color(hex: 0xFF5C8A)
    static let good = Color(hex: 0x2DC653)
    static let bad = Color(hex: 0xEF476F)

    static let sky = LinearGradient(
        colors: [Color(hex: 0xA0E7FF), Color(hex: 0xE4C1F9)],
        startPoint: .top, endPoint: .bottom)
    static let candy = LinearGradient(
        colors: [Color(hex: 0xFFD6E0), Color(hex: 0xFFF1C1)],
        startPoint: .topLeading, endPoint: .bottomTrailing)
    static let mint = LinearGradient(
        colors: [Color(hex: 0xC8F7C5), Color(hex: 0xB9E8FF)],
        startPoint: .topLeading, endPoint: .bottomTrailing)
    static let sunset = LinearGradient(
        colors: [Color(hex: 0xFFE29A), Color(hex: 0xFFB3C6)],
        startPoint: .topLeading, endPoint: .bottomTrailing)
    static let night = LinearGradient(
        colors: [Color(hex: 0x3A0CA3), Color(hex: 0x7209B7), Color(hex: 0xF72585)],
        startPoint: .topLeading, endPoint: .bottomTrailing)
}

// MARK: - Buttons & cards

struct BubbleButtonStyle: ButtonStyle {
    var color: Color = Theme.pink
    var textColor: Color = .white

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.fun(18, .heavy))
            .foregroundStyle(textColor)
            .padding(.horizontal, 22)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(color)
                    .shadow(color: .black.opacity(0.18), radius: 0, x: 0, y: configuration.isPressed ? 1 : 5)
            )
            .offset(y: configuration.isPressed ? 4 : 0)
            .animation(.spring(response: 0.25, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

struct PressableStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1)
            .animation(.spring(response: 0.25, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

struct CardModifier: ViewModifier {
    var color: Color = .white
    var padding: CGFloat = 16

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(RoundedRectangle(cornerRadius: 24, style: .continuous).fill(color))
            .shadow(color: .black.opacity(0.08), radius: 8, x: 0, y: 4)
    }
}

extension View {
    func card(_ color: Color = .white, padding: CGFloat = 16) -> some View {
        modifier(CardModifier(color: color, padding: padding))
    }
}

// MARK: - Small building blocks

struct Pill: View {
    let text: String
    var color: Color = Theme.pink

    var body: some View {
        Text(text)
            .font(.fun(12, .heavy))
            .foregroundStyle(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Capsule().fill(color))
    }
}

struct StarRow: View {
    let count: Int
    var total: Int = 3
    var size: CGFloat = 18

    var body: some View {
        HStack(spacing: 2) {
            ForEach(0..<total, id: \.self) { i in
                Image(systemName: i < count ? "star.fill" : "star")
                    .font(.system(size: size, weight: .bold))
                    .foregroundStyle(i < count ? Color(hex: 0xFFC300) : Color.gray.opacity(0.4))
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(count) of \(total) stars")
    }
}

struct ProgressCapsule: View {
    let value: Double
    var color: Color = Theme.pink

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Color.white.opacity(0.7))
                Capsule()
                    .fill(color)
                    .frame(width: max(12, geo.size.width * min(max(value, 0), 1)))
            }
        }
        .frame(height: 12)
        .animation(.spring(response: 0.5, dampingFraction: 0.8), value: value)
    }
}

struct SectionHeader: View {
    let title: String
    var emoji: String = ""

    var body: some View {
        HStack(spacing: 6) {
            if !emoji.isEmpty { Text(emoji) }
            Text(title)
        }
        .font(.fun(19, .heavy))
        .foregroundStyle(Theme.ink)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// A chip that labels an enzyme, vitamin, mineral or other helper.
/// Helpers that are also Molecule Pals get a mini face and can be tapped to meet them.
struct HelperChips: View {
    let helpers: [String]
    var title: String = "Helpers on this step"
    var isCollected: (String) -> Bool = { _ in true }
    var onTapCharacter: ((MoleculeCharacter) -> Void)? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title.uppercased())
                .font(.fun(12, .heavy))
                .foregroundStyle(Theme.softInk)
            FlowLayout(spacing: 8) {
                ForEach(helpers, id: \.self) { helper in
                    if let id = Cast.helperCharacterID(for: helper), let onTapCharacter {
                        let character = Cast.character(id)
                        Button { onTapCharacter(character) } label: {
                            HStack(spacing: 6) {
                                MoleculeFace(character: character, size: 24, animated: false)
                                Text(helper)
                                if !isCollected(id) {
                                    Text("NEW")
                                        .font(.fun(10, .black))
                                        .foregroundStyle(.white)
                                        .padding(.horizontal, 5)
                                        .padding(.vertical, 2)
                                        .background(Capsule().fill(Theme.pink))
                                }
                            }
                            .font(.fun(14, .bold))
                            .foregroundStyle(Theme.ink)
                            .padding(.leading, 6)
                            .padding(.trailing, 12)
                            .padding(.vertical, 5)
                            .background(Capsule().fill(character.color.opacity(0.18)))
                            .overlay(Capsule().stroke(character.color.opacity(0.6), lineWidth: 1.5))
                        }
                        .buttonStyle(PressableStyle())
                        .accessibilityHint("Meet \(character.name)")
                    } else {
                        Text(helper)
                            .font(.fun(14, .bold))
                            .foregroundStyle(Theme.ink)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 7)
                            .background(Capsule().fill(Color.white))
                            .overlay(Capsule().stroke(Theme.ink.opacity(0.12), lineWidth: 1))
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct SpeechBubble<Content: View>: View {
    var color: Color = .white
    @ViewBuilder var content: Content

    var body: some View {
        VStack(spacing: 0) {
            Triangle()
                .fill(color)
                .frame(width: 26, height: 13)
            content
                .padding(18)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 24, style: .continuous).fill(color))
        }
        .shadow(color: .black.opacity(0.08), radius: 8, x: 0, y: 4)
    }
}

/// Classic "shake" effect: animate `animatableData` by +1 to wiggle once.
struct ShakeEffect: GeometryEffect {
    var amount: CGFloat = 10
    var shakes: CGFloat = 3
    var animatableData: CGFloat

    func effectValue(size: CGSize) -> ProjectionTransform {
        ProjectionTransform(CGAffineTransform(translationX: amount * sin(animatableData * .pi * shakes), y: 0))
    }
}

/// Wrapping layout for chips and tags.
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var widest: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(ProposedViewSize(width: maxWidth, height: nil))
            if x > 0 && x + size.width > maxWidth {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            x += size.width + spacing
            widest = max(widest, x - spacing)
            rowHeight = max(rowHeight, size.height)
        }
        return CGSize(width: proposal.width ?? widest, height: y + rowHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var rowHeight: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(ProposedViewSize(width: bounds.width, height: nil))
            if x > bounds.minX && x + size.width > bounds.maxX {
                x = bounds.minX
                y += rowHeight + spacing
                rowHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}

// MARK: - Confetti

struct ConfettiView: View {
    private struct Particle {
        let x: Double
        let vx: Double
        let vy: Double
        let size: Double
        let color: Color
        let spin: Double
        let round: Bool
    }

    @State private var start = Date()
    @State private var particles: [Particle] = ConfettiView.makeParticles(count: 90)

    private static func makeParticles(count: Int) -> [Particle] {
        let colors: [Color] = [
            Color(hex: 0xFF5C8A), Color(hex: 0xFFC300), Color(hex: 0x3A86FF),
            Color(hex: 0x2DC653), Color(hex: 0x9B5DE5), Color(hex: 0xFF8C42), Color(hex: 0x00BBF9),
        ]
        return (0..<count).map { _ in
            Particle(
                x: Double.random(in: 0.1...0.9),
                vx: Double.random(in: -0.25...0.25),
                vy: Double.random(in: -1.3 ... -0.6),
                size: Double.random(in: 7...13),
                color: colors.randomElement() ?? .pink,
                spin: Double.random(in: -8...8),
                round: Bool.random())
        }
    }

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { context, size in
                let t = timeline.date.timeIntervalSince(start)
                guard t < 4 else { return }
                for p in particles {
                    let x = (p.x + p.vx * t) * size.width
                    let y = size.height * (0.45 + p.vy * t + 0.75 * t * t)
                    if y > size.height + 20 { continue }
                    var ctx = context
                    ctx.translateBy(x: x, y: y)
                    ctx.rotate(by: .radians(p.spin * t))
                    let rect = CGRect(x: -p.size / 2, y: -p.size / 4, width: p.size, height: p.size / 2)
                    let path = p.round ? Path(ellipseIn: rect) : Path(rect)
                    ctx.fill(path, with: .color(p.color))
                }
            }
        }
        .allowsHitTesting(false)
        .ignoresSafeArea()
    }
}

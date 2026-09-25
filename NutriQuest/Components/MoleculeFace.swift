import SwiftUI

/// A personified molecule: a colorful body shape with eyes, a smile,
/// rosy cheeks and an accessory emoji. It gently bobs and blinks.
struct MoleculeFace: View {
    let character: MoleculeCharacter
    var size: CGFloat = 90
    var excited = false
    var animated = true
    var silhouette = false

    private var seed: Double {
        Double(character.id.unicodeScalars.reduce(0) { $0 + Int($1.value) } % 97) / 97
    }

    var body: some View {
        if animated && !silhouette {
            TimelineView(.animation(minimumInterval: 1.0 / 30.0)) { context in
                let t = context.date.timeIntervalSinceReferenceDate
                face(bob: sin((t + seed * 10) * 2.2) * 0.035,
                     blink: (t + seed * 7).truncatingRemainder(dividingBy: 3.4) < 0.14)
            }
            .frame(width: size, height: size)
        } else {
            face(bob: 0, blink: false)
                .frame(width: size, height: size)
        }
    }

    private func face(bob: Double, blink: Bool) -> some View {
        let outline = character.shape.shape
        let tint = silhouette ? Color.gray.opacity(0.35) : character.color
        return ZStack {
            outline
                .fill(tint)
                .overlay(
                    outline.fill(RadialGradient(colors: [.white.opacity(0.55), .clear],
                                             center: UnitPoint(x: 0.3, y: 0.25),
                                             startRadius: 0, endRadius: size * 0.6))
                )
                .overlay(outline.stroke(Color.white.opacity(0.95),
                                     style: StrokeStyle(lineWidth: max(2, size * 0.045), lineJoin: .round)))
                .shadow(color: tint.opacity(0.45), radius: size * 0.08, x: 0, y: size * 0.05)

            if silhouette {
                Text("?")
                    .font(.fun(size * 0.45, .black))
                    .foregroundStyle(.white)
            } else {
                FaceFeatures(size: size, excited: excited, sleepy: character.id == "melatonin", blink: blink)
                    .offset(y: size * 0.06)
                Text(character.accessory)
                    .font(.system(size: size * 0.3))
                    .offset(x: size * 0.36, y: -size * 0.36)
            }
        }
        .frame(width: size, height: size)
        .offset(y: CGFloat(bob) * size)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(silhouette ? "Undiscovered molecule" : character.name)
    }
}

struct FaceFeatures: View {
    let size: CGFloat
    var excited = false
    var sleepy = false
    var blink = false

    var body: some View {
        VStack(spacing: size * 0.05) {
            HStack(spacing: size * 0.2) {
                eye
                eye
            }
            mouth
        }
        .overlay(alignment: .bottom) {
            HStack(spacing: size * 0.42) {
                Circle().fill(Color(hex: 0xFF4D6D).opacity(0.35)).frame(width: size * 0.11)
                Circle().fill(Color(hex: 0xFF4D6D).opacity(0.35)).frame(width: size * 0.11)
            }
            .offset(y: -size * 0.1)
        }
    }

    @ViewBuilder private var eye: some View {
        if blink || sleepy {
            SmileArc()
                .stroke(Theme.ink, style: StrokeStyle(lineWidth: max(1.5, size * 0.035), lineCap: .round))
                .frame(width: size * 0.13, height: size * 0.05)
                .frame(height: size * 0.18)
        } else {
            ZStack {
                Ellipse().fill(Color.white).frame(width: size * 0.15, height: size * 0.18)
                Circle().fill(Theme.ink).frame(width: size * 0.095).offset(x: size * 0.01, y: size * 0.02)
                Circle().fill(Color.white).frame(width: size * 0.035).offset(x: size * 0.03, y: 0)
            }
            .frame(height: size * 0.18)
        }
    }

    @ViewBuilder private var mouth: some View {
        if excited {
            OpenMouth()
                .fill(Theme.ink)
                .overlay(
                    Ellipse()
                        .fill(Color(hex: 0xFF6B8B))
                        .frame(width: size * 0.12, height: size * 0.06)
                        .offset(y: size * 0.035)
                )
                .clipShape(OpenMouth())
                .frame(width: size * 0.24, height: size * 0.07)
                .padding(.bottom, size * 0.05)
        } else {
            SmileArc()
                .stroke(Theme.ink, style: StrokeStyle(lineWidth: max(1.5, size * 0.035), lineCap: .round))
                .frame(width: size * 0.22, height: size * 0.06)
                .padding(.bottom, size * 0.06)
        }
    }
}

/// A row of faces connected by arrows — shows how one molecule turns into the next.
struct TransformationChain: View {
    let ids: [String]
    var faceSize: CGFloat = 54

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(Array(ids.enumerated()), id: \.offset) { index, id in
                    if index > 0 {
                        Image(systemName: "arrow.right")
                            .font(.system(size: 14, weight: .heavy))
                            .foregroundStyle(Theme.softInk)
                    }
                    VStack(spacing: 4) {
                        MoleculeFace(character: Cast.character(id), size: faceSize, animated: false)
                        Text(Cast.character(id).molecule.components(separatedBy: " (").first ?? "")
                            .font(.fun(11, .bold))
                            .foregroundStyle(Theme.ink)
                            .lineLimit(2)
                            .multilineTextAlignment(.center)
                            .frame(width: faceSize + 20)
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
        }
    }
}

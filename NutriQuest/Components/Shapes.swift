import SwiftUI

struct RegularPolygon: Shape {
    var sides: Int

    func path(in rect: CGRect) -> Path {
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) / 2 * 0.94
        var path = Path()
        for i in 0..<sides {
            let angle = Double(i) / Double(sides) * 2 * .pi - .pi / 2
            let point = CGPoint(x: center.x + radius * CGFloat(cos(angle)),
                                y: center.y + radius * CGFloat(sin(angle)))
            if i == 0 { path.move(to: point) } else { path.addLine(to: point) }
        }
        path.closeSubpath()
        return path
    }
}

struct StarShape: Shape {
    var points: Int = 8
    var innerRatio: CGFloat = 0.8

    func path(in rect: CGRect) -> Path {
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let outer = min(rect.width, rect.height) / 2
        let inner = outer * innerRatio
        let total = points * 2
        var path = Path()
        for i in 0..<total {
            let radius = i.isMultiple(of: 2) ? outer : inner
            let angle = Double(i) / Double(total) * 2 * .pi - .pi / 2
            let point = CGPoint(x: center.x + radius * CGFloat(cos(angle)),
                                y: center.y + radius * CGFloat(sin(angle)))
            if i == 0 { path.move(to: point) } else { path.addLine(to: point) }
        }
        path.closeSubpath()
        return path
    }
}

struct DropShape: Shape {
    func path(in r: CGRect) -> Path {
        let w = r.width
        let h = r.height
        var p = Path()
        p.move(to: CGPoint(x: r.midX, y: r.minY))
        p.addCurve(to: CGPoint(x: r.maxX - w * 0.08, y: r.minY + h * 0.62),
                   control1: CGPoint(x: r.midX + w * 0.18, y: r.minY + h * 0.18),
                   control2: CGPoint(x: r.maxX - w * 0.08, y: r.minY + h * 0.38))
        p.addArc(center: CGPoint(x: r.midX, y: r.minY + h * 0.62), radius: w * 0.42,
                 startAngle: .degrees(0), endAngle: .degrees(180), clockwise: false)
        p.addCurve(to: CGPoint(x: r.midX, y: r.minY),
                   control1: CGPoint(x: r.minX + w * 0.08, y: r.minY + h * 0.38),
                   control2: CGPoint(x: r.midX - w * 0.18, y: r.minY + h * 0.18))
        p.closeSubpath()
        return p
    }
}

struct InsetCapsule: Shape {
    func path(in rect: CGRect) -> Path {
        Capsule().path(in: rect.insetBy(dx: 0, dy: rect.height * 0.15))
    }
}

struct Squircle: Shape {
    func path(in rect: CGRect) -> Path {
        let inset = rect.insetBy(dx: rect.width * 0.04, dy: rect.height * 0.04)
        return RoundedRectangle(cornerRadius: min(rect.width, rect.height) * 0.32, style: .continuous)
            .path(in: inset)
    }
}

struct Triangle: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: r.midX, y: r.minY))
        p.addLine(to: CGPoint(x: r.maxX, y: r.maxY))
        p.addLine(to: CGPoint(x: r.minX, y: r.maxY))
        p.closeSubpath()
        return p
    }
}

/// A downward curve used for smiles and closed eyes.
struct SmileArc: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: r.minX, y: r.minY))
        p.addQuadCurve(to: CGPoint(x: r.maxX, y: r.minY),
                       control: CGPoint(x: r.midX, y: r.maxY * 2 - r.minY))
        return p
    }
}

struct OpenMouth: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: r.minX, y: r.minY))
        p.addLine(to: CGPoint(x: r.maxX, y: r.minY))
        p.addQuadCurve(to: CGPoint(x: r.minX, y: r.minY),
                       control: CGPoint(x: r.midX, y: r.maxY * 2 - r.minY))
        p.closeSubpath()
        return p
    }
}

/// A friendly, simplified human figure drawn on a 100 × 160 grid.
struct BodySilhouette: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        // Head & neck
        p.addEllipse(in: CGRect(x: 37, y: 3, width: 26, height: 26))
        p.addRoundedRect(in: CGRect(x: 44, y: 26, width: 12, height: 10), cornerSize: CGSize(width: 4, height: 4))
        // Torso
        p.addRoundedRect(in: CGRect(x: 28, y: 33, width: 44, height: 64), cornerSize: CGSize(width: 14, height: 14))
        // Arms
        let arm = Path(roundedRect: CGRect(x: -6, y: 0, width: 12, height: 58), cornerRadius: 6)
        p.addPath(arm.applying(CGAffineTransform(rotationAngle: 0.18)
            .concatenating(CGAffineTransform(translationX: 31, y: 38))))
        p.addPath(arm.applying(CGAffineTransform(rotationAngle: -0.18)
            .concatenating(CGAffineTransform(translationX: 69, y: 38))))
        // Legs
        p.addRoundedRect(in: CGRect(x: 31, y: 90, width: 17, height: 66), cornerSize: CGSize(width: 8, height: 8))
        p.addRoundedRect(in: CGRect(x: 52, y: 90, width: 17, height: 66), cornerSize: CGSize(width: 8, height: 8))

        let scale = CGAffineTransform(scaleX: rect.width / 100, y: rect.height / 160)
            .concatenating(CGAffineTransform(translationX: rect.minX, y: rect.minY))
        return p.applying(scale)
    }
}

extension FaceShape {
    var shape: AnyShape {
        switch self {
        case .hexagon: return AnyShape(RegularPolygon(sides: 6))
        case .pentagon: return AnyShape(RegularPolygon(sides: 5))
        case .diamond: return AnyShape(RegularPolygon(sides: 4))
        case .circle: return AnyShape(Circle())
        case .capsule: return AnyShape(InsetCapsule())
        case .drop: return AnyShape(DropShape())
        case .gem: return AnyShape(StarShape(points: 8, innerRatio: 0.82))
        case .squircle: return AnyShape(Squircle())
        }
    }
}

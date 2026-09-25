import SwiftUI

@main
struct NutriQuestApp: App {
    @StateObject private var store = ProgressStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .preferredColorScheme(.light)
        }
    }
}

struct RootView: View {
    @AppStorage("NutriQuest.hasOnboarded") private var hasOnboarded = false

    var body: some View {
        TabView {
            BodyMapView()
                .tabItem { Label("Body Map", systemImage: "figure.stand") }
            PathwayListView()
                .tabItem { Label("Pathways", systemImage: "arrow.triangle.branch") }
            GalleryView()
                .tabItem { Label("Molecule Pals", systemImage: "face.smiling.inverse") }
            PlayHubView()
                .tabItem { Label("Play", systemImage: "gamecontroller.fill") }
        }
        .tint(Theme.pink)
        .fullScreenCover(isPresented: Binding(
            get: { !hasOnboarded },
            set: { showing in if !showing { hasOnboarded = true } }
        )) {
            OnboardingView { hasOnboarded = true }
        }
    }
}

struct OnboardingView: View {
    var onFinish: () -> Void
    @State private var page = 0

    private struct Page {
        let faces: [String]
        let title: String
        let text: String
    }

    private let pages: [Page] = [
        Page(faces: ["mito"],
             title: "Hi! I'm Dr. Mito!",
             text: "I'm a mitochondrion, the powerhouse inside your cells. I'll be your guide on a journey through the body!"),
        Page(faces: ["starch", "lct", "protein", "iron"],
             title: "Every bite is an adventure",
             text: "Carbs, fats, proteins, vitamins and minerals get snipped, carried and rebuilt into the energy, hormones and body parts you need."),
        Page(faces: ["serotonin", "insulin", "t3", "adrenaline"],
             title: "Food becomes YOU",
             text: "Explore the Body Map, follow Pathways, collect Molecule Pals and play games to earn stars. Let's go!"),
    ]

    var body: some View {
        ZStack {
            Theme.sky.ignoresSafeArea()
            VStack(spacing: 20) {
                TabView(selection: $page) {
                    ForEach(pages.indices, id: \.self) { i in
                        VStack(spacing: 24) {
                            Spacer()
                            HStack(spacing: -8) {
                                ForEach(pages[i].faces, id: \.self) { id in
                                    MoleculeFace(character: Cast.character(id),
                                                 size: pages[i].faces.count == 1 ? 170 : 86,
                                                 excited: true)
                                }
                            }
                            Text(pages[i].title)
                                .font(.fun(32, .black))
                                .foregroundStyle(Theme.ink)
                                .multilineTextAlignment(.center)
                            Text(pages[i].text)
                                .font(.fun(19, .medium))
                                .foregroundStyle(Theme.softInk)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 28)
                            Spacer()
                            Spacer()
                        }
                        .tag(i)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .always))

                Button {
                    if page < pages.count - 1 {
                        withAnimation { page += 1 }
                    } else {
                        onFinish()
                    }
                } label: {
                    Text(page < pages.count - 1 ? "Next" : "Let's go!")
                        .frame(maxWidth: 260)
                }
                .buttonStyle(BubbleButtonStyle(color: Theme.pink))
                .padding(.bottom, 30)
            }
        }
    }
}

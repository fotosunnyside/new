import SwiftUI

struct QuizView: View {
    private struct Outcome {
        let score: Int
        let stars: Int
        let isNewBest: Bool
    }

    private static let questionCount = 10

    @EnvironmentObject private var store: ProgressStore
    @Environment(\.dismiss) private var dismiss

    @State private var questions: [QuizQuestion] = []
    @State private var index = 0
    @State private var correct = 0
    @State private var answered = false
    @State private var outcome: Outcome?

    var body: some View {
        ZStack {
            Theme.candy.ignoresSafeArea()
            if let outcome {
                GameOverView(
                    title: "\(correct) of \(questions.count) correct!",
                    score: outcome.score,
                    stars: outcome.stars,
                    isNewBest: outcome.isNewBest,
                    lessons: [
                        "Carbs, fats and proteins are all broken into small pieces before they're absorbed.",
                        "Vitamins and minerals are the helpers enzymes need to build hormones and make energy.",
                        "Hormones are made from food molecules: amino acids, cholesterol, iodine and more!",
                    ],
                    onReplay: startQuiz,
                    onDone: { dismiss() })
            } else if questions.indices.contains(index) {
                ScrollView {
                    VStack(spacing: 16) {
                        HStack {
                            Text("Question \(index + 1) of \(questions.count)")
                                .font(.fun(15, .heavy))
                                .foregroundStyle(Theme.softInk)
                            Spacer()
                            ScoreBadge(label: "Correct", value: "\(correct)", color: Theme.good)
                        }
                        ProgressCapsule(value: Double(index + 1) / Double(max(1, questions.count)), color: Theme.pink)

                        MoleculeFace(character: Cast.character("mito"), size: 90, excited: answered)

                        QuestionCard(question: questions[index]) { isCorrect in
                            if isCorrect { correct += 1 }
                            withAnimation { answered = true }
                        }
                        .id(index)
                        .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity),
                                                removal: .opacity))

                        if answered {
                            Button(index + 1 < questions.count ? "Next question" : "See results") { next() }
                                .buttonStyle(BubbleButtonStyle(color: Theme.pink))
                                .transition(.scale.combined(with: .opacity))
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Molecule Quiz")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .onAppear { if questions.isEmpty { startQuiz() } }
    }

    private func startQuiz() {
        questions = Array(Library.allQuestions.shuffled().prefix(Self.questionCount))
        index = 0
        correct = 0
        answered = false
        outcome = nil
    }

    private func next() {
        if index + 1 < questions.count {
            withAnimation(.spring(response: 0.45, dampingFraction: 0.8)) {
                answered = false
                index += 1
            }
        } else {
            let score = correct * 10
            let stars = correct >= 9 ? 3 : correct >= 7 ? 2 : correct >= 4 ? 1 : 0
            let best = store.record(score: score, stars: stars, for: .quiz)
            withAnimation { outcome = Outcome(score: score, stars: stars, isNewBest: best) }
        }
    }
}

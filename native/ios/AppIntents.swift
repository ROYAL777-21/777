// AppIntents.swift — native Siri integration for Scroll Academy (v11)
//
// Drop into the iOS app target when the store build wraps the web app
// (Capacitor / SWV / SwiftUI shell). Until then, the Shortcuts deep-link
// bridge works today: see Profile → "Use Papy with Siri".
//
// What you get once native:
//   · "Hey Siri, Ask Papy"        → opens the app with the assistant listening
//   · "Hey Siri, read my streak"  → deep-links with the query pre-filled
//   · Siri Suggestions learn the user's real phrases
//
// Requires iOS 17+; the app's URL scheme below must be registered in
// Info.plist (CFBundleURLTypes → "scroll").

import AppIntents
import SwiftUI

/// The shared deep-link builder — mirrors the web bridge (?assistant=1&q=).
enum ScrollDeepLink {
    static func assistant(query: String? = nil) -> URL {
        var components = URLComponents(string: "scroll://open")
        var items: [URLQueryItem] = [URLQueryItem(name: "assistant", value: "1")]
        if let query, !query.trimmingCharacters(in: .whitespaces).isEmpty {
            items.append(URLQueryItem(name: "q", value: String(query.prefix(200))))
        }
        components?.queryItems = items
        return components?.url ?? URL(string: "scroll://open?assistant=1")!
    }
}

/// "Hey Siri, Ask Papy" — opens the assistant sheet, mic ready.
struct AskPapyIntent: AppIntent {
    static let title: LocalizedStringResource = "Ask Papy"
    static let description = IntentDescription("Ask your Scroll Academy study companion anything — streak, verses, lessons.")
    static let openAppWhenRun = true

    @Parameter(title: "Question", requestValueDialog: "What would you like to ask?")
    var query: String?

    static var parameterSummary: some ParameterSummary {
        Summary("Ask Papy \(\(\.$query))")
    }

    @MainActor
    func perform() async throws -> some IntentResult {
        // the shell's scene delegate handles the URL and routes it to the
        // webview, which runs the same /?assistant=1&q=… bridge as the web
        UIApplication.shared.open(ScrollDeepLink.assistant(query: query))
        return .result()
    }
}

/// "Hey Siri, how's my streak?" — one-shot with the answer spoken by the app.
struct StreakStatusIntent: AppIntent {
    static let title: LocalizedStringResource = "Check My Streak"
    static let description = IntentDescription("Hear how your Scroll Academy streak is doing.")
    static let openAppWhenRun = true

    @MainActor
    func perform() async throws -> some IntentResult {
        UIApplication.shared.open(ScrollDeepLink.assistant(query: "How is my streak?"))
        return .result()
    }
}

/// Siri phrase registration — no setup screen required.
struct ScrollShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AskPapyIntent(),
            phrases: [
                "Ask Papy in \(.applicationName)",
                "Ask \(.applicationName)"
            ],
            shortTitle: "Ask Papy",
            systemImageName: "sparkles"
        )
        AppShortcut(
            intent: StreakStatusIntent(),
            phrases: ["How is my streak in \(.applicationName)"],
            shortTitle: "Streak",
            systemImageName: "flame"
        )
    }
}

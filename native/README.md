# Native assistant adapters (v11)

Siri and the Android assistant already work with the app **today** through the
zero-native bridge — a Shortcut or Assistant routine opens:

```
https://<your-origin>/?assistant=1&q=<URL-encoded question>
```

The app wakes, hears the question, and answers out loud. Setup steps live in
**Profile → Use Papy with Siri & your assistant**.

These adapters are for the **store builds** (when the app ships in a native
wrapper), where the deep-links become native voice entry points:

| File | Platform | What it adds |
|---|---|---|
| `ios/AppIntents.swift` | iOS 17+ | "Hey Siri, Ask Papy…" phrases via App Intents + Siri Suggestions |
| `android/app-actions.xml` | Android | Google Assistant App Actions (built-in + custom intents) |

Both route to the **same URL bridge** the web uses, so the assistant behavior
never forks between platforms. Remember to register the `scroll://` URL scheme
in `Info.plist` (CFBundleURLTypes) and `AndroidManifest.xml` respectively.

Privacy: the utterance is matched to an intent and discarded — never stored,
never logged, never sent to telemetry (only `{intent, matched, mode}` is
recorded). See `docs/TELEMETRY-SCHEMA.md § Privacy`.

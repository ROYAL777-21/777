import { NextResponse } from "next/server"
import {
  EVENT_CONTRACTS,
  TELEMETRY_EVENT_COUNT,
  TELEMETRY_SCHEMA_VERSION,
  telemetryCanonicalForm,
  telemetryFingerprint,
} from "@/lib/telemetry/schema"
import { engineCensus } from "@/lib/telemetry/census"

/**
 * GET /api/engine/schema — telemetry schema introspection (v11).
 *
 * Public by design: it contains no user data, only the contract —
 * event types, payload specs, PII classes, fingerprint and census.
 * The desktop shell (Tauri) and ScrollBridge (C#) pin the fingerprint
 * and compare it at startup; a mismatch means the schema drifted
 * between builds and should fail loudly in CI, never silently in prod.
 *
 *   GET /api/engine/schema            → summary + contracts
 *   GET /api/engine/schema?full=1     → include per-event prop specs
 */
export async function GET(req: Request) {
  try {
    const full = new URL(req.url).searchParams.get("full") === "1"
    const census = await engineCensus()
    const payload = {
      version: TELEMETRY_SCHEMA_VERSION,
      fingerprint: telemetryFingerprint(),
      canonicalForm: telemetryCanonicalForm(),
      eventCount: TELEMETRY_EVENT_COUNT,
      census,
      events: full
        ? EVENT_CONTRACTS
        : Object.fromEntries(
            Object.entries(EVENT_CONTRACTS).map(([type, c]) => [
              type,
              { desc: c.desc, pii: c.pii, props: Object.keys(c.props) },
            ]),
          ),
    }
    return NextResponse.json(payload, { headers: { "cache-control": "public, max-age=300" } })
  } catch (e) {
    console.error("[api/engine/schema]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"

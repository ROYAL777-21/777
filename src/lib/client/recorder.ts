"use client"

/**
 * Microphone recorder — lets learners "sound it out themselves".
 * Records via MediaRecorder, returns a playable blob URL for A/B comparison
 * against the TTS model pronunciation.
 */

export type RecorderState = "idle" | "requesting" | "recording" | "denied" | "unsupported"

export interface RecordingResult {
  url: string
  durationSec: number
}

export function recorderSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== "undefined"
  )
}

export class VoiceRecorder {
  private stream: MediaStream | null = null
  private recorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private startedAt = 0
  private onChunk: ((state: RecorderState) => void) | null = null

  setOnState(cb: (state: RecorderState) => void) {
    this.onChunk = cb
  }

  async start(maxMs = 10000): Promise<boolean> {
    if (!recorderSupported()) {
      this.onChunk?.("unsupported")
      return false
    }
    try {
      this.onChunk?.("requesting")
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.chunks = []
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : ""
      this.recorder = new MediaRecorder(this.stream, mime ? { mimeType: mime } : undefined)
      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data)
      }
      this.recorder.start(100)
      this.startedAt = Date.now()
      this.onChunk?.("recording")
      // hard stop at maxMs to avoid runaway recordings
      setTimeout(() => {
        if (this.recorder?.state === "recording") this.stop()
      }, maxMs)
      return true
    } catch {
      this.onChunk?.("denied")
      this.releaseStream()
      return false
    }
  }

  stop(): Promise<RecordingResult | null> {
    return new Promise((resolve) => {
      const rec = this.recorder
      if (!rec || rec.state === "inactive") {
        this.releaseStream()
        resolve(null)
        return
      }
      rec.onstop = () => {
        const durationSec = Math.max(0.3, (Date.now() - this.startedAt) / 1000)
        const blob = new Blob(this.chunks, { type: rec.mimeType || "audio/webm" })
        this.releaseStream()
        this.onChunk?.("idle")
        if (blob.size === 0) {
          resolve(null)
          return
        }
        resolve({ url: URL.createObjectURL(blob), durationSec })
      }
      try {
        rec.stop()
      } catch {
        this.releaseStream()
        resolve(null)
      }
    })
  }

  private releaseStream() {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    this.recorder = null
  }

  cancel() {
    try {
      if (this.recorder?.state === "recording") this.recorder.stop()
    } catch {
      // ignore
    }
    this.releaseStream()
    this.onChunk?.("idle")
  }
}

/** simple meter level subscription for a live recording indicator */
export async function createLevelMeter(stream: MediaStream, cb: (level: number) => void): Promise<() => void> {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    const src = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    src.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)
    let raf = 0
    const tick = () => {
      analyser.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length / 255
      cb(avg)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      void ctx.close()
    }
  } catch {
    return () => undefined
  }
}

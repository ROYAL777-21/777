"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Send, Users, Sparkles, ShieldCheck } from "lucide-react"
import { parseAvatar } from "@/lib/avatar"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { CommunityPayload, PostAttachment, PostDTO } from "@/lib/types"
import { AvatarSvg } from "./AvatarSvg"
import { useRefreshApp } from "./ScrollApp"

type FeedPost = PostDTO & { ago: string }

export function CommunityView() {
  const [tab, setTab] = useState<"all" | "friends" | "me">("all")
  const { data, isLoading } = useQuery<{ posts: FeedPost[] } & CommunityPayload>({
    queryKey: ["community", tab],
    queryFn: async () => {
      const res = await fetch(`/api/community?tab=${tab}`)
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    refetchInterval: 30_000,
  })

  return (
    <div className="px-3 sm:px-5 pt-5 pb-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-4">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-duo-purple" /> Community
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">Share achievements, verses and victories — build each other up</p>
        </header>

        <Composer />

        {/* tabs */}
        <div className="flex gap-2 my-4">
          {(
            [
              { id: "all", label: "Everyone" },
              { id: "friends", label: "Friends" },
              { id: "me", label: "My posts" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sfx.tap()
                setTab(t.id)
              }}
              className={`btn3d px-4 py-2 text-sm border-2 border-b-4 ${
                tab === t.id ? "bg-ink text-white border-[#242424] shadow-[0_3px_0_#242424]" : "bg-white border-paper-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* guidelines */}
        <div className="flex items-center gap-2.5 bg-duo-gold/15 border-2 border-duo-gold/40 rounded-2xl px-4 py-2.5 mb-4 text-xs font-bold text-duo-gold-dark">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            Community covenant: “Let no corrupting talk come out of your mouths, but only such as is good for building up” (Eph 4:29). Encourage, don&apos;t
            boast; discuss, don&apos;t demean.
          </span>
        </div>

        {isLoading ? (
          <p className="text-center font-black text-muted-foreground py-10">Gathering the community…</p>
        ) : (data?.posts.length ?? 0) === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border-2 border-paper-border">
            <div className="text-5xl mb-3">🌱</div>
            <h3 className="font-black text-lg">Nothing here yet</h3>
            <p className="text-sm font-bold text-muted-foreground mt-1">
              {tab === "friends" ? "Add some friends to see their posts here." : "Be the first to share an encouragement!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data!.posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── COMPOSER ──────────────────────────────────────────────────

function Composer() {
  const shareDraft = useAppStore((s) => s.shareDraft)
  const setShareDraft = useAppStore((s) => s.setShareDraft)
  const pushToast = useAppStore((s) => s.pushToast)
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const [text, setText] = useState("")
  const [focusedOnce, setFocusedOnce] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const expanded = focusedOnce || !!shareDraft

  useEffect(() => {
    if (shareDraft) inputRef.current?.focus()
  }, [shareDraft])

  const post = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/community", {
        method: "POST",
        body: JSON.stringify({ body: text, attachment: shareDraft }),
      })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: () => {
      sfx.correct()
      haptics.tap()
      setText("")
      setShareDraft(null)
      pushToast("Posted! 🌟", "Your encouragement is live in the community feed.", "🌟")
      void qc.invalidateQueries({ queryKey: ["community"] })
      void qc.invalidateQueries({ queryKey: ["profile"] })
      refreshApp()
    },
    onError: () => {
      sfx.wrong()
      pushToast("Couldn't post", "Something went wrong — please try again.", "⚠️")
    },
  })

  const canPost = text.trim().length > 0

  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-4">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocusedOnce(true)}
        placeholder={shareDraft ? `Say something about your ${shareDraft.kind}…` : "Share an encouragement, a verse, or a win…"}
        rows={expanded ? 3 : 1}
        className="w-full resize-none bg-secondary rounded-2xl px-4 py-3 font-semibold text-sm focus:outline-none placeholder:text-muted-foreground/70"
        aria-label="Write a post"
      />
      <AnimatePresence>
        {shareDraft && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 10 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <AttachmentCard att={shareDraft} onRemove={() => setShareDraft(null)} />
          </motion.div>
        )}
      </AnimatePresence>
      {expanded && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] font-black text-muted-foreground">{text.length}/600</span>
          <button
            onClick={() => post.mutate()}
            disabled={!canPost || post.isPending}
            className="btn3d bg-duo-purple text-white shadow-[0_3px_0_#7c3aed] px-5 py-2.5 text-sm flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Post
          </button>
        </div>
      )}
    </div>
  )
}

function AttachmentCard({ att, onRemove }: { att: PostAttachment; onRemove?: () => void }) {
  return (
    <div className="relative rounded-2xl p-3.5 flex items-center gap-3 border-2" style={{ backgroundColor: att.color + "14", borderColor: att.color + "55" }}>
      <span className="text-3xl shrink-0">{att.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-black text-sm leading-tight" style={{ color: att.color }}>
          {att.title}
        </p>
        <p className="text-xs font-bold text-muted-foreground line-clamp-2">{att.subtitle}</p>
      </div>
      {onRemove && (
        <button onClick={onRemove} className="p-1.5 rounded-full hover:bg-secondary shrink-0" aria-label="Remove attachment">
          ✕
        </button>
      )}
    </div>
  )
}

// ── POST CARD ─────────────────────────────────────────────────

function PostCard({ post, index }: { post: FeedPost; index: number }) {
  const qc = useQueryClient()
  const [liked, setLiked] = useState(post.liked)
  const [likes, setLikes] = useState(post.likes)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState(post.comments)
  const avatar = parseAvatar(post.authorAvatar)

  const like = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/community/like", { method: "POST", body: JSON.stringify({ postId: post.id }) })
      if (!res.ok) throw new Error("failed")
    },
    onMutate: () => {
      const to = !liked
      setLiked(to)
      setLikes((n) => n + (to ? 1 : -1))
      if (to) {
        sfx.correct()
        haptics.tap()
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["community"] })
    },
  })

  const comment = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/community/comment", {
        method: "POST",
        body: JSON.stringify({ postId: post.id, body: commentText }),
      })
      if (!res.ok) throw new Error("failed")
    },
    onSuccess: () => {
      sfx.tap()
      setComments((cs) => [
        ...cs,
        { id: `local-${Date.now()}`, authorName: "You", authorAvatar: null, authorEmoji: "🦁", isUser: true, body: commentText, createdAt: "just now" },
      ])
      setCommentText("")
      // friend bots reply — refresh after a moment
      setTimeout(() => void qc.invalidateQueries({ queryKey: ["community"] }), 2500)
    },
  })

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] p-4"
    >
      {/* author */}
      <div className="flex items-center gap-2.5 mb-2.5">
        {avatar ? (
          <AvatarSvg config={avatar} size={44} />
        ) : (
          <span className="w-11 h-11 rounded-full bg-secondary grid place-items-center text-xl">{post.authorEmoji ?? "👤"}</span>
        )}
        <div className="min-w-0">
          <p className="font-black text-sm leading-tight flex items-center gap-1.5">
            {post.isUser ? `${post.authorName} (you)` : post.authorName}
            {post.isFriend && !post.isUser && (
              <span className="text-[10px] font-black bg-duo-purple/10 text-duo-purple rounded-full px-1.5 py-0.5">friend</span>
            )}
          </p>
          <p className="text-[11px] font-bold text-muted-foreground">
            {post.authorCountry} · {post.ago}
          </p>
        </div>
        {post.attachment?.kind === "achievement" && <Sparkles className="w-4 h-4 ml-auto text-duo-gold shrink-0" />}
      </div>

      <p className="font-semibold text-[15px] leading-relaxed whitespace-pre-wrap">{post.body}</p>

      {post.attachment && (
        <div className="mt-3">
          <AttachmentCard att={post.attachment} />
        </div>
      )}

      {/* actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-paper-border/70">
        <button
          onClick={() => like.mutate()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black transition-colors ${
            liked ? "bg-duo-red/10 text-duo-red" : "text-muted-foreground hover:bg-secondary"
          }`}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <motion.span whileTap={{ scale: 1.3 }} animate={liked ? { scale: [1, 1.35, 1] } : {}}>
            <Heart className={`w-5 h-5 ${liked ? "fill-duo-red" : ""}`} />
          </motion.span>
          {likes}
        </button>
        <button
          onClick={() => {
            sfx.tap()
            setCommentsOpen((o) => !o)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black text-muted-foreground hover:bg-secondary transition-colors"
          aria-expanded={commentsOpen}
        >
          <MessageCircle className="w-5 h-5" /> {comments.length}
        </button>
      </div>

      {/* comments */}
      <AnimatePresence>
        {commentsOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-2 space-y-2">
              {comments.map((c) => {
                const cAvatar = parseAvatar(c.authorAvatar)
                return (
                  <div key={c.id} className="flex items-start gap-2 bg-secondary rounded-2xl px-3 py-2">
                    {cAvatar ? (
                      <AvatarSvg config={cAvatar} size={28} />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-white grid place-items-center text-sm shrink-0">{c.authorEmoji ?? "👤"}</span>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-black">
                        {c.isUser ? "You" : c.authorName} <span className="font-bold text-muted-foreground/70">· {c.createdAt}</span>
                      </p>
                      <p className="text-sm font-semibold">{c.body}</p>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && commentText.trim()) comment.mutate()
                  }}
                  placeholder="Write an encouragement…"
                  className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm font-semibold focus:outline-none placeholder:text-muted-foreground/70"
                  aria-label="Write a comment"
                />
                <button
                  onClick={() => comment.mutate()}
                  disabled={!commentText.trim() || comment.isPending}
                  className="btn3d bg-duo-purple text-white shadow-[0_3px_0_#7c3aed] px-3.5 py-2"
                  aria-label="Send comment"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

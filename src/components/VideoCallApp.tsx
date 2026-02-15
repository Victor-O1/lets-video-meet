"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  Participant,
  VideoTrack,
  AudioTrack,
  ConnectionState,
  VideoPresets,
  AudioPresets,
  Track,
  createLocalVideoTrack,
  createLocalAudioTrack,
} from "livekit-client";
import { toast } from "sonner";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Copy,
  Users,
  Monitor,
  MonitorOff,
  MessageCircle,
  X,
  Send,
  Wifi,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface VideoCallProps {
  initialRoom?: string;
  initialName?: string;
}

interface ParticipantInfo {
  identity: string;
  name: string;
  isLocal: boolean;
  videoTrack?: VideoTrack;
  audioTrack?: AudioTrack;
  screenShareTrack?: VideoTrack;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSpeaking?: boolean;
}

interface ChatMessage {
  id: string;
  message: string;
  from: { identity: string; name: string };
  timestamp: number;
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

interface ChatPanelProps {
  showChat: boolean;
  chatMessages: ChatMessage[];
  messageInput: string;
  isSendingMessage: boolean;
  currentUserIdentity: string;
  onToggleChat: () => void;
  onMessageChange: (v: string) => void;
  onSendMessage: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatPanel = ({
  showChat,
  chatMessages,
  messageInput,
  isSendingMessage,
  currentUserIdentity,
  onToggleChat,
  onMessageChange,
  onSendMessage,
  messagesEndRef,
}: ChatPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showChat) setTimeout(() => inputRef.current?.focus(), 100);
  }, [showChat]);

  if (!showChat) return null;

  return (
    <div
      className="fixed right-5 bottom-28 flex flex-col z-50"
      style={{
        width: 360,
        height: 480,
        background: "rgba(10,10,18,0.92)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        boxShadow:
          "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MessageCircle size={16} style={{ color: "#a78bfa" }} />
          <span
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: 0.2,
            }}
          >
            Messages
          </span>
          {chatMessages.length > 0 && (
            <span
              style={{
                background: "rgba(167,139,250,0.2)",
                color: "#a78bfa",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 99,
                padding: "1px 7px",
              }}
            >
              {chatMessages.length}
            </span>
          )}
        </div>
        <button
          onClick={onToggleChat}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            borderRadius: 8,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#9ca3af",
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {chatMessages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.2)",
            }}
          >
            <MessageCircle
              size={36}
              style={{ marginBottom: 12, opacity: 0.4 }}
            />
            <p style={{ fontSize: 13, margin: 0 }}>No messages yet</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isOwn = msg.from.identity === currentUserIdentity;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isOwn ? "flex-end" : "flex-start",
                }}
              >
                {!isOwn && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#a78bfa",
                      marginBottom: 4,
                      fontWeight: 600,
                    }}
                  >
                    {msg.from.name}
                  </span>
                )}
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "8px 13px",
                    borderRadius: isOwn
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",
                    background: isOwn
                      ? "linear-gradient(135deg, #7c3aed, #db2777)"
                      : "rgba(255,255,255,0.07)",
                    color: "#fff",
                    fontSize: 13,
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                    border: isOwn ? "none" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {msg.message}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.25)",
                    marginTop: 4,
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (messageInput.trim()) onSendMessage();
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={messageInput}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Send a message…"
            disabled={isSendingMessage}
            maxLength={500}
            autoComplete="off"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "10px 14px",
              color: "#fff",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || isSendingMessage}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: messageInput.trim()
                ? "linear-gradient(135deg, #7c3aed, #db2777)"
                : "rgba(255,255,255,0.06)",
              border: "none",
              cursor: messageInput.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Video Tile ───────────────────────────────────────────────────────────────

/**
 * KEY FIX: Local video uses getUserMedia directly via a separate effect that
 * doesn't skip isLocal. Remote participants use track.attach() as normal.
 * This avoids the blank-tile issue where local videoTrack.attach() was
 * conditionally skipped or the element was never wired up.
 */
const VideoTile = ({
  participant,
  isLarge = false,
}: {
  participant: ParticipantInfo;
  isLarge?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  // ── Local camera: attach via track.attach (works for local too!) ──────────
  useEffect(() => {
    const el = videoRef.current;
    const track = participant.videoTrack;
    if (!el || !track) return;

    // LiveKit's attach() works for both local and remote tracks
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [participant.videoTrack]);

  // ── Remote audio ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = audioRef.current;
    const track = participant.audioTrack;
    if (!el || !track || participant.isLocal) return;

    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [participant.audioTrack, participant.isLocal]);

  // ── Screen share ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = screenRef.current;
    const track = participant.screenShareTrack;
    if (!el || !track) return;

    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [participant.screenShareTrack]);

  const initial = participant.name.charAt(0).toUpperCase();
  const showVideo = participant.videoTrack && participant.isVideoEnabled;
  const hasScreen = !!participant.screenShareTrack;

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 18,
        overflow: "hidden",
        background: "#0d0d14",
        border: participant.isSpeaking
          ? "2px solid rgba(167,139,250,0.7)"
          : "1px solid rgba(255,255,255,0.07)",
        boxShadow: participant.isSpeaking
          ? "0 0 0 4px rgba(167,139,250,0.15)"
          : "0 8px 32px rgba(0,0,0,0.5)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        height: "100%",
        minHeight: isLarge ? 380 : 200,
      }}
    >
      {/* Screen share layer */}
      {hasScreen && (
        <video
          ref={screenRef}
          autoPlay
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "#000",
          }}
        />
      )}

      {/* Camera layer */}
      {!hasScreen && showVideo && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: participant.isLocal ? "scaleX(-1)" : "none", // mirror local
          }}
        />
      )}

      {/* Avatar fallback */}
      {!hasScreen && !showVideo && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(ellipse at 50% 30%, #1a1035, #0a0a14)",
          }}
        >
          <div
            style={{
              width: isLarge ? 88 : 64,
              height: isLarge ? 88 : 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isLarge ? 36 : 26,
              fontWeight: 700,
              color: "#fff",
              boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              marginTop: 12,
            }}
          >
            Camera off
          </p>
        </div>
      )}

      {/* Hidden audio element */}
      {!participant.isLocal && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          style={{ display: "none" }}
        />
      )}

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "32px 14px 14px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 99,
              padding: "4px 10px",
              color: "#fff",
              fontSize: 12,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {participant.isLocal && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            )}
            {participant.name}
            {participant.isLocal && " (You)"}
          </span>

          {/* Speaking indicator */}
          {participant.isSpeaking && !participant.isLocal && (
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {[0, 75, 150].map((delay) => (
                <div
                  key={delay}
                  style={{
                    width: 3,
                    height: delay === 75 ? 14 : 10,
                    borderRadius: 99,
                    background: "#a78bfa",
                    animation: `pulse 0.8s ease-in-out infinite`,
                    animationDelay: `${delay}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {!participant.isAudioEnabled && (
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MicOff size={13} color="#fff" />
            </span>
          )}
          {!participant.isVideoEnabled && !hasScreen && (
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <VideoOff size={13} color="#fff" />
            </span>
          )}
          {hasScreen && (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 99,
                background: "rgba(59,130,246,0.85)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Monitor size={11} />
              Screen
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Control Button ───────────────────────────────────────────────────────────

const CtrlBtn = ({
  active,
  danger,
  onClick,
  children,
  label,
}: {
  active: boolean;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      width: 52,
      height: 52,
      borderRadius: 16,
      border: danger
        ? "none"
        : active
          ? "1px solid rgba(255,255,255,0.15)"
          : "1px solid rgba(239,68,68,0.4)",
      background: danger
        ? "linear-gradient(135deg, #dc2626, #b91c1c)"
        : active
          ? "rgba(255,255,255,0.1)"
          : "rgba(239,68,68,0.15)",
      color: danger ? "#fff" : active ? "#fff" : "#ef4444",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s",
    }}
    onMouseOver={(e) => {
      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
    }}
    onMouseOut={(e) => {
      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
    }}
  >
    {children}
  </button>
);

// ─── Duration Timer ───────────────────────────────────────────────────────────

const DurationTimer = () => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const fmt = (n: number) => n.toString().padStart(2, "0");
  return (
    <span
      style={{
        color: "rgba(255,255,255,0.5)",
        fontSize: 12,
        fontFeatureSettings: "'tnum'",
      }}
    >
      {h > 0 ? `${fmt(h)}:` : ""}
      {fmt(m)}:{fmt(s)}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VideoCallApp({
  initialRoom = "",
  initialName = "",
}: VideoCallProps) {
  const [roomName, setRoomName] = useState(initialRoom);
  const [participantName, setParticipantName] = useState(initialName);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [localParticipant, setLocalParticipant] =
    useState<LocalParticipant | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Track helpers ─────────────────────────────────────────────────────────

  const getParticipantTracks = (p: Participant) => {
    let videoTrack: VideoTrack | undefined;
    let audioTrack: AudioTrack | undefined;
    let screenShareTrack: VideoTrack | undefined;

    p.trackPublications.forEach((pub) => {
      if (!pub.track) return;
      if (pub.kind === Track.Kind.Video) {
        if (pub.source === Track.Source.ScreenShare)
          screenShareTrack = pub.track as VideoTrack;
        else videoTrack = pub.track as VideoTrack;
      } else if (pub.kind === Track.Kind.Audio) {
        audioTrack = pub.track as AudioTrack;
      }
    });

    return { videoTrack, audioTrack, screenShareTrack };
  };

  const updateParticipants = useCallback((r: Room) => {
    const list: ParticipantInfo[] = [];
    const lp = r.localParticipant;
    const lt = getParticipantTracks(lp);
    list.push({
      identity: lp.identity,
      name: lp.name || lp.identity,
      isLocal: true,
      ...lt,
      isVideoEnabled: lp.isCameraEnabled,
      isAudioEnabled: lp.isMicrophoneEnabled,
      isSpeaking: lp.isSpeaking,
    });
    r.remoteParticipants.forEach((rp) => {
      const rt = getParticipantTracks(rp);
      list.push({
        identity: rp.identity,
        name: rp.name || rp.identity,
        isLocal: false,
        ...rt,
        isVideoEnabled: rp.isCameraEnabled,
        isAudioEnabled: rp.isMicrophoneEnabled,
        isSpeaking: rp.isSpeaking,
      });
    });
    setParticipants(list);
  }, []);

  // ── Chat ──────────────────────────────────────────────────────────────────

  const handleDataReceived = useCallback(
    (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "chat") {
          const newMsg: ChatMessage = {
            id: `${Date.now()}-${Math.random()}`,
            message: msg.text,
            from: {
              identity: participant?.identity || "unknown",
              name: participant?.name || participant?.identity || "Unknown",
            },
            timestamp: Date.now(),
          };
          setChatMessages((prev) => [...prev, newMsg]);
          setUnreadCount((c) => c + 1);
        }
      } catch {}
    },
    [],
  );

  const handleToggleChat = useCallback(() => {
    setShowChat((p) => !p);
    setUnreadCount(0);
  }, []);

  const sendChatMessage = useCallback(async () => {
    if (!messageInput.trim() || !localParticipant || isSendingMessage) return;
    setIsSendingMessage(true);
    try {
      const data = new TextEncoder().encode(
        JSON.stringify({ type: "chat", text: messageInput.trim() }),
      );
      await localParticipant.publishData(data, { reliable: true });
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          message: messageInput.trim(),
          from: {
            identity: localParticipant.identity,
            name: localParticipant.name || localParticipant.identity,
          },
          timestamp: Date.now(),
        },
      ]);
      setMessageInput("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  }, [messageInput, localParticipant, isSendingMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── Join ──────────────────────────────────────────────────────────────────

  const joinRoom = useCallback(async () => {
    if (!roomName.trim() || !participantName.trim()) {
      toast.error("Enter room name and your name");
      return;
    }
    setIsLoading(true);
    try {
      // Create tracks up-front to ensure permissions are granted before connecting
      let videoTrack: VideoTrack;
      let audioTrack: AudioTrack;
      try {
        videoTrack = await createLocalVideoTrack({
          resolution: VideoPresets.h720.resolution,
        });
      } catch {
        toast.error("Cannot access camera");
        setIsLoading(false);
        return;
      }
      try {
        audioTrack = await createLocalAudioTrack();
      } catch {
        videoTrack.stop();
        toast.error("Cannot access microphone");
        setIsLoading(false);
        return;
      }

      const newRoom = new Room({ adaptiveStream: true, dynacast: true });

      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomName, username: participantName }),
      });
      if (!res.ok) throw new Error("Token fetch failed");
      const { token } = await res.json();

      newRoom.on(RoomEvent.Connected, async () => {
        setIsJoined(true);
        toast.success("Joined!");
        try {
          await newRoom.localParticipant.publishTrack(videoTrack);
          await newRoom.localParticipant.publishTrack(audioTrack);
          setIsVideoEnabled(true);
          setIsAudioEnabled(true);
          // Small delay to let track publications propagate
          setTimeout(() => updateParticipants(newRoom), 300);
        } catch {
          toast.error("Failed to publish media");
        }
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        setIsJoined(false);
        videoTrack.stop();
        audioTrack.stop();
        toast.info("Disconnected");
      });

      newRoom.on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
        toast.success(`${p.name || p.identity} joined`);
        updateParticipants(newRoom);
      });
      newRoom.on(RoomEvent.ParticipantDisconnected, (p: RemoteParticipant) => {
        toast.info(`${p.name || p.identity} left`);
        updateParticipants(newRoom);
      });
      newRoom.on(RoomEvent.TrackSubscribed, () => updateParticipants(newRoom));
      newRoom.on(RoomEvent.TrackUnsubscribed, () =>
        updateParticipants(newRoom),
      );
      newRoom.on(RoomEvent.LocalTrackPublished, (pub) => {
        if (pub.source === Track.Source.ScreenShare) setIsScreenSharing(true);
        updateParticipants(newRoom);
      });
      newRoom.on(RoomEvent.LocalTrackUnpublished, (pub) => {
        if (pub.source === Track.Source.ScreenShare) setIsScreenSharing(false);
        updateParticipants(newRoom);
      });
      newRoom.on(RoomEvent.TrackMuted, () => updateParticipants(newRoom));
      newRoom.on(RoomEvent.TrackUnmuted, () => updateParticipants(newRoom));
      newRoom.on(RoomEvent.ActiveSpeakersChanged, () =>
        updateParticipants(newRoom),
      );
      newRoom.on(RoomEvent.DataReceived, handleDataReceived);

      const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
      if (!url) throw new Error("NEXT_PUBLIC_LIVEKIT_URL not set");
      await newRoom.connect(url, token);

      setRoom(newRoom);
      setLocalParticipant(newRoom.localParticipant);
    } catch (err) {
      console.error(err);
      toast.error("Failed to join room");
    } finally {
      setIsLoading(false);
    }
  }, [roomName, participantName, updateParticipants, handleDataReceived]);

  // ── Controls ──────────────────────────────────────────────────────────────

  const toggleVideo = useCallback(async () => {
    if (!localParticipant) return;
    try {
      const next = !isVideoEnabled;
      await localParticipant.setCameraEnabled(next);
      setIsVideoEnabled(next);
      if (room) updateParticipants(room);
    } catch {
      toast.error("Cannot toggle camera");
    }
  }, [localParticipant, isVideoEnabled, room, updateParticipants]);

  const toggleAudio = useCallback(async () => {
    if (!localParticipant) return;
    try {
      const next = !isAudioEnabled;
      await localParticipant.setMicrophoneEnabled(next);
      setIsAudioEnabled(next);
      if (room) updateParticipants(room);
    } catch {
      toast.error("Cannot toggle microphone");
    }
  }, [localParticipant, isAudioEnabled, room, updateParticipants]);

  const toggleScreenShare = useCallback(async () => {
    if (!localParticipant) return;
    try {
      if (isScreenSharing) {
        await localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
        toast.success("Screen sharing stopped");
      } else {
        await localParticipant.setScreenShareEnabled(true, { audio: true });
        setIsScreenSharing(true);
        toast.success("Screen sharing started");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name !== "NotAllowedError") {
          toast.error("Failed to share screen");
        }
      }
      setIsScreenSharing(false);
    }
  }, [localParticipant, isScreenSharing]);

  const leaveRoom = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setLocalParticipant(null);
      setParticipants([]);
      setIsJoined(false);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      setIsScreenSharing(false);
      setChatMessages([]);
      setShowChat(false);
    }
  }, [room]);

  const copyRoomLink = useCallback(() => {
    navigator.clipboard.writeText(
      `${window.location.origin}?room=${encodeURIComponent(roomName)}`,
    );
    toast.success("Invite link copied!");
  }, [roomName]);

  useEffect(() => {
    return () => {
      room?.disconnect();
    };
  }, [room]);

  // ── Grid layout ───────────────────────────────────────────────────────────

  const gridStyle = (): React.CSSProperties => {
    const n = participants.length;
    if (n <= 1) return { gridTemplateColumns: "1fr", gridTemplateRows: "1fr" };
    if (n === 2)
      return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr" };
    if (n <= 4)
      return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" };
    return { gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr" };
  };

  // ────────────────────────────────────────────────────────────────────────────
  // JOIN SCREEN
  // ────────────────────────────────────────────────────────────────────────────

  if (!isJoined) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#050508",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          position: "relative",
          overflow: "hidden",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        {/* Ambient blobs */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.25), transparent 70%)",
            filter: "blur(40px)",
            animation: "blob1 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(219,39,119,0.2), transparent 70%)",
            filter: "blur(40px)",
            animation: "blob2 10s ease-in-out infinite",
          }}
        />

        <style>{`
          @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.1)} }
          @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(1.08)} }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          input::placeholder { color: rgba(255,255,255,0.25) !important; }
          input:focus { outline: none !important; border-color: rgba(124,58,237,0.6) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important; }
        `}</style>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 420,
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div
              style={{
                display: "inline-flex",
                width: 72,
                height: 72,
                borderRadius: 22,
                background: "linear-gradient(135deg, #7c3aed, #db2777)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                boxShadow: "0 16px 48px rgba(124,58,237,0.45)",
              }}
            >
              <Video size={32} color="#fff" />
            </div>
            <h1
              style={{
                color: "#fff",
                fontSize: 40,
                fontWeight: 800,
                margin: "0 0 8px",
                letterSpacing: -1,
              }}
            >
              Konek
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 15,
                margin: 0,
              }}
            >
              Crystal-clear video calls, instantly.
            </p>
          </div>

          {/* Card */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 32,
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="text"
                placeholder="Room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    roomName.trim() &&
                    participantName.trim() &&
                    !isLoading
                  )
                    joinRoom();
                }}
                autoFocus
                style={{
                  height: 52,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 14,
                  padding: "0 18px",
                  color: "#fff",
                  fontSize: 15,
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              />
              <input
                type="text"
                placeholder="Your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    roomName.trim() &&
                    participantName.trim() &&
                    !isLoading
                  )
                    joinRoom();
                }}
                style={{
                  height: 52,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 14,
                  padding: "0 18px",
                  color: "#fff",
                  fontSize: 15,
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={joinRoom}
                disabled={
                  isLoading || !roomName.trim() || !participantName.trim()
                }
                style={{
                  height: 52,
                  background:
                    isLoading || !roomName.trim() || !participantName.trim()
                      ? "rgba(255,255,255,0.08)"
                      : "linear-gradient(135deg, #7c3aed, #db2777)",
                  border: "none",
                  borderRadius: 14,
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor:
                    isLoading || !roomName.trim() || !participantName.trim()
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  transition: "all 0.2s",
                  boxShadow:
                    !isLoading && roomName.trim() && participantName.trim()
                      ? "0 8px 24px rgba(124,58,237,0.4)"
                      : "none",
                  fontFamily: "inherit",
                }}
              >
                {isLoading ? (
                  <>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Connecting…
                  </>
                ) : (
                  <>
                    <Video size={18} />
                    Join Room
                  </>
                )}
              </button>

              {roomName.trim() && (
                <button
                  onClick={copyRoomLink}
                  style={{
                    height: 44,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  <Copy size={14} />
                  Copy invite link
                </button>
              )}
            </div>
          </div>

          {/* Features strip */}
          <div
            style={{
              marginTop: 28,
              display: "flex",
              justifyContent: "center",
              gap: 28,
              color: "rgba(255,255,255,0.3)",
              fontSize: 12,
            }}
          >
            {[
              { dot: "#22c55e", label: "HD Video" },
              { dot: "#3b82f6", label: "Screen Share" },
              { dot: "#a78bfa", label: "Live Chat" },
            ].map(({ dot, label }) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: dot,
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                {label}
              </div>
            ))}
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CALL INTERFACE
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050508",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Subtle ambient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.07), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(219,39,119,0.06), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Top bar ── */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(5,5,8,0.7)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #db2777)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Video size={18} color="#fff" />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
              {roomName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
              <DurationTimer />
            </div>
          </div>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 99,
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.25)",
              color: "#22c55e",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            Live
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Users size={13} />
            {participants.length}
          </div>
          <button
            onClick={copyRoomLink}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
            }}
          >
            <Copy size={13} />
            Invite
          </button>
          <button
            onClick={leaveRoom}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
            }}
          >
            <PhoneOff size={13} />
            Leave
          </button>
        </div>
      </div>

      {/* ── Video grid ── */}
      <div
        style={{
          flex: 1,
          padding: "16px 20px",
          position: "relative",
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 12,
            height: "100%",
            ...gridStyle(),
          }}
        >
          {participants.map((p) => (
            <VideoTile
              key={p.identity}
              participant={p}
              isLarge={participants.length <= 2}
            />
          ))}
        </div>
      </div>

      {/* ── Control bar ── */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          padding: "14px 20px 20px",
          background: "rgba(5,5,8,0.8)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <CtrlBtn
          active={isAudioEnabled}
          onClick={toggleAudio}
          label={isAudioEnabled ? "Mute mic" : "Unmute mic"}
        >
          {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </CtrlBtn>

        <CtrlBtn
          active={isVideoEnabled}
          onClick={toggleVideo}
          label={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </CtrlBtn>

        <CtrlBtn
          active={isScreenSharing}
          onClick={toggleScreenShare}
          label={isScreenSharing ? "Stop sharing" : "Share screen"}
        >
          {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </CtrlBtn>

        {/* Chat button with unread badge */}
        <div style={{ position: "relative" }}>
          <CtrlBtn active={showChat} onClick={handleToggleChat} label="Chat">
            <MessageCircle size={20} />
          </CtrlBtn>
          {unreadCount > 0 && !showChat && (
            <div
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #db2777)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              {unreadCount}
            </div>
          )}
        </div>

        <div
          style={{
            width: 1,
            height: 32,
            background: "rgba(255,255,255,0.1)",
            margin: "0 4px",
          }}
        />

        <CtrlBtn active={false} danger onClick={leaveRoom} label="End call">
          <PhoneOff size={20} />
        </CtrlBtn>
      </div>

      {/* ── Chat panel ── */}
      <ChatPanel
        showChat={showChat}
        chatMessages={chatMessages}
        messageInput={messageInput}
        isSendingMessage={isSendingMessage}
        currentUserIdentity={localParticipant?.identity || ""}
        onToggleChat={handleToggleChat}
        onMessageChange={setMessageInput}
        onSendMessage={sendChatMessage}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}

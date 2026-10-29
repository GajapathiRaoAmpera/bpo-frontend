"use client";

import { type BotOutputData, PipecatClient, type UserInputData } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";
import { useCallback, useEffect, useRef, useState } from "react";

export type VoicePhase = "idle" | "connecting" | "live" | "ended" | "error";

/**
 * Browser side of a call: Pipecat JS client over WebRTC to the bot in bpo-backend.
 * Committed transcript and tool actions come from the API; this hook adds audio and live captions.
 */
export function useVoiceCall(onServerEvent: (data: { type?: string }) => void) {
  const clientRef = useRef<PipecatClient | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const eventRef = useRef(onServerEvent);
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [botCaption, setBotCaption] = useState("");
  const [userCaption, setUserCaption] = useState("");
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  useEffect(() => {
    eventRef.current = onServerEvent;
  }, [onServerEvent]);

  const reset = useCallback(() => {
    setBotCaption("");
    setUserCaption("");
    setBotSpeaking(false);
    setMicLevel(0);
  }, []);

  const connect = useCallback(async (callId: number) => {
    setPhase("connecting");
    setError(null);
    reset();
    audioRef.current ??= Object.assign(new Audio(), { autoplay: true });
    const segments = new Map<number, string>();

    const client = new PipecatClient({
      transport: new SmallWebRTCTransport({
        webrtcRequestParams: { endpoint: `/api/v1/voice/sessions/${callId}/offer` },
      }),
      enableMic: true,
      enableCam: false,
      callbacks: {
        onBotReady: () => setPhase("live"),
        onDisconnected: () => {
          setPhase((p) => (p === "error" ? p : "ended"));
          reset();
        },
        onTrackStarted: (track, participant) => {
          if (participant?.local || track.kind !== "audio" || !audioRef.current) return;
          audioRef.current.srcObject = new MediaStream([track]);
          void audioRef.current.play().catch(() => undefined);
        },
        onBotStartedSpeaking: () => setBotSpeaking(true),
        onBotStoppedSpeaking: () => {
          setBotSpeaking(false);
          segments.clear();
          setBotCaption("");
        },
        onBotOutput: (data: BotOutputData) => {
          // Caption of what the bot is saying now; the committed turn arrives via the API.
          const id = data.segment_id ?? 0;
          const text = data.spoken_progress?.accumulated_text ?? `${segments.get(id) ?? ""} ${data.text}`.trim();
          segments.set(id, text);
          setBotCaption([...segments.values()].join(" "));
        },
        onUserInput: (data: UserInputData) => setUserCaption(data.final ? "" : data.text),
        onLocalAudioLevel: (level) => setMicLevel(level),
        onServerMessage: (data) => eventRef.current(data ?? {}),
        onError: (message) => {
          const detail = (message?.data as { message?: string } | undefined)?.message;
          setError(detail ?? "The voice connection reported an error.");
        },
      },
    });
    clientRef.current = client;
    try {
      await client.initDevices();
      await client.connect();
    } catch (e) {
      clientRef.current = null;
      setPhase("error");
      const name = (e as { name?: string })?.name;
      setError(name === "NotAllowedError"
        ? "Microphone access was blocked. Allow the microphone for this site and start the call again."
        : "Couldn't connect to the voice agent. Check the backend is running and try again.");
      throw e;
    }
  }, [reset]);

  const disconnect = useCallback(async () => {
    const client = clientRef.current;
    clientRef.current = null;
    if (client) await client.disconnect().catch(() => undefined);
    setPhase((p) => (p === "idle" ? p : "ended"));
    reset();
  }, [reset]);

  const toggleMic = useCallback(() => {
    setMicOn((on) => {
      clientRef.current?.enableMic(!on);
      return !on;
    });
  }, []);

  const resetToIdle = useCallback(() => {
    setPhase("idle");
    setError(null);
    setMicOn(true);
  }, []);

  useEffect(() => () => void clientRef.current?.disconnect(), []);

  return { phase, error, micOn, micLevel, botCaption, userCaption, botSpeaking, connect, disconnect, toggleMic, resetToIdle };
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function LessonAudio({ text }: { text: string }) {
  const active = useRef<SpeechSynthesisUtterance | null>(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");

  function stop() {
    if (!active.current) return;
    active.current = null;
    window.speechSynthesis.cancel();
    setPlaying(false);
  }

  useEffect(() => () => {
    if (active.current) {
      active.current = null;
      window.speechSynthesis.cancel();
    }
  }, []);

  function play() {
    const synth = window.speechSynthesis;
    const voice = synth?.getVoices().filter((candidate) => /^vi(?:-|$)/i.test(candidate.lang))
      .sort((a, b) => Number(b.localService) - Number(a.localService))
      .find((candidate) => navigator.onLine || candidate.localService);
    if (!synth || !voice || typeof SpeechSynthesisUtterance === "undefined") {
      setMessage(navigator.onLine
        ? "Chưa tìm thấy giọng tiếng Việt trên thiết bị. Em có thể thử lại sau khi bật giọng tiếng Việt."
        : "Nghe khi mất mạng cần giọng tiếng Việt có sẵn trên thiết bị.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice.lang;
    utterance.voice = voice;
    utterance.rate = 0.85;
    const finish = (error = false) => {
      if (active.current !== utterance) return;
      active.current = null;
      setPlaying(false);
      if (error) setMessage("Chưa phát được giọng đọc. Em hãy thử lại.");
    };
    utterance.onend = () => finish();
    utterance.onerror = () => finish(true);
    setMessage("");
    setPlaying(true);
    active.current = utterance;
    try { synth.speak(utterance); } catch { finish(true); }
  }

  return <div className="lesson-audio">
    <button type="button" className="button secondary" onClick={playing ? stop : play}>
      {playing ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
      {playing ? "Dừng đọc" : "Nghe giọng đọc"}
    </button>
    <span className="section-intro">Giọng đọc từ thiết bị</span>
    <div aria-live="polite">{message && <p>{message}</p>}</div>
  </div>;
}

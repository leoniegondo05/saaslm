"use client";

import { useEffect, useRef, useState } from "react";

/*
  Bulle IA flottante (tête de robot) : reste visible sur tout le dashboard
  ("Ma journée", "Accueil"...) car montée dans app/dashboard/layout.tsx, pas
  dans chaque page. Au clic elle ouvre un panneau "Analyser ma boutique /
  Assistant LM" où le client démarre la conversation.

  Déplaçable à la souris (glisser-déposer), PAS de déplacement automatique :
  demande explicite — l'utilisateur pose la bulle où il veut, elle n'y bouge
  plus toute seule (remplace la promenade aléatoire précédente). Position
  mémorisée par navigateur (localStorage) pour rester au même endroit d'une
  visite à l'autre ; tant qu'elle n'a jamais été déplacée, elle garde sa
  position par défaut (bas-droite, classes Tailwind "fixed bottom-...").

  Échanges purement locaux pour l'instant (pas d'appel API) : à brancher sur
  le backend IA dès qu'il existe une route pour ça.
*/

type ChatMessage = { role: "assistant" | "user"; text: string };

const INTRO_MESSAGE: ChatMessage = {
  role: "assistant",
  text: "Bonjour Awa 👋 Je suis votre assistant LM. Dites-moi ce que vous voulez savoir sur votre boutique (ventes, commandes, recommandations...).",
};

const BUBBLE_SIZE = 64; // h-16 w-16
const EDGE_MARGIN = 8;
const POSITION_STORAGE_KEY = "lm-dashboard-ai-bubble-position";

export default function FloatingAiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO_MESSAGE]);
  const [draft, setDraft] = useState("");

  // null = position par défaut (bas-droite, posée par les classes Tailwind) ;
  // une fois déplacée, coordonnées absolues en pixels (coin haut-gauche de
  // la bulle).
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const grabOffsetRef = useRef({ x: 0, y: 0 });

  // Position sauvegardée par le navigateur (par appareil), pour rester où
  // l'utilisateur l'a laissée d'une visite à l'autre.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(POSITION_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved?.x === "number" && typeof saved?.y === "number") {
        // localStorage n'existe que côté client : lu après montage pour ne
        // pas désynchroniser le HTML serveur (qui ignore toujours la
        // position sauvegardée) de la 1re passe client.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPosition(saved);
      }
    } catch {
      // localStorage indisponible (navigation privée, etc.) : position par défaut
    }
  }, []);

  useEffect(() => {
    const clamp = (x: number, y: number) => {
      const maxX = window.innerWidth - BUBBLE_SIZE - EDGE_MARGIN;
      const maxY = window.innerHeight - BUBBLE_SIZE - EDGE_MARGIN;
      return {
        x: Math.min(Math.max(EDGE_MARGIN, x), Math.max(EDGE_MARGIN, maxX)),
        y: Math.min(Math.max(EDGE_MARGIN, y), Math.max(EDGE_MARGIN, maxY)),
      };
    };

    const moveTo = (clientX: number, clientY: number) => {
      if (!draggingRef.current) return;
      movedRef.current = true;
      setPosition(clamp(clientX - grabOffsetRef.current.x, clientY - grabOffsetRef.current.y));
    };

    const endDrag = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setPosition((current) => {
        if (current) {
          try {
            localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(current));
          } catch {
            // localStorage indisponible : la position reste valable pour cette session seulement
          }
        }
        return current;
      });
    };

    const onMouseMove = (event: MouseEvent) => moveTo(event.clientX, event.clientY);
    const onMouseUp = () => endDrag();
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || !draggingRef.current) return;
      event.preventDefault();
      moveTo(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => endDrag();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const startDrag = (clientX: number, clientY: number) => {
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (!rect) return;
    draggingRef.current = true;
    movedRef.current = false;
    grabOffsetRef.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
      {
        role: "assistant",
        text: "Analyse en cours... cette réponse sera bientôt générée par l'IA LM.",
      },
    ]);
    setDraft("");
  };

  // flex-col-reverse : le panneau (2e enfant) s'affiche toujours au-dessus
  // de la bulle (1er enfant), que la bulle soit ancrée en bas (position par
  // défaut) ou déplacée n'importe où via style.top/left.
  return (
    <div
      className={
        position
          ? "fixed z-50 flex flex-col-reverse items-end gap-3"
          : "fixed bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] right-4 z-50 flex flex-col-reverse items-end gap-3 sm:right-6 lg:bottom-8 lg:right-8"
      }
      style={position ? { left: position.x, top: position.y } : undefined}
    >
      {/* Bulle robot — glisser pour déplacer, cliquer (sans glisser) pour ouvrir/fermer */}
      <button
        ref={bubbleRef}
        type="button"
        aria-label={open ? "Fermer l'assistant IA" : "Ouvrir l'assistant IA"}
        onMouseDown={(event) => {
          event.preventDefault();
          startDrag(event.clientX, event.clientY);
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) startDrag(touch.clientX, touch.clientY);
        }}
        onClick={() => {
          if (movedRef.current) return; // c'était un glisser-déposer, pas un clic
          setOpen((current) => !current);
        }}
        className="flex h-16 w-16 shrink-0 cursor-grab touch-none items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff5fc4,var(--color-brand-pink)_45%,#3a1d8a_100%)] shadow-[0_10px_30px_rgba(236,12,140,0.45)] transition hover:brightness-110 active:cursor-grabbing"
      >
        <RobotFaceIcon className="h-8 w-8 text-white" />
      </button>

      {open && (
        <div className="flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#241454,#150c38_65%,#0d0826_100%)] shadow-[0_20px_60px_rgba(20,18,32,0.35)]">
          {/* En-tête */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#ff5fc4,var(--color-brand-pink)_70%)] shadow-[0_0_16px_rgba(236,12,140,0.6)]">
              <RobotFaceIcon className="h-5 w-5 text-white" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-white">
                Analyser ma boutique
              </p>
              <p className="text-[11px] font-medium tracking-wide text-white/50">
                ASSISTANCE LM
              </p>
            </div>
            <button
              type="button"
              aria-label="Fermer l'assistant"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Fil de discussion */}
          <div className="flex max-h-[50vh] min-h-[160px] flex-col gap-2.5 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <p
                key={index}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                  message.role === "assistant"
                    ? "self-start rounded-bl-sm bg-white/10 text-white/90"
                    : "self-end rounded-br-sm bg-brand-pink text-white"
                }`}
              >
                {message.text}
              </p>
            ))}
          </div>

          {/* Saisie */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(draft);
            }}
            className="flex items-center gap-2 border-t border-white/10 p-3"
          >
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Écrivez votre message..."
              className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:bg-white/15"
            />
            <button
              type="submit"
              aria-label="Envoyer"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white transition hover:brightness-110"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ── Icônes ── */

function RobotFaceIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 2v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="3.2" r="1" fill="currentColor" />
      <rect
        x="4"
        y="6.5"
        width="16"
        height="13"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="9" cy="13" r="1.4" fill="currentColor" />
      <circle cx="15" cy="13" r="1.4" fill="currentColor" />
      <path
        d="M9 16.5c.9.7 1.9 1 3 1s2.1-.3 3-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M1.5 12h2M20.5 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M3.5 12 20 4l-6.5 16-3-6.5L3.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

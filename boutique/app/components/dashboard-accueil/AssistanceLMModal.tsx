"use client";

import { useEffect, useRef, useState } from "react";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { TAB_LABELS_EN, type AccueilTab } from "./AccueilNav";
import { REGLAGES_TABS, type ReglagesTab } from "../dashboard-reglages/ReglagesNav";
import {
  ASSISTANCE_QUESTIONS,
  getAssistanceBrief,
  REGLAGES_ASSISTANCE_QUESTIONS,
  getReglagesAssistanceBrief,
  type AssistanceQuestion,
} from "./assistanceQuestions";

/*
  Panneau ouvert par le bouton "solution LM" (DashboardHeader.tsx, badge
  devenu vrai bouton). Champ de saisie libre type chat — les questions de
  assistanceQuestions.ts ne sont QUE des exemples suggérés au-dessus du
  champ (retour utilisateur du 2026-09-11 : "j'ai pas dit les questions
  vont s'afficher, c'est un exemple de question que l'utilisateur peut
  poser, sinon lorsqu'on clique sur solution LM c'est un champ qui
  s'affiche"). Cliquer un exemple l'envoie directement dans le fil, comme
  si l'utilisateur l'avait tapé et validé.

  `activeTab` vient de app/dashboard/accueil/page.tsx (état du même
  AccueilNav qui filtre les sections) :
  - un onglet précis (Commandes, Finances...) → exemples de cette seule
    section (ASSISTANCE_QUESTIONS[activeTab]) ;
  - null ("Tout", ou toute page du dashboard hors Accueil qui n'a pas de
    notion de section) → briefing condensé des 7 sections
    (getAssistanceBrief : 2 exemples les plus importants par section).

  `activeReglagesTab` vient de app/dashboard/reglages/page.tsx (état du
  même ReglagesNav) et prime sur `activeTab` quand il est défini (`!==
  undefined`, même sur "Tout" → null) : mêmes règles que ci-dessus mais
  sur les 6 fiches Réglages (REGLAGES_ASSISTANCE_QUESTIONS /
  getReglagesAssistanceBrief). Reste `undefined` sur toute page qui ne le
  passe pas explicitement, pour ne jamais s'activer par accident ailleurs.

  `pageQuestions`/`pageLabel` : pour une page sans onglet (Demandes,
  Partenaire agréé — voir DashboardHeader.tsx) qui a sa propre liste de
  questions groundées, plutôt que retomber sur le briefing des 7 sections
  Accueil (retour utilisateur du 2026-09-16, cf. assistanceQuestions.ts).
  Prime sur `activeTab`/brief mais pas sur `activeReglagesTab` (aucune page
  ne passe les deux).

  Aucune vraie API assistant n'existe encore (rien dans lib/api/services
  ne répond à une question libre) : la réponse envoyée est un message
  générique "bientôt disponible", jamais un chiffre inventé — même règle
  que le reste du dashboard, cf. commentaire sur l'attribution publicitaire
  dans FinancesSection.tsx ("aucun chiffre inventé n'est attribué...").
  Le jour où l'API existe, seul `sendMessage` ci-dessous a besoin de
  changer (remplacer le setTimeout mock par l'appel réel).

  Même recette de panneau que CreerCategorieModal.tsx (fixed inset-0 + fond
  assombri + stopPropagation + Échap) — thème clair du dashboard, cf.
  mémoire [[dashboard-background-fafcfc]].
*/

type ChatMessage = { role: "user" | "assistant"; text: string };

const MOCK_REPLY_DELAY_MS = 500;

export default function AssistanceLMModal({
  activeTab,
  activeReglagesTab,
  pageQuestions,
  pageLabel,
  onFermer,
}: {
  activeTab: AccueilTab | null;
  activeReglagesTab?: ReglagesTab | null;
  pageQuestions?: AssistanceQuestion[];
  pageLabel?: { fr: string; en: string };
  onFermer: () => void;
}) {
  const { t } = useDashboardLangue();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  // setTimeout des réponses mock en attente : nettoyés au démontage, pour ne
  // jamais tenter un setState après fermeture du panneau (Échap/clic dehors
  // pendant le délai simulé de "réponse").
  const pendingReplies = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFermer]);

  useEffect(() => () => pendingReplies.current.forEach(clearTimeout), []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const mockReply = t(
    "L'assistance n'est pas encore branchée à vos données réelles — cette réponse arrivera avec l'API. En attendant, les chiffres affichés sur cet écran répondent déjà à la plupart de ces questions.",
    "Support isn't wired to your real data yet — this reply will land once the API is ready. Meanwhile, the numbers shown on this screen already answer most of these questions."
  );

  const sendMessage = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [...m, { role: "user", text: clean }]);
    setInput("");
    const id = setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: mockReply }]);
    }, MOCK_REPLY_DELAY_MS);
    pendingReplies.current.push(id);
  };

  const isReglages = activeReglagesTab !== undefined;
  const isPage = !isReglages && pageQuestions !== undefined;
  const brief = !isReglages && !isPage && activeTab === null ? getAssistanceBrief() : null;
  const questions = !isReglages && !isPage && activeTab !== null ? ASSISTANCE_QUESTIONS[activeTab] : null;
  const reglagesBrief = isReglages && activeReglagesTab === null ? getReglagesAssistanceBrief() : null;
  const reglagesQuestions =
    isReglages && activeReglagesTab !== null ? REGLAGES_ASSISTANCE_QUESTIONS[activeReglagesTab] : null;
  const exampleQuestions = questions ?? reglagesQuestions ?? (isPage ? pageQuestions! : null);
  // Libellé déjà localisé (FR/EN) du tab actif, calculé une fois — évite un
  // t() imbriqué dans le texte du sous-titre ci-dessous.
  const reglagesTabMeta =
    isReglages && activeReglagesTab !== null ? REGLAGES_TABS.find((tab) => tab.key === activeReglagesTab) : undefined;
  const tabLabel = activeTab !== null
    ? t(activeTab, TAB_LABELS_EN[activeTab])
    : reglagesTabMeta
      ? t(reglagesTabMeta.label, reglagesTabMeta.labelEn)
      : isPage && pageLabel
        ? t(pageLabel.fr, pageLabel.en)
        : "";

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/45 p-4 pt-16 sm:pt-24" onClick={onFermer}>
      {/* stopPropagation : cliquer dans le panneau ne doit pas le fermer, seul le fond assombri le fait. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-lg flex-col rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 text-[var(--dashboard-text)] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M12 3.2l2 5.6 5.6 2-5.6 2-2 5.6-2-5.6-5.6-2 5.6-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight sm:text-base">{t("solution LM", "LM solution")}</h2>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">
                {exampleQuestions
                  ? t(`Posez une question sur « ${tabLabel} »`, `Ask a question about “${tabLabel}”`)
                  : isReglages
                    ? t("Posez une question sur tous vos Réglages", "Ask a question about all your Settings")
                    : t("Posez une question sur tout votre Accueil", "Ask a question about your whole Home tab")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFermer}
            aria-label={t("Fermer", "Close")}
            className="shrink-0 rounded-full p-1.5 text-[var(--dashboard-text)]/40 transition hover:bg-[var(--dashboard-text)]/[0.06] hover:text-[var(--dashboard-text)]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />

        {/* Exemples : suggestions cliquables, pas une liste figée. Cliquer en
            envoie une directement dans le fil, comme si tapée puis validée. */}
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
          {t("Par exemple", "For example")}
        </p>
        {exampleQuestions ? (
          <div className="mt-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {exampleQuestions.map(({ fr, en }) => (
              <button
                key={fr}
                type="button"
                onClick={() => sendMessage(t(fr, en))}
                className="rounded-full bg-[var(--dashboard-surface-2)] px-3 py-1.5 text-left text-[11px] text-[var(--dashboard-text)]/70 transition hover:bg-[var(--dashboard-text)]/[0.08]"
              >
                {t(fr, en)}
              </button>
            ))}
          </div>
        ) : brief ? (
          <div className="mt-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {brief.flatMap(({ tab, questions: qs }) =>
              qs.map(({ fr, en }) => (
                <button
                  key={fr}
                  type="button"
                  onClick={() => sendMessage(t(fr, en))}
                  title={t(tab, TAB_LABELS_EN[tab])}
                  className="rounded-full bg-[var(--dashboard-surface-2)] px-3 py-1.5 text-left text-[11px] text-[var(--dashboard-text)]/70 transition hover:bg-[var(--dashboard-text)]/[0.08]"
                >
                  {t(fr, en)}
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="mt-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {reglagesBrief!.flatMap(({ tab, questions: qs }) => {
              const meta = REGLAGES_TABS.find((r) => r.key === tab)!;
              return qs.map(({ fr, en }) => (
                <button
                  key={fr}
                  type="button"
                  onClick={() => sendMessage(t(fr, en))}
                  title={t(meta.label, meta.labelEn)}
                  className="rounded-full bg-[var(--dashboard-surface-2)] px-3 py-1.5 text-left text-[11px] text-[var(--dashboard-text)]/70 transition hover:bg-[var(--dashboard-text)]/[0.08]"
                >
                  {t(fr, en)}
                </button>
              ));
            })}
          </div>
        )}

        <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />

        {/* Fil de discussion */}
        <div ref={threadRef} className="flex max-h-[40vh] min-h-[8rem] flex-col gap-2 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="my-auto text-center text-[11px] text-[var(--dashboard-text)]/35">
              {t("Tapez votre question ci-dessous, ou choisissez un exemple au-dessus.", "Type your question below, or pick an example above.")}
            </p>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand-purple text-white"
                      : "bg-[var(--dashboard-surface-2)] text-[var(--dashboard-text)]/80"
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Champ de saisie */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="mt-3.5 flex items-center gap-2"
        >
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("Écrivez votre question…", "Type your question…")}
            className="flex-1 rounded-full border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-4 py-2.5 text-xs outline-none focus:border-brand-pink dark:bg-white/[0.04]"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label={t("Envoyer", "Send")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

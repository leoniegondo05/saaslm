"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "../../partenaire-agree/partenaire-agree.module.css";
import CandidatureForm from "./CandidatureForm";
import Wordmark from "../Wordmark";

/*
  Page "Partenaire agréé LM", portée depuis la maquette HTML/CSS fournie
  par l'utilisateur (partenaire-agree-lm.html) — fidèle au pixel : voir
  partenaire-agree.module.css pour le CSS quasi-verbatim (dégradé "aurore"
  découpé en diagonale, maquettes ordinateur/téléphone, sections claires/
  sombres, bande finale, panneau de candidature). Le <Navbar /> partagé du
  site (posé par-dessus, dans app/partenaire-agree/page.tsx) remplace la
  barre de navigation propre à la maquette — voir le commentaire en tête
  du module CSS.

  Reveal-on-scroll (.apparait/.vu) recréé en IntersectionObserver, comme le
  script de la maquette. Le panneau de candidature reprend l'adresse email
  saisie dans le champ du heros à l'ouverture (CandidatureForm.tsx).
*/

function Apparait({
  children,
  delayIndex = 0,
  className = "",
}: {
  children: ReactNode;
  delayIndex?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [vu, setVu] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVu(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.apparait} ${vu ? styles.vu : ""} ${className}`}
      style={{ transitionDelay: `${(delayIndex % 4) * 0.07}s` }}
    >
      {children}
    </div>
  );
}

function Loupe() {
  return (
    <span className={styles.loupe}>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M5 1H1v4M9 13h4V9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function Coche() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10.5l4 4 8-9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ETAPES = [
  { titre: "Vous candidatez", texte: "Le formulaire prend dix minutes." },
  { titre: "Nous étudions", texte: "Votre société et vos capacités de livraison." },
  { titre: "Vous signez", texte: "La licence fixe le cadre de votre activité." },
  { titre: "Votre espace s'ouvre", texte: "Vos équipes, puis vos premières boutiques." },
];

const MODULES = [
  {
    couleur: "#5B34C9",
    titre: "Un back-office complet",
    texte: "Tout ce qu'une entreprise de logistique doit piloter, réuni dans une seule interface.",
  },
  {
    couleur: "#F59E0B",
    titre: "Une application pour vos livreurs",
    texte: "Simple, utilisable à une main, faite pour le terrain.",
  },
  {
    couleur: "#EC0C8C",
    titre: "Un espace dédié",
    texte: "Isolé, à votre nom, ouvert à vos seules équipes.",
  },
];

const ETIQUETTES = [
  "Commandes",
  "Livreurs",
  "Stock",
  "Finance",
  "Boutiques",
  "Support",
  "Équipes",
  "Analytique",
];

const PROFILS = [
  {
    titre: "Sociétés de livraison et de coursier",
    texte: "Vous avez une flotte et des tournées à remplir.",
    icone: (
      <path
        d="M3 21V8l7-4v17M10 21V11l10 4v6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    ),
  },
  {
    titre: "Prestataires de stockage",
    texte: "Vous voulez y ajouter la livraison et l'encaissement.",
    icone: (
      <>
        <path
          d="M3 9l9-5 9 5v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9 21v-7h6v7" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
  },
  {
    titre: "Opérateurs multi-villes",
    texte: "Plusieurs zones, ou plusieurs pays.",
    icone: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 12h18M12 3a15 15 0 010 18 15 15 0 010-18z" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
  },
  {
    titre: "Structures encore sur cahier",
    texte: "C'est exactement ce que la plateforme remplace.",
    icone: (
      <>
        <path
          d="M4 20V6a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
];

const CONDITIONS = [
  "Une entreprise enregistrée",
  "Une activité de livraison déjà en cours",
  "Des livreurs rattachés à votre société",
  "Un lieu de stockage, même modeste",
  "Un responsable joignable",
];

export default function PartenaireAgreeLanding() {
  const [ouvert, setOuvert] = useState(false);
  const [emailHeros, setEmailHeros] = useState("");

  function ouvrir() {
    setOuvert(true);
  }
  function refermer() {
    setOuvert(false);
  }

  useEffect(() => {
    if (!ouvert) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") refermer();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ouvert]);

  function handleHerosKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") ouvrir();
  }

  return (
    <div className={styles.page}>
      {/* ============================================================
          HEROS
          ============================================================ */}
      <header className={styles.heros}>
        <div className={styles.aurore} />
        <div className={styles.colonnes} />

        <div className={styles.dedans}>
          <div className={styles.grilleHeros}>
            <div>
              <h1 className={styles.titreHeros}>
                L&apos;infrastructure qui fait grandir votre logistique
              </h1>

              <p className={styles.texteHeros}>
                Rejoignez le réseau LM. Une plateforme pour piloter toute votre exploitation, et
                des e-commerçants à servir.
              </p>

              <div className={styles.champ}>
                <input
                  type="email"
                  id="email-heros"
                  placeholder="Votre adresse email"
                  aria-label="Votre adresse email"
                  value={emailHeros}
                  onChange={(event) => setEmailHeros(event.target.value)}
                  onKeyDown={handleHerosKeyDown}
                />
                <button type="button" onClick={ouvrir}>
                  Commencer maintenant
                  <svg width="7" height="11" viewBox="0 0 7 11" fill="none" aria-hidden="true">
                    <path
                      d="M1 1l4.5 4.5L1 10"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <p className={styles.sousChamp}>
                Sans engagement. Votre dossier est examiné par LM avant l&apos;ouverture de votre
                espace.
              </p>
            </div>

            {/* maquettes : tableau de bord de l'entreprise agréée */}
            <div className={styles.maquettes}>
              <div className={styles.scene}>
                <div className={styles.ordinateur}>
                  <div className={styles.barreAppli}>
                    <span className={styles.chipAppli}>
                      <span /> ENTREPRISE AGRÉÉE
                    </span>
                    <span className={styles.recherche}>
                      Rechercher une boutique, une commande, un livreur…
                    </span>
                  </div>
                  <div className={styles.corpsAppli}>
                    <h5>Vue d&apos;ensemble</h5>

                    <div className={styles.kpiRangee}>
                      <div className={styles.kpi}>
                        <label>Commandes prises en charge</label>
                        <b>1 284</b>
                        <small>Aujourd&apos;hui, 14:00</small>
                      </div>
                      <div className={styles.kpi}>
                        <label>Boutiques actives</label>
                        <b>47</b>
                        <small>+6 ce mois</small>
                      </div>
                    </div>

                    <svg viewBox="0 0 420 74" height="74" width="100%" aria-hidden="true" style={{ display: "block" }}>
                      <path
                        d="M0,60 L60,58 L110,52 L160,46 L210,30 L260,26 L310,18 L360,14 L420,10"
                        fill="none"
                        stroke="#5B34C9"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M0,68 L60,66 L110,64 L160,60 L210,56 L260,50 L310,48 L360,44 L420,42"
                        fill="none"
                        stroke="#CFC9DA"
                        strokeWidth="1.4"
                      />
                    </svg>

                    <div className={styles.cartesAppli}>
                      <div className={styles.carteAppli}>
                        <label>
                          Taux de livraison <span className={styles.hausse}>+3,1 pts</span>
                        </label>
                        <b>92,4 %</b>
                        <svg
                          viewBox="0 0 170 44"
                          height="44"
                          width="100%"
                          aria-hidden="true"
                          style={{ display: "block", marginTop: 6 }}
                        >
                          <path
                            d="M0,38 L28,32 L56,34 L84,22 L112,24 L140,12 L170,8"
                            fill="none"
                            stroke="#5B34C9"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M0,42 L28,40 L56,36 L84,34 L112,28 L140,26 L170,20"
                            fill="none"
                            stroke="#D9D3E6"
                            strokeWidth="1.4"
                          />
                        </svg>
                        <div className={styles.maj}>Sur les 30 derniers jours</div>
                      </div>
                      <div className={styles.carteAppli}>
                        <label>Livreurs en tournée</label>
                        <b>
                          23 <span style={{ fontWeight: 400, color: "#A29CB0" }}>/ 31</span>
                        </b>
                        <svg
                          viewBox="0 0 170 44"
                          height="44"
                          width="100%"
                          aria-hidden="true"
                          style={{ display: "block", marginTop: 6 }}
                        >
                          <path
                            d="M0,36 L28,30 L56,32 L84,20 L112,18 L140,10 L170,6"
                            fill="none"
                            stroke="#EC0C8C"
                            strokeWidth="1.6"
                          />
                        </svg>
                        <div className={styles.maj}>Mis à jour maintenant</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.telephone}>
                  <div className={styles.enteteTel}>
                    <span className={styles.carre} /> ENTREPRISE AGRÉÉE
                  </div>
                  <div className={styles.telSous}>Aujourd&apos;hui</div>

                  <div className={styles.grandNombre}>1 284</div>
                  <div className={styles.legendeTel}>commandes prises en charge</div>

                  <svg
                    viewBox="0 0 168 40"
                    height="40"
                    width="100%"
                    aria-hidden="true"
                    style={{ display: "block", margin: "10px 0 14px" }}
                  >
                    <rect x="2" y="24" width="14" height="16" rx="2" fill="#DCD7E6" />
                    <rect x="24" y="19" width="14" height="21" rx="2" fill="#DCD7E6" />
                    <rect x="46" y="22" width="14" height="18" rx="2" fill="#DCD7E6" />
                    <rect x="68" y="13" width="14" height="27" rx="2" fill="#5B34C9" />
                    <rect x="90" y="16" width="14" height="24" rx="2" fill="#DCD7E6" />
                    <rect x="112" y="8" width="14" height="32" rx="2" fill="#5B34C9" />
                    <rect x="134" y="4" width="14" height="36" rx="2" fill="#EC0C8C" />
                  </svg>

                  <div className={styles.ligneStat}>
                    <span>Boutiques actives</span>
                    <b>47</b>
                  </div>
                  <div className={styles.ligneStat}>
                    <span>Livreurs en tournée</span>
                    <b>23</b>
                  </div>
                  <div className={styles.ligneStat}>
                    <span>Taux de livraison</span>
                    <b>92,4 %</b>
                  </div>
                  <div className={styles.ligneStat}>
                    <span>En attente</span>
                    <b>18</b>
                  </div>

                  <button className={styles.boutonTel} type="button" style={{ marginTop: 13 }}>
                    Voir le détail
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* copie du titre et du texte, recolorée sous la diagonale */}
        <div className={styles.calque} aria-hidden="true">
          <div className={styles.dedans}>
            <div className={styles.grilleHeros}>
              <div>
                <h1 className={styles.titreHeros}>
                  L&apos;infrastructure qui fait grandir votre logistique
                </h1>
                <p className={styles.texteHeros}>
                  Rejoignez le réseau LM. Une plateforme pour piloter toute votre exploitation, et
                  des e-commerçants à servir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          POURQUOI DEVENIR PARTENAIRE AGREE
          ============================================================ */}
      <section className={styles.bandeClaire} id="pourquoi">
        <div className={styles.section}>
          <Apparait>
            <p className={styles.oeil}>Pourquoi devenir partenaire agréé</p>
            <h2 className={styles.h2}>
              Un logiciel, ce n&apos;est qu&apos;une moitié. L&apos;autre, c&apos;est le réseau.
            </h2>
            <p className={styles.chapeau}>
              LM équipe votre exploitation et vous met en relation avec des e-commerçants. Les
              deux ensemble, pas l&apos;un sans l&apos;autre.
            </p>
          </Apparait>

          <div className={styles.cartes}>
            <Apparait delayIndex={0} className={styles.carte}>
              <Loupe />
              <h3>Des boutiques, pas seulement un outil</h3>
              <p>
                Le réseau vous met en relation avec des e-commerçants qui cherchent un partenaire
                logistique.
              </p>
              <div className={styles.demo}>
                <div className={styles.listeBoutiques}>
                  <div className={styles.rang}>
                    <i /> Evan store <small>Électronique</small>
                  </div>
                  <div className={styles.rang}>
                    <i /> Maison Adjo <small>Cosmétique</small>
                  </div>
                  <div className={`${styles.rang} ${styles.pale}`}>
                    <i /> Kayo Sport <small>Sport</small>
                  </div>
                </div>
              </div>
            </Apparait>

            <Apparait delayIndex={1} className={styles.carte}>
              <Loupe />
              <h3>Toute l&apos;exploitation au même endroit</h3>
              <p>Commandes, livreurs, stock et comptes dans une seule interface, en temps réel.</p>
              <div className={styles.demo}>
                <div className={styles.tuiles}>
                  <div className={styles.tuile}>
                    <b>Commandes</b>
                    <span>en temps réel</span>
                  </div>
                  <div className={styles.tuile}>
                    <b>Livreurs</b>
                    <span>sur le terrain</span>
                  </div>
                  <div className={styles.tuile}>
                    <b>Stock</b>
                    <span>multi-entrepôts</span>
                  </div>
                </div>
              </div>
            </Apparait>

            <Apparait delayIndex={2} className={styles.carte}>
              <Loupe />
              <h3>L&apos;encaissement est intégré</h3>
              <p>
                Les paiements locaux sont encaissés puis reversés par la plateforme. Vous
                n&apos;avancez rien.
              </p>
              <div className={styles.demo}>
                <div className={styles.barreFonds}>
                  <div className={styles.piste}>
                    <div className={styles.part} style={{ width: "68%" }} />
                  </div>
                  <div className={styles.legende}>
                    <span>Encaissé</span>
                    <span>Reversé</span>
                  </div>
                </div>
              </div>
            </Apparait>

            <Apparait delayIndex={3} className={styles.carte}>
              <Loupe />
              <h3>Votre espace n&apos;est qu&apos;à vous</h3>
              <p>
                Vos boutiques, vos équipes et vos données restent dans votre environnement,
                séparées des autres partenaires.
              </p>
              <div className={styles.demo}>
                <div className={styles.tuiles}>
                  <div className={styles.tuile}>
                    <b>Vous</b>
                    <span>votre espace</span>
                  </div>
                  <div className={styles.tuile} style={{ opacity: 0.4 }}>
                    <b>—</b>
                    <span>autre partenaire</span>
                  </div>
                  <div className={styles.tuile} style={{ opacity: 0.4 }}>
                    <b>—</b>
                    <span>autre partenaire</span>
                  </div>
                </div>
              </div>
            </Apparait>
          </div>
        </div>
      </section>

      {/* ============================================================
          COMMENT REJOINDRE NOTRE RESEAU
          ============================================================ */}
      <section className={styles.section} id="rejoindre">
        <Apparait>
          <p className={styles.oeil}>Comment rejoindre notre réseau de partenaires</p>
          <h2 className={styles.h2}>Quatre étapes, dans cet ordre.</h2>
          <p className={styles.chapeau}>Rien ne s&apos;ouvre avant que votre dossier soit examiné.</p>
        </Apparait>

        <div className={styles.etapes}>
          {ETAPES.map((etape, index) => (
            <Apparait key={etape.titre} delayIndex={index} className={styles.etape}>
              <div className={styles.num}>{index + 1}</div>
              <h3>{etape.titre}</h3>
              <p>{etape.texte}</p>
            </Apparait>
          ))}
        </div>
      </section>

      {/* ============================================================
          CE QUE LM MET A VOTRE DISPOSITION
          ============================================================ */}
      <section className={styles.sombre} id="dispositif">
        <div className={styles.section}>
          <Apparait>
            <p className={styles.oeil}>Ce que LM met à votre disposition</p>
            <h2 className={styles.h2} style={{ color: "var(--lavande)" }}>
              Une solution SaaS B2B2B.
            </h2>
            <p className={styles.chapeau}>
              LM édite la plateforme. Vous l&apos;exploitez sous votre nom, avec vos équipes et
              vos clients.
            </p>
          </Apparait>

          <div className={styles.modules}>
            {MODULES.map((module, index) => (
              <Apparait key={module.titre} delayIndex={index} className={styles.module}>
                <span className={styles.marqueCouleur} style={{ background: module.couleur }} />
                <h3>{module.titre}</h3>
                <p>{module.texte}</p>
              </Apparait>
            ))}
          </div>

          <Apparait className={styles.etiquettes}>
            {ETIQUETTES.map((etiquette) => (
              <span key={etiquette}>{etiquette}</span>
            ))}
          </Apparait>
        </div>
      </section>

      {/* ============================================================
          QUI PEUT DEVENIR PARTENAIRE
          ============================================================ */}
      <section className={styles.bandeClaire} id="qui">
        <div className={styles.section}>
          <Apparait>
            <p className={styles.oeil}>Qui peut devenir partenaire</p>
            <h2 className={styles.h2}>
              Une entreprise qui livre déjà, et qui veut livrer davantage.
            </h2>
            <p className={styles.chapeau}>
              LM ne remplace pas votre métier. Elle l&apos;outille et lui amène des clients.
            </p>
          </Apparait>

          <div className={styles.deuxColonnes}>
            <Apparait>
              {PROFILS.map((profil) => (
                <div key={profil.titre} className={styles.profil}>
                  <span className={styles.rond}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      {profil.icone}
                    </svg>
                  </span>
                  <div>
                    <h3>{profil.titre}</h3>
                    <p>{profil.texte}</p>
                  </div>
                </div>
              ))}
            </Apparait>

            <Apparait className={styles.conditions}>
              <h3>Ce que nous vérifions</h3>
              <ul>
                {CONDITIONS.map((condition) => (
                  <li key={condition}>
                    <Coche /> {condition}
                  </li>
                ))}
              </ul>
              <p className={styles.noteConditions}>
                Ces points ne sont pas éliminatoires un par un.
              </p>
            </Apparait>
          </div>
        </div>
      </section>

      {/* ============================================================
          BANDE FINALE
          ============================================================ */}
      <section className={styles.bandeFinale}>
        <div className={styles.section}>
          <h2>Votre prochaine boutique vous attend déjà sur la plateforme.</h2>
          <p>
            Déposez votre candidature. Nous revenons vers vous avec une réponse claire, et les
            étapes suivantes.
          </p>
          <button className={styles.boutonBlanc} type="button" onClick={ouvrir}>
            Déposer ma candidature
            <svg width="8" height="12" viewBox="0 0 7 11" fill="none" aria-hidden="true">
              <path
                d="M1 1l4.5 4.5L1 10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* ============================================================
          FORMULAIRE DE CANDIDATURE
          ============================================================ */}
      <div
        className={`${styles.voile} ${ouvert ? styles.ouvert : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-formulaire"
        onClick={(event) => {
          if (event.target === event.currentTarget) refermer();
        }}
      >
        <div className={styles.panneau}>
          <button className={styles.fermer} type="button" onClick={refermer} aria-label="Fermer">
            ×
          </button>
          <CandidatureForm open={ouvert} initialEmail={emailHeros} />
        </div>
      </div>

      {/* ============================================================
          PIED DE PAGE
          ============================================================ */}
      <footer className={styles.pied}>
        <div className={styles.piedHaut}>
          <div>
            <h3>
              Parlons de votre <em>PROJET</em>
            </h3>
            <p className={styles.accroche}>
              Une question, un projet de partenariat ?
              <br />
              Notre équipe vous répond rapidement.
            </p>
          </div>
          <div>
            <h4>S&apos;abonner</h4>
            <p className={styles.info}>
              Restez informé des nouvelles fonctionnalités et mises à jour de notre plateforme.
            </p>
            <div className={styles.abo}>
              <input type="email" placeholder="Votre adresse email" aria-label="Votre adresse email" />
              <button type="button">S&apos;abonner</button>
            </div>
            <p className={styles.legal}>
              En vous abonnant, vous acceptez notre politique de confidentialité et consentez à
              recevoir nos communications.
            </p>
          </div>
        </div>
        <div className={styles.piedBas}>
          <span>© 2026 <Wordmark />. Tous droits réservés.</span>
          <nav>
            <Link href="/politique-confidentialite">Politique confidentialité</Link>
            <Link href="/conditions-utilisation">Conditions d&apos;utilisation</Link>
            <Link href="/cookies">Paramètres cookies</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

"use client";

import ScrollReveal from "./ScrollReveal";

export default function Features() {
  return (
    <ScrollReveal
      dataSection
      dataTitre="Vos flux financiers se simplifient"
      dataSous="Encaissé automatiquement, par les moyens de paiement locaux."
      className="py-33 px-7 max-w-[1500px] mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-center">
        <svg viewBox="0 0 900 620" aria-hidden="true">
          <defs>
            <symbol id="billet" viewBox="0 0 26 14">
              <rect x="1" y="1" width="24" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="13" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5 5v4M21 5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </symbol>
            <symbol id="globe" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="15" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <ellipse cx="17" cy="17" rx="6.4" ry="15" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M2.6 12h28.8M2.6 22h28.8M17 2v30" stroke="currentColor" strokeWidth="1.7" />
            </symbol>
            <symbol id="boutique-feat" viewBox="0 0 34 30">
              <path d="M4 10h26v17H4z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M2 4h30l2 6H0z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M9 14h16M9 19h16M9 24h16" stroke="currentColor" strokeWidth="2" />
            </symbol>
            <symbol id="immeuble-feat" viewBox="0 0 30 30">
              <path d="M4 27V9l9-5v23M13 27V13l13 5v9z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M7.5 13h2M7.5 18h2M17.5 20h2M21.5 21h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </symbol>
          </defs>

          <text x="20" y="46" fill="#FAF7FC" fontSize="17" letterSpacing="1.4">AUTRE PAYS</text>
          <g color="#EC0C8C">
            <rect x="42" y="76" width="56" height="56" rx="12" fill="rgba(236,12,140,.08)" stroke="rgba(236,12,140,.45)" />
            <use href="#boutique-feat" x="55" y="90" width="30" height="27" />
          </g>
          <g color="#FAF7FC"><use href="#globe" x="53" y="152" width="34" height="34" /></g>

          <text x="490" y="46" fill="#FAF7FC" fontSize="17" letterSpacing="1.4">CÔTE D&apos;IVOIRE</text>
          <g color="#8B6BE8">
            <rect x="540" y="76" width="56" height="56" rx="12" fill="rgba(109,63,214,.10)" stroke="rgba(109,63,214,.5)" />
            <use href="#immeuble-feat" x="554" y="90" width="28" height="28" />
          </g>
          <g color="#FAF7FC"><use href="#globe" x="551" y="152" width="34" height="34" /></g>

          <text x="250" y="126" fill="rgba(250,247,252,.34)" fontSize="30">Cash</text>
          <path id="flux-1" className="flow-path" d="M170,208 C244,208 266,132 340,128 C414,124 428,166 502,162" fill="none" stroke="#4C8B4A" strokeWidth="2.4" />
          <g color="rgba(250,247,252,.6)">
            {[0, 1.5, 2.9].map((begin, i) => (
              <use key={i} href="#billet" width="26" height="14" x="-13" y="-7">
                <animateMotion dur="4.4s" repeatCount="indefinite" begin={`${begin}s`}>
                  <mpath href="#flux-1" />
                </animateMotion>
              </use>
            ))}
          </g>

          <text x="20" y="336" fill="#FAF7FC" fontSize="17" letterSpacing="1.4">CÔTE D&apos;IVOIRE</text>
          <g color="#8B6BE8">
            <rect x="42" y="366" width="56" height="56" rx="12" fill="rgba(109,63,214,.10)" stroke="rgba(109,63,214,.5)" />
            <use href="#immeuble-feat" x="56" y="380" width="28" height="28" />
          </g>
          <g color="#FAF7FC"><use href="#globe" x="53" y="442" width="34" height="34" /></g>

          <text x="490" y="336" fill="#FAF7FC" fontSize="17" letterSpacing="1.4">AUTRE PAYS</text>
          <g color="#EC0C8C">
            <rect x="540" y="366" width="56" height="56" rx="12" fill="rgba(236,12,140,.08)" stroke="rgba(236,12,140,.45)" />
            <use href="#boutique-feat" x="553" y="380" width="30" height="27" />
          </g>
          <g color="#FAF7FC"><use href="#globe" x="551" y="442" width="34" height="34" /></g>

          <text x="250" y="416" fill="rgba(250,247,252,.34)" fontSize="30">Cash</text>
          <path id="flux-2" className="flow-path" d="M170,498 C244,498 266,422 340,418 C414,414 428,456 502,452" fill="none" stroke="#4C8B4A" strokeWidth="2.4" />
          <g color="rgba(250,247,252,.6)">
            {[0.7, 2.2, 3.6].map((begin, i) => (
              <use key={i} href="#billet" width="26" height="14" x="-13" y="-7">
                <animateMotion dur="4.4s" repeatCount="indefinite" begin={`${begin}s`}>
                  <mpath href="#flux-2" />
                </animateMotion>
              </use>
            ))}
          </g>
        </svg>

        <div className="telephone">
          <div className="ecran">
            <div className="encoche" />
            <div className="rail phone-carousel">
              <div className="vue">
                <div className="coche phone-sparkle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#FAF7FC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>Votre commande<br />a bien été effectuée</h4>
                <p>Cliquez sur le lien pour<br />suivre votre commande</p>
                <div className="lien-suivi">
                  track.liivremoi.com/CMD-2034-YOP
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M5 9l4-4M6 3h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div className="vue">
                <h4 style={{ marginBottom: 6 }}>Suivi de commande</h4>
                <div className="etape faite"><i /> Commande confirmée</div>
                <div className="etape faite"><i /> Colis pris en charge</div>
                <div className="etape faite"><i /> En cours de livraison</div>
                <div className="etape"><i /> Paiement à la réception</div>
                <div className="moyen">Mobile money <span>›</span></div>
                <div className="moyen">Carte bancaire <span>›</span></div>
              </div>

              <div className="vue">
                <p>Montant débité</p>
                <div className="montant">24 500 F</div>
                <div className="debite">Paiement confirmé</div>
                <p style={{ marginTop: 10 }}>Le vendeur est crédité<br />automatiquement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
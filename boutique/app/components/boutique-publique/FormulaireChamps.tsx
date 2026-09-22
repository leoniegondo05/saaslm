"use client";

import { useMemo, useState } from "react";
import * as DrapeauxSvg from "country-flag-icons/react/3x2";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import type { FormulaireState } from "@/app/components/dashboard-reglages/personnaliser/types";
import { LuCheck, LuChevronDown, LuMapPin, LuPhone, LuSearch, LuUser } from "react-icons/lu";
import type { IconType } from "react-icons";

/*
  Champs "Vos informations" (nom, commune, adresse précise, téléphone) —
  port fidèle de FormulaireChampsApercu dans BoutiquePreview.tsx : liste
  d'indicatifs complète (libphonenumber-js + drapeaux SVG locaux, jamais un
  emoji ni une image distante — cf. commentaire d'origine sur le CSP
  img-src), "Me localiser" (géolocalisation réelle du navigateur, comme dans
  l'éditeur), commune recherchable, note pour le livreur optionnelle.

  Contrairement à l'éditeur (état local, aperçu non fonctionnel), les
  valeurs remontent au parent (CommandeClient.tsx) via `valeurs`/`onChange`
  pour que la commande réellement envoyée contienne ce que le client a
  saisi.
*/

const COMMUNES_CI = ["Abobo", "Adjamé", "Anyama", "Attécoubé", "Bingerville", "Cocody", "Koumassi", "Marcory"];
const VILLES_HORS_ABIDJAN = ["Bouaké", "Yamoussoukro", "Daloa", "San-Pédro", "Korhogo", "Man", "Gagnoa", "Abengourou"];
const NOMS_PAYS_FR = new Intl.DisplayNames(["fr"], { type: "region" });
const INDICATIFS = getCountries()
  .filter((code) => code in DrapeauxSvg)
  .map((code) => ({ pays: NOMS_PAYS_FR.of(code) ?? code, code: `+${getCountryCallingCode(code)}`, drapeau: code }))
  .sort((a, b) => a.pays.localeCompare(b.pays, "fr"));
const INDICATIF_DEFAUT = INDICATIFS.find((i) => i.drapeau === "CI") ?? INDICATIFS[0];

function IconeDrapeau({ code, className }: { code: string; className: string }) {
  const Drapeau = DrapeauxSvg[code as keyof typeof DrapeauxSvg];
  return Drapeau ? <Drapeau className={className} /> : null;
}

export type ZoneLivraison = "" | "abidjan" | "hors-abidjan";

export type ValeursFormulaire = {
  nomPrenom: string;
  zone: ZoneLivraison;
  commune: string;
  adressePrecise: string;
  ville: string;
  nomGare: string;
  indicatif: string;
  telephone: string;
  note: string;
};

export const VALEURS_FORMULAIRE_VIDES: ValeursFormulaire = {
  nomPrenom: "",
  zone: "",
  commune: "",
  adressePrecise: "",
  ville: "",
  nomGare: "",
  indicatif: INDICATIF_DEFAUT.code,
  telephone: "",
  note: "",
};

export default function FormulaireChamps({
  f,
  valeurs,
  onChange,
}: {
  f: FormulaireState;
  valeurs: ValeursFormulaire;
  onChange: (v: ValeursFormulaire) => void;
}) {
  const [communeOuverte, setCommuneOuverte] = useState(false);
  const [communeRecherche, setCommuneRecherche] = useState("");
  const [villeOuverte, setVilleOuverte] = useState(false);
  const [villeRecherche, setVilleRecherche] = useState("");
  const [geoloc, setGeoloc] = useState<"repos" | "recherche" | "trouvee" | "refusee">("repos");
  const [adresseModifiable, setAdresseModifiable] = useState(false);
  const [indicatifOuvert, setIndicatifOuvert] = useState(false);
  const [indicatifRecherche, setIndicatifRecherche] = useState("");

  const indicatifChoisi = INDICATIFS.find((i) => i.code === valeurs.indicatif) ?? INDICATIF_DEFAUT;
  const indicatifsFiltres = useMemo(() => {
    const q = indicatifRecherche.trim().toLowerCase();
    if (!q) return INDICATIFS;
    return INDICATIFS.filter((ind) => ind.pays.toLowerCase().includes(q) || ind.code.includes(q));
  }, [indicatifRecherche]);
  const communesFiltrees = COMMUNES_CI.filter((c) => c.toLowerCase().includes(communeRecherche.toLowerCase()));
  const villesFiltrees = VILLES_HORS_ABIDJAN.filter((v) => v.toLowerCase().includes(villeRecherche.toLowerCase()));

  const maj = (patch: Partial<ValeursFormulaire>) => onChange({ ...valeurs, ...patch });

  const boiteBase = f.styleChamps === "ligne" ? "rounded-none border-0 border-b" : f.styleChamps === "plein" ? "rounded-xl border-0" : "rounded-xl border";
  const boiteClasses = `${boiteBase} px-3.5 py-3 lg:px-3 lg:py-2`;
  const boiteStyle = (actif?: boolean): React.CSSProperties =>
    f.styleChamps === "plein"
      ? { background: actif ? "color-mix(in srgb, var(--ac) 8%, transparent)" : "color-mix(in srgb, var(--tx) 5%, transparent)" }
      : { borderColor: actif ? "var(--ac)" : "color-mix(in srgb, var(--tx) 14%, transparent)" };
  const libelleDansChamp = f.libellesPosition === "dans-le-champ";
  const libelle = (texte: string) => libelleDansChamp && <p className="text-[10.5px] text-[var(--tx)]/45">{texte}</p>;
  const labelExterne = (texte: string) => !libelleDansChamp && <p className="mb-1 text-[12.5px] font-medium text-[var(--tx)]/60">{texte}</p>;
  const iconeChamp = (IconeChamp: IconType) => f.iconesDansChamps && <IconeChamp color="color-mix(in srgb, var(--tx) 35%, transparent)" size={15} />;
  const iconePersonne = LuUser;
  const iconeLieu = LuMapPin;

  function localiser() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoloc("refusee");
      return;
    }
    setGeoloc("recherche");
    navigator.geolocation.getCurrentPosition(
      () => {
        setGeoloc("trouvee");
        maj({ adressePrecise: valeurs.adressePrecise || "Position actuelle du téléphone" });
      },
      () => setGeoloc("refusee")
    );
  }

  return (
    <>
      <div className={`grid gap-3 lg:gap-2 ${f.colonnes === 2 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        <div className="col-span-full">
          {labelExterne("Nom et prénom")}
          <div className={boiteClasses} style={boiteStyle()}>
            <div className="flex items-center gap-2">
              {iconeChamp(iconePersonne)}
              <div className="min-w-0 flex-1">
                {libelleDansChamp && libelle("Nom et prénom")}
                <input
                  required
                  value={valeurs.nomPrenom}
                  onChange={(e) => maj({ nomPrenom: e.target.value })}
                  placeholder={libelleDansChamp ? "" : "Nom et prénom"}
                  autoComplete="name"
                  className={`w-full bg-transparent text-[13.5px] outline-none ${libelleDansChamp ? "mt-0.5" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-full grid grid-cols-2 gap-3">
          {(
            [
              ["abidjan", "Je suis à Abidjan"],
              ["hors-abidjan", "Je suis hors Abidjan"],
            ] as const
          ).map(([valeurZone, texte]) => (
            <button
              key={valeurZone}
              type="button"
              onClick={() => maj({ zone: valeurZone, commune: "", adressePrecise: "", ville: "", nomGare: "" })}
              className={`${boiteClasses} text-center text-[13px] font-semibold`}
              style={boiteStyle(valeurs.zone === valeurZone)}
            >
              {texte}
            </button>
          ))}
        </div>

        {valeurs.zone === "abidjan" && (
          <>
            <div className={f.colonnes === 2 ? "" : "col-span-full"}>
              {labelExterne("Commune")}
              <div className="relative">
                <button type="button" onClick={() => setCommuneOuverte((v) => !v)} className={`w-full text-left ${boiteClasses}`} style={boiteStyle(communeOuverte)}>
                  <div className="flex items-center gap-2">
                    {iconeChamp(iconeLieu)}
                    <div className="min-w-0 flex-1">
                      {libelle("Commune")}
                      <span className="flex items-center justify-between gap-1">
                        <span className="truncate text-[13.5px]" style={{ color: valeurs.commune ? "var(--tx)" : "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
                          {valeurs.commune || "Choisir"}
                        </span>
                        <LuChevronDown color="color-mix(in srgb, var(--tx) 30%, transparent)" size={14} />
                      </span>
                    </div>
                  </div>
                </button>
                {communeOuverte && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[220px] overflow-y-auto rounded-xl border border-[var(--tx)]/10 bg-[var(--bg)] shadow-lg">
                    <div className="flex items-center gap-2 border-b border-[var(--tx)]/8 px-3 py-2.5">
                      <LuSearch color="color-mix(in srgb, var(--tx) 30%, transparent)" size={15} />
                      <input
                        value={communeRecherche}
                        onChange={(e) => setCommuneRecherche(e.target.value)}
                        placeholder="Rechercher une commune"
                        className="w-full bg-transparent text-[13px] outline-none"
                        autoFocus
                      />
                    </div>
                    {communesFiltrees.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          maj({ commune: c });
                          setCommuneOuverte(false);
                          setCommuneRecherche("");
                        }}
                        className="block w-full px-3 py-2 text-left text-[13px]"
                        style={c === valeurs.commune ? { background: "color-mix(in srgb, var(--ac) 10%, transparent)", color: "var(--ac)", fontWeight: 600 } : undefined}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={f.colonnes === 2 ? "" : "col-span-full"}>
              {labelExterne(f.libelleAdressePrecise)}
              <div className={boiteClasses} style={boiteStyle()}>
                <div className="flex items-center gap-2">
                  {iconeChamp(iconeLieu)}
                  <div className="min-w-0 flex-1">
                    {libelleDansChamp && libelle(f.libelleAdressePrecise)}
                    {adresseModifiable || geoloc !== "trouvee" ? (
                      <input
                        required
                        value={valeurs.adressePrecise}
                        onChange={(e) => maj({ adressePrecise: e.target.value })}
                        onBlur={() => setAdresseModifiable(false)}
                        placeholder={f.texteExempleAdressePrecise}
                        className={`w-full bg-transparent text-[13.5px] outline-none ${libelleDansChamp ? "mt-0.5" : ""}`}
                      />
                    ) : (
                      <span className="mt-0.5 flex items-center justify-between gap-1">
                        <span className="flex items-center gap-1.5 truncate text-[13.5px]">
                          {!f.iconesDansChamps && <LuMapPin color="var(--ac)" size={14} />}
                          {valeurs.adressePrecise}
                        </span>
                        <button type="button" onClick={() => setAdresseModifiable(true)} className="shrink-0 text-[12px] font-semibold underline" style={{ color: "var(--ac)" }}>
                          Modifier
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {valeurs.zone === "hors-abidjan" && (
          <>
            <div className={f.colonnes === 2 ? "" : "col-span-full"}>
              {labelExterne("Ville")}
              <div className="relative">
                <button type="button" onClick={() => setVilleOuverte((v) => !v)} className={`w-full text-left ${boiteClasses}`} style={boiteStyle(villeOuverte)}>
                  <div className="flex items-center gap-2">
                    {iconeChamp(iconeLieu)}
                    <div className="min-w-0 flex-1">
                      {libelle("Ville")}
                      <span className="flex items-center justify-between gap-1">
                        <span className="truncate text-[13.5px]" style={{ color: valeurs.ville ? "var(--tx)" : "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
                          {valeurs.ville || "Choisir"}
                        </span>
                        <LuChevronDown color="color-mix(in srgb, var(--tx) 30%, transparent)" size={14} />
                      </span>
                    </div>
                  </div>
                </button>
                {villeOuverte && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[220px] overflow-y-auto rounded-xl border border-[var(--tx)]/10 bg-[var(--bg)] shadow-lg">
                    <div className="flex items-center gap-2 border-b border-[var(--tx)]/8 px-3 py-2.5">
                      <LuSearch color="color-mix(in srgb, var(--tx) 30%, transparent)" size={15} />
                      <input
                        value={villeRecherche}
                        onChange={(e) => setVilleRecherche(e.target.value)}
                        placeholder="Rechercher une ville"
                        className="w-full bg-transparent text-[13px] outline-none"
                        autoFocus
                      />
                    </div>
                    {villesFiltrees.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          maj({ ville: v });
                          setVilleOuverte(false);
                          setVilleRecherche("");
                        }}
                        className="block w-full px-3 py-2 text-left text-[13px]"
                        style={v === valeurs.ville ? { background: "color-mix(in srgb, var(--ac) 10%, transparent)", color: "var(--ac)", fontWeight: 600 } : undefined}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={f.colonnes === 2 ? "" : "col-span-full"}>
              {labelExterne("Nom de la gare")}
              <div className={boiteClasses} style={boiteStyle()}>
                <div className="flex items-center gap-2">
                  {iconeChamp(iconeLieu)}
                  <div className="min-w-0 flex-1">
                    {libelleDansChamp && libelle("Nom de la gare")}
                    <input
                      required
                      value={valeurs.nomGare}
                      onChange={(e) => maj({ nomGare: e.target.value })}
                      placeholder={libelleDansChamp ? "" : "Nom de la gare"}
                      className={`w-full bg-transparent text-[13.5px] outline-none ${libelleDansChamp ? "mt-0.5" : ""}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="col-span-full">
          {labelExterne("Téléphone")}
          <div className={`relative flex ${boiteBase}`} style={boiteStyle()}>
            {f.iconesDansChamps && (
              <span className="flex shrink-0 items-center pl-3">
                <LuPhone color="color-mix(in srgb, var(--tx) 30%, transparent)" size={15} />
              </span>
            )}
            <button type="button" onClick={() => setIndicatifOuvert((v) => !v)} className="flex shrink-0 items-center gap-1.5 border-r border-[var(--tx)]/12 px-3 py-3 lg:px-2.5 lg:py-2">
              <IconeDrapeau code={indicatifChoisi.drapeau} className="h-[11px] w-4 rounded-[2px] object-cover" />
              <span className="text-[13px] font-semibold">{indicatifChoisi.code}</span>
              <LuChevronDown color="color-mix(in srgb, var(--tx) 30%, transparent)" size={13} />
            </button>
            <input
              required
              type="tel"
              value={valeurs.telephone}
              onChange={(e) => maj({ telephone: e.target.value.replace(/[^\d\s]/g, "") })}
              placeholder="Numéro de téléphone"
              autoComplete="tel"
              className="flex-1 bg-transparent px-3.5 py-3 text-[13.5px] outline-none lg:px-3 lg:py-2"
            />
            {indicatifOuvert && (
              <div className="absolute left-0 top-full z-30 mt-1 w-[260px] overflow-hidden rounded-xl border border-[var(--tx)]/10 bg-[var(--bg)] shadow-lg">
                <div className="flex items-center gap-2 border-b border-[var(--tx)]/8 px-3 py-2.5">
                  <LuSearch color="color-mix(in srgb, var(--tx) 30%, transparent)" size={15} />
                  <input
                    value={indicatifRecherche}
                    onChange={(e) => setIndicatifRecherche(e.target.value)}
                    placeholder="Rechercher un pays"
                    className="w-full bg-transparent text-[13px] outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-[220px] overflow-y-auto">
                  {indicatifsFiltres.map((ind) => (
                    <button
                      key={ind.drapeau}
                      type="button"
                      onClick={() => {
                        maj({ indicatif: ind.code });
                        setIndicatifOuvert(false);
                        setIndicatifRecherche("");
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px]"
                      style={ind.drapeau === indicatifChoisi.drapeau ? { background: "color-mix(in srgb, var(--ac) 10%, transparent)", color: "var(--ac)", fontWeight: 600 } : undefined}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <IconeDrapeau code={ind.drapeau} className="h-[11px] w-4 shrink-0 rounded-[2px] object-cover" />
                        <span className="truncate">{ind.pays}</span>
                      </span>
                      <span className="shrink-0 font-figures">{ind.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {valeurs.zone === "abidjan" && f.boutonLocaliser &&
        (geoloc === "trouvee" ? (
          <>
            <div className="relative mt-2.5 overflow-hidden rounded-xl" style={{ height: 84 }}>
              <svg viewBox="0 0 300 84" preserveAspectRatio="none" className="block h-full w-full">
                <rect width="300" height="84" fill="#EAE3D2" />
                <rect x="0" y="14" width="300" height="9" fill="#F6F1E5" />
                <rect x="46" y="0" width="9" height="84" fill="#F6F1E5" />
                <rect x="130" y="0" width="11" height="84" fill="#F6F1E5" />
                <rect x="0" y="56" width="300" height="7" fill="#F6F1E5" />
                <rect x="205" y="0" width="9" height="84" fill="#F6F1E5" />
                <path d="M215 84 L300 40 L300 84 Z" fill="#C2DBE6" />
                <rect x="64" y="25" width="24" height="20" fill="#DED4BC" />
                <rect x="155" y="60" width="26" height="18" fill="#DED4BC" />
              </svg>
              <span className="absolute left-1/2 top-1/2 h-2.5 w-5 -translate-x-1/2 rounded-full" style={{ background: "rgba(0,0,0,.16)", filter: "blur(1.5px)", marginTop: 11 }} />
              <svg viewBox="0 0 24 30" className="absolute left-1/2 top-1/2 h-7 w-6 -translate-x-1/2 -translate-y-[85%]" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }}>
                <path d="M12 0C5.4 0 0 5.3 0 11.8 0 20.6 12 30 12 30s12-9.4 12-18.2C24 5.3 18.6 0 12 0Z" fill="var(--ac)" />
                <circle cx="12" cy="11.5" r="4.5" fill="#fff" />
              </svg>
            </div>
            <div className="mt-2.5 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[12.5px] font-semibold" style={{ borderColor: "#1E9E6A", color: "#1E9E6A", background: "color-mix(in srgb, #1E9E6A 6%, transparent)" }}>
              <LuCheck color="#1E9E6A" size={15} />
              <span>
                Position trouvée
                <br />
                <span className="font-normal opacity-80">Adresse précise remplie</span>
              </span>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={localiser}
            className="mt-2.5 flex w-full items-center gap-2 rounded-xl border border-dashed px-3.5 py-2.5 text-[13px] font-semibold lg:px-3 lg:py-2"
            style={{ borderColor: "var(--ac)", color: "var(--ac)" }}
          >
            <LuMapPin color="var(--ac)" size={16} />
            {geoloc === "recherche" ? "Recherche en cours…" : "Me localiser maintenant"}
          </button>
        ))}
      {valeurs.zone === "abidjan" && geoloc === "refusee" && <p className="mt-2 text-[12px]" style={{ color: "#D8347E" }}>Position indisponible, remplis l&apos;adresse précise à la main.</p>}
      {f.mentionSpecifique && (
        <label className="mt-2.5 block">
          <input
            value={valeurs.note}
            onChange={(e) => maj({ note: e.target.value })}
            placeholder={
              f.mentionType === "choix" ? "Une précision pour le livreur (facultatif)" : f.mentionType === "date" ? "Une date à préciser pour le livreur ? (facultatif)" : "Une précision pour le livreur ? (facultatif)"
            }
            className="w-full rounded-xl border border-[var(--tx)]/12 px-3.5 py-2.5 text-[13px] outline-none placeholder:text-[var(--tx)]/45 lg:px-3 lg:py-2"
          />
        </label>
      )}
    </>
  );
}

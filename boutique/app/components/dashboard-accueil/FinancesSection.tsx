"use client";

import PaymentMethodCard from "../PaymentMethodCard";
import { Bar, Card, Divider, LegendRow, MiniStat, SectionHeader, StatRow, Tag } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Finances" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx pour que ce dernier ne soit plus qu'un
  orchestrateur (cf. FinancesSection/CommandesSection/... + AccueilNav).
*/

/*
  Mini graphe en barres (jour par jour) — même principe que l'ancien
  graphe "chiffre d'affaires" : pas de librairie de charts, juste des
  <span> de hauteur proportionnelle. Réutilisé pour la trésorerie et la
  projection à 30 jours (cf. écran "Accueil · Finance" envoyé).
*/
function MiniBars({ values, highlightColor = "#EC0C8C" }: { values: number[]; highlightColor?: string }) {
  const max = Math.max(...values);
  return (
    <div className="mt-3 flex h-16 items-end gap-[3px]">
      {values.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-t"
          style={{
            height: `${Math.max(6, (v / max) * 100)}%`,
            background: v === max ? `linear-gradient(180deg,#fff,${highlightColor})` : "var(--dashboard-text-10, rgba(20,18,32,0.12))",
          }}
        />
      ))}
    </div>
  );
}

/*
  Anneau de proportion (conic-gradient + trou central) — remplace les
  ".donut"/".ring" en SVG du document envoyé, sans librairie : un disque
  et un disque troué de la couleur de la carte par-dessus.
*/
function Ring({ pct, color, size = 96, children }: { pct: number; color: string; size?: number; children?: React.ReactNode }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="h-full w-full rounded-full"
        style={{ background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(20,18,32,0.08) ${pct * 3.6}deg)` }}
      />
      <div
        className="absolute rounded-full card-tint"
        style={{ inset: size * 0.16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      >
        {children}
      </div>
    </div>
  );
}

/*
  Barre empilée à plusieurs segments — pour "l'argent immobilisé"
  (stock déposé / suspendu / en livraison / retours), légendée juste en
  dessous avec LegendRow (couleurs partagées).
*/
function StackedBar({ segments }: { segments: { pct: number; color: string }[] }) {
  return (
    <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
      {segments.map((s, i) => (
        <span key={i} style={{ width: `${s.pct}%`, background: s.color }} />
      ))}
    </div>
  );
}

export default function FinancesSection({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();

  // 30 jours de solde disponible (cf. graphe "évolution de la trésorerie") :
  // deux paliers de fin de suspension groupée (bonds), comme sur le modèle envoyé.
  const cashDays = [42, 44, 46, 48, 51, 53, 56, 59, 62, 65, 69, 72, 76, 25, 28, 31, 34, 37, 41, 45, 49, 53, 57, 61, 65, 26, 30, 34, 38, 41];
  const forecastDays = [30, 31, 33, 32, 34, 36, 35, 38, 40, 39, 42, 44, 43, 46, 48];

  // Rangée du haut du document envoyé : le portefeuille (carte gardée) à
  // gauche, le solde du sous-compte à droite — même disposition (scw2).
  const soldeCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Solde de votre sous-compte", "Your sub-account balance")}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">1 482 300 F</p>
          </div>
          <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
        </div>
        <p className="mt-2 text-[11px] text-[var(--dashboard-text)]/50">
          {t(
            "Rien ne se demande : dès qu'un client paie, la plateforme répartit le montant entre les sous-comptes de chaque acteur. Votre part arrive sur le portefeuille de l'opérateur choisi par le client.",
            "Nothing to request: as soon as a client pays, the platform splits the amount between each party's sub-account. Your share lands on the wallet of the operator the client used."
          )}
        </p>
        <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
          <span className="h-full" style={{ width: "69%", background: "linear-gradient(90deg,#4FE0AE,#38BDF8)" }} />
          <span className="h-full" style={{ width: "31%", background: "linear-gradient(90deg,#FFB84D,#FF9A3D)" }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#4FE0AE" }} /><div><p className="font-semibold">1 022 800 F</p><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Disponible tout de suite", "Available right away")}</p></div></div>
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#FFB84D" }} /><div><p className="font-semibold">459 500 F</p><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Suspendu · délai de litige", "On hold · dispute window")}</p></div></div>
        </div>
        <Divider />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold">{t("Votre délai de suspension : 72 h", "Your hold period: 72 h")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t("C'est vous qui le fixez, jamais moins de 24 h. Passé ce délai, votre part devient disponible sans démarche.", "You set it, never under 24 h. Once it's over, your share becomes available with no action needed.")}
            </p>
          </div>
          <button type="button" className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)]/60 px-3 py-2 text-[10px] font-semibold">
            {t("Changer", "Change")}
          </button>
        </div>
      </Card>
  );

  // Deuxième bloc du document : l'évolution du solde jour par jour.
  const evolutionCard = (
      <Card title={t("Évolution de votre trésorerie", "Cash evolution")} className="!bg-[var(--dashboard-glass)]" badge={<Tag tone="neutral">{t("Les deux", "Both")}</Tag>}>
        <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Solde disponible, jour par jour, sur la période choisie", "Available balance, day by day, over the chosen period")}</p>
        <MiniBars values={cashDays} />
        <div className="mt-1 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
          <span>9 août</span><span>16 août</span><span>23 août</span><span>30 août</span><span>8 sept.</span>
        </div>
        <Divider />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label={t("Point le plus bas", "Lowest point")} value="318 000 F" />
          <MiniStat label={t("Point le plus haut", "Highest point")} value="861 000 F" />
          <MiniStat label={t("Solde moyen", "Average balance")} value="601 400 F" />
          <MiniStat label={t("Variation", "Change")} value="+87 %" tone="pink" />
        </div>
        <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
          {t("Les bonds correspondent à des fins de suspension groupées : plusieurs commandes libérées le même jour.", "The jumps are grouped hold releases: several orders freed on the same day.")}
        </p>
      </Card>
  );

  // Troisième bloc : le compte de résultat de la période.
  const compteResultatCard = (
      <Card title={t("Compte de résultat de la période", "Period P&L")} className="!bg-[var(--dashboard-glass)]" badge={<Tag tone="neutral">{t("Les deux", "Both")}</Tag>}>
        <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("De l'encaissé à ce qui vous reste réellement", "From what's collected to what's really left")}</p>
        <StatRow label={t("Encaissé des clients", "Collected from clients")} value="2 316 400 F" compact />
        <StatRow label={t("Prix produit partenaire", "Partner product price")} value="− 1 062 000 F" compact />
        <StatRow label={t("Frais logistiques", "Logistics fees")} value="− 178 500 F" compact />
        <StatRow label={t("Frais de transaction", "Transaction fees")} value="− 34 700 F" compact />
        <StatRow label={t("Garantie produit", "Product warranty")} value="− 12 400 F" compact />
        <StatRow label={t("Coût des refus", "Cost of refusals")} value="− 31 000 F" compact />
        <StatRow label={t("Publicité", "Advertising")} value="− 412 000 F" compact />
        <StatRow label={t("Commission LM", "LM commission")} value="− 57 900 F" compact />
        <StatRow label={t("Abonnement", "Subscription")} value="− 25 000 F" compact />
        <Divider />
        <StatRow label={t("Résultat net", "Net result")} value="502 900 F" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[var(--dashboard-surface-2)] p-2.5 text-center">
            <p className="text-[9px] text-[var(--dashboard-text)]/40">{t("Marge brute", "Gross margin")}</p>
            <p className="mt-0.5 text-sm font-bold">54,2 %</p>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(56,189,248,.12)" }}>
            <p className="text-[9px] text-[var(--dashboard-text)]/40">{t("Marge de contribution", "Contribution margin")}</p>
            <p className="mt-0.5 text-sm font-bold" style={{ color: "#0C86BE" }}>24,1 %</p>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(79,224,174,.14)" }}>
            <p className="text-[9px] text-[var(--dashboard-text)]/40">{t("Marge nette", "Net margin")}</p>
            <p className="mt-0.5 text-sm font-bold" style={{ color: "#0E9F6E" }}>21,7 %</p>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
          {t("La marge de contribution dit si le modèle tient : sous zéro, vendre plus fait perdre plus.", "The contribution margin says if the model holds: below zero, selling more loses more.")}
        </p>
      </Card>
  );

  // Quatrième bloc : la comparaison stockage management / dropshipping.
  const comparaisonCard = (
      <Card title={t("Stockage vs dropshipping", "Warehousing vs dropshipping")} className="!bg-[var(--dashboard-glass)]" badge={<Tag tone="neutral">{t("Les deux", "Both")}</Tag>}>
        <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("La même analyse, ramenée à une commande", "The same analysis, per order")}</p>
        <div className="mt-3 flex items-center gap-4">
          <Ring pct={68} color="#38BDF8">
            <span className="text-sm font-bold">68 %</span>
            <span className="text-[8px] text-[var(--dashboard-text)]/40">{t("stockage", "warehousing")}</span>
          </Ring>
          <p className="text-[11px] text-[var(--dashboard-text)]/50">
            {t("78 commandes en stockage management, 41 en dropshipping sur la période.", "78 warehousing orders, 41 dropshipping orders this period.")}
          </p>
        </div>
        <Divider />
        <Tag tone="blue" className="mb-1.5">{t("Stockage management · 78 commandes", "Warehousing · 78 orders")}</Tag>
        <StatRow label={t("Panier moyen encaissé", "Average basket collected")} value="20 295 F" compact />
        <StatRow label={t("Prix produit, déjà payé", "Product price, already paid")} value="− 9 308 F" compact />
        <StatRow label={t("Logistique, transaction, garantie", "Logistics, transaction, warranty")} value="− 1 896 F" compact />
        <StatRow label={t("Acquisition du client", "Client acquisition")} value="− 3 462 F" compact />
        <StatRow label={t("Commission LM", "LM commission")} value="− 507 F" compact />
        <StatRow label={t("Marge de contribution", "Contribution margin")} value={t("5 122 F · 25,2 %", "5 122 F · 25.2%")} compact />
        <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("Argent avancé : 1 842 000 F", "Cash advanced: 1 842 000 F")}</p>
        <Divider />
        <Tag tone="pink" className="mb-1.5">{t("Dropshipping · 41 commandes", "Dropshipping · 41 orders")}</Tag>
        <StatRow label={t("Panier moyen encaissé", "Average basket collected")} value="17 888 F" compact />
        <StatRow label={t("Prix fixé par le partenaire", "Price set by the partner")} value="− 8 195 F" compact />
        <StatRow label={t("Logistique, transaction, garantie", "Logistics, transaction, warranty")} value="− 1 896 F" compact />
        <StatRow label={t("Acquisition du client", "Client acquisition")} value="− 3 462 F" compact />
        <StatRow label={t("Commission LM", "LM commission")} value="− 447 F" compact />
        <StatRow label={t("Marge de contribution", "Contribution margin")} value={t("3 888 F · 21,7 %", "3 888 F · 21.7%")} compact />
        <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("Argent avancé : 0 F", "Cash advanced: 0 F")}</p>
        <Divider />
        <p className="text-[10px] text-[var(--dashboard-text)]/50">
          {t("Le stockage rapporte plus par commande mais immobilise 1 842 000 F. Gardez en stock ce qui tourne vite, laissez au partenaire ce qui dort.", "Warehousing yields more per order but ties up 1 842 000 F. Keep fast movers in stock, leave slow ones to the partner.")}
        </p>
      </Card>
  );

  // Rangée à deux colonnes du document : acquisition | coût des refus.
  const acquisitionCard = (
      <Card title={t("D'où viennent vos commandes", "Where your orders come from")} className="!bg-[var(--dashboard-glass)]" badge={<Tag tone="neutral">{t("Les deux", "Both")}</Tag>}>
        <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Attribué par les pixels installés sur votre boutique", "Attributed by the pixels installed on your shop")}</p>
        <div className="mt-3 space-y-2.5">
          {[
            { name: t("Publicité Meta", "Meta ads"), roas: "4,8×", detail: t("186 000 F dépensés · 892 000 F", "186 000 F spent · 892 000 F") },
            { name: t("Publicité TikTok", "TikTok ads"), roas: "5,3×", detail: t("142 000 F dépensés · 748 000 F", "142 000 F spent · 748 000 F") },
            { name: t("Publicité Google", "Google ads"), roas: "4,5×", detail: t("64 000 F dépensés · 289 000 F", "64 000 F spent · 289 000 F") },
            { name: t("Publicité YouTube", "YouTube ads"), roas: "3,6×", detail: t("20 000 F dépensés · 72 000 F", "20 000 F spent · 72 000 F") },
          ].map((r) => (
            <div key={r.name} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[var(--dashboard-text)]/60">{r.name}</span>
              <span className="text-right">
                <span className="font-semibold text-[#0E9F6E]">{r.roas}</span>
                <span className="ml-1.5 text-[10px] text-[var(--dashboard-text)]/40">{r.detail}</span>
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[var(--dashboard-text)]/40">{t("Ventes organiques", "Organic sales")}</span>
            <span className="text-right text-[10px] text-[var(--dashboard-text)]/40">{t("Aucune dépense · 315 400 F", "No spend · 315 400 F")}</span>
          </div>
        </div>
        <Divider />
        <p className="text-[10px] text-[var(--dashboard-text)]/50">
          {t("Seules 4 régies posent un pixel et sont attribuables. Tout le reste (live, partage, retour client) se range en ventes organiques, sans chiffre inventé.", "Only 4 ad networks place a pixel and are attributable. Everything else (live, share, returning client) is filed as organic — no invented numbers.")}
        </p>
        <Divider />
        <StatRow label={t("Seuil de rentabilité publicitaire", "Ad break-even threshold")} value="2,4×" />
      </Card>
  );

  const refusCard = (
      <Card title={t("Le coût de ce qui n'arrive pas", "The cost of what doesn't arrive")} className="!bg-[var(--dashboard-glass)]" badge={<Tag tone="neutral">{t("Les deux", "Both")}</Tag>}>
        <div className="mt-2 flex items-center gap-4">
          <Ring pct={80.4} color="#4FE0AE">
            <span className="text-sm font-bold">80,4 %</span>
            <span className="text-[8px] text-[var(--dashboard-text)]/40">{t("livrées", "delivered")}</span>
          </Ring>
          <div className="flex-1 space-y-1.5 text-xs">
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4FE0AE" }} />{t("Livrées et payées", "Delivered and paid")}</span><b>119</b></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FFB84D" }} />{t("Refusées à l'appel", "Refused on the call")}</span><b>14</b></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FF7A80" }} />{t("Refusées à la porte", "Refused at the door")}</span><b>9</b></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--dashboard-text)]/20" />{t("Encore en route", "Still on the way")}</span><b>6</b></div>
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-2.5" style={{ background: "rgba(255,184,77,.1)" }}>
            <p className="text-[10px] font-semibold">{t("À l'appel · 14", "On the call · 14")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("Annulée avant toute course. Seule la publicité est perdue.", "Cancelled before any run. Only the ad spend is lost.")}</p>
            <p className="mt-1.5 text-xs font-bold" style={{ color: "#C07A0C" }}>48 500 F</p>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: "rgba(255,122,128,.1)" }}>
            <p className="text-[10px] font-semibold">{t("À la porte · 9", "At the door · 9")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("Livraison et récupération dues, marchandise repart.", "Delivery and pickup both due, goods sent back.")}</p>
            <p className="mt-1.5 text-xs font-bold" style={{ color: "#DC3A45" }}>53 600 F</p>
          </div>
        </div>
        <Divider />
        <StatRow label={t("Marchandise revenue en stock (S)", "Goods back in stock (W)")} value="118 400 F" />
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">
          {t("Un refus à l'appel coûte 3× moins qu'un refus à la porte : faire appeler plus tôt est le levier le moins cher.", "A refusal on the call costs 3× less than at the door: calling earlier is the cheapest lever.")}
        </p>
      </Card>
  );

  // Blocs pleine largeur suivants du document : produits, argent
  // immobilisé, trésorerie attendue.
  const produitsCard = (
      <Card title={t("Ce que chaque produit laisse vraiment", "What each product really leaves")} className="!bg-[var(--dashboard-glass)]" badge={<Tag tone="warn">{t("1 en perte", "1 at a loss")}</Tag>}>
        <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Marge de contribution par commande, publicité comprise", "Contribution margin per order, ads included")}</p>
        <div className="mt-3 space-y-3">
          {[
            { nature: "S", name: t("Sérum éclat 30 ml", "Radiance serum 30 ml"), pct: 82, val: "31,4 %", tot: "+6 112 F", color: "#4FE0AE" },
            { nature: "S", name: t("Beurre de karité 200 g", "Shea butter 200 g"), pct: 68, val: "26,1 %", tot: "+4 908 F", color: "#4FE0AE" },
            { nature: "D", name: t("Sac cabas en raphia", "Raffia tote bag"), pct: 49, val: "18,8 %", tot: "+3 402 F", color: "#EC0C8C" },
            { nature: "D", name: t("Huile de ricin 100 ml", "Castor oil 100 ml"), pct: 22, val: "8,4 %", tot: "+1 214 F", color: "#FFB84D" },
            { nature: "S", name: t("Sandales tressées", "Woven sandals"), pct: 11, val: "− 1,8 %", tot: "− 340 F", color: "#FF7A80" },
          ].map((p) => (
            <div key={p.name}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Tag tone={p.nature === "S" ? "blue" : "pink"} className="!px-1.5 !py-0.5">{p.nature}</Tag>
                  {p.name}
                </span>
                <span className="text-right">
                  <span className="font-semibold">{p.val}</span>
                  <span className="ml-1.5 text-[10px] text-[var(--dashboard-text)]/40">{p.tot}</span>
                </span>
              </div>
              <Bar pct={p.pct} color="" background={p.color} />
            </div>
          ))}
        </div>
        <Divider />
        <p className="text-[10px] text-[var(--dashboard-text)]/50">
          {t("Les sandales tressées coûtent 340 F par commande après publicité : monter le prix, couper la pub dessus, ou les écouler sans les pousser.", "Woven sandals cost 340 F per order after ads: raise the price, cut ads on it, or clear it without pushing.")}
        </p>
        <Divider />
        <StatRow label={t("Part faite par vos 3 premiers produits", "Share made by your top 3 products")} value="61 %" />
      </Card>
  );

  const immobiliseCard = (
      <Card title={t("L'argent que vous avez, sans l'avoir", "The money you have, without having it")} className="!bg-[var(--dashboard-glass)]" badge={<Tag tone="warn">2 758 700 F</Tag>}>
        <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Ce qui est immobilisé et ne peut pas servir aujourd'hui", "What's tied up and can't be used today")}</p>
        <StackedBar segments={[{ pct: 66.8, color: "#8B5CF6" }, { pct: 16.3, color: "#FFB84D" }, { pct: 8.7, color: "#38BDF8" }, { pct: 8.2, color: "#FF7A80" }]} />
        <div className="mt-3 space-y-2">
          <LegendRow color="#8B5CF6" label={t("Stock déposé, en valeur d'achat (S)", "Deposited stock, at cost (W)")} value="1 842 000 F" />
          <LegendRow color="#FFB84D" label={t("Suspendu, délai de litige", "On hold, dispute window")} value="459 500 F" />
          <LegendRow color="#38BDF8" label={t("Colis partis, pas livrés", "Shipped, not yet delivered")} value="252 000 F" />
          <LegendRow color="#FF7A80" label={t("Marchandise des refus, en retour", "Refused goods, coming back")} value="205 200 F" />
        </div>
        <Divider />
        <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Combien de temps met votre argent à revenir", "How long it takes your money to come back")}</p>
        <div className="mt-2 flex items-center gap-1 overflow-x-auto text-center text-[9px]">
          {[
            { v: t("4 j", "4 d"), l: t("Achat et dépôt", "Purchase & deposit") },
            { v: t("18 j", "18 d"), l: t("En stock avant vente", "In stock before sale") },
            { v: t("1,1 j", "1.1 d"), l: t("Livraison", "Delivery") },
            { v: t("3 j", "3 d"), l: t("Délai de litige", "Dispute window") },
          ].map((c, i) => (
            <div key={i} className="flex shrink-0 items-center gap-1">
              <div className="rounded-lg bg-[var(--dashboard-surface-2)] px-2 py-1.5">
                <p className="text-xs font-bold">{c.v}</p>
                <p className="mt-0.5 w-14 text-[8px] leading-tight text-[var(--dashboard-text)]/40">{c.l}</p>
              </div>
              <span className="text-[var(--dashboard-text)]/25">→</span>
            </div>
          ))}
          <div className="shrink-0 rounded-lg px-2.5 py-1.5" style={{ background: "rgba(255,184,77,.15)" }}>
            <p className="text-xs font-bold" style={{ color: "#C07A0C" }}>26,1 j</p>
            <p className="mt-0.5 w-16 text-[8px] leading-tight text-[var(--dashboard-text)]/40">{t("Du franc sorti au franc disponible", "From cash out to cash available")}</p>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
          {t("Ce cycle n'existe qu'en stockage management. En dropshipping il se réduit aux 4,1 jours entre la vente et la fin de suspension.", "This cycle only exists in warehousing. In dropshipping it's just the 4.1 days between sale and end of hold.")}
        </p>
      </Card>
  );

  const projectionCard = (
      <Card title={t("Trésorerie attendue", "Expected cash")} className="!bg-[var(--dashboard-glass)]" badge={<Tag tone="blue">{t("Projection", "Forecast")}</Tag>}>
        <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("30 prochains jours, au rythme actuel", "Next 30 days, at the current pace")}</p>
        <MiniBars values={forecastDays} highlightColor="#38BDF8" />
        <div className="mt-1 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
          <span>{t("Auj.", "Today")}</span><span>+10 j</span><span>+20 j</span><span>+30 j</span>
        </div>
        <Divider />
        <StatRow label={t("Solde attendu dans 30 jours", "Expected balance in 30 days")} value={<span className="text-[#0E9F6E]">1 495 000 F</span>} />
        <StatRow label={t("Suspensions qui se libèrent", "Holds being released")} value="459 500 F" />
        <StatRow label={t("Réapprovisionnement à prévoir (S)", "Restock to plan (W)")} value={t("Vers le 22 sept.", "Around Sept. 22")} />
        <StatRow label={t("Abonnement", "Subscription")} value={t("Le 14 · 25 000 F", "On the 14th · 25 000 F")} />
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">
          {t("Aucun creux sous zéro n'est prévu. Un réapprovisionnement avancé au 19 passerait la courbe au rouge 3 jours.", "No dip below zero is expected. Restocking on the 19th would push the curve red for 3 days.")}
        </p>
      </Card>
  );

  // Ordre et disposition = le document "Accueil · Finance" envoyé :
  // 1) portefeuille + solde côte à côte, 2) trésorerie, 3) compte de
  // résultat, 4) stockage vs drop, 5) acquisition + refus côte à côte,
  // 6) produits, 7) argent immobilisé, 8) projection — tout en pleine
  // largeur sauf les deux rangées à deux colonnes explicitement notées
  // "côte à côte" dans le document.
  return (
    <>
      <SectionHeader
        eyebrow={t("Finances", "Finances")}
        title={t("Où va votre argent", "Where your money goes")}
        subtitle={t("Ce que la période a encaissé, prélevé et laissé.", "What this period collected, deducted and left over.")}
        count={t("28 indicateurs", "28 metrics")}
        first={first}
        layout="inline"
      />

      <div className="grid gap-3">
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(260px,320px)_1fr]">
          <PaymentMethodCard />
          {soldeCard}
        </div>

        {evolutionCard}
        {compteResultatCard}
        {comparaisonCard}

        <div className="grid items-start gap-3 sm:grid-cols-2">
          {acquisitionCard}
          {refusCard}
        </div>

        {produitsCard}
        {immobiliseCard}
        {projectionCard}
      </div>
    </>
  );
}

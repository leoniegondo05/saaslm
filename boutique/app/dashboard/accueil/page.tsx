import DashboardHeader, { SparkleIcon } from "../../components/DashboardHeader";
import DashboardSidebar from "../../components/DashboardSidebar";
import PaymentMethodCard from "../../components/PaymentMethodCard";

/*
  Onglet "Accueil" du dashboard boutique : le tableau de données complet
  (finances, commandes, clients, acquisition, stock, produits, alertes),
  atteint depuis l'icône "Accueil" du rail (voir DashboardSidebar).

  Même fond et même ossature que "Ma journée" (app/dashboard/page.tsx) —
  dégradé clair bg-[radial-gradient(...)], rail + en-tête partagés — pour
  que les deux onglets restent visuellement un seul et même dashboard.
  Contenu traduit du dossier de maquettes fourni ("Écran 02 · Accueil") :
  mêmes libellés et mêmes chiffres, remis dans le système visuel clair déjà
  posé par "Ma journée" (cartes card-tint, accent rose/violet) plutôt que
  dans le thème sombre du dossier — cf. mémoire [[dashboard-mock-data-pending-laravel-api]],
  ces chiffres sont statiques en attendant l'API Laravel.
*/

export default function AccueilPage() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top_right,#f4e9f3_0%,#efe2ee_45%,#e8dbe9_100%)] font-sans text-[#141220] antialiased">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1">
          <DashboardHeader />

          {/* ── Recherche + Assistance LM ── */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="flex w-full max-w-xs items-center gap-2 rounded-full bg-white/70 px-4 py-2.5 shadow-[0_2px_10px_rgba(20,18,32,0.06)] sm:max-w-sm">
              <SearchIcon />
              <span className="truncate text-xs text-[#141220]/40">
                Rechercher dans la période
              </span>
            </div>
            <button
              type="button"
              className="flex shrink-0 items-center gap-3 rounded-full bg-[linear-gradient(135deg,var(--color-brand-pink),#2a1668_45%,#1a2a8a_100%)] px-1 py-1 pr-5 shadow-[0_8px_24px_rgba(58,29,138,0.28)] transition hover:brightness-110"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#ff5fc4,var(--color-brand-pink)_70%)] shadow-[0_0_16px_rgba(236,12,140,0.6)]">
                <SparkleIcon className="text-white" />
              </span>
              <span className="text-left leading-tight">
                <span className="block text-xs font-semibold text-white">
                  Analyser ma boutique
                </span>
                <span className="block text-[9px] font-medium tracking-wide text-white/60">
                  ASSISTANCE LM
                </span>
              </span>
            </button>
          </div>

          {/* ══════════════════════ FINANCES ══════════════════════ */}
          <SectionHeader
            eyebrow="Finances"
            title="Où va votre argent"
            subtitle="Ce que la période a encaissé, prélevé et laissé."
            count="28 indicateurs"
            first
          />

          <div className="grid gap-3 lg:grid-cols-3">
            <PaymentMethodCard />

            <div className="rounded-2xl bg-[linear-gradient(168deg,#FFFFFF_0%,#EFF1F8_64%,#DFE3EF_100%)] p-4 shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7B8095]">
                  Trésorerie disponible
                </p>
                <Tag tone="dark">Retirable</Tag>
              </div>
              <p className="mt-1 text-3xl font-bold tracking-tight">318 000 F</p>
              <p className="mt-1 text-xs text-[#3A4055]">
                Sur 5 commandes libérées, reversées par votre partenaire.
              </p>
              <Divider />
              <StatRow label="Dernier versement" value="22 août · 214 000 F" />
              <StatRow label="Versements ce mois" value="2" />
              <StatRow label="Délai moyen de versement" value="1,4 jour" />
              <StatRow label="Demande en attente" value="aucune" />
              <Btn variant="dark" className="mt-4">
                Demander mon versement
              </Btn>
            </div>

            <Card title="Où se trouve votre argent">
              <div className="mt-3 grid grid-cols-2 gap-3">
                <MiniStat label="Encaissé sur la période" value="842 500" />
                <MiniStat label="Livrés mais non payés" value="54 000" />
                <MiniStat label="Livrés et payés · rétention" value="96 000" />
                <MiniStat label="Suspendus pour litige" value="28 000" tone="pink" />
              </div>
              <Divider />
              <StatRow label="Prochaine libération" value="41 h 12" />
              <Bar pct={43} color="bg-brand-pink" />
              <p className="mt-1.5 text-[10px] text-[#141220]/40">3 commandes · rétention de 72 h</p>
              <Divider />
              <StatRow label="Libérable demain" value="62 000 F" />
              <StatRow label="Libérable sous 7 jours" value="134 000 F" />
              <StatRow label="Impayés de plus de 72 h" value={<>18 000 F <span className="text-[#141220]/40">· 2 commandes</span></>} />
            </Card>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <div className="overflow-hidden rounded-2xl shadow-[0_4px_24px_rgba(20,18,32,0.06)] lg:col-span-1">
              <div className="bg-[linear-gradient(180deg,#3B1FA8,#141A56)] p-4 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">
                    Chiffre d&apos;affaires · 15 – 30 août
                  </p>
                  <Tag tone="dark">+18 %</Tag>
                </div>
                <div className="mt-3 flex h-14 items-end gap-1">
                  {[32, 54, 40, 68, 56, 84, 100, 66, 74, 48, 62, 80].map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${h}%`,
                        background: h === 100 ? "linear-gradient(180deg,#FF8BC4,#EC0C8C)" : "rgba(255,255,255,0.22)",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-[linear-gradient(180deg,#D9DEF0,#FFFFFF)] p-4">
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold tracking-tight">842 500 F</p>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B8095]">Meilleure journée</p>
                    <p className="text-xs font-semibold">27 août · 96 400 F</p>
                  </div>
                </div>
                <Divider />
                <StatRow label="Panier moyen" value="13 050 F · +6 %" />
                <StatRow label="Ticket le plus élevé" value="48 000 F" />
                <StatRow label="Ticket le plus bas" value="3 900 F" />
                <StatRow label="Chiffre d'affaires perdu" value="148 000 F · 12 commandes" />
                <StatRow label="Écart facturé / encaissé" value="54 000 F" />
              </div>
            </div>

            <Card title="Ce que la période a coûté">
              <StatRow label="Produits drop achetés" value="248 000" bold={false} />
              <StatRow label="Frais logistiques" value="96 000" bold={false} />
              <StatRow label="Emballage" value="inclus" bold={false} />
              <StatRow label="Garantie contre la perte" value="12 000" bold={false} />
              <StatRow label="Livraisons express" value="22 000" bold={false} />
              <StatRow label="Récupération de marchandise" value="4 000" bold={false} />
              <StatRow label="Commission LM" value="21 060" bold={false} />
              <StatRow label="Frais de paiement en ligne" value="14 900" bold={false} />
              <StatRow label="Coût des retours" value="18 000" bold={false} />
              <Divider />
              <StatRow label="Total prélevé" value="435 960" />
              <Bar pct={52} color="bg-[#141220]/40" />
              <p className="mt-1.5 text-[10px] text-[#141220]/40">52 % du chiffre d&apos;affaires · 5 972 F par commande</p>
            </Card>

            <div>
              <div className="rounded-2xl bg-[linear-gradient(155deg,#3B1FA8_0%,#1B1E72_46%,#0A0E28_100%)] p-4 text-white shadow-[0_18px_40px_rgba(20,20,60,0.3)]">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Bénéfice net de la période</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">406 540 F</p>
                <div className="mt-1 flex items-center gap-2">
                  <Tag tone="dark">Marge 48 %</Tag>
                  <span className="text-[10px] text-white/50">+ 6 points sur 30 jours</span>
                </div>
                <div className="my-3 h-px bg-white/15" />
                <StatRow label="Marge sur stockage" value="46 %" light />
                <StatRow label="Marge sur drop" value="33 %" light />
                <StatRow label="Marge sur produits propres" value="71 %" light />
              </div>
              <Card title="Paiements reçus, par moyen" className="mt-3">
                <PayRow label="Orange Money" color="#FF7900" value="412 000" pct={49} />
                <PayRow label="Wave" color="#1BA1F2" value="238 500" pct={28} />
                <PayRow label="MTN MoMo" color="#FFCC00" value="121 000" pct={14} />
                <PayRow label="Moov Money" color="#2F72D6" value="71 000" pct={9} />
              </Card>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <MiniTile label="Abonnement" value="25 000 F" note="Échéance 14 sept." />
            <MiniTile label="Commission LM" value="21 060 F" note="2,5 % effectif" />
            <MiniTile label="Reste à percevoir" value="150 000 F" />
            <MiniTile label="Valeur du stock déposé" value="1 209 100 F" />
            <MiniTile label="Prévision à 7 jours" value="512 000 F" note="Au rythme actuel" />
            <MiniTile label="Trésorerie totale" value="468 000 F" />
          </div>

          {/* ══════════════════════ COMMANDES ══════════════════════ */}
          <SectionHeader
            eyebrow="Commandes"
            title="Ce que devient chaque commande"
            subtitle="De la prise de commande jusqu'à la livraison."
            count="24 indicateurs"
          />

          <div className="grid gap-3 lg:grid-cols-4">
            <Card title="Commandes de la période">
              <div className="mt-3 flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[6px] border-brand-pink/25">
                  <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-brand-pink border-r-brand-pink" style={{ transform: "rotate(45deg)" }} />
                  <div className="text-center">
                    <p className="text-lg font-bold leading-none">73</p>
                    <p className="text-[8px] text-[#141220]/40">au total</p>
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <StatRow label="Livrées" value="45" />
                  <StatRow label="En cours" value="16" />
                  <StatRow label="Non livrées" value="12" />
                </div>
              </div>
              <Divider />
              <StatRow label="Taux de livraison" value="79 %" />
              <StatRow label="Dont produits en stockage" value="31" />
              <StatRow label="Dont produits en drop" value="42" />
              <StatRow label="Articles par commande" value="1,4" />
            </Card>

            <Card title="Où en sont les commandes en cours">
              <StatRow label="En coordination" value="4" bold={false} />
              <StatRow label="Affectées à un livreur" value="7" bold={false} />
              <StatRow label="En cours de livraison" value="3" bold={false} />
              <StatRow label="En relance" value="2" bold={false} />
              <Divider />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">Les quatre délais</p>
              <StatRow label="Commande → confirmation" value="1 h 40" bold={false} />
              <StatRow label="Confirmation → livreur" value="4 h 10" bold={false} />
              <StatRow label="Livreur → livraison" value="20 h" bold={false} />
              <StatRow label="Total moyen" value="26 h" />
            </Card>

            <Card title="Pourquoi elles n'aboutissent pas">
              <FailRow label="Client injoignable" value={6} pct={100} />
              <FailRow label="Adresse introuvable" value={3} pct={50} />
              <FailRow label="Refus à la livraison" value={2} pct={33} />
              <FailRow label="Produit non conforme" value={1} pct={17} />
              <Divider />
              <StatRow label="Relances demandées" value="9" />
              <StatRow label="Relances abouties" value="6 · 67 %" />
              <StatRow label="Taux d'annulation" value="4 %" />
            </Card>

            <Card title="Quand vos clients règlent">
              <StatRow label="Depuis la page de commande" value="62 %" />
              <Bar pct={62} />
              <div className="mt-2" />
              <StatRow label="Via le lien de commande" value="38 %" />
              <Bar pct={38} color="bg-[#141220]/30" />
              <Divider />
              <StatRow label="Livraisons normales" value="62 · 77 % réussies" />
              <StatRow label="Livraisons express" value="11 · 91 % réussies" />
              <StatRow label="Délai moyen express" value="7 h" />
              <StatRow label="Supplément express encaissé" value="22 000 F" />
            </Card>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.7fr_1fr]">
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                  Heures auxquelles vos clients commandent
                </p>
                <p className="text-[10px] text-[#141220]/40">Pic entre 20 h et 22 h · 38 % des commandes</p>
              </div>
              <div
                className="mt-3 grid gap-[3px]"
                style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
              >
                {HOURLY_ORDERS.map((v, i) => (
                  <span
                    key={i}
                    className="h-4 rounded-sm"
                    style={{ background: v > 0.75 ? "#EC0C8C" : `rgba(236,12,140,${Math.max(0.06, v * 0.55)})` }}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[9px] text-[#141220]/40">
                <span>00 h</span>
                <span>06 h</span>
                <span>12 h</span>
                <span>18 h</span>
                <span>23 h</span>
              </div>
              <Divider />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">Jours de la semaine</p>
              <div className="mt-2 grid grid-cols-7 gap-2 text-center">
                {[
                  ["Lun", 8],
                  ["Mar", 9],
                  ["Mer", 11],
                  ["Jeu", 10],
                  ["Ven", 16],
                  ["Sam", 14],
                  ["Dim", 5],
                ].map(([d, v]) => (
                  <div key={d}>
                    <p className="text-[9px] text-[#141220]/40">{d}</p>
                    <p className={`text-xs font-semibold ${Number(v) >= 14 ? "text-brand-pink" : ""}`}>{v}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Communes livrées">
              <CommuneRow label="Yopougon" pct={41} value="30" />
              <CommuneRow label="Cocody" pct={27} value="20" />
              <CommuneRow label="Abobo" pct={18} value="13" />
              <CommuneRow label="Marcory" pct={9} value="7" />
              <CommuneRow label="Bingerville" pct={5} value="3" />
              <Divider />
              <StatRow label="Commune la plus rentable" value="Cocody · marge 54 %" />
              <StatRow label="Commune la plus difficile" value="Abobo · 31 % d'échecs" />
            </Card>
          </div>

          {/* ══════════════════════ CLIENTS ══════════════════════ */}
          <SectionHeader
            eyebrow="Clients"
            title="Qui achète, et qui revient"
            subtitle="Ce que valent vos clients et ce qu'ils pensent."
            count="14 indicateurs"
          />

          <div className="grid gap-3 lg:grid-cols-4">
            <Card title="Qui achète chez vous">
              <StatRow label="Clients servis" value="73" />
              <StatRow label="Nouveaux clients" value="58 · 79 %" />
              <StatRow label="Clients revenus" value="15 · 21 %" />
              <StatRow label="Deuxième achat en" value="17 jours" />
              <StatRow label="Meilleur client" value="68 000 F" />
              <Divider />
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#141220]/50">Clients à risque</p>
                <Tag tone="warn">4</Tag>
              </div>
              <p className="mt-1.5 text-[10px] text-[#141220]/40">
                Deux échecs de livraison ou plus. À rappeler avant d&apos;expédier.
              </p>
            </Card>

            <Card title="Vos cinq meilleurs clients">
              <ClientRow name="Traoré M." zone="Cocody" value="68 000 F" orders={5} pct={100} />
              <ClientRow name="Konan A." zone="Yopougon" value="51 000 F" orders={4} pct={75} />
              <ClientRow name="Aya D." zone="Marcory" value="38 000 F" orders={3} pct={56} />
              <ClientRow name="Koffi B." zone="Abobo" value="27 000 F" orders={2} pct={40} />
              <ClientRow name="Silué F." zone="Cocody" value="24 000 F" orders={2} pct={35} />
            </Card>

            <Card title="Ce qu'ils pensent">
              <div className="mt-1 flex items-end gap-2">
                <p className="text-3xl font-bold tracking-tight">4,6</p>
                <p className="pb-1 text-xs text-[#141220]/40">sur 5 · 41 avis</p>
              </div>
              <div className="mt-3 space-y-2">
                <RatingRow label="5 étoiles" value="28" pct={68} />
                <RatingRow label="4 étoiles" value="8" pct={20} />
                <RatingRow label="3 étoiles et moins" value="5" pct={12} color="bg-[#FF5A62]" />
              </div>
              <Divider />
              <p className="text-[10px] text-[#141220]/40">
                Dernier avis négatif : « Casque reçu sans le câble » · 27 août
              </p>
            </Card>

            <Card title="Panier moyen par commune">
              <StatRow label="Cocody" value="16 400 F" />
              <StatRow label="Bingerville" value="14 800 F" />
              <StatRow label="Marcory" value="13 200 F" />
              <StatRow label="Yopougon" value="11 900 F" />
              <StatRow label="Abobo" value="9 600 F" />
              <Divider />
              <StatRow label="Commandes à 2 articles ou plus" value="26 %" />
              <StatRow label="Clients ayant laissé un avis" value="56 %" />
            </Card>
          </div>

          {/* ══════════════════════ ACQUISITION ══════════════════════ */}
          <SectionHeader
            eyebrow="Acquisition"
            title="D'où viennent vos ventes"
            subtitle="Votre page de commande et vos sources de trafic."
            count="14 indicateurs"
          />

          <div className="grid gap-3 lg:grid-cols-4">
            <Card title="Votre page de commande">
              <div className="mt-1 flex items-end gap-2">
                <p className="text-3xl font-bold tracking-tight">2 140</p>
                <p className="pb-1 text-xs text-[#141220]/40">visites</p>
              </div>
              <Divider />
              <StatRow label="Commandes obtenues" value="73" />
              <StatRow label="Taux de transformation" value="3,4 %" />
              <StatRow label="Visiteurs uniques" value="1 780" />
              <StatRow label="Temps moyen sur la page" value="1 min 12" />
              <StatRow label="Visites depuis un téléphone" value="93 %" />
            </Card>

            <Card title="D'où viennent vos visiteurs">
              <SourceRow label="TikTok" value="912" pct={43} color="bg-brand-pink" />
              <SourceRow label="WhatsApp et lien direct" value="556" pct={26} color="bg-[#141220]/70" />
              <SourceRow label="Facebook" value="385" pct={18} color="bg-[#2F6BE0]" />
              <SourceRow label="Instagram" value="192" pct={9} color="bg-[#141220]/30" />
              <SourceRow label="Google" value="95" pct={4} color="bg-[#141220]/20" />
            </Card>

            <Card title="Ce que chaque source rapporte">
              <StatRow label="TikTok" value="3,1 % · 28 commandes" />
              <StatRow label="WhatsApp et direct" value="4,9 % · 27" />
              <StatRow label="Facebook" value="2,6 % · 10" />
              <StatRow label="Instagram" value="3,1 % · 6" />
              <StatRow label="Google" value="2,1 % · 2" />
              <Divider />
              <p className="text-[10px] text-[#141220]/40">
                Le lien direct transforme le mieux : ce sont des clients déjà convaincus quand ils arrivent.
              </p>
            </Card>

            <Card title="Paniers abandonnés">
              <div className="mt-1 flex items-end gap-2">
                <p className="text-3xl font-bold tracking-tight">23</p>
                <p className="pb-1 text-xs text-[#141220]/40">soit 287 000 F</p>
              </div>
              <Divider />
              <StatRow label="Abandon après le prix" value="11" />
              <StatRow label="Abandon au paiement" value="7" />
              <StatRow label="Abandon à l'adresse" value="5" />
              <StatRow label="Relancés" value="9 · 3 récupérés" />
              <Divider />
              <StatRow label="Pixels connectés" value="3 sur 4" />
              <p className="mt-1.5 text-[10px] text-[#141220]/40">Google Ads reste à connecter.</p>
            </Card>
          </div>

          {/* ══════════════════════ STOCK ══════════════════════ */}
          <SectionHeader
            eyebrow="Stock"
            title="Ce que vous avez confié"
            subtitle="Chaque dépôt, du départ de chez vous jusqu'à la vente."
            count="Flèches pour changer de produit"
          />

          <div className="grid gap-3 lg:grid-cols-[1.9fr_1fr]">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                  Fiche d&apos;un dépôt
                </p>
                <ProductSelector name="Sérum éclat 30 ml" position="Dépôt 1 sur 4" />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Nature code="S" />
                  <div>
                    <p className="text-xs font-semibold">Déposé le 22 août à 09 h 40</p>
                    <p className="text-[10px] text-[#141220]/40">
                      Entrepôt Yopougon · dépôt DP-0341 · garantie souscrite
                    </p>
                  </div>
                </div>
                <Tag tone="ko">3 unités écartées</Tag>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-2">
                <QuickStat label="Quantité déposée" value="120" />
                <QuickStat label="Reçu conforme" value="117" tone="ok" />
                <QuickStat label="Endommagé à la réception" value="3" tone="ko" />
                <QuickStat label="Mis en distribution" value="117" />
                <QuickStat label="Vendu sur la période" value="34" />
              </div>
              <div className="mt-2 grid grid-cols-5 gap-2">
                <QuickStat label="Restant en entrepôt" value="83" />
                <QuickStat label="Réservé aux commandes" value="6" />
                <QuickStat label="Valeur immobilisée" value="514 600" />
                <QuickStat label="Couverture" value="22 j" />
                <QuickStat label="Frais de garantie" value="12 000" />
              </div>

              <Divider />
              <div className="flex items-center justify-between text-[10px] text-[#141220]/40">
                <span>Parcours du dépôt</span>
                <span>22 août → 23 août</span>
              </div>
              <div className="mt-2 flex gap-1">
                {[1, 1, 1, 1].map((_, i) => (
                  <span key={i} className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[9px] text-[#141220]/40">
                <span>Demande envoyée</span>
                <span>Récupérée chez moi</span>
                <span>Contrôle de conformité</span>
                <span>Disponible à la vente</span>
              </div>

              <Divider />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-md text-[10px] text-[#141220]/40">
                  3 flacons cassés relevés au contrôle, photos jointes par le partenaire. Un litige reste
                  ouvrable jusqu&apos;au 22 septembre.
                </p>
                <div className="flex gap-2">
                  <span className="rounded-full border border-[#141220]/15 px-3.5 py-2 text-[10px] font-semibold">
                    Voir le contrôle
                  </span>
                  <span className="rounded-full border border-brand-pink/40 px-3.5 py-2 text-[10px] font-semibold text-brand-pink">
                    Ouvrir un litige
                  </span>
                </div>
              </div>

              <Divider />
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                  Mes quatre dépôts
                </p>
                <Tag tone="dark">240 unités · 1 209 100 F</Tag>
              </div>
              <Table
                className="mt-3"
                head={["Produit", "Déposé le", "Déposé", "Conforme", "Endommagé", "Vendu", "Restant", "Couverture"]}
                rows={[
                  ["Sérum éclat 30 ml", "22 août", "120", "117", "3", "34", "83", "22 j"],
                  ["Huile de ricin 100 ml", "28 août", "60", "—", "—", "58", "2", "1 j"],
                  ["Beurre de karité 200 g", "12 août", "200", "200", "0", "73", "127", "34 j"],
                  ["Coffret parfum", "2 août", "40", "40", "0", "40", "0", "Rupture"],
                ]}
              />

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                  Produits que je revends sans stock · drop
                </p>
                <div className="flex gap-1.5">
                  <Tag tone="blue">3 du partenaire</Tag>
                  <Tag tone="pink">2 de LM</Tag>
                </div>
              </div>
              <Table
                className="mt-3"
                head={["Produit", "Source", "Prix drop", "Vendu", "Dispo à la source", "Couverture", "Marge", "Litiges"]}
                rows={[
                  ["Montre connectée S8", "L", "6 200", "48", "340", "21 j", "31 %", "3"],
                  ["Casque sans fil X2", "P", "4 800", "21", "96", "13 j", "34 %", "1"],
                  ["Lotion tonique", "L", "3 800", "9", "210", "40 j", "38 %", "0"],
                  ["Masque argile", "P", "3 400", "6", "18", "6 j", "29 %", "0"],
                  ["Gel nettoyant", "P", "2 200", "4", "140", "35 j", "36 %", "0"],
                ]}
                sourceCol={1}
              />
            </Card>

            <div>
              <div className="overflow-hidden rounded-2xl shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
                <div className="bg-[linear-gradient(180deg,#3B1FA8,#141A56)] p-4 text-white">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Évolution du stock</p>
                  </div>
                  <ProductSelector name="Sérum éclat 30 ml" position="Produit 1 sur 4" dark className="mt-2" />
                  <div className="mt-3 flex h-12 items-end gap-1">
                    {[80, 68, 62, 46, 38, 22].map((h, i) => (
                      <span key={i} className="flex-1 rounded-t bg-white/25" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="mt-1.5 flex justify-between text-[9px] text-white/50">
                    <span>— Restant</span>
                    <span className="text-brand-pink">- - Sorties cumulées</span>
                  </div>
                </div>
                <div className="bg-[linear-gradient(180deg,#D9DEF0,#FFFFFF)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B8095]">Restant</p>
                      <p className="text-xl font-bold">83</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B8095]">Valeur</p>
                      <p className="text-sm font-bold">514 600 F</p>
                    </div>
                  </div>
                  <Divider />
                  <StatRow label="Sortie moyenne" value="1,6 par jour" />
                  <StatRow label="Rupture estimée" value="21 septembre" />
                  <StatRow label="Rotation" value="0,4 fois par mois" />
                </div>
              </div>

              <Card title="Tous dépôts confondus" className="mt-3">
                <StatRow label="Unités en entrepôt" value="240" />
                <StatRow label="Déposé depuis le 1er août" value="420" />
                <StatRow label="Endommagé à la réception" value="3 · 0,7 %" />
                <StatRow label="Écarts non résolus" value="1" />
                <StatRow label="Couverture moyenne" value="19 jours" />
                <StatRow label="Stock dormant" value="28 unités · 60 j sans vente" />
                <StatRow label="Délai moyen de contrôle" value="1,2 jour" />
              </Card>

              <Card className="mt-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                    Envois récents
                  </p>
                  <Tag tone="pink">1 en cours</Tag>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-semibold">Huile de ricin · 60</span>
                  <span className="text-[#141220]/40">28 août</span>
                </div>
                <div className="mt-1.5 flex gap-1">
                  <span className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
                  <span className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
                  <span className="h-1 flex-1 rounded-full bg-[#141220]/10" />
                  <span className="h-1 flex-1 rounded-full bg-[#141220]/10" />
                </div>
                <p className="mt-1.5 text-[10px] text-[#141220]/40">Au contrôle · résultat attendu aujourd&apos;hui</p>
                <Divider />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#141220]/50">Sérum éclat · 120</span>
                  <Tag tone="warn">3 écartés</Tag>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-[#141220]/50">Beurre de karité · 200</span>
                  <Tag tone="ok">Conforme</Tag>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-[#141220]/50">Coffret parfum · 40</span>
                  <Tag tone="ok">Conforme</Tag>
                </div>
                <Btn variant="outline" className="mt-4">
                  Déposer un nouveau stock
                </Btn>
              </Card>
            </div>
          </div>

          {/* ══════════════════════ PRODUITS (natures) ══════════════════════ */}
          <SectionHeader
            eyebrow="Produits"
            title="Vos quatre façons de vendre"
            subtitle="Ce que chaque nature de produit vous rapporte."
            count="20 indicateurs"
          />

          <div className="grid gap-3 lg:grid-cols-3">
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                  Top 5 des produits
                </p>
                <p className="text-[10px] text-[#141220]/40">sur la période</p>
              </div>
              <TopProductRow code="L" name="Montre connectée S8" value="48 · 672 000" pct={100} />
              <TopProductRow code="S" name="Sérum éclat 30 ml" value="37 · 444 000" pct={77} />
              <TopProductRow code="P" name="Casque sans fil X2" value="21 · 231 000" pct={44} />
              <TopProductRow code="S" name="Huile de ricin" value="14 · 105 000" pct={29} />
              <TopProductRow code="O" name="Coffret parfum" value="9 · 81 000" pct={19} />
              <Divider />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                Les moins rentables
              </p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Nature code="S" />
                  Bracelet cuir
                </span>
                <span className="text-[#141220]/50">2 ventes · 29 %</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Nature code="P" />
                  Gel nettoyant
                </span>
                <span className="text-[#141220]/50">4 ventes · 36 %</span>
              </div>
              <Divider />
              <p className="text-[10px] text-[#141220]/40">
                S · stocké chez le partenaire &nbsp; P · drop du partenaire &nbsp; L · drop LM &nbsp; O · produit propre
              </p>
            </Card>

            <Card title="Vos quatre natures de produits">
              <div className="mt-2 flex h-2 overflow-hidden rounded-full">
                <span className="h-full" style={{ width: "36%", background: "#141220" }} />
                <span className="h-full bg-[#141220]/30" style={{ width: "17%" }} />
                <span className="h-full bg-[#2F6BE0]" style={{ width: "29%" }} />
                <span className="h-full bg-brand-pink" style={{ width: "18%" }} />
              </div>
              <NatureRow code="S" name="Stockage Management" value="4 · 284 500" note="Marge 46 % · 240 unités immobilisées · 22 j de couverture" />
              <NatureRow code="O" name="Produits propres" value="8 · 112 000" note="Marge 71 % · vous livrez vous-même · aucun frais partenaire" />
              <NatureRow code="P" name="Drop du partenaire" value="7 · 301 000" note="Marge 34 % · aucun stock avancé · 1 litige" />
              <NatureRow code="L" name="Drop LM" value="5 · 145 000" note="Marge 31 % · catalogue de la plateforme · 3 litiges" last />
              <Divider />
              <StatRow label="Nature la plus rentable" value="Produits propres" />
              <StatRow label="Nature qui vend le plus" value="Drop du partenaire" />
            </Card>

            <div>
              <Card>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                    Ma position sur les prix drop
                  </p>
                </div>
                <ProductSelector name="Montre connectée S8" position="Produit 1 sur 12" className="mt-2" />
                <p className="mt-2 text-xs">
                  Vous payez <b>6 200 F</b> · vous revendez <b>14 000 F</b>
                </p>
                <div className="relative mt-3 h-1 rounded-full bg-[linear-gradient(90deg,#C9CFDD,#EC0C8C)]">
                  <span
                    className="absolute -top-1.5 h-4 w-0.5 rounded-full bg-[#141220] shadow-[0_0_0_2px_#fff]"
                    style={{ left: "38%" }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[9px] text-[#141220]/40">
                  <span>Bas 5 400</span>
                  <span>Moyen 7 100</span>
                  <span>Haut 8 900</span>
                </div>
                <Divider />
                <StatRow label="Marge nette" value="31 %" />
                <StatRow label="Vendu par" value="42 boutiques" />
                <StatRow label="Prix moyen du réseau" value="13 400 F" />
                <StatRow label="Votre écart au marché" value="+ 4 %" />
              </Card>

              <Card title="Catalogue accessible" className="mt-3">
                <StatRow label="Produits du partenaire" value="117" />
                <StatRow label="Produits LM" value="64" />
                <StatRow label="Nouveautés ce mois" value="12" />
                <StatRow label="Produits à venir" value="6" />
                <StatRow label="Jamais vendus chez vous" value="3" />
                <StatRow label="Mis de côté" value="5" />
              </Card>
            </div>
          </div>

          {/* ══════════════════════ ALERTES ══════════════════════ */}
          <SectionHeader
            eyebrow="Alertes"
            title="Ce qui demande une décision"
            subtitle="Ruptures, litiges et tenue de votre partenaire."
            count="16 indicateurs"
          />

          <div className="grid gap-3 pb-4 lg:grid-cols-3">
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                  Ce qui demande une décision
                </p>
                <Tag tone="pink">5 alertes</Tag>
              </div>
              <AlertRow code="S" name="Huile de ricin" tag="Rupture sous 1 jour" tone="ko" />
              <AlertRow code="S" name="Coffret parfum" tag="En rupture · retiré de la page" tone="ko" />
              <AlertRow code="S" name="Bracelet cuir" tag="Rotation lente · 28 immobilisées" tone="warn" />
              <AlertRow code="P" name="Casque X2" tag="4 avis négatifs" tone="warn" />
              <AlertRow code="L" name="Montre S8" tag="3 litiges ce mois" tone="warn" last />
              <Divider />
              <StatRow label="Alertes traitées ce mois" value="11" />
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">Litiges</p>
                <Tag tone="pink">1 en cours</Tag>
              </div>
              <StatRow label="Montant suspendu" value="28 000 F" />
              <StatRow label="Ouvert par" value="Le client final" />
              <StatRow label="Depuis" value="3 jours" />
              <StatRow label="Résolus ce mois" value="4" />
              <StatRow label="Délai moyen de résolution" value="5 jours" />
              <StatRow label="Montant récupéré" value="46 000 F" />
              <StatRow label="Montant perdu" value="12 000 F" />
              <StatRow label="Taux de litige" value="1,4 %" />
              <button
                type="button"
                className="mt-4 w-full rounded-full border border-brand-pink/40 py-2.5 text-center text-xs font-semibold text-brand-pink transition hover:bg-brand-pink/5"
              >
                Voir le litige en cours
              </button>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                  Votre partenaire
                </p>
                <Tag tone="dark">Note 8,4</Tag>
              </div>
              <StatRow label="Délai moyen de livraison" value="26 h" />
              <StatRow label="Moyenne du réseau" value="31 h" />
              <StatRow label="Taux de livraison" value="79 %" />
              <StatRow label="Retards ce mois" value="5" />
              <StatRow label="Écarts sur mes dépôts" value="3 unités" />
              <StatRow label="Réponses à l'assistance" value="3 h en moyenne" />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-[#141220]/50">Évaluation du mois</span>
                <Tag tone="pink">À donner</Tag>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Données dérivées ─────────────────────────── */

// 24 barres pour la bande "heures de commande" — pic 20h-22h, gabarit repris
// des hauteurs de la maquette (0 → 1).
const HOURLY_ORDERS = [
  0.06, 0.05, 0.05, 0.05, 0.06, 0.09, 0.14, 0.2, 0.26, 0.3, 0.34, 0.4, 0.44, 0.38, 0.34, 0.36, 0.42, 0.5, 0.5, 0.7, 1, 1,
  0.6, 0.2,
];

/* ─────────────────────────── Composants d'appui ─────────────────────────── */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  count,
  first = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  count?: string;
  first?: boolean;
}) {
  return (
    <div className={`mb-4 flex flex-wrap items-end justify-between gap-3 ${first ? "mt-8" : "mt-12"}`}>
      <div>
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-pink">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-pink shadow-[0_0_10px_rgba(236,12,140,0.6)]" />
          {eyebrow}
        </span>
        <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-[#141220]/50">{subtitle}</p>}
      </div>
      {count && (
        <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-[#141220]/40 shadow-[0_2px_10px_rgba(20,18,32,0.06)]">
          {count}
        </span>
      )}
    </div>
  );
}

function Card({
  title,
  badge,
  className = "",
  children,
}: {
  title?: string;
  badge?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl card-tint p-4 shadow-[0_4px_24px_rgba(20,18,32,0.06)] ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">{title}</p>
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}

function StatRow({
  label,
  value,
  bold = true,
  light = false,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  light?: boolean;
}) {
  return (
    <div className="mt-2.5 flex items-center justify-between gap-3 text-xs first:mt-3">
      <span className={light ? "text-white/55" : "text-[#141220]/50"}>{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="my-3 h-px bg-[#141220]/10" />;
}

function Bar({ pct, color = "bg-brand-pink" }: { pct: number; color?: string }) {
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#141220]/[0.08]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "pink" | "ok" | "warn" | "ko" | "blue" | "neutral" | "dark";
}) {
  const tones: Record<string, string> = {
    pink: "bg-brand-pink/10 text-brand-pink",
    ok: "bg-[#dcf5e3] text-[#178a3f]",
    warn: "bg-[#fff1d6] text-[#a8690a]",
    ko: "bg-[#ffe1e2] text-[#c8262d]",
    blue: "bg-brand-purple/10 text-brand-purple",
    neutral: "bg-[#141220]/[0.06] text-[#141220]/60",
    dark: "bg-[#141220]/[0.08] text-[#141220]/70",
  };
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Btn({
  children,
  variant = "outline",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "dark" | "outline" | "white";
  className?: string;
}) {
  const variants: Record<string, string> = {
    dark: "bg-[#141220] text-white",
    outline: "border border-[#141220]/15 bg-white/60 text-[#141220]",
    white: "bg-white text-[#141220] shadow-[0_2px_10px_rgba(20,18,32,0.08)]",
  };
  return (
    <button
      type="button"
      className={`w-full rounded-full px-4 py-2.5 text-center text-xs font-semibold transition hover:brightness-95 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Nature({ code }: { code: "S" | "P" | "L" | "O" }) {
  const styles: Record<string, string> = {
    S: "bg-[#141220]/[0.08] text-[#141220]/60",
    P: "bg-brand-purple/10 text-brand-purple",
    L: "bg-brand-pink/10 text-brand-pink",
    O: "border border-[#141220]/15 text-[#141220]/40",
  };
  return (
    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${styles[code]}`}>
      {code}
    </span>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "pink";
}) {
  return (
    <div>
      <p className="text-[10px] text-[#141220]/40">{label}</p>
      <p className={`mt-0.5 text-base font-bold ${tone === "pink" ? "text-brand-pink" : ""}`}>{value}</p>
    </div>
  );
}

function MiniTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl card-tint p-3 shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
      <p className="text-[10px] text-[#141220]/40">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
      {note && <p className="mt-0.5 text-[9px] text-[#141220]/35">{note}</p>}
    </div>
  );
}

function QuickStat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "ko" }) {
  return (
    <div className="rounded-xl border border-[#141220]/10 bg-white/60 p-2.5">
      <p className="text-[9px] text-[#141220]/40">{label}</p>
      <p
        className={`mt-0.5 text-sm font-bold ${
          tone === "ok" ? "text-[#178a3f]" : tone === "ko" ? "text-[#c8262d]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PayRow({ label, color, value, pct }: { label: string; color: string; value: string; pct: number }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-[#141220]/70">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#141220]/[0.08]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function FailRow({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#141220]/50">{label}</span>
        <span>{value}</span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" />
    </div>
  );
}

function CommuneRow({ label, pct, value }: { label: string; pct: number; value: string }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-semibold">
          {pct} % · {value}
        </span>
      </div>
      <Bar pct={pct} color="bg-[#141220]/50" />
    </div>
  );
}

function ClientRow({
  name,
  zone,
  value,
  orders,
  pct,
}: {
  name: string;
  zone: string;
  value: string;
  orders: number;
  pct: number;
}) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>
          {name} · {zone}
        </span>
        <span className="font-semibold">
          {value} · {orders} commande{orders > 1 ? "s" : ""}
        </span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" />
    </div>
  );
}

function RatingRow({ label, value, pct, color = "bg-[#141220]" }: { label: string; value: string; pct: number; color?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-[#141220]/40">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <Bar pct={pct} color={color} />
    </div>
  );
}

function SourceRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-semibold">
          {value} · {pct} %
        </span>
      </div>
      <Bar pct={pct} color={color} />
    </div>
  );
}

function TopProductRow({ code, name, value, pct }: { code: "S" | "P" | "L" | "O"; name: string; value: string; pct: number }) {
  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {name}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" />
    </div>
  );
}

function NatureRow({
  code,
  name,
  value,
  note,
  last = false,
}: {
  code: "S" | "P" | "L" | "O";
  name: string;
  value: string;
  note: string;
  last?: boolean;
}) {
  return (
    <>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {name}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <p className="ml-7 mt-0.5 text-[10px] text-[#141220]/40">{note}</p>
      {!last && <Divider />}
    </>
  );
}

function AlertRow({
  code,
  name,
  tag,
  tone,
  last = false,
}: {
  code: "S" | "P" | "L" | "O";
  name: string;
  tag: string;
  tone: "warn" | "ko";
  last?: boolean;
}) {
  return (
    <>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {name}
        </span>
        <Tag tone={tone}>{tag}</Tag>
      </div>
      {!last && <Divider />}
    </>
  );
}

function ProductSelector({
  name,
  position,
  dark = false,
  className = "",
}: {
  name: string;
  position: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-1.5 py-1 ${
        dark ? "border-white/20 bg-white/10" : "border-brand-pink/30 bg-brand-pink/5"
      } ${className}`}
    >
      <button
        type="button"
        aria-label="Produit précédent"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${dark ? "bg-white/15 text-white" : "bg-white text-[#141220]/60"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
          <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="min-w-0 flex-1 text-center leading-tight">
        <span className={`block truncate text-[10px] font-semibold ${dark ? "text-white" : ""}`}>{name}</span>
        <span className={`block text-[8px] ${dark ? "text-white/50" : "text-[#141220]/40"}`}>{position}</span>
      </span>
      <button
        type="button"
        aria-label="Produit suivant"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${dark ? "bg-white/15 text-white" : "bg-white text-[#141220]/60"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
          <path d="m9.5 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function Table({
  head,
  rows,
  className = "",
  sourceCol,
}: {
  head: string[];
  rows: string[][];
  className?: string;
  sourceCol?: number;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[560px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#141220]/10">
            {head.map((h) => (
              <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#141220]/35">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#141220]/[0.05] last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-3">
                  {j === 0 ? (
                    <span className="font-semibold">{cell}</span>
                  ) : sourceCol === j ? (
                    <Nature code={cell as "S" | "P" | "L" | "O"} />
                  ) : (
                    <span className={cell === "Rupture" || cell === "1 j" ? "text-brand-pink" : ""}>{cell}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0 text-[#141220]/30" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="m20 20-3.6-3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

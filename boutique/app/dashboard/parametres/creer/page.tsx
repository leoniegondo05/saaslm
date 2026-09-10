"use client";

import { useRouter } from "next/navigation";
import DashboardHeader from "../../../components/DashboardHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";
import CreerCollaborateur from "../../../components/dashboard-parametres/CreerCollaborateur";

/*
  Écran "Créer un collaborateur", atteint depuis le bouton du même nom sur
  "Gérer les accès" (voir PersonnelAcces.tsx). Page à part (pas une 3e
  colonne encastrée dans la liste) pour qu'une actualisation du navigateur
  ici reste ici — même mouvement que /dashboard/produits/ajouter.

  Rien n'est encore envoyé au serveur (cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]]) : "Créer le compte et
  envoyer les accès" ramène simplement sur la liste, à remplacer par un
  vrai appel à l'API Laravel de gestion du personnel quand elle existera.
*/

export default function CreerCollaborateurPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <CreerCollaborateur
            onAnnuler={() => router.push("/dashboard/parametres/acces")}
            onCreer={() => router.push("/dashboard/parametres/acces")}
          />
        </div>
      </div>
    </div>
  );
}

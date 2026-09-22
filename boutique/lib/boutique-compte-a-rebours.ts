/*
  Parse le texte libre `promo.finOffre` (ex: "30 sept. 2026 · 23 h 59") en
  date exploitable pour le compte à rebours de SectionPromo. Champ texte
  libre côté réglages (cf. commentaire historique dans SectionPromo.tsx) —
  si le format ne matche pas, on retourne `null` et l'appelant retombe sur
  le simple texte "Jusqu'au…" plutôt que de planter ou d'afficher "NaN".
*/

const MOIS_INDEX: Record<string, number> = {
  janvier: 0,
  janv: 0,
  fevrier: 1,
  fevr: 1,
  mars: 2,
  avril: 3,
  avr: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  juil: 6,
  aout: 7,
  septembre: 8,
  sept: 8,
  octobre: 9,
  oct: 9,
  novembre: 10,
  nov: 10,
  decembre: 11,
  dec: 11,
};

function sansAccents(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function parseFinOffre(texte: string): Date | null {
  const dateMatch = texte.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\.?\s+(\d{4})/);
  if (!dateMatch) return null;

  const jour = Number(dateMatch[1]);
  const mois = MOIS_INDEX[sansAccents(dateMatch[2])];
  const annee = Number(dateMatch[3]);
  if (mois === undefined || !jour || !annee) return null;

  const heureMatch = texte.match(/(\d{1,2})\s*h\s*(\d{1,2})?/i);
  const heures = heureMatch ? Number(heureMatch[1]) : 23;
  const minutes = heureMatch?.[2] ? Number(heureMatch[2]) : 59;

  const date = new Date(annee, mois, jour, heures, minutes, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

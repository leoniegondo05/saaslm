/*
  Wordmark officiel "LIIVRE MOI" : la charte graphique (section Logo, page
  "Logo principal") colore le O de MOI en rose fuchsia, reste du mot dans
  la couleur du texte courant. Composant partagé pour ne pas dupliquer ce
  détail à chaque endroit où le wordmark est écrit en texte (à côté du
  logo.svg, qui lui ne contient que l'icône).
*/
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      LIIVRE M<span className="text-brand-pink">O</span>I
    </span>
  );
}

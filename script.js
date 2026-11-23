/* =========================================================
   1. TYPOGRAPHIE ALÉATOIRE
   ========================================================= */

// Chaque police est associée à des mots qui vont bien avec son caractère.
// Pour en ajouter une : copiez un bloc, changez le nom (il doit exister
// dans le lien Google Fonts de index.html), la graisse min/max et les mots.
// Toutes ces polices ont une graisse minimale très fine (100 ou 200).
const polices = [
  { nom: "Fraunces",            type: "serif",      min: 100, max: 900, mots: ["Nectar", "Brioche", "Douceur", "Gourmand", "Sirop"] },
  { nom: "Roboto Serif",        type: "serif",      min: 100, max: 900, mots: ["Journal", "Chapitre", "Gazette", "Courrier"] },
  { nom: "Inter",               type: "sans-serif", min: 100, max: 900, mots: ["Silence", "Minimal", "Essentiel", "Neutre"] },
  { nom: "Unbounded",           type: "sans-serif", min: 200, max: 900, majuscules: true, mots: ["Fusée", "Turbo", "Galaxie", "Cosmos", "Futur"] },
  { nom: "Outfit",              type: "sans-serif", min: 100, max: 900, mots: ["Souffle", "Horizon", "Lumière", "Aurore"] },
  { nom: "JetBrains Mono",      type: "monospace",  min: 100, max: 800, mots: ["Binaire", "Terminal", "Algorithme", "Console"] },
  { nom: "Bricolage Grotesque", type: "sans-serif", min: 200, max: 800, mots: ["Atelier", "Bricolage", "Collage", "Maquette"] },
  { nom: "Sora",                type: "sans-serif", min: 100, max: 800, mots: ["Signal", "Orbite", "Matrice", "Vecteur"] },
  { nom: "Josefin Sans",        type: "sans-serif", min: 100, max: 700, mots: ["Élégance", "Soirée", "Mousseline", "Velours"] },
  { nom: "Big Shoulders Display", type: "sans-serif", min: 100, max: 900, majuscules: true, mots: ["Chantier", "Industrie", "Manifeste", "Acier"] },
  { nom: "Epilogue",            type: "sans-serif", min: 100, max: 900, mots: ["Édition", "Manchette", "Affiche", "Colonne"] },
  { nom: "Lexend",              type: "sans-serif", min: 100, max: 900, mots: ["Lecture", "Clarté", "Lisible", "Syllabe"] }
];

// Réglages des graisses extrêmes (la position du curseur de graisse va de 0 à 1)
const SEUIL_FIN = 0.2;     // en dessous : on grignote les lettres (traits de quelques pixels)
const SEUIL_GRAS = 0.6;    // au-dessus : on épaissit le contour des lettres
const EROSION_MAX = 0.005; // grignotage maximal, en em (rayon d'érosion)
const CONTOUR_MAX = 0.12;  // épaisseur maximale du contour, en em
const ETIREMENT_MAX = 4;   // étirement maximal : à ±100, le mot est multiplié (ou divisé) par ce facteur

const $ = (id) => document.getElementById(id);

const mot = $("mot");
const zone = document.querySelector(".zone-mot");
const legende = $("legende");
const graisse = $("graisse");
const espacement = $("espacement");
const taille = $("taille");
const valGraisse = $("val-graisse");
const valEspacement = $("val-espacement");
const valTaille = $("val-taille");
const etirementH = $("etirement-h");
const etirementV = $("etirement-v");
const italique = $("italique");
const valEtirementH = $("val-etirement-h");
const valEtirementV = $("val-etirement-v");

// Filtre d'érosion (défini dans index.html) : amincit les lettres sans faire apparaître
// les chevauchements du tracé de la police
const erosion = $("erosion");

function auHasard(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

function entreDeux(min, max) {
  return min + Math.random() * (max - min);
}

// On évite de tirer deux fois de suite la même police
let derniere = null;
try { derniere = localStorage.getItem("derniere-police"); } catch (e) {}
const police = auHasard(polices.filter((p) => p.nom !== derniere));
try { localStorage.setItem("derniere-police", police.nom); } catch (e) {}

// Réglage d'un curseur (valeur de départ tirée au hasard). Un double-clic le remet à cette valeur de départ.
function regler(curseur, min, max, step, valeur) {
  Object.assign(curseur, { min, max, step, value: valeur });
  const depart = curseur.value;
  curseur.addEventListener("dblclick", () => {
    curseur.value = depart;
    appliquer();
  });
}

// Graisse : 0 = le plus fin possible, 100 = le plus gras possible
regler(graisse, 0, 100, 1, Math.round(entreDeux(15, 85)));

// Espacement : -0.1 = lettres presque superposées, 0.8 = lettres très écartées
regler(espacement, -0.1, 0.8, 0.005,
  (police.majuscules ? entreDeux(0.02, 0.15) : entreDeux(-0.03, 0.08)).toFixed(3));

// Taille : en % de la taille maximale (= largeur de l'écran)
regler(taille, 5, 100, 1, Math.round(entreDeux(40, 65)));

// Étirement horizontal et vertical : de -100 à +100, position 0 (aucun étirement) à l'ouverture
regler(etirementH, -100, 100, 1, 0);
regler(etirementV, -100, 100, 1, 0);

// Application de la police et du mot
mot.textContent = auHasard(police.mots);
mot.style.fontFamily = `"${police.nom}", ${police.type}`;
mot.style.textTransform = police.majuscules ? "uppercase" : "none";
legende.textContent = "Police : " + police.nom;

// Applique la graisse et l'espacement au mot
function styleTexte(poids, espace) {
  mot.style.fontWeight = poids;
  mot.style.letterSpacing = espace + "em";
  mot.style.textIndent = espace + "em"; // recentre le mot malgré l'espace ajouté après la dernière lettre
}

// Mesure la largeur du mot pour une graisse et un espacement donnés (à 100 px de haut)
function largeurPour(poids, espace) {
  mot.style.transform = "none"; // on mesure sans étirement (il est réappliqué ensuite par appliquer)
  mot.style.fontSize = "100px";
  styleTexte(poids, espace);
  return mot.getBoundingClientRect().width;
}

// Calcule la taille du texte : jamais de retour à la ligne, et le curseur de taille agit sur toute sa course.
// La taille ne dépend ni de la graisse ni de l'espacement : les lettres gardent leur taille quand on
// épaissit ou qu'on espace le mot, et celles des extrémités sortent simplement de l'écran par les côtés.
function calculerTaille() {
  if (!mot.textContent.trim()) return;

  // Largeur disponible = celle de la zone du mot (donc l'écran moins les marges définies dans style.css)
  const largeurDispo = zone.clientWidth;

  // Taille de référence (= 100 %) : le mot remplit l'écran avec une graisse normale et sans espacement
  const poidsRef = Math.min(Math.max(400, police.min), police.max);
  const tailleRef = (100 * largeurDispo) / (largeurPour(poidsRef, 0) || 1);

  mot.style.fontSize = (taille.value / 100) * tailleRef + "px";
}

// Affiche un "+" devant les valeurs positives (ex. : +25)
function avecSigne(valeur) {
  return (valeur > 0 ? "+" : "") + valeur;
}

function appliquer() {
  const t = graisse.value / 100;
  const poids = police.min + t * (police.max - police.min);
  const espace = Number(espacement.value);

  // Graisse extrême : au-delà de la graisse maximale de la police, on épaissit le contour
  // des lettres (presque illisible).
  if (t > SEUIL_GRAS) {
    const contour = ((t - SEUIL_GRAS) / (1 - SEUIL_GRAS)) ** 1.5 * CONTOUR_MAX;
    mot.style.webkitTextStroke = contour + "em var(--noir)";
  } else {
    mot.style.webkitTextStroke = "0";
  }

  // Italique (décocher = texte normal)
  mot.style.fontStyle = italique.checked ? "italic" : "normal";

  calculerTaille();
  // Après la mesure, on remet la graisse et l'espacement réels
  styleTexte(poids, espace);

  // Étirement : -100 = mot divisé par ETIREMENT_MAX, 0 = taille normale, +100 = mot multiplié par ETIREMENT_MAX.
  // Le mot est étiré depuis son centre et peut sortir de l'écran.
  const echelleX = ETIREMENT_MAX ** (etirementH.value / 100);
  const echelleY = ETIREMENT_MAX ** (etirementV.value / 100);
  mot.style.transform = `scale(${echelleX}, ${echelleY})`;

  // À l'autre bout, on grignote un peu les lettres pour obtenir des traits de quelques pixels
  // seulement. L'érosion s'applique sur le rendu final, ce qui évite les trous blancs aux
  // endroits où les tracés de la police se chevauchent.
  const rayon = t < SEUIL_FIN ? ((SEUIL_FIN - t) / SEUIL_FIN) * EROSION_MAX * parseFloat(mot.style.fontSize) : 0;
  erosion.setAttribute("radius", rayon || 0);
  mot.style.filter = rayon > 0 ? "url(#grignote)" : "none";

  valGraisse.textContent = graisse.value;
  valEspacement.textContent = espace.toFixed(2) + " em";
  valTaille.textContent = taille.value + " %";
  valEtirementH.textContent = avecSigne(etirementH.value);
  valEtirementV.textContent = avecSigne(etirementV.value);
}

[graisse, espacement, taille, etirementH, etirementV, italique].forEach((reglage) => {
  reglage.addEventListener("input", appliquer);
});
window.addEventListener("resize", appliquer);
mot.addEventListener("input", appliquer);
appliquer();

// Entrée = pas de saut de ligne ; le texte collé est toujours du texte simple
mot.addEventListener("keydown", (event) => {
  if (event.key === "Enter") event.preventDefault();
});
mot.addEventListener("paste", (event) => {
  event.preventDefault();
  const texte = (event.clipboardData.getData("text") || "").replace(/\s+/g, " ");
  document.execCommand("insertText", false, texte);
});

// On affiche le mot une fois la police chargée (évite un flash de police par défaut)
const afficher = () => {
  appliquer(); // on recalcule la taille avec la vraie police
  mot.classList.add("pret");
};
Promise.race([
  document.fonts.load(`400 1em "${police.nom}"`, mot.textContent),
  new Promise((resolve) => setTimeout(resolve, 1500))
]).then(afficher, afficher);


/* =========================================================
   2. HALO QUI SUIT LA SOURIS
   ========================================================= */

const HORS_ECRAN = -999;
let sourisX = HORS_ECRAN;
let sourisY = HORS_ECRAN;
let enAttente = false;

function mettreAJourHalo() {
  document.body.style.setProperty("--x", sourisX + "px");
  document.body.style.setProperty("--y", sourisY + "px");
  enAttente = false;
}

function deplacerHalo(x, y) {
  sourisX = x;
  sourisY = y;
  // Un seul calcul par image affichée : mouvement fluide
  if (!enAttente) {
    enAttente = true;
    requestAnimationFrame(mettreAJourHalo);
  }
}

document.addEventListener("mousemove", (event) => deplacerHalo(event.clientX, event.clientY));

// Quand la souris quitte la page, on cache le halo
document.addEventListener("mouseleave", () => deplacerHalo(HORS_ECRAN, HORS_ECRAN));


/* =========================================================
   3. SONS (discrets)
   ========================================================= */

const VOLUME_TOC = 0.1;   // volume du "toc" de la case italique, de 0 (silence) à 1 (très fort)
const VOLUME_CLIC = 0.03; // volume du petit clic des curseurs, de 0 (silence) à 1 (très fort)
const CRANS = 40;         // nombre de clics sur toute la course d'un curseur

// Les sons sont synthétisés (aucun fichier). Le navigateur n'autorise le son qu'après une action
// de l'utilisateur : le moteur audio est donc créé au premier son, qui suit toujours un clic ou une touche.
let contexteAudio = null;

function jouer(son) {
  const Contexte = window.AudioContext || window.webkitAudioContext;
  if (!contexteAudio && Contexte) contexteAudio = new Contexte();
  if (!contexteAudio) return;
  contexteAudio.resume().then(() => son(contexteAudio)).catch(() => {});
}

// Souffle très bref qui s'éteint tout de suite (utilisé par les deux sons)
function souffleBref(contexte, debut, duree, volume, sortie) {
  const longueur = Math.floor(contexte.sampleRate * duree);
  const bruit = contexte.createBuffer(1, longueur, contexte.sampleRate);
  const valeurs = bruit.getChannelData(0);
  for (let i = 0; i < longueur; i++) valeurs[i] = (Math.random() * 2 - 1) * (1 - i / longueur);
  const source = contexte.createBufferSource();
  const gain = contexte.createGain();
  source.buffer = bruit;
  gain.gain.value = volume;
  source.connect(gain).connect(sortie);
  source.start(debut);
}

// Note courte dont la hauteur descend vite, puis s'éteint (utilisée par les deux sons)
function noteCourte(contexte, debut, aigu, grave, duree, volume, sortie) {
  const note = contexte.createOscillator();
  const gain = contexte.createGain();
  note.frequency.setValueAtTime(aigu, debut);
  note.frequency.exponentialRampToValueAtTime(grave, debut + duree * 0.7);
  gain.gain.setValueAtTime(0, debut);
  gain.gain.linearRampToValueAtTime(volume, debut + 0.004); // démarrage très doux
  gain.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
  note.connect(gain).connect(sortie);
  note.start(debut);
  note.stop(debut + duree + 0.01);
}

// Le "toc" feutré de la case italique, un peu différent à chaque fois
function jouerToc(contexte, debut = contexte.currentTime) {
  const variation = 0.95 + Math.random() * 0.1;

  // Filtre passe-bas : c'est lui qui rend le son "feutré"
  const filtre = contexte.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.value = 1000;
  filtre.connect(contexte.destination);

  noteCourte(contexte, debut, 330 * variation, 170 * variation, 0.14, VOLUME_TOC, filtre);
  souffleBref(contexte, debut, 0.02, VOLUME_TOC * 0.3, filtre); // le frottement de feutre
}

// "tic" de cran de molette
function jouerClic(contexte, debut = contexte.currentTime) {
  const variation = 0.95 + Math.random() * 0.1;

  // Deux filtres : l'un retire tout le grave (plus de "corps", donc plus de "toc"), l'autre adoucit l'extrême aigu
  const filtreGrave = contexte.createBiquadFilter();
  filtreGrave.type = "highpass";
  filtreGrave.frequency.value = 1800;
  const filtreAigu = contexte.createBiquadFilter();
  filtreAigu.type = "lowpass";
  filtreAigu.frequency.value = 5000;
  filtreGrave.connect(filtreAigu).connect(contexte.destination);

  souffleBref(contexte, debut, 0.006, VOLUME_CLIC, filtreGrave);                                      // le contact du cran
  noteCourte(contexte, debut, 3600 * variation, 2800 * variation, 0.018, VOLUME_CLIC * 0.5, filtreGrave); // le petit ressort
}

// Case italique : le toc est joué quand on la coche et quand on la décoche (c'est le seul son de clic du site)
italique.addEventListener("change", () => jouer(jouerToc));

// Curseurs : un petit clic à chaque cran franchi (CRANS crans sur toute la course, quelle que soit la vitesse)
[graisse, espacement, taille, etirementH, etirementV].forEach((curseur) => {
  const cran = () => Math.floor(((curseur.value - curseur.min) / (curseur.max - curseur.min)) * CRANS);
  let dernierCran = cran();

  curseur.addEventListener("input", () => {
    const cranActuel = cran();
    if (cranActuel !== dernierCran) {
      dernierCran = cranActuel;
      jouer(jouerClic);
    }
  });
  // Le double-clic remet le curseur à sa valeur de départ (sans clic) : on resynchronise le cran
  curseur.addEventListener("dblclick", () => { dernierCran = cran(); });
});
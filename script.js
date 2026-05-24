/* ================================================
   SCRIPT.JS — Portfolio de Joys Boum Mben

   PLAN DU FICHIER :
   1. Animation au défilement (IntersectionObserver)
   2. Modale des projets (ouverture / fermeture)
   3. Lien actif dans la navigation
================================================ */


/* ================================================
   1. ANIMATION AU DÉFILEMENT
   
   Principe :
   - Tous les éléments .animer-entree sont invisibles (CSS : opacity:0)
   - On surveille chaque élément avec IntersectionObserver
   - Quand un élément entre dans la zone visible de l'écran,
     on lui ajoute la classe .visible → le CSS le rend visible
================================================ */

// On sélectionne TOUS les éléments à animer dans la page
const elementsAAnimer = document.querySelectorAll('.animer-entree');

// On crée l'observateur avec ses options
const observateur = new IntersectionObserver(
  (entrees) => {
    // "entrees" = liste des éléments surveillés qui ont changé d'état
    entrees.forEach((entree) => {

      // isIntersecting = true si l'élément est visible à l'écran
      if (entree.isIntersecting) {

        // On ajoute .visible → l'animation CSS se déclenche
        entree.target.classList.add('visible');

        // On arrête de surveiller cet élément : il a déjà été animé
        // (sans ça, il serait animé à chaque fois qu'on scrolle dessus)
        observateur.unobserve(entree.target);
      }
    });
  },
  {
    threshold: 0.1,              // déclenche quand 10% de l'élément est visible
    rootMargin: '0px 0px -40px 0px' // décale légèrement le bas de la zone de détection
  }
);

// On donne chaque élément à surveiller à l'observateur
elementsAAnimer.forEach((el) => observateur.observe(el));


/* ================================================
   2. MODALE DES PROJETS

   Principe :
   - Clic sur une carte → on lit ses attributs data-*
     (data-titre, data-desc, data-lien, data-tags)
   - On remplit la modale avec ces données
   - On affiche la modale en ajoutant la classe .active
   - Fermeture : bouton ×, clic dehors, ou touche Échap
================================================ */

// On récupère les éléments de la modale par leur id
const modale       = document.getElementById('modale');
const modaleTitre  = document.getElementById('modale-titre-texte');
const modaleDesc   = document.getElementById('modale-desc');
const modaleTags   = document.getElementById('modale-tags');
const modaleLien   = document.getElementById('modale-lien');
const modaleFermer = document.getElementById('modale-fermer');

// On sélectionne toutes les cartes projets
const cartesProjet = document.querySelectorAll('.projet-carte');

/* --- Fonction OUVRIR la modale --- */
function ouvrirModale(carte) {

  // Étape 1 : lire les données stockées dans les attributs data-* de la carte
  // Ex : data-titre="CinéTicket" → carte.dataset.titre = "CinéTicket"
  const titre     = carte.dataset.titre;
  const desc      = carte.dataset.desc;
  const lien      = carte.dataset.lien;
  const lienTexte = carte.dataset.lienTexte; // data-lien-texte → lienTexte (camelCase auto)
  const tags      = carte.dataset.tags ? carte.dataset.tags.split(',') : [];
  //                                     ^ si data-tags existe, on découpe par virgule

  // Étape 2 : injecter ces données dans la modale
  modaleTitre.textContent = titre;
  modaleDesc.textContent  = desc;
  modaleLien.href         = lien;
  modaleLien.target = '_blank';
  modaleLien.rel    = 'noopener';
  modaleLien.textContent  = lienTexte;

  // Étape 3 : générer les tags dynamiquement en HTML
  // .map() transforme chaque tag en balise <span>
  // .join('') réunit tout en une seule chaîne de texte
  modaleTags.innerHTML = tags
    .map(tag => `<span class="projet-tag">${tag.trim()}</span>`)
    .join('');

  // Étape 4 : afficher la modale
  modale.classList.add('active');
  modale.setAttribute('aria-hidden', 'false'); // accessibilité
  document.body.style.overflow = 'hidden';     // bloque le scroll de la page derrière

  // Étape 5 : mettre le focus sur le bouton fermer (accessibilité clavier)
  modaleFermer.focus();
}

/* --- Fonction FERMER la modale --- */
function fermerModale() {
  modale.classList.remove('active');
  modale.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // rétablit le scroll
}

/* --- Brancher les événements sur chaque carte --- */
cartesProjet.forEach((carte) => {

  // Clic souris
  carte.addEventListener('click', () => ouvrirModale(carte));

  // Touche Entrée ou Espace (pour les utilisateurs au clavier)
  carte.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // empêche le scroll au Space
      ouvrirModale(carte);
    }
  });
});

/* --- Fermeture de la modale --- */

// Via le bouton ×
modaleFermer.addEventListener('click', fermerModale);

// En cliquant sur le fond sombre (en dehors de la boîte blanche)
modale.addEventListener('click', (e) => {
  // e.target = l'élément cliqué
  // Si on a cliqué sur l'overlay lui-même (et pas sur la boîte), on ferme
  if (e.target === modale) fermerModale();
});

// Via la touche Échap (bonne pratique UX)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modale.classList.contains('active')) {
    fermerModale();
  }
});


/* ================================================
   3. LIEN ACTIF DANS LA NAVIGATION

   Principe :
   - On surveille chaque section avec IntersectionObserver
   - Quand une section est au centre de l'écran,
     on colore le lien nav correspondant en rose
================================================ */

// Tous les liens de navigation
const liensNav = document.querySelectorAll('.nav-liens a');

// Toutes les sections qui ont un id (hero, a-propos, competences...)
const toutesLesSections = document.querySelectorAll('section[id]');

// Un observateur par section
toutesLesSections.forEach((section) => {

  new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {

        if (entree.isIntersecting) {

          // On remet tous les liens à leur couleur normale
          liensNav.forEach(lien => lien.style.color = '');

          // On cherche le lien qui pointe vers cette section
          // Ex : section id="a-propos" → on cherche a[href="#a-propos"]
          const lienActif = document.querySelector(
            `.nav-liens a[href="#${entree.target.id}"]`
          );

          // Si ce lien existe, on le colore en rose clair
          if (lienActif) {
            lienActif.style.color = 'var(--rose-clair)';
          }
        }
      });
    },
    {
      // rootMargin négatif = on déclenche quand la section est bien au centre
      // -40% en haut et -55% en bas = zone de détection au milieu de l'écran
      rootMargin: '-40% 0px -55% 0px'
    }
  ).observe(section);

});
/* ================================================
   POURCENTAGE ALIGNÉ AVEC LA BARRE
   Déplace le texte du % pour qu'il soit
   exactement au bout de la barre remplie.
================================================ */

// On attend que les barres soient animées (1.2s) avant de positionner
document.querySelectorAll('.competence-carte').forEach((carte) => {
  const barre    = carte.querySelector('.competence-barre');
  const pourcent = carte.querySelector('.competence-pourcent');

  if (!barre || !pourcent) return; // sécurité si l'élément n'existe pas

  // On lit la largeur cible de la barre (ex: "80%")
  const valeur = barre.style.width || getComputedStyle(barre).width;

  // On positionne le % à droite, aligné avec le bout de la barre
  pourcent.style.textAlign  = 'left';
  pourcent.style.width      = valeur;
  pourcent.style.display    = 'block';
  pourcent.style.transition = 'width 1.2s ease';

  // Petit délai pour laisser l'animation démarrer
  setTimeout(() => {
    pourcent.style.width = valeur;
  }, 100);
});/* ================================================
   POURCENTAGE ALIGNÉ AVEC LA BARRE
   Déplace le texte du % pour qu'il soit
   exactement au bout de la barre remplie.
================================================ */

// On attend que les barres soient animées (1.2s) avant de positionner
document.querySelectorAll('.competence-carte').forEach((carte) => {
  const barre    = carte.querySelector('.competence-barre');
  const pourcent = carte.querySelector('.competence-pourcent');

  if (!barre || !pourcent) return; // sécurité si l'élément n'existe pas

  // On lit la largeur cible de la barre (ex: "80%")
  const valeur = barre.style.width || getComputedStyle(barre).width;

  // On positionne le % à droite, aligné avec le bout de la barre
  pourcent.style.textAlign  = 'left';
  pourcent.style.width      = valeur;
  pourcent.style.display    = 'block';
  pourcent.style.transition = 'width 1.2s ease';

  // Petit délai pour laisser l'animation démarrer
  setTimeout(() => {
    pourcent.style.width = valeur;
  }, 100);
});/* ================================================
 /* POURCENTAGE SYNCHRONISÉ AVEC LA BARRE */
document.querySelectorAll('.competence-carte').forEach((carte) => {
  const barre    = carte.querySelector('.competence-barre');
  const pourcent = carte.querySelector('.competence-pourcent');

  if (!barre || !pourcent) return;

  // On lit data-pourcentage="80" → valeur = "80"
  const valeur = barre.dataset.pourcentage;

  if (!valeur) return;

  // On applique la largeur à la barre
  barre.style.width = valeur + '%';

  // On affiche le bon chiffre
  pourcent.textContent = valeur + '%';
});

/* ================================================
   CURSEUR PERSONNALISÉ — DIAMANT
================================================ */

const curseurPoint  = document.getElementById('curseur-point');
const curseurCercle = document.getElementById('curseur-cercle');

let sourisX = 0, sourisY = 0;
let cercleX = 0, cercleY = 0;

/* Suit la souris instantanément */
document.addEventListener('mousemove', (e) => {
  sourisX = e.clientX;
  sourisY = e.clientY;

  curseurPoint.style.left = sourisX + 'px';
  curseurPoint.style.top  = sourisY + 'px';
});

/* Cercle qui suit avec retard fluide */
function animerCercle() {
  cercleX += (sourisX - cercleX) * 0.12;
  cercleY += (sourisY - cercleY) * 0.12;

  curseurCercle.style.left = cercleX + 'px';
  curseurCercle.style.top  = cercleY + 'px';

  requestAnimationFrame(animerCercle);
}
animerCercle();

/* Effet au survol des éléments cliquables */
document.querySelectorAll(
  'a, button, .projet-carte, .competence-carte, .btn-principal, .btn-secondaire'
).forEach((el) => {
  el.addEventListener('mouseenter', () => curseurCercle.classList.add('survol'));
  el.addEventListener('mouseleave', () => curseurCercle.classList.remove('survol'));
});

/* Effet au clic */
document.addEventListener('mousedown', () => curseurPoint.classList.add('clic'));
document.addEventListener('mouseup',   () => curseurPoint.classList.remove('clic'));

/* Cache quand la souris quitte la fenêtre */
document.addEventListener('mouseleave', () => {
  curseurPoint.style.opacity  = '0';
  curseurCercle.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  curseurPoint.style.opacity  = '1';
  curseurCercle.style.opacity = '0.8';
});
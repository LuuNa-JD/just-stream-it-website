# JustStreamIt - Site Web de Streaming de Films

## Vue d'ensemble
JustStreamIt est un site web de streaming de films qui affiche les films les mieux notés, les films par catégorie, ainsi que des informations détaillées sur chaque film. Le site est construit avec HTML, CSS (en utilisant Sass pour le style) et JavaScript. Les données sont récupérées via une API locale.

## Fonctionnalités
- **Affichage du Meilleur Film** : Le film le mieux noté est mis en avant de manière proéminente.
- **Films les Mieux Notés** : Une section affichant les 10 films les mieux notés, basés sur les scores IMDB et les votes.
- **Films par Catégorie** : Les utilisateurs peuvent parcourir les films classés par genres tels que l'Horreur, la Comédie, l'Action, etc.
- **Détails du Film dans une Fenêtre Modale** : Une fenêtre modale affiche des informations détaillées sur un film sélectionné.
- **Contenu Dynamique** : Les données des films sont récupérées depuis une API locale et le contenu est rendu dynamiquement sur la page.

## Prérequis

- **Node.js** : Assurez-vous que Node.js est installé sur votre système. Vous pouvez le télécharger depuis [Node.js](https://nodejs.org/).

## Installation

### 1. Cloner le Répertoire
Clonez ce projet sur votre machine locale :

\`\`\`bash
git clone https://github.com/LuuNa-JD/just-stream-it-website.git
cd juststreamit
\`\`\`

### 2. Installer les Dépendances
Installez les dépendances du projet via npm :

\`\`\`bash
npm install
\`\`\`

### 3. Configuration de l'API Locale

1. **Installation de l'API** :
   - Téléchargez et installez l'API locale depuis [JustStreamIt API](https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR).
   - Suivez les instructions du README de l'API pour l'installer et la lancer sur votre machine locale.

2. **Lancer l'API** :
   - Assurez-vous que l'API est en cours d'exécution sur \`http://localhost:8000/\` afin que le site web puisse récupérer les données des films.

### 4. Compiler le CSS avec Sass
Le projet utilise Sass pour la gestion des styles. Vous devez compiler les fichiers Sass en CSS :

\`\`\`bash
npm run build-css
\`\`\`

Cette commande compile le fichier \`styles.scss\` en \`styles.css\`.

### 5. Lancer le Site Web
Ouvrez le fichier \`index.html\` dans votre navigateur pour voir le site en action.

## Utilisation
- **Navigation** : Parcourez les films les mieux notés et les films par catégorie.
- **Voir plus** : Cliquez sur "Voir plus" pour afficher plus de films dans une catégorie spécifique.
- **Détails** : Cliquez sur le bouton "Détails" pour voir plus d'informations sur un film dans une fenêtre modale.

## Dépendances
- **Sass** : Pour la compilation du CSS.
- **API Locale** : Pour récupérer les données des films.

## Auteurs
- **Denizot Julien** - Développeur Principal

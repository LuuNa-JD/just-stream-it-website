document.addEventListener('DOMContentLoaded', function () {
  const bestMovieLink = 'http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&sort_by=-votes&limit=1';
  const topMoviesLink = 'http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&sort_by=-votes&limit=10';
  const category1Link = 'http://localhost:8000/api/v1/titles/?genre=horror&sort_by=-imdb_score&sort_by=-votes&limit=10';
  const category2Link = 'http://localhost:8000/api/v1/titles/?genre=comedy&sort_by=-imdb_score&sort_by=-votes&limit=10';

  let totalMovies = []; // Définit la liste des films
  let currentDisplayedCount = 0; // Traque le nombre de films affichés
  let isShowingMore = false; // Traque si "Voir plus" est actif

  let categoryMovies = {}; // Stocke les films par catégorie
  let categoryDisplayedCount = {}; // Traque le nombre de films affichés par catégorie
  let isShowingMoreCategory = {}; // Traque si "Voir plus" est actif par catégorie


  async function getRandomImage() {
    const response = await fetch('https://loremflickr.com/320/240');
    return response.url;
  }

  // Fonction pour récupérer le meilleur film
  function fetchBestMovie() {
    fetch(bestMovieLink)
      .then(response => response.json())
      .then(data => {
        const bestMovie = data.results[0];
        return fetch(`http://localhost:8000/api/v1/titles/${bestMovie.id}`);
      })
      .then(response => response.json())
      .then(movie => {
        displayBestMovie(movie);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération du meilleur film :', error);
      });
  }

  // Fonction pour afficher le meilleur film
  function displayBestMovie(movie) {
    const imgElement = document.querySelector('#best-movie img');
    const imageUrl = movie.image_url;

    imgElement.src = imageUrl;
    imgElement.onerror = async function () { // Si l'image ne charge pas, affiche une image aléatoire
      this.src = await getRandomImage();
      this.onerror = null;
    };
    document.getElementById('best-movie-title').textContent = movie.title;
    document.getElementById('best-movie-summary').textContent = movie.description;
    document.getElementById('best-movie-details').onclick = function () {
      showMovieDetails(movie);
    };
  }

  // Fonction pour récupérer les films les mieux notés
  function fetchTopRatedMovies(url, accumulatedMovies = [], skipFirst = true) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const moviesToAdd = skipFirst ? data.results.slice(1) : data.results; // Ignorer le premier film pour éviter les doublons
        accumulatedMovies = accumulatedMovies.concat(moviesToAdd);

        if (accumulatedMovies.length < 10 && data.next) {
          fetchTopRatedMovies(data.next, accumulatedMovies, false);
        } else {
          totalMovies = accumulatedMovies;
          const moviesContainer = document.getElementById('top-rated-movies');
          const initialCount = getInitialMoviesCount();
          displayMovies(totalMovies, moviesContainer, initialCount);
          setupViewMoreButton(); // Paramétrer le bouton "Voir plus"
        }
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des films les mieux notés :', error); // Afficher une erreur si la requête échoue
      });
  }

  // Fonction pour récupérer les films par catégorie
  function fetchMoviesByCategory(url, category, accumulatedMovies = []) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const moviesToAdd = data.results;
        accumulatedMovies = accumulatedMovies.concat(moviesToAdd);

        if (accumulatedMovies.length < 10 && data.next) {
          fetchMoviesByCategory(data.next, category, accumulatedMovies);
        } else {
          categoryMovies[category] = accumulatedMovies;
          const moviesContainer = document.getElementById(`movies-${category}`);
          const initialCount = getInitialMoviesCount();
          displayMovies(categoryMovies[category], moviesContainer, initialCount, category);
          setupViewMoreButtonForCategory(category);
        }
      })
      .catch(error => {
        console.error(`Erreur lors de la récupération des films de la catégorie ${category} :`, error);
      });
  }

  // Fonction pour obtenir le nombre de films à afficher en fonction de la largeur de l'écran
  function getInitialMoviesCount() {
    if (window.innerWidth >= 1025) {
      return 6;
    } else if (window.innerWidth >= 577) {
      return 4;
    } else {
      return 2;
    }
  }

  // Fonction pour obtenir le nombre de films à afficher lors de l'appui sur "Voir plus"
  function getViewMoreCount() {
    if (window.innerWidth >= 1025) {
      return 0;
    } else if (window.innerWidth >= 577) {
      return 2;
    } else {
      return 4;
    }
  }

  // Fonction pour afficher les films
  function displayMovies(movies, container, limit, category = null) {
    if (!container) {
      console.error(`Élément du conteneur avec l'ID ${container} introuvable.`);
      return;
    }

    container.innerHTML = ''; // Effacer le contenu du conteneur
    const moviesToDisplay = movies.slice(0, limit);
    moviesToDisplay.forEach(movie => {
      const movieCard = createMovieCard(movie);
      container.appendChild(movieCard);
    });

    if (category) {
      categoryDisplayedCount[category] = limit;
    } else {
      currentDisplayedCount = limit;
    }
  }

  // Fonction pour créer une carte de film
  function createMovieCard(movie) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'movie-card';

    const img = document.createElement('img');
    img.className = 'movie-img';
    img.src = movie.image_url;
    img.alt = movie.title;

    img.onerror = async function () {
      this.src = await getRandomImage();
      this.onerror = null; // Éviter une boucle infinie
    };

    const cardBody = document.createElement('div');
    cardBody.className = 'movie-card-body';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'movie-card-title';
    cardTitle.textContent = movie.title;

    const detailsButton = document.createElement('button');
    detailsButton.className = 'movie-btn';
    detailsButton.textContent = 'Détails';
    detailsButton.onclick = function () {
      fetchMovieDetails(movie.id);
    };

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(detailsButton);
    cardDiv.appendChild(img);
    cardDiv.appendChild(cardBody);

    return cardDiv;
  }

  // Fonction pour récupérer les détails du film
  function fetchMovieDetails(movieId) {
    fetch(`http://localhost:8000/api/v1/titles/${movieId}`)
      .then(response => response.json())
      .then(movie => {
        showMovieDetails(movie);
      });
  }

  function closeModal() {
    document.getElementById('movieModal').style.display = 'none';
  }

  // Affiche les détails du film dans une modale
  async function showMovieDetails(movie) {
    const imgElement = document.getElementById('modal-movie-img');
    imgElement.src = movie.image_url;
    imgElement.onerror = async function () {
        this.src = await getRandomImage();
        this.onerror = null;
    };

    document.getElementById('modal-movie-title').textContent = movie.title;

    // Combine year and genres
    document.getElementById('modal-movie-year-genre').textContent = `${movie.year} - ${movie.genres.join(', ')}`;

    // Combine rating and duration
    document.getElementById('modal-movie-rating-duration').textContent = `PG-${movie.rated} - ${movie.duration} minutes (${movie.countries})`;

    document.getElementById('modal-movie-imdb-score').textContent = `IMDB score: ${movie.imdb_score}/10`;

    document.getElementById('modal-movie-director').textContent = movie.directors.join(', ');

    document.getElementById('modal-movie-summary').textContent = movie.description;

    document.getElementById('modal-movie-actors').textContent = movie.actors.join(', ');

    document.querySelector('.modal').style.display = 'block'; // Show the modal

    document.querySelector('.btn.btn-danger[aria-label="Close"]').onclick = closeModal;
  }


  // Configurer le bouton "Voir plus" pour les films les mieux notés
  function setupViewMoreButton() {
    const viewMoreButton = document.getElementById('view-more');
    const moviesContainer = document.getElementById('top-rated-movies');
    const initialCount = getInitialMoviesCount();
    const viewMoreCount = getViewMoreCount();

    if (viewMoreCount === 0) {
      viewMoreButton.style.display = 'none'; // Cache le bouton sur desktop
    } else {
      viewMoreButton.style.display = 'block'; // Affiche le bouton sur tablette et mobile
      viewMoreButton.textContent = isShowingMore ? 'Voir moins' : 'Voir plus';

      viewMoreButton.onclick = function () {
        if (isShowingMore) {
          // Afficher moins
          displayMovies(totalMovies, moviesContainer, initialCount);
          currentDisplayedCount = initialCount;
          isShowingMore = false;
          this.textContent = 'Voir plus';
        } else {
          // Afficher plus
          const newLimit = Math.min(currentDisplayedCount + viewMoreCount, totalMovies.length);
          displayMovies(totalMovies, moviesContainer, newLimit);
          currentDisplayedCount = newLimit;
          isShowingMore = true;
          this.textContent = 'Voir moins';
        }
      };
    }

    // Affichage initial
    displayMovies(totalMovies, moviesContainer, initialCount);
    currentDisplayedCount = initialCount;
  }

  // Paramétrer le bouton "Voir plus" pour les films par catégorie
  function setupViewMoreButtonForCategory(category) {
    const viewMoreButton = document.getElementById(`view-more-${category}`);
    const moviesContainer = document.getElementById(`movies-${category}`);
    const initialCount = getInitialMoviesCount();
    const viewMoreCount = getViewMoreCount();

    if (viewMoreCount === 0) {
      viewMoreButton.style.display = 'none'; // Masquer le bouton sur ordinateur
    } else {
      viewMoreButton.style.display = 'block'; // Afficher le bouton sur tablette et mobile
      viewMoreButton.textContent = isShowingMoreCategory[category] ? 'Voir moins' : 'Voir plus';

      viewMoreButton.onclick = function () {
        if (isShowingMoreCategory[category]) {
          // Afficher moins
          displayMovies(categoryMovies[category], moviesContainer, initialCount, category);
          isShowingMoreCategory[category] = false;
          this.textContent = 'Voir plus';
        } else {
          // Afficher plus
          const newLimit = Math.min(categoryDisplayedCount[category] + viewMoreCount, categoryMovies[category].length);
          displayMovies(categoryMovies[category], moviesContainer, newLimit, category);
          categoryDisplayedCount[category] = newLimit;
          isShowingMoreCategory[category] = true;
          this.textContent = 'Voir moins';
        }
      };
    }

    // Affichage initial
    displayMovies(categoryMovies[category], moviesContainer, initialCount, category);
    categoryDisplayedCount[category] = initialCount;
  }

  // Ajouter un écouteur d'événements pour le menu déroulant des catégories
  document.getElementById('category-selector').addEventListener('focus', function (event) {
    const categorySelector = event.target;
    const selectedCategoryIndex = categorySelector.selectedIndex;

    // Ajouter une coche verte à l'option sélectionnée quand le menu déroulant est ouvert
    if (!categorySelector.options[selectedCategoryIndex].dataset.originalText) {
        categorySelector.options[selectedCategoryIndex].dataset.originalText = categorySelector.options[selectedCategoryIndex].text;
    }
    categorySelector.options[selectedCategoryIndex].text += ' ✅';
});

document.getElementById('category-selector').addEventListener('blur', function (event) {
    const categorySelector = event.target;

    // Restaurer le texte original de l'option sélectionnée après la fermeture du menu
    setTimeout(() => {
        for (let i = 0; i < categorySelector.options.length; i++) {
            if (categorySelector.options[i].dataset.originalText) {
                categorySelector.options[i].text = categorySelector.options[i].dataset.originalText;
            }
        }
    }, 100);
});

document.getElementById('category-selector').addEventListener('change', function (event) {
    const categorySelector = event.target;
    const selectedCategoryIndex = categorySelector.selectedIndex;
    const viewMoreButton = document.getElementById('view-more-selected-category');

    // Mettre à jour le texte original sans la coche
    categorySelector.options[selectedCategoryIndex].dataset.originalText = categorySelector.options[selectedCategoryIndex].text.replace(' ✅', '');

    // Traiter le changement de sélection
    if (categorySelector.value) {
        fetchMoviesForSelectedCategory(categorySelector.value);
        viewMoreButton.style.display = 'block'; // Affiche le bouton "Voir plus"
    } else {
        viewMoreButton.style.display = 'none'; // Masquer le bouton "Voir plus"
    }

    // Fermer le menu déroulant en retirant le focus
    categorySelector.blur();
});

  // Fonction pour récupérer et afficher les films pour la catégorie sélectionnée
  function fetchMoviesForSelectedCategory(category) {
    const url = `http://localhost:8000/api/v1/titles/?genre=${category}&sort_by=-imdb_score&sort_by=-votes&limit=10`;
    fetchMoviesByCategory(url, 'selected-category');
  }

  // // Fermer la fenêtre modale en cliquant à l'extérieur
  // window.onclick = function (event) {
  //   const modal = document.querySelector('.modal');
  //   if (event.target == modal) {
  //     modal.style.display = 'none';
  //   }
  // };

  // // Fermer la fenêtre modale en cliquant sur le bouton de fermeture
  // document.querySelector('.close').onclick = function () {
  //   document.querySelector('.modal').style.display = 'none';
  // };

  // Récupérer les données initiales
  fetchBestMovie();
  fetchTopRatedMovies(topMoviesLink);

  // Récupérer les films par catégorie
  fetchMoviesByCategory(category1Link, 'category1');
  fetchMoviesByCategory(category2Link, 'category2');

  // Récupérer à nouveau les films lors du redimensionnement de la fenêtre
  window.addEventListener('resize', function () {
    const moviesContainer = document.getElementById('top-rated-movies');
    moviesContainer.innerHTML = ''; // Effacer le conteneur
    const initialCount = getInitialMoviesCount();
    displayMovies(totalMovies, moviesContainer, initialCount);
    isShowingMore = false; // Réinitialiser l'état de "Voir plus"
    setupViewMoreButton();

    // Récupérer à nouveau les films par catégorie
    Object.keys(categoryMovies).forEach(category => {
      const categoryContainer = document.getElementById(`movies-${category}`);
      categoryContainer.innerHTML = ''; // Effacer le conteneur
      displayMovies(categoryMovies[category], categoryContainer, initialCount, category);
      isShowingMoreCategory[category] = false; // Réinitialiser l'état de "Voir plus"
      setupViewMoreButtonForCategory(category);
    });
  });
});

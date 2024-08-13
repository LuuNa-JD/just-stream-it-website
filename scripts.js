// Attendre que le DOM soit complètement chargé avant d'exécuter le script
document.addEventListener('DOMContentLoaded', function () {
  // Définir les liens pour les différentes requêtes API
  const bestMovieLink = 'http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&sort_by=-votes&limit=1';
  const topMoviesLink = 'http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&sort_by=-votes&limit=10';
  const category1Link = 'http://localhost:8000/api/v1/titles/?genre=horror&sort_by=-imdb_score&sort_by=-votes&limit=10';
  const category2Link = 'http://localhost:8000/api/v1/titles/?genre=comedy&sort_by=-imdb_score&sort_by=-votes&limit=10';

  // Initialiser les variables pour stocker les films et les états d'affichage
  let totalMovies = [];
  let currentDisplayedCount = 0;
  let isShowingMore = false;

  let categoryMovies = {};
  let categoryDisplayedCount = {};
  let isShowingMoreCategory = {};

  // Fonction pour obtenir une image aléatoire
  async function getRandomImage() {
    const response = await fetch('https://loremflickr.com/320/240');
    return response.url;
  }

  // Fonction pour récupérer le meilleur film
  function fetchBestMovie() {
    fetch(bestMovieLink)
      .then(response => response.json())
      .then(data => fetch(`http://localhost:8000/api/v1/titles/${data.results[0].id}`))
      .then(response => response.json())
      .then(displayBestMovie)
      .catch(error => console.error('Erreur lors de la récupération du meilleur film :', error));
  }

  // Fonction pour afficher le meilleur film
  function displayBestMovie(movie) {
    const imgElement = document.querySelector('#best-movie img');
    imgElement.src = movie.image_url;
    imgElement.onerror = async function () {
      this.src = await getRandomImage();
      this.onerror = null;
    };
    document.getElementById('best-movie-title').textContent = movie.title;
    document.getElementById('best-movie-summary').textContent = movie.description;
    document.getElementById('best-movie-details').onclick = () => showMovieDetails(movie);
  }

  // Fonction pour récupérer les films les mieux notés
  function fetchTopRatedMovies(url, accumulatedMovies = [], skipFirst = true) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const moviesToAdd = skipFirst ? data.results.slice(1) : data.results;
        accumulatedMovies = accumulatedMovies.concat(moviesToAdd);

        if (accumulatedMovies.length < 10 && data.next) {
          fetchTopRatedMovies(data.next, accumulatedMovies, false);
        } else {
          totalMovies = accumulatedMovies;
          setupViewMoreButton();
        }
      })
      .catch(error => console.error('Erreur lors de la récupération des films les mieux notés :', error));
  }

  // Fonction pour récupérer les films par catégorie
  function fetchMoviesByCategory(url, category, accumulatedMovies = []) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        accumulatedMovies = accumulatedMovies.concat(data.results);

        if (accumulatedMovies.length < 10 && data.next) {
          fetchMoviesByCategory(data.next, category, accumulatedMovies);
        } else {
          categoryMovies[category] = accumulatedMovies;
          setupViewMoreButtonForCategory(category);
        }
      })
      .catch(error => console.error(`Erreur lors de la récupération des films de la catégorie ${category} :`, error));
  }

  // Fonction pour obtenir le nombre initial de films à afficher en fonction de la largeur de la fenêtre
  function getInitialMoviesCount() {
    if (window.innerWidth >= 1025) return 6;
    if (window.innerWidth >= 577) return 4;
    return 2;
  }

  // Fonction pour obtenir le nombre de films à afficher en plus lors du clic sur "Voir plus"
  function getViewMoreCount() {
    if (window.innerWidth >= 1025) return 0;
    if (window.innerWidth >= 577) return 2;
    return 4;
  }

  // Fonction pour afficher les films dans un conteneur donné
  function displayMovies(movies, container, limit, category = null) {
    if (!container) {
      console.error(`Élément du conteneur avec l'ID ${container} introuvable.`);
      return;
    }

    container.innerHTML = '';
    movies.slice(0, limit).forEach(movie => {
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
      this.onerror = null;
    };

    const cardBody = document.createElement('div');
    cardBody.className = 'movie-card-body';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'movie-card-title';
    cardTitle.textContent = movie.title;

    const detailsButton = document.createElement('button');
    detailsButton.className = 'movie-btn';
    detailsButton.textContent = 'Détails';
    detailsButton.onclick = () => fetchMovieDetails(movie.id);

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(detailsButton);
    cardDiv.appendChild(img);
    cardDiv.appendChild(cardBody);

    return cardDiv;
  }

  // Fonction pour récupérer les détails d'un film
  function fetchMovieDetails(movieId) {
    fetch(`http://localhost:8000/api/v1/titles/${movieId}`)
      .then(response => response.json())
      .then(showMovieDetails);
  }

  // Fonction pour fermer la modal
  function closeModal() {
    const modal = document.getElementById('movieModal');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  }

  // Fonction pour afficher les détails d'un film dans une modal
  async function showMovieDetails(movie) {
    const modal = document.getElementById('movieModal');
    const imgElement = document.getElementById('modal-movie-img');

    imgElement.src = movie.image_url;
    imgElement.onerror = async function () {
      this.src = await getRandomImage();
      this.onerror = null;
    };

    document.getElementById('modal-movie-title').textContent = movie.title;
    document.getElementById('modal-movie-year-genre').textContent = `${movie.year} - ${movie.genres.join(', ')}`;
    document.getElementById('modal-movie-rating-duration').textContent = `PG-${movie.rated} - ${movie.duration} minutes (${movie.countries})`;
    document.getElementById('modal-movie-imdb-score').textContent = `IMDB score: ${movie.imdb_score}/10`;
    document.getElementById('modal-movie-director').textContent = movie.directors.join(', ');
    document.getElementById('modal-movie-summary').textContent = movie.description;
    document.getElementById('modal-movie-actors').textContent = movie.actors.join(', ');

    modal.style.display = 'block';
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('tabindex', '-1');
    modal.focus();

    const closeButton = document.querySelector('.btn.btn-danger[aria-label="Close"]');
    if (closeButton) closeButton.onclick = closeModal;

    const closeCross = document.querySelector('.btn-close[aria-label="Close"]');
    if (closeCross) closeCross.onclick = closeModal;
  }

  // Fonction pour configurer le bouton "Voir plus" pour les films les mieux notés
  function setupViewMoreButton() {
    const viewMoreButton = document.getElementById('view-more');
    const moviesContainer = document.getElementById('top-rated-movies');
    const initialCount = getInitialMoviesCount();
    const viewMoreCount = getViewMoreCount();

    if (viewMoreCount === 0) {
      viewMoreButton.style.display = 'none';
    } else {
      viewMoreButton.style.display = 'block';
      viewMoreButton.textContent = isShowingMore ? 'Voir moins' : 'Voir plus';
      viewMoreButton.onclick = function () {
        isShowingMore = !isShowingMore;
        const newCount = isShowingMore ? currentDisplayedCount + viewMoreCount : initialCount;
        displayMovies(totalMovies, moviesContainer, newCount);
        currentDisplayedCount = newCount;
        viewMoreButton.textContent = isShowingMore ? 'Voir moins' : 'Voir plus';
      };
    }
    displayMovies(totalMovies, moviesContainer, initialCount);
    currentDisplayedCount = initialCount;
  }

  // Fonction pour configurer le bouton "Voir plus" pour les films par catégorie
  function setupViewMoreButtonForCategory(category) {
    const viewMoreButton = document.getElementById(`view-more-${category}`);
    const moviesContainer = document.getElementById(`movies-${category}`);
    const initialCount = getInitialMoviesCount();
    const viewMoreCount = getViewMoreCount();

    if (viewMoreCount === 0) {
      viewMoreButton.style.display = 'none';
    } else {
      viewMoreButton.style.display = 'block';
      viewMoreButton.onclick = function () {
        isShowingMoreCategory[category] = !isShowingMoreCategory[category];
        const newCount = isShowingMoreCategory[category] ? categoryDisplayedCount[category] + viewMoreCount : initialCount;
        displayMovies(categoryMovies[category], moviesContainer, newCount, category);
        categoryDisplayedCount[category] = newCount;
        viewMoreButton.textContent = isShowingMoreCategory[category] ? 'Voir moins' : 'Voir plus';
      };
    }

    displayMovies(categoryMovies[category], moviesContainer, initialCount, category);
    categoryDisplayedCount[category] = initialCount;
  }

  // Ajouter des écouteurs d'événements pour le sélecteur de catégorie
  document.getElementById('category-selector').addEventListener('focus', function (event) {
    const categorySelector = event.target;
    const selectedCategoryIndex = categorySelector.selectedIndex;

    if (!categorySelector.options[selectedCategoryIndex].dataset.originalText) {
      categorySelector.options[selectedCategoryIndex].dataset.originalText = categorySelector.options[selectedCategoryIndex].text;
    }
    categorySelector.options[selectedCategoryIndex].text += ' ✅';
  });

  document.getElementById('category-selector').addEventListener('blur', function (event) {
    const categorySelector = event.target;
    setTimeout(() => {
      const selectedCategoryIndex = categorySelector.selectedIndex;
      categorySelector.options[selectedCategoryIndex].text = categorySelector.options[selectedCategoryIndex].dataset.originalText;
    }, 100);
  });

  document.getElementById('category-selector').addEventListener('change', function (event) {
    const categorySelector = event.target;
    const selectedCategoryIndex = categorySelector.selectedIndex;
    const viewMoreButton = document.getElementById('view-more-selected-category');

    categorySelector.options[selectedCategoryIndex].dataset.originalText = categorySelector.options[selectedCategoryIndex].text.replace(' ✅', '');

    if (categorySelector.value) {
      fetchMoviesForSelectedCategory(categorySelector.value);
      viewMoreButton.style.display = 'block';
    } else {
      viewMoreButton.style.display = 'none';
    }

    categorySelector.blur();
  });

  // Fonction pour récupérer les films pour la catégorie sélectionnée
  function fetchMoviesForSelectedCategory(category) {
    const url = `http://localhost:8000/api/v1/titles/?genre=${category}&sort_by=-imdb_score&sort_by=-votes&limit=10`;
    fetchMoviesByCategory(url, 'selected-category');
  }

  // Récupérer et afficher les films au chargement de la page
  fetchBestMovie();
  fetchTopRatedMovies(topMoviesLink);
  fetchMoviesByCategory(category1Link, 'category1');
  fetchMoviesByCategory(category2Link, 'category2');

  // Réagir aux changements de taille de la fenêtre
  window.addEventListener('resize', function () {
    const moviesContainer = document.getElementById('top-rated-movies');
    moviesContainer.innerHTML = '';
    const initialCount = getInitialMoviesCount();
    displayMovies(totalMovies, moviesContainer, initialCount);
    isShowingMore = false;
    setupViewMoreButton();

    Object.keys(categoryMovies).forEach(category => {
      const categoryContainer = document.getElementById(`movies-${category}`);
      categoryContainer.innerHTML = '';
      displayMovies(categoryMovies[category], categoryContainer, initialCount, category);
      isShowingMoreCategory[category] = false;
      setupViewMoreButtonForCategory(category);
    });
  });
});

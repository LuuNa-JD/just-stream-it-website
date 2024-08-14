document.addEventListener('DOMContentLoaded', function () {
  const bestMovieLink = 'http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&sort_by=-votes&limit=1';
  const topMoviesLink = 'http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&sort_by=-votes&limit=10';
  const category1Link = 'http://localhost:8000/api/v1/titles/?genre=horror&sort_by=-imdb_score&sort_by=-votes&limit=10';
  const category2Link = 'http://localhost:8000/api/v1/titles/?genre=comedy&sort_by=-imdb_score&sort_by=-votes&limit=10';

  // Fonction pour obtenir une image aléatoire
  async function getRandomImage() {
    const response = await fetch('https://loremflickr.com/320/240');
    return response.url;
  }
  // Fonction pour afficher plus de films
  document.querySelectorAll('.view-more').forEach(button => {
    button.addEventListener('click', function () {
        const moviesGrid = this.closest('.movies-container').querySelector('.movies-grid');
        moviesGrid.classList.toggle('show-more');
        this.textContent = moviesGrid.classList.contains('show-more') ? 'Voir moins' : 'Voir plus';
    });
  });



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

  // Fonction pour récupérer et afficher les films dans une section donnée
  function fetchAndDisplayMovies(url, containerId, skipFirst = false) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        let movies = skipFirst ? data.results.slice(1) : data.results;
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        movies.forEach(movie => {
          const movieCard = createMovieCard(movie);
          container.appendChild(movieCard);
        });

        // Vérifier si une deuxième page est disponible
        if (data.next) {
          fetch(data.next)
            .then(response => response.json())
            .then(data => {
              movies = data.results;
              movies.forEach(movie => {
                const movieCard = createMovieCard(movie);
                container.appendChild(movieCard);
              });
            })
            .catch(error => console.error('Erreur lors de la récupération des films de la deuxième page :', error));
        }
      })
      .catch(error => console.error('Erreur lors de la récupération des films :', error));
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

  // Fonction pour fermer la modal
  function closeModal() {
    const modal = document.getElementById('movieModal');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  }

  // Gestion des événements sur le sélecteur de catégories
  const categorySelector = document.getElementById('category-selector');
  const viewMoreButton = document.getElementById('view-more-selected-category');


  categorySelector.addEventListener('change', function (event) {
    const selectedCategory = categorySelector.value;

    if (selectedCategory) {
      fetchMoviesForSelectedCategory(selectedCategory);
      // Afficher le bouton "Voir plus" lorsque la catégorie est sélectionnée
      viewMoreButton.style.display = 'block';
    } else {
      // Masquer le bouton "Voir plus" si aucune catégorie n'est sélectionnée
      viewMoreButton.style.display = 'none';
    }
  });

  // Fonction pour récupérer les films pour la catégorie sélectionnée
  function fetchMoviesForSelectedCategory(category) {
    const url = `http://localhost:8000/api/v1/titles/?genre=${category}&sort_by=-imdb_score&sort_by=-votes&limit=10`;
    fetchAndDisplayMovies(url, 'movies-selected-category');
  }

  // Récupérer et afficher les films au chargement de la page
  fetchBestMovie();
  fetchAndDisplayMovies(topMoviesLink, 'top-rated-movies', true);
  fetchAndDisplayMovies(category1Link, 'movies-category1');
  fetchAndDisplayMovies(category2Link, 'movies-category2');
});

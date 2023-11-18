import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

//const apiKey = '40669349-8b3833151bb6b3e237d7939fc';
let currentPage = 1;
let currentQuery = '';
const perPage = 40;
const apiKey = '40669349-8b3833151bb6b3e237d7939fc';
const BASE_URL = 'https://pixabay.com/api/';

const searchForm = document.getElementById('search-form');
const galleryContainer = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.photo-card', {
  disableScroll: false,
  history: false,
  nextOnImageClick: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

const fetchData = async (query, page = 1) => {
  const response = await axios.get(BASE_URL, {
    params: {
      key: apiKey,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: perPage,
    },
  });
  return response.data;
};

const renderGallery = images => {
  if (images.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  const galleryMarkup = images
    .map(image => {
      return `
          <a href="${image.largeImageURL}" class="photo-card">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            <div class="info">
              <p class="info-item"><b>Likes:</b> ${image.likes}</p>
              <p class="info-item"><b>Views:</b> ${image.views}</p>
              <p class="info-item"><b>Comments:</b> ${image.comments}</p>
              <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
            </div>
          </a>
        `;
    })
    .join('');

    if (currentPage === 1) {
      galleryContainer.innerHTML = ''; // Очистим содержимое контейнера перед вставкой нового
      galleryContainer.insertAdjacentHTML('beforeend', galleryMarkup);
    } else {
      galleryContainer.insertAdjacentHTML('beforeend', galleryMarkup);
    }

  

  lightbox.refresh();
};
const handleFormSubmit = async event => {
  event.preventDefault();
  try {
    currentQuery = event.target.elements.searchQuery.value.trim();
//Отримує значення текстового поля з ім'ям searchQuery від форми та прибирає зайві пробіли з початку і кінця рядка. 
//Значення введене користувачем стає поточним запитом пошуку.
    if (!currentQuery) {
      Notiflix.Notify.warning('Please enter a search query.');
      return;
    }

    currentPage = 1;
    
    

    const data = await fetchData(currentQuery, currentPage);

    if (data && data.hits.length > 0) { //Перевіряє, чи отримані дані не є порожніми і чи є в них зображення
      renderGallery(data.hits);
      if (data.hits.length < perPage) {
        loadMoreBtn.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'block';
      }
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    } else {
      galleryContainer.innerHTML = '';
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

const handleLoadMoreClick = async () => {
  try {
    currentPage++;
    loadMoreBtn.disabled = true;

    const data = await fetchData(currentQuery, currentPage);

    if (data && data.hits.length > 0) {
      renderGallery(data.hits);
      if (data.hits.length < perPage) {
        loadMoreBtn.style.display = 'none';
        Notiflix.Notify.warning(
          "You've reached the end of search results. No more images available."
        );
      }
    } else {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }

    loadMoreBtn.disabled = false;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
  const { height: cardHeight } =
    galleryContainer.firstElementChild.getBoundingClientRect(); 
    //getBoundingClientRect() повертає розміри та позицію елемента відносно видимої області вікна.
  window.scrollBy({ top: cardHeight , behavior: 'smooth' });
};

searchForm.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', handleLoadMoreClick);

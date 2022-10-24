import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const axios = require('axios').default;

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('input'),
  searchBtn: document.querySelector('.search'),
  loadMoreBtn: document.querySelector('.load-more'),
  gallery: document.querySelector('.gallery'),
};

const BASE_URL = 'https://pixabay.com/api/';
const API = '30790511-0058a7b32e06c419542f9f14e';

let keyword = '';
let pageToFetch = 1;

async function fetchEvent(page, keyword) {
  const params = new URLSearchParams({
    key: API,
    q: keyword,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return await response.json();

  // const data = await response.json();
  // console.log(data)
  // if (!data) {
  //   throw new Error(response.error);
  // }
  // return data;
}

async function getEvents(page, keyword) {
  try {
    const data = await fetchEvent(page, keyword);

    if (page === 1 && data.totalHits !== 0) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }

    if (data.total === 0) {
      refs.loadMoreBtn.classList.add('invisible');
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search ${keyword}. Please try again.`
      );
    }

    const events = data.hits;
    renderEvents(events);
    new SimpleLightbox('.gallery a').refresh();

    if (pageToFetch === Math.ceil(data.totalHits / 40)) {
      refs.loadMoreBtn.classList.add('invisible');
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }

    pageToFetch += 1;

    if (Math.ceil(data.totalHits / 40) > 1) {
      refs.loadMoreBtn.classList.remove('invisible');
    }
  } catch (error) {
    // Notiflix.Notify.failure(
    //   `${error.message}`
    // );
    console.log(error.message);
  }
}

// fetchEvent(page, keyword).then(data => {
//   if (page === 1 && data.totalHits !== 0) {
//     Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
//   }

//   if (data.total === 0) {
//     refs.loadMoreBtn.classList.add('invisible');
//     Notiflix.Notify.failure(
//       `Sorry, there are no images matching your search ${keyword}. Please try again.`
//     );
//   }

//   const events = data.hits;
//   renderEvents(events);
//   new SimpleLightbox('.gallery a').refresh();

//   if (pageToFetch === Math.ceil(data.totalHits / 40)) {
//     refs.loadMoreBtn.classList.add('invisible');
//     Notiflix.Notify.info(
//       "We're sorry, but you've reached the end of search results."
//     );
//     return;
//   }

//   pageToFetch += 1;

//   if (Math.ceil(data.totalHits / 40) > 1) {
//     refs.loadMoreBtn.classList.remove('invisible');
//   }
// });

function renderEvents(events) {
  const markup = events
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
        <a class="photo-card__item" href="${largeImageURL}">
        <div class="photo-card">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" width='260' height='200'/>
            <div class="info">
                <p class="info-item">
                ${likes}
                <b>Likes</b>
                </p>
                <p class="info-item">
                ${views}
                <b>Views</b>
                </p>
                <p class="info-item">
                ${comments}
                <b>Comments</b>
                </p>
                <p class="info-item">
                ${downloads}
                <b>Downloads</b>
                </p>
            </div>
        </div>
        </a>
        `;
      }
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

refs.form.addEventListener('submit', onFormSubmitHandler);

function onFormSubmitHandler(e) {
  e.preventDefault();
  const query = e.target.elements.searchQuery.value;
  keyword = query;
  pageToFetch = 1;
  refs.gallery.innerHTML = '';
  if (!query) {
    return;
  }
  getEvents(pageToFetch, query);
}

refs.loadMoreBtn.addEventListener('click', onLoadMoreHandler);

function onLoadMoreHandler() {
  getEvents(pageToFetch, keyword);
}

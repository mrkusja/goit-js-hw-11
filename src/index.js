import Notiflix from 'notiflix';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

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

function fetchEvent(page, keyword) {
  const params = new URLSearchParams({
    key: API,
    q: keyword,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
  });

  return fetch(`${BASE_URL}?${params}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .catch(error => console.log(error));
}

function getEvents(page, keyword) {
  fetchEvent(page, keyword).then(data => {
    if (data.total === 0) {
      refs.loadMoreBtn.classList.add('invisible');
      alert(`There are no events by keyword ${keyword}`);
    }

    const events = data.hits;
    renderEvents(events);

    if (pageToFetch === Math.ceil(data.total / 40)) {
      refs.loadMoreBtn.classList.add('invisible');
      alert('Finish');
      return;
    }

    pageToFetch += 1;

    if (Math.ceil(data.total / 40) > 1) {
      refs.loadMoreBtn.classList.remove('invisible');
    }
  });
}

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
            <img src="${webformatURL}" data-source=${largeImageURL} alt="${tags}" loading="lazy" width='260' height='200'/>
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

new SimpleLightbox(".gallery a", {
  enableKeyboard: true,
  docClose: true,
  overlay: true,
  nav: true,
  close: true,
  showCounter: true,
  })

  refs.gallery.addEventListener('click', onSimpleLightbox)

  function onSimpleLightbox(e) {
    e.preventDefault();
  
    if (e.target.nodeName !== "IMG") {
      return;
    }
    console.log(123);
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
  // SimpleLightbox.refresh()
}

refs.loadMoreBtn.addEventListener('click', onLoadMoreHandler);

function onLoadMoreHandler() {
  getEvents(pageToFetch, keyword);
}

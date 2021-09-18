import api from '../services/api'
import renderMovieDataToModal from '../../templates/renderMovieForModal.hbs'
import storageSetter from '../services/storageSetter'
import { onWatched, onQueue } from './header'

const {
    modalMarkupContainer,
    galleryList,
    modal,
    modalCloseBtn,
} = api.refs;

const { queueBtn, watchedBtn } = storageSetter.refs;

galleryList.addEventListener('click', onMovieCardClick);

storageSetter.addListenerToBtns();

function onMovieCardClick(e) {
    if (e.target === e.currentTarget) return;

    const movieId = Number(e.target.closest('li').dataset.movieid);
    const {isAlreadyInWatched, isAlreadyInQueue} = storageSetter.checkUsersLibrary(movieId);
    watchedBtn.textContent = isAlreadyInWatched ? 'remove from watched' : 'add to watched';
    queueBtn.textContent = isAlreadyInQueue ? 'remove from queue' : 'add to queue';
    isAlreadyInWatched && storageSetter.btnColorSetter(watchedBtn);
    isAlreadyInQueue && storageSetter.btnColorSetter(queueBtn);
    movieDataById(movieId);
};

async function movieDataById(movieId) {
    try {
        const movieData = await api.fetchMovieForModal(movieId);
        const preparedMovieData = { ...movieData, poster_path:`https://image.tmdb.org/t/p/w500${movieData.poster_path}` };
        if (!movieData.poster_path) {
            const imgPlug = 'https://imgp.whaleshares.io/pimgp/a/einstei1/p/image-not-found-shitpostfriday/0x0/https://img.whaleshares.io/wls-img/einstei1/d765e65f432e7e6f0d062616d19364ecdc5631da.png';
            preparedMovieData.poster_path = imgPlug;
        }
        const markup = renderMovieDataToModal(preparedMovieData);
        modalMarkupContainer.innerHTML = markup;
        modal.classList.remove('visually-hidden');
        modal.addEventListener('click', eventsOnModal);
        document.body.classList.add('body_modal-open');
        window.addEventListener('keydown', eventsOnModal);
    } catch (error) {
        console.log(error);
    }
};

function eventsOnModal(e) {
    if (e.target === e.currentTarget ||
        e.target.closest('button') === modalCloseBtn ||
        e.key === 'Escape') {
        modal.classList.add('visually-hidden');
        modal.removeEventListener('click', eventsOnModal);
        document.body.classList.remove('body_modal-open');
        window.removeEventListener('keydown', eventsOnModal);
        storageSetter.removeBtnColor();
        if (!document.querySelector('#watched-btn.visually-hidden') && !document.querySelector('#watched-btn.btn-passive')) {
            const wasChanges = localStorage.getItem('wasChanges');
            if (wasChanges) {
                onWatched();
            };
        };
        if (document.querySelector('#queue-btn.btn-active')) {
            const wasChanges = localStorage.getItem('wasChanges');
            if (wasChanges) {
                onQueue();
            };
        };
        localStorage.removeItem('wasChanges');
    };
};
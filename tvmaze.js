'use strict';

const $showsList = $('#showsList');
const $episodesArea = $('#episodesArea');
const $searchForm = $('#searchForm');
const $episodesList = $('#episodesList');
const BASE_URL = 'http://api.tvmaze.com';

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *  Each show object should contain exactly: {id, name, summary, image}
 *  (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm (searchTerm) {
  //get request to API, query search term
  //TODO move api url into global space
  let response = await axios.get(`${BASE_URL}/search/shows`, {
    params: { q: searchTerm }
  });

  console.log('response', response);

  //passing an array of episode objs, returns an array of reformatted episode objs
  const episodes = response.data.map(_formatEpisode);

  /** takes in an episode obj and returns a formatted obj
   * with only id, name, summary, and img properties
   */
  function _formatEpisode (episode) {
    let id = episode.show.id;
    let name = episode.show.name;
    let summary = episode.show.summary;
    let placeholderImg = 'https://tinyurl.com/tv-missing';
    let image =
      episode.show.image === null
        ? placeholderImg
        : episode.show.image.original;

    return { id, name, summary, image };
  }

  return episodes;
}

/** Given list of shows, create markup for each and append to DOM */
function populateShows (shows) {
  $showsList.empty();

  //creates show element and populates with id, img, name, and summary
  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *  Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay () {
  const term = $('#searchForm-term').val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on('submit', async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow (id) {
  const epsResponse = await axios.get(`${BASE_URL}/shows/${id}/episodes`);

  //passing an array of episode objs, returns an array of reformatted episode objs
  const episodes = epsResponse.data.map(_formatEpisode);

  /** takes in an episode obj and returns a formatted obj
   *  with only id, name, season, and number properties
   */
  function _formatEpisode (episode) {
    //TODO: const vars
    // let id = episode.id;
    // let name = episode.name;
    // let season = episode.season;
    // let number = episode.number;

    const { id, name, season, number } = episode;

    return { id, name, season, number };
  }

  return episodes;
}

/** accepts an array of episodes objs
 * creates li elements for each episode
 * appends to episodes list */
function populateEpisodes (episodes) {
  $episodesList.empty();
  console.log('populating episodes!');

  //creates li listing for each episode, includes season and episode number
  for (let episode of episodes) {
    let $episode = $(
      `<li>${episode.name} (season ${episode.season}, episode ${episode.number})</li>`
    );

    $episodesList.append($episode);
  }

  $episodesArea.show();
}

/**
 * grabs show id
 * creates list of episodes for a show
 * */

async function displayEpsList (evt) {
  //prevents default refresh behavior
  evt.preventDefault();

  console.log('in event handler for Show-getEpisodes click');

  //grab the id for the show whose episode button was clicked
  const showId = $(evt.target)
    .closest('.Show')
    .data('show-id');

  //call async getEpisodesOfShow
  const episodesList = await getEpisodesOfShow(showId);

  //populate episodes list
  populateEpisodes(episodesList);
}

/** adds click handler to episodes button
 * */

$('#showsList').on('click', '.Show-getEpisodes', displayEpsList);

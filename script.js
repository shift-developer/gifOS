//ENDPOINTS
const trending = 'gifs/trending';
const search = 'gifs/search';
const random = 'gifs/random';
const trendingSearchs = 'trending/searches'

//REQUEST PARAMETERS
const limit = '&limit='; //The maximum number of objects to return. (Default: “25”)
const q = '&q='; //Search query term or phrase.
const tag = '&tag=' //Filters results by specified tag..

async function llamarApi(endpoint, nroLimit = '', stringSearch = '', stringTag = '') {
    const API_KEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
    const API_URL = 'http://api.giphy.com/v1/';
    let url = `${API_URL}${endpoint}${API_KEY}`;

    if(endpoint == trending || endpoint == search) {
     url = url + limit + nroLimit;
        if(endpoint == trending) {
            url = url + q + stringSearch;
        }
    } else if (endpoint == random){
        url = url + tag + stringTag;
    }
    const datos = await fetch(url);
    const datosJSON = await datos.json();
    return datosJSON;
}

function getTrendingGifs(numeroDeGifs, idContainer) {
    crearHTMLGifs(numeroDeGifs, idContainer);
    llamarApi(trending, numeroDeGifs).then((res) => {
        for(let i = 0; i < numeroDeGifs; i++){
            arrDOM[i].src = res.data[i].images.downsized.url;
        }
    });  
}

function getSugerenciasGifs(tag1, tag2, tag3, tag4, arrDOM) {
    llamarApi(random, '', '', tag1).then((res) => {
        arrDOM[0].src = res.data.images.downsized.url;
    })
    llamarApi(random, '', '', tag2).then((res) => {
        arrDOM[1].src = res.data.images.downsized.url;
    })
    llamarApi(random, '', '', tag3).then((res) => {
        arrDOM[2].src = res.data.images.downsized.url;
    })
    llamarApi(random, '', '', tag4).then((res) => {
        arrDOM[3].src = res.data.images.downsized.url;
    })
}


//creamos el array de urls de gifs
const sugerenciasGifs = document.getElementsByClassName('gif sugerencias');
getSugerenciasGifs('memes', 'reactions', 'cat', 'fails', sugerenciasGifs);

const tendenciasContainer = document.querySelector('#tendencias-container');
getTrendingGifs(4, '#tendencias-container');

function crearHTMLGifs(numeroDeGifs, idContainer) {
    const container = document.querySelector(idContainer);
    const arrHTMLGifs = [];
    for(let i = 0; i < numeroDeGifs; i++) {
        let containerGif = document.createElement('div');
        containerGif.className = 'archivo-gif';
        container.appendChild(containerGif);
        let gif = document.createElement('img');
        gif.className = 'gif tendencias';
        gif.appendChild(containerGif);
    }
    console.log(container);
}






   

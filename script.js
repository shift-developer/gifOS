//ENDPOINTS
const trending = 'gifs/trending';
const search = 'gifs/search';
const random = 'gifs/random';
const trendingSearchs = 'trending/searches'

//REQUEST PARAMETERS
const limit = '&limit='; //The maximum number of objects to return. (Default: “25”)
const q = '&q='; //Search query term or phrase.
const tag = '&tag=' //Filters results by specified tag..

//GLOBAL FUNCTIONS 
async function llamarApi(endpoint, nroLimit = '', stringSearch = '', stringTag = '') {
    const API_KEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
    const API_URL = 'http://api.giphy.com/v1/';
    let url = `${API_URL}${endpoint}${API_KEY}`;
    //-> FALTA AGREGAR TRY CATCH PARA EL MANEJO DE ERRORES
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

function getSugerenciasGifs(tag1, tag2, tag3, tag4) {
    const sugerenciasGifs = document.getElementsByClassName('gif sugerencias');
    const tagGifs = document.getElementsByClassName('tag-gif');
    for(let i = 0; i < 4; i++) {
        tagGifs[i].innerHTML = '#' + arguments[i];
    }
   
    llamarApi(random, '', '', tag1).then((res) => {
        sugerenciasGifs[0].src = res.data.images.downsized.url;
    })
    llamarApi(random, '', '', tag2).then((res) => {
        sugerenciasGifs[1].src = res.data.images.downsized.url;
    })
    llamarApi(random, '', '', tag3).then((res) => {
        sugerenciasGifs[2].src = res.data.images.downsized.url;
    })
    llamarApi(random, '', '', tag4).then((res) => {
        sugerenciasGifs[3].src = res.data.images.downsized.url;
    })
}

function crearHTMLGifs(numeroDeGifs, idContainer) {
    const container = document.querySelector(idContainer);
    for(let i = 0; i < numeroDeGifs; i++) {
        let containerGif = document.createElement('div');
        containerGif.className = 'archivo-gif';
        container.appendChild(containerGif);
        let gif = document.createElement('img');
        gif.className = 'gif tendencias';
        containerGif.appendChild(gif);
    }
}
//podriamos cargar la imagen fija y dejar el hover para que el gif funcione, de ese modo cargamos más rapido y mejora el UX
function getTrendingGifs(numeroDeGifs, idContainer) {
    crearHTMLGifs(numeroDeGifs, idContainer);
    const arrDOM = document.getElementsByClassName('gif tendencias');
    llamarApi(trending, numeroDeGifs).then((res) => {
        for(let i = 0; i < numeroDeGifs; i++){
            arrDOM[i].src = res.data[i].images.downsized.url;
        }
    });  
}

function ventanaElegirTema() {
    let estado = document.querySelector('.elegir-theme').style.display;
    if(estado == 'none') {
        document.querySelector('.elegir-theme').style.display = 'block';
    } else {
        document.querySelector('.elegir-theme').style.display = 'none';
    }
}

function setSailorDayTheme() {
    document.body.classList.remove('night');
    document.querySelector('.logo').src = './assets/gifOF_logo.png';

    const sailorClass = 'btn themebtn';
    document.querySelector('#sailor-day').className = sailorClass + ' theme-selected';
    document.querySelector('#sailor-night').className = sailorClass + ' gray';
}

function setSailorNightTheme() {
    document.body.className = 'night';
    document.querySelector('.logo').src = './assets/gifOF_logo_dark.png';

    const sailorClass = 'btn themebtn';
    document.querySelector('#sailor-day').className = sailorClass + ' gray';
    document.querySelector('#sailor-night').className = sailorClass + ' theme-selected';
}

//SUGERENCIAS
getSugerenciasGifs('memes', 'reactions', 'cat', 'fails');

//TENDENCIAS
getTrendingGifs(12, '#tendencias-container'); 

//CAMBIAR TEMA (agregar eventos con addeventlistener más adelante)

//BUSCADOR












   

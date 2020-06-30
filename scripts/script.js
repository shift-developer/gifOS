/*----------------------------------- CONSTANTS -----------------------------------*/ 
/*API*/
const API_KEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
const API_URL = 'https://api.giphy.com/v1/';

/*ENDPOINTS*/
const TRENDING = 'gifs/trending';
const SEARCH = 'gifs/search';
const RANDOM = 'gifs/random';

/*REQUEST PARAMETERS*/
const LIMIT_QUERY = '&limit='; //The maximum number of objects to return. (Default: “25”)
const SEARCH_QUERY = '&q='; //Search query term or phrase.
const TAG_QUERY = '&tag=' //Filters results by specified tag..


/*------------------------------- GLOBAL FUNCTIONS ---------------------------------*/ 
async function llamarApi(endpoint, nroLimit = '', stringSearch = '', stringTag = '') {
    
    let url = `${API_URL}${endpoint}${API_KEY}`;
    //-> FALTA AGREGAR TRY CATCH PARA EL MANEJO DE ERRORES
    if(endpoint == TRENDING || endpoint == SEARCH) {
     url = url + LIMIT_QUERY + nroLimit;
        if(endpoint == SEARCH) {
            url = url + SEARCH_QUERY + stringSearch;
        }
    } else if (endpoint == RANDOM){
        url = url + TAG_QUERY + stringTag;
    } 

    const datos = await fetch(url);
    const datosJSON = await datos.json();
    return datosJSON;
}

function getSugerenciasGifs(tag1, tag2, tag3, tag4) {
    const sugerenciasContainer = document.getElementsByClassName('sugerencia-gif');
    const tagGifs = document.getElementsByClassName('tag-gif');
    const buttonsVerMas = document.getElementsByClassName('btn vermas');

    for(let i = 0; i < 4; i++) {
        tagGifs[i].innerHTML = '#' + arguments[i];
        buttonsVerMas[i].addEventListener('click', () => {
            getSearchGifs(numeroDeGifsSearched, arguments[i]);
            inputBuscar.value = arguments[i];
        })

        let gifImg = document.createElement('img');
        gifImg.className = 'gif sugerencias';
        sugerenciasContainer[i].prepend(gifImg);

        llamarApi(RANDOM, '', '', arguments[i]).then((res) => {
            gifImg.src = res.data.images.downsized.url;
        })
    }
   
}

function getTrendingGifs(numeroDeGifs, idContainer) {
    crearHTMLGifs(numeroDeGifs, idContainer, 'tendencias');
    const arrDOM = document.getElementsByClassName('gif tendencias');

    llamarApi(TRENDING, numeroDeGifs).then((res) => {
        for(let i = 0; i < numeroDeGifs; i++){
            arrDOM[i].src = res.data[i].images.downsized_still.url;
            let title = res.data[i].title;
            let titleHash = transformInHashtags(title);
            let titleSearch = transformInTagSearch(title);
            arrDOM[i].parentNode.setAttribute('data-content', titleHash);

            arrDOM[i].addEventListener('mouseover', () => {
            arrDOM[i].src = res.data[i].images.downsized.url;
            });
            arrDOM[i].addEventListener('mouseout', () => {
                arrDOM[i].src = res.data[i].images.downsized_still.url;
            });
            arrDOM[i].addEventListener('click', () => {
                getSearchGifs(numeroDeGifsSearched, titleSearch);
                inputBuscar.value = titleSearch;
            });
        }
    });  
}

function getSearchGifs(numeroDeGifs, searchString) {
    const sugerenciasSection = document.querySelector('#sugerencias');
    const tendenciasSection = document.querySelector('#tendencias');
    sugerenciasSection.style.display = 'none';
    tendenciasSection.style.display= 'none';
    const gifsContainer = document.querySelector('#search-container');

    while (gifsContainer.hasChildNodes()) {  
        gifsContainer.removeChild(gifsContainer.firstChild);
    }
    
    llamarApi(SEARCH, numeroDeGifs, searchString).then((res) => {
        let nroGifsRecibidos = res.data.length;
        if(nroGifsRecibidos == 0) {
            let msgNoResultados = document.createElement('p');
            msgNoResultados.innerHTML = 'No se han encontrado gifos para tu búsqueda. Prueba con otro tag'
            gifsContainer.appendChild(msgNoResultados);
        }

        crearHTMLGifs(nroGifsRecibidos, '#search-container', 'search-results');
        const arrDOM = document.getElementsByClassName('gif search-results');
        const separador = document.querySelector('#separador-resultname');
        separador.style.display = 'block';
        separador.innerHTML = searchString + ' (resultados)';
        
        for(let i = 0; i < nroGifsRecibidos; i++){
            arrDOM[i].src = res.data[i].images.downsized_still.url;
            let title = res.data[i].title;
            let titleHash = transformInHashtags(title);
            let titleSearch = transformInTagSearch(title);
            arrDOM[i].parentNode.setAttribute('data-content', titleHash);

            arrDOM[i].addEventListener('mouseover', () => {
            arrDOM[i].src = res.data[i].images.downsized.url;
            });
            arrDOM[i].addEventListener('mouseout', () => {
                arrDOM[i].src = res.data[i].images.downsized_still.url;
            });
            arrDOM[i].addEventListener('click', () => {
                getSearchGifs(numeroDeGifsSearched, titleSearch);
                inputBuscar.value = titleSearch;
            });
        }

        btnBuscar.classList.add('busqueda-on');
        btnBuscarText.classList.add('active-text');
        if(localStorage.themeSelected == 'Sailor Night') {
            btnBuscarImg.src = './assets/lupa_light.svg'
        } else {
            btnBuscarImg.src = './assets/lupa.svg'
        }
        saveSearch(searchString);
    });  

}

function crearHTMLGifs(numeroDeGifs, idContainer, gifClassName) {
    const container = document.querySelector(idContainer);
    //gifClassName puede recibir 'tendencias' o 'search-results'

    for(let i = 0; i < numeroDeGifs; i++) {
        let containerGif = document.createElement('div');
        containerGif.className = 'archivo-gif';
        container.appendChild(containerGif);
        let gif = document.createElement('img');
        gif.className = 'gif sinventana ' + gifClassName;
        containerGif.appendChild(gif);
        containerGif.addEventListener('mouseover', () => {
            containerGif.className += ' hover-gifsearch';
            gif.classList.add('gif-hovered');
        });
        containerGif.addEventListener('mouseout', () => {
            containerGif.className = 'archivo-gif';
            gif.classList.remove('gif-hovered');
        });
    }
}

function transformInHashtags(title) {
    let string = title.replace(/\s+/g, ' #');
    let hashtag = '#';
    string = hashtag + string;
    return string;
}

function transformInTagSearch(title) {
    let stringArr = title.split(' ');
    return stringArr[0] + ' ' + stringArr[1];
}

function saveSearch(stringSearch) {
    /*función usada cuando se produce una búsqueda que agrega al storage y HTML, 
    sólo si no se repite el tag*/

    if(!elTagSeRepite(stringSearch) && localStorage.contador < 9){
        count = localStorage.contador;
        count++;
        localStorage.contador = count;
        localStorage.setItem(count, stringSearch);
        setTagSearch(stringSearch);
    }
    
}

function elTagSeRepite(stringSearch) {
    let arr = [];
    
    if(!localStorage.contador) {
        localStorage.contador = 0;
        return false;
    } else {
        for(let i = 1; i <= localStorage.contador; i++) {
            arr.push(localStorage[i]);
        }
        if(arr.filter(tag => tag == stringSearch).length == 0) {
            return false;
        }
        return true;
    }
}

function setTagSearch(searchString) {
    //setear en el html los tags ya buscados

    if(!localStorage[searchString]) {

    const tagButton = document.createElement('button');
    tagButton.className = 'btn tag-search';
    tagButton.innerHTML = '#' + searchString;
    sectionTagsBuscados.appendChild(tagButton);

    tagButton.onclick = () => {
        getSearchGifs(numeroDeGifsSearched, searchString);
        inputBuscar.value = searchString;
        }
    }
}

function setLocalStorageTags() {
    while (sectionTagsBuscados.hasChildNodes()) {  
        sectionTagsBuscados.removeChild(sectionTagsBuscados.firstChild);
    }

    /*iterar los elementos del localStorage con la funcion setTagSearch, 
    la llamamos al reiniciar el index*/
    for(let i = 1; i <= localStorage.contador; i++) {
    
        if(localStorage.contador > 0) {
            setTagSearch(localStorage[i]);
        }
    }
}

async function getSearchSuggestions(tag) { 
    const url = 'https://api.giphy.com/v1/tags/related/' + '{' + tag + '}' + API_KEY;
    const datos = await fetch(url);
    const datosJSON = await datos.json();

    return datosJSON;
}

async function getSearchAutocomplete(tag) {
    const url = 'https://api.giphy.com/v1/gifs/search/tags' + API_KEY + SEARCH_QUERY + tag;
    const datos = await fetch(url);
    const datosJSON = await datos.json();

    return datosJSON;
}


function ventanaElegirTema() {
    let estado = document.querySelector('.elegir-theme');

    if(estado.style.display == 'none') {
        estado.style.display = 'block';
    } else {
        estado.style.display = 'none';
    }
}

function setSailorDayTheme() {
    document.querySelector('.logo').src = './assets/gifOF_logo.png';
    document.body.classList.remove('night');
    
    const sailorClass = 'btn themebtn';
    document.querySelector('#sailor-day').className = sailorClass + ' theme-selected';
    document.querySelector('#sailor-night').className = sailorClass + ' gray';
    document.querySelector("link[rel*='icon']").href = './assets/favicon_day.svg';
    localStorage.setItem('themeSelected', 'Sailor Day');
}

function setSailorNightTheme() {
    document.querySelector('.logo').src = './assets/gifOF_logo_dark.png';
    document.body.className = 'night';

    const sailorClass = 'btn themebtn';
    document.querySelector('#sailor-day').className = sailorClass + ' gray';
    document.querySelector('#sailor-night').className = sailorClass + ' theme-selected';
    document.querySelector("link[rel*='icon']").href = './assets/favicon_night.svg';
    localStorage.setItem('themeSelected', 'Sailor Night');
}

function getMyGifsUrlArray() {
    let items = [];
    for (let i = 0; i < localStorage.length; i++) {
        let item = localStorage.getItem(localStorage.key(i));
        
        if(item.includes('data')) {
            itemJson = JSON.parse(item);
            items.push(itemJson.data.images.downsized.url);
        }
    }
    return items;
}


/*------------------------------- EVENTS AND FUNCTIONS CALLS -------------------------------*/ 
/*NUMBER OF GIFS*/
let numeroDeGifsSearched = 24; //number of results in search
let numeroDeTrendingGifs = 24; //number of results in trending

/*SUGGESTED TAGS*/
const tagsSection = document.querySelector('#tagbuscados')
let sugTag1 = 'funny';
let sugTag2 = 'reactions';
let sugTag3 = 'cat';
let sugTag4 = 'meme';

/*SUGGESTIONS*/
const sugerenciasSection = document.querySelector('#sugerencias');
getSugerenciasGifs(sugTag1, sugTag2, sugTag3, sugTag4); 

/*TRENDING*/
const tendenciasSection = document.querySelector('#tendencias');
getTrendingGifs(numeroDeTrendingGifs, '#tendencias-container'); 

/*THEME CHANGE */
const dropDownBtn = document.querySelector('.dropdown-button');
const textDropBtn = document.querySelector('#text-dropbtn');
const iconDropBtn = document.querySelector('.v-icon');

window.addEventListener('load', () => {
    
    if(!localStorage.themeSelected) {
        localStorage.setItem('themeSelected', 'Sailor Day');
    } else if(localStorage.themeSelected == 'Sailor Night') {
        setSailorNightTheme();
    }
});

dropDownBtn.addEventListener('click', ventanaElegirTema);

const dayBtn = document.querySelector('#sailor-day');
dayBtn.addEventListener('click', setSailorDayTheme);

const nightBtn = document.querySelector('#sailor-night');
nightBtn.addEventListener('click', setSailorNightTheme);

dropDownBtn.addEventListener('mouseover', () => {
    textDropBtn.classList.add('hover-dropdown');
    iconDropBtn.classList.add('hover-dropdown');
});
dropDownBtn.addEventListener('mouseout', () => {
    textDropBtn.classList.remove('hover-dropdown');
    iconDropBtn.classList.remove('hover-dropdown');
})


/*SEARCH BAR*/
const sectionBuscador = document.querySelector('#buscador');
const inputBuscar = document.querySelector('.inputbuscar');
const ventanaSugerencias = document.querySelector('.search-sugerencias');
const resultadosSugeridos = document.getElementsByClassName('btn gray search-sugerencia');
const btnBuscar = document.querySelector('.btn-buscar');
const btnBuscarText = document.querySelector('.btn-buscar span');
const btnBuscarImg = document.querySelector('.btn-buscar img');
const form = document.querySelector('#form');
const searchSection = document.querySelector('#search-section');

inputBuscar.addEventListener('input', (e) => {
    const normalClass = 'btn gray btn-buscar ';
    const urlInactive = './assets/lupa_inactive.svg';
    let urlActive = './assets/lupa.svg';

    btnBuscar.classList.remove('busqueda-on');
    btnBuscarText.classList.remove('active-text');
    btnBuscarImg.src = urlInactive;

    if (localStorage.themeSelected == 'Sailor Night'){
        urlActive = './assets/lupa_light.svg';
    }
    
    if(inputBuscar.value.length < 1) {
        ventanaSugerencias.style.display = 'none';
        btnBuscar.className = normalClass;
        btnBuscarText.className = 'normal-text';
        btnBuscarImg.src = urlInactive;
    }

    if(inputBuscar.value.length >= 3) {

        getSearchSuggestions(inputBuscar.value).then( (res) => {
            let sug2 = res.data[0].name;
            let sug3 = res.data[1].name;
            resultadosSugeridos[1].innerHTML = sug2;
            resultadosSugeridos[2].innerHTML = sug3;
            ventanaSugerencias.style.display = 'block';

            resultadosSugeridos[1].onclick = () => {
                getSearchGifs(numeroDeGifsSearched, sug2);
                inputBuscar.value = sug2;
                ventanaSugerencias.style.display = 'none';
                
            };
            resultadosSugeridos[2].onclick = () => {
                getSearchGifs(numeroDeGifsSearched, sug3);
                inputBuscar.value = sug3;
                ventanaSugerencias.style.display = 'none';
            };
        });

        getSearchAutocomplete(inputBuscar.value).then( (res) => {
            let sug1 = res.data[0].name;
            resultadosSugeridos[0].innerHTML = sug1;
            resultadosSugeridos[0].onclick = () => {
                getSearchGifs(numeroDeGifsSearched, sug1);
                inputBuscar.value = sug1;
                ventanaSugerencias.style.display = 'none';
            };
        });
    }

    if(inputBuscar.value.length > 0){
        btnBuscar.className = normalClass + 'active-buscar';
        btnBuscarText.className = 'active-text';
        btnBuscarImg.src = urlActive;
    }
    
});


inputBuscar.addEventListener('keyup', (e) => {
    let keycode = e.keycode;
    let stringSearch = inputBuscar.value;

    if(keycode == '13' && stringSearch.lenght > 0){
        ventanaSugerencias.style.display = 'none';
        getSearchGifs(numeroDeGifsSearched, stringSearch);
    }

    if(keycode == '8' && stringSearch.lenght < 2) {
        setTimeout( () => {
            ventanaSugerencias.style.display = 'none';
        }, 2000);
    }

    if(stringSearch < 2) {
        ventanaSugerencias.style.display = 'none';
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
});

btnBuscar.addEventListener('click', () => {
    let stringSearch = inputBuscar.value;
    if(stringSearch.length > 0){
    ventanaSugerencias.style.display = 'none';
    getSearchGifs(numeroDeGifsSearched, stringSearch);
    
    }
});


/*SEARCHED TAGS*/
const sectionTagsBuscados = document.querySelector('.tags-buscados');
setLocalStorageTags(); //al reiniciar la página evalúa los tags el localStorage


/*CONTAINER GIF EVENTS */
const arrSugerenciaContainer = document.getElementsByClassName('sugerencia-gif');
const arrSugerenciaImg = document.getElementsByClassName('gif sugerencias');
const arrSugerenciaBtn = document.getElementsByClassName('btn vermas');

for(let i = 0; i < 4; i++) {
    arrSugerenciaContainer[i].onmouseover = () => {
        arrSugerenciaImg[i].className += ' hover-dotted-img';
        arrSugerenciaBtn[i].className += ' hover-dotted';
    }
    arrSugerenciaContainer[i].onmouseout = () => {
        arrSugerenciaImg[i].className += 'gif sugerencias';
        arrSugerenciaBtn[i].className += 'btn vermas';
    }
}

/*MIS GUIFOS BTN */
const misguifosSection = document.querySelector('#misguifos');
const btnMisGuifos = document.querySelector('#btn-misguifos')

window.addEventListener('load', ()=> {
    sectionBuscador.classList.remove('hidden');
    tagsSection.classList.remove('hidden');
    sugerenciasSection.classList.remove('hidden');
    tendenciasSection.classList.remove('hidden');
    misguifosSection.classList.add('hidden');
});

btnMisGuifos.onclick = () => {
    const localGifs = getMyGifsUrlArray();
    const container = document.querySelector('#results');
    document.querySelector('.misguifos').classList.add('opacity');
    sectionBuscador.classList.add('hidden');
    tagsSection.classList.add('hidden');
    sugerenciasSection.classList.add('hidden');
    tendenciasSection.classList.add('hidden');
    searchSection.classList.add('hidden');
    misguifosSection.classList.remove('hidden');


    localGifs.forEach(item => {
        let containerGif = document.createElement('div');
        containerGif.className = 'archivo-gif miguifo';
        container.appendChild(containerGif);
        let gif = document.createElement('img');
        gif.className = 'gif sinventana';
        gif.src = item;
        containerGif.appendChild(gif);
    });

    btnMisGuifos.onclick = () => false;
}






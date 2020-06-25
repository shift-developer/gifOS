/*ENDPOINTS*/
const trending = 'gifs/trending';
const search = 'gifs/search';
const random = 'gifs/random';

/*REQUEST PARAMETERS*/
const limit = '&limit='; //The maximum number of objects to return. (Default: “25”)
const q = '&q='; //Search query term or phrase.
const tag = '&tag=' //Filters results by specified tag..

/*GLOBAL FUNCTIONS*/ 
async function llamarApi(endpoint, nroLimit = '', stringSearch = '', stringTag = '') {
    const API_KEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
    const API_URL = 'http://api.giphy.com/v1/';
    let url = `${API_URL}${endpoint}${API_KEY}`;

    //-> FALTA AGREGAR TRY CATCH PARA EL MANEJO DE ERRORES
    if(endpoint == trending || endpoint == search) {
     url = url + limit + nroLimit;
        if(endpoint == search) {
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
    const buttonsVerMas = document.getElementsByClassName('btn vermas');

    for(let i = 0; i < 4; i++) {
        tagGifs[i].innerHTML = '#' + arguments[i];
        buttonsVerMas[i].addEventListener('click', () => {
            getSearchGifs(numeroDeGifs, arguments[i]);
            inputBuscar.value = arguments[i];
        })
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

function crearHTMLGifs(numeroDeGifs, idContainer, gifClassName) {
    const container = document.querySelector(idContainer);

    for(let i = 0; i < numeroDeGifs; i++) {
        let containerGif = document.createElement('div');
        containerGif.className = 'archivo-gif';
        container.appendChild(containerGif);
        let gif = document.createElement('img');
        gif.className = 'gif sinventana ' + gifClassName;
        containerGif.appendChild(gif);
    }
}

function getTrendingGifs(numeroDeGifs, idContainer) {
    crearHTMLGifs(numeroDeGifs, idContainer, 'tendencias');
    const arrDOM = document.getElementsByClassName('gif tendencias');

    llamarApi(trending, numeroDeGifs).then((res) => {
        for(let i = 0; i < numeroDeGifs; i++){
            arrDOM[i].src = res.data[i].images.downsized.url;
        }
    });  
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

function getSearchGifs(numeroDeGifs, searchString) {
    const sugerenciasSection = document.querySelector('#sugerencias');
    const tendenciasSection = document.querySelector('#tendencias');
    sugerenciasSection.style.display = 'none';
    tendenciasSection.style.display= 'none';
    const gifsContainer = document.querySelector('#search-container');

    while (gifsContainer.hasChildNodes()) {  
        gifsContainer.removeChild(gifsContainer.firstChild);
    }
    
    llamarApi(search, numeroDeGifs, searchString).then((res) => {
        let nroGifsRecibidos = res.data.length;

        crearHTMLGifs(nroGifsRecibidos, '#search-container', 'search-results');
        const arrDOM = document.getElementsByClassName('gif search-results');
        const separador = document.querySelector('#separador-resultname');
        separador.style.display = 'block';
        separador.innerHTML = searchString + ' (resultados)';
        
        for(let i = 0; i < nroGifsRecibidos; i++){
            arrDOM[i].src = res.data[i].images.downsized.url;
        }

        saveSearch(searchString);
    });  

}

async function getSearchSuggestions(tag) {
    const API_KEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
    const url = 'http://api.giphy.com/v1/tags/related/' + '{' + tag + '}' + API_KEY;
    const datos = await fetch(url);
    const datosJSON = await datos.json();

    return datosJSON;
}

async function getSearchAutocomplete(tag) {
    const API_KEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
    const url = 'http://api.giphy.com/v1/gifs/search/tags' + API_KEY + q + tag;
    const datos = await fetch(url);
    const datosJSON = await datos.json();

    return datosJSON;
}

function saveSearch(stringSearch) {
    //función usada cuando se produce una búsqueda que agrega al storage y HTML, sólo si no se repite el tag
    if(!elTagSeRepite(stringSearch)){
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
    
        if(!localStorage[searchString]) {

        const tagButton = document.createElement('button');
        tagButton.className = 'btn tag-search';
        tagButton.innerHTML = '#' + searchString;
        sectionTagsBuscados.appendChild(tagButton);

        tagButton.onclick = () => {
            getSearchGifs(numeroDeGifs, searchString);
        }
    }
}

function setLocalStorageTags() {
    while (sectionTagsBuscados.hasChildNodes()) {  
        sectionTagsBuscados.removeChild(sectionTagsBuscados.firstChild);
    }
    
    for(let i = 1; i <= localStorage.contador; i++) {
    
        if(localStorage.contador > 0) {
            setTagSearch(localStorage[i]);
        }
    }
}

/*NÚMERO DE GIFS*/
const numeroDeGifs = 8;

/*SUGERENCIAS*/
getSugerenciasGifs('memes', 'reactions', 'cat', 'fails');

/*TENDENCIAS*/
getTrendingGifs(12, '#tendencias-container'); 

/*CAMBIAR TEMA */
const dropDownBtn = document.querySelector('.dropdown-button');
const textDropBtn = document.querySelector('#text-dropbtn');
const iconDropBtn = document.querySelector('.v-icon');

dropDownBtn.addEventListener('click', ventanaElegirTema);

const dayBtn = document.querySelector('#sailor-day');
dayBtn.addEventListener('click', setSailorDayTheme);

const nightBtn = document.querySelector('#sailor-night');
nightBtn.addEventListener('click', setSailorNightTheme);

dropDownBtn.addEventListener('mouseover', () => {
    textDropBtn.className += ' hover-dropdown';
    iconDropBtn.className += ' hover-dropdown';
});
dropDownBtn.addEventListener('mouseout', () => {
    textDropBtn.className = 'btn primary';
    iconDropBtn.className = 'btn primary v-icon';
})



/*BUSCADOR*/
const sectionBuscador = document.querySelector('#buscador');
const inputBuscar = document.querySelector('.inputbuscar');
const ventanaSugerencias = document.querySelector('.search-sugerencias');
const resultadosSugeridos = document.getElementsByClassName('btn gray search-sugerencia');
const btnBuscar = document.querySelector('.btn-buscar');
const btnBuscarText = document.querySelector('.btn-buscar span');
const btnBuscarImg = document.querySelector('.btn-buscar img');
const form = document.querySelector('#form');

inputBuscar.addEventListener('input', () => {
    const normalClass = 'btn gray btn-buscar ';
    const urlInactive = '/assets/lupa_inactive.svg';
    let urlActive = '/assets/lupa.svg';

    if (document.body.className == 'night'){
        urlActive = '/assets/lupa_light.svg';
    }
    
    if(inputBuscar.value.length < 3) {
        ventanaSugerencias.style.display = 'none';
        btnBuscar.className = normalClass;
        btnBuscarText.className = 'normal-text';
        btnBuscarImg.src = urlInactive;
    }
    
    if(inputBuscar.value.length >= 3) {

        btnBuscar.className = normalClass + 'active-buscar';
        btnBuscarText.className = 'active-text';
        btnBuscarImg.src = urlActive;

        getSearchSuggestions(inputBuscar.value).then( (res) => {
            let sug2 = res.data[0].name;
            let sug3 = res.data[1].name;
            resultadosSugeridos[1].innerHTML = sug2;
            resultadosSugeridos[2].innerHTML = sug3;
            ventanaSugerencias.style.display = 'block';

            resultadosSugeridos[1].onclick = () => {
                getSearchGifs(numeroDeGifs, sug2);
                inputBuscar.value = sug2;
                ventanaSugerencias.style.display = 'none';
                
            };
            resultadosSugeridos[2].onclick = () => {
                getSearchGifs(numeroDeGifs, sug3);
                inputBuscar.value = sug3;
                ventanaSugerencias.style.display = 'none';
            };
        });

        getSearchAutocomplete(inputBuscar.value).then( (res) => {
            let sug1 = res.data[0].name;
            resultadosSugeridos[0].innerHTML = sug1;
            resultadosSugeridos[0].onclick = () => {
                getSearchGifs(numeroDeGifs, sug1);
                inputBuscar.value = sug1;
                ventanaSugerencias.style.display = 'none';
            };
        });
    }
});


inputBuscar.addEventListener('keyup', (e) => {
    let keycode = e.keycode;
    let stringSearch = inputBuscar.value;

    if(keycode == '13' && stringSearch.lenght > 0){
        ventanaSugerencias.style.display = 'none';
        getSearchGifs(numeroDeGifs, stringSearch);
        
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
});

btnBuscar.addEventListener('click', () => {
    let stringSearch = inputBuscar.value;
    if(stringSearch.length > 0){
    ventanaSugerencias.style.display = 'none';
    getSearchGifs(numeroDeGifs, stringSearch);
    
    }
});


/*TAGS YA BUSCADOS*/
const sectionTagsBuscados = document.querySelector('.tags-buscados');
setLocalStorageTags(); //al reiniciar la página evalúa los tags el localStorage


/* EVENTOS CONTAINER GIFS */
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







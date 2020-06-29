/*--------------------------- CONSTANTES ---------------------------*/ 
/*API*/
const APIKEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
const API_BASE_URL = 'https://api.giphy.com/v1/gifs/';
const API_UPLOAD = 'https://upload.giphy.com/v1/gifs';

/*DOM*/
const start = document.getElementById('permiso-comenzar'); //btn comenzar
const video = document.querySelector('video'); //<video>
const record = document.getElementById('record'); //btn capturar
const stop = document.getElementById('stop'); //img btn capturar
const restart = document.getElementById('restart'); //btn repetir captura
const upload = document.getElementById('upload'); //btn subir guifo
const preview = document.getElementById('preview'); //img gif de preview
const progressBar = document.getElementsByClassName('progress-bar-item'); //progress bar items array
const uploadMessage = document.getElementById('upload-msg'); //container de mensaje de subiendo gif
const download = document.getElementById('download'); //boton descargar guifo
const copy = document.getElementById('copy'); //boton copiar link
const ventanaCrearGuifos = document.querySelector('#ventana-crearguifos');

/*---------------------------- VARIABLES ----------------------------*/ 
let recorder;
let recording = false; //para el manejo del timer
let contador = 0;

/*------------------------- GLOBAL FUNCTIONS -------------------------*/ 

async function getStream() {
    let stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                height: 436,
                width: 830
            }
        });
   
    return stream;
}

function streamAndRecord() {

    getStream().then( (streaming) => {
        video.srcObject = streaming;
        video.play();

        record.addEventListener('click', () => {
            recording = !recording;
            document.getElementById('timer').innerHTML = 'Prepárate...'
            document.getElementById('camera-button').src = '../assets/recording.svg';

            if (recording === true) {
                this.disabled = true; //deshabilitamos el boton record

                recorder = RecordRTC(streaming, 
                    {
                        type: 'gif',
                        frameRate: 1,
                        quality: 10,
                        width: 360,
                        hidden: 240,
                    }
                );

                recorder.startRecording();
                getDuration();

                record.classList.add('capturandobtn');
                record.innerHTML = 'Listo';
                stop.classList.add('capturandobtn');

                recorder.camera = streaming;

            } else {
                this.disabled = true;
                recorder.stopRecording(previewAndUpload);
                recording = false;
            }
        });
    });
}

function getDuration() {
    let seconds = 0;
    let minutes = 0;
    let timer = setInterval(() => {
        if (recording) {
            if (seconds < 60) {
                if (seconds <= 9) {
                    seconds = '0' + seconds;
                }
                document.getElementById('timer').innerHTML = `00:00:0${minutes}:${seconds}`;
                seconds++;
            } else {
                minutes++;
                seconds = 0;
            }
            
        } else {
            clearInterval(timer); //si no estoy grabando los limpia
        }
    }, 1000);
}

function previewAndUpload() {

    recorder.camera.stop();
    let form = new FormData();
    form.append('file', recorder.getBlob(), 'prueba-gif');

    //aca obtenemos el blob con la variable global recorder, que ya tiene el gif guardado para la preview
    objectURL = URL.createObjectURL(recorder.getBlob());
    preview.src = objectURL;

    //modificamos el DOM para mostrar la preview, remover el timer
    preview.classList.remove('hidden');
    video.classList.add('hidden');
    document.getElementById('video-record-buttons').classList.add('hidden');
    document.getElementById('video-upload-buttons').classList.remove('hidden');

    upload.addEventListener('click', () => {
        uploadMessage.classList.remove('hidden');
        preview.classList.add('hidden');
        animateProgressbar(progressBar);
        //acá se pasa el form a la función upload gif
        uploadGif(form).then( res => {
            
            if (res.meta.status != 200 ) {
                uploadMessage.innerHTML = `<p class="error-msg">Hubo un error subiendo tu Guifo</p>`;
            } else {
                console.log(res.data);
                console.log(res.data.id);
                uploadMessage.classList.add('hidden');
                ventanaCrearGuifos.classList.add('hidden');
                document.getElementById('share-modal-wrapper').classList.remove('hidden');
                const gifId = res.data.id;
                getGifDetails(gifId);
                recorder.destroy();
                recorder = null;
            }
        })
        .catch(error => {
            uploadMessage.innerHTML = `<p class="error-msg">Hubo un error subiendo tu Guifo</p>`;
            console.log('Error: ', error);
        });
    });
}

function animateProgressbar(bar) {
    setInterval( () => {

        if(contador < bar.length) {
            bar.item(contador).classList.toggle('progress-bar-item-active');
            contador++;
        } else {
            contador = 0;
        }
    }, 200);
}

async function uploadGif(gif) {
    const url = API_UPLOAD + APIKEY;
    const CONFIG_UPLOAD = {method: 'POST', mode:'cors', body: gif}
    
    const apiUpload = await fetch(url, CONFIG_UPLOAD);
    const apiUploadJson = await apiUpload.json();

    return apiUploadJson;
}

async function getGif(id) {
    const url = API_BASE_URL + id + APIKEY;
    const apiRes = await fetch(url);
    const apiResJson = await apiRes.json();

    return apiResJson;
}

function getGifDetails(id) {

    getGif(id).then( (res) => {
        const gifURL = res.data.url;
        localStorage.setItem('gif' + res.data.id, JSON.stringify(res));

        /*Seteamos el DOM para mostrar nuestro modal de succes*/
        document.getElementById('share-modal-preview').src = res.data.images.fixed_height.url;
        const copyModal = document.getElementById('copy-success');
        preview.classList.remove('hidden');

        download.href = gifURL;

        copy.addEventListener('click', () => {
            navigator.clipboard.writeText(gifUrl);
            copyModal.innerHTML = 'Link copiado con éxito!';
            copyModal.classList.remove('hidden');
            setTimeout(() => {copyModal.classList.add('hidden') }, 500);
        });

        document.getElementById('finish').addEventListener('click', () => {
            location.reload();
        });

    }) .catch( (error) => {
            console.log(error);  
        });
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
/*BOTÓN COMENZAR*/
start.addEventListener('click', () => {
    //cambiamos de modal pre a modal grabacion
    ventanaCrearGuifos.classList.add('captura-container');
    document.querySelector('#pre-upload-text').classList.add('hidden');
    document.querySelector('#pre-upload-video').classList.remove('hidden');

    streamAndRecord();
});

/*BOTÓN REPETIR CAPTURA*/
restart.addEventListener('click', () => {
    location.reload();
    streamAndRecord();
})

/*MIS GUIFOS */
window.addEventListener('load', () => {
    const localGifs = getMyGifsUrlArray();
    const container = document.querySelector('#results');

    localGifs.forEach(item => {
        let containerGif = document.createElement('div');
        containerGif.className = 'archivo-gif miguifo';
        container.appendChild(containerGif);
        let gif = document.createElement('img');
        gif.className = 'gif sinventana';
        gif.src = item;
        containerGif.appendChild(gif);
    })
})

getMyGifsUrlArray();

document.getElementById('share-done').addEventListener('click', () => {
    ventanaCrearGuifos.classList.remove('captura-container');
    location.reload();
});




// ==UserScript==
// @name         Extraer Llave y Desencriptar Mensajes
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Extrae los mensajes en el codigo fuente, los cuenta y desencripta
// @author       FelipeMora
// @match        https://cripto.tiiny.site/
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js#sha512-a+SUDuwNzXDvz4XrIcXHuCf089/iJAoN4lmrXJg18XnduKK6YlDHNRalv4yd1N40OKI80tFidF+rqTFKGPoWFQ==
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // Función para extraer la clave de los párrafos
    function obtenerClave() {
        let clave = '';
        const parrafos = document.querySelectorAll('p');
        parrafos.forEach(parrafo => {
            const texto = parrafo.innerText;
            for (let i = 0; i < texto.length; i++) {
                if (texto[i] === texto[i].toUpperCase() && /[A-Z]/.test(texto[i])) {
                    clave += texto[i];
                }
            }
        });
        return clave;
    }

    // Función para contar los mensajes cifrados en los divs y guardar sus IDs
    function obtenerMensajesCifrados() {
        const divs = document.querySelectorAll('div');
        let idsCifrados = [];
        divs.forEach(div => {
            if (div.id && /^[A-Za-z0-9+/=]+$/.test(div.id)) {
                idsCifrados.push(div.id);
            }
        });
        return idsCifrados;
    }

    // Función para desencriptar los mensajes usando 3DES
    function desencriptarMensaje(mensajeCifrado, clave) {
        try {
            const keyHex = CryptoJS.enc.Utf8.parse(clave);
            const encryptedBytes = CryptoJS.enc.Base64.parse(mensajeCifrado);
            const decrypted = CryptoJS.TripleDES.decrypt(
                {
                    ciphertext: encryptedBytes
                },
                keyHex,
                {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7
                }
            );
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            console.error('Error al desencriptar el mensaje:', e);
            return null;
        }
    }

    // Función principal
    function principal() {
        // Obtener la clave de los párrafos
        const clave = obtenerClave();
        console.log("La llave es: " + clave);

        // Obtener los mensajes cifrados en los divs
        const idsMensajesCifrados = obtenerMensajesCifrados();
        console.log("Cantidad de mensajes cifrados: " + idsMensajesCifrados.length);

        // Desencriptar y mostrar los mensajes
        idsMensajesCifrados.forEach(mensajeCifrado => {
            const mensajeDesencriptado = desencriptarMensaje(mensajeCifrado, clave);
            if (mensajeDesencriptado) {
                console.log(`${mensajeCifrado} ${mensajeDesencriptado}`);

                // Crear un nuevo elemento para mostrar el mensaje desencriptado en la página
                const divMensaje = document.createElement('div');
                divMensaje.innerText = ` ${mensajeDesencriptado}`;
                document.body.appendChild(divMensaje);
            } else {
                console.error(`No se pudo desencriptar el mensaje: ${mensajeCifrado}`);
            }
        });
    }

    // Ejecutar la función principal después de que la página se haya cargado
    window.addEventListener('load', principal);
})();

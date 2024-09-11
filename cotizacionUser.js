import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDnKcHS41_TH5jzmT2gIEU6-h4C_dnIML8",
    authDomain: "fablab2-88ab1.firebaseapp.com",
    projectId: "fablab2-88ab1",
    storageBucket: "fablab2-88ab1.appspot.com",
    messagingSenderId: "30169496903",
    appId: "1:30169496903:web:a7060677c0513fe1ea6062",
    measurementId: "G-TL1F53C259"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para calcular la cotización
async function calcular() {
    const material = document.getElementById('Materiales').value;
    const ancho = parseFloat(document.getElementById('inputAncho').value);
    const largo = parseFloat(document.getElementById('inputLargo').value);
    const cantidad = parseInt(document.getElementById('inputCantidad').value);

    if (!material || isNaN(ancho) || isNaN(largo) || isNaN(cantidad)) {
        alert('Todos los campos son obligatorios y deben ser numéricos.');
        return;
    }

    const costosMateriales = {
        'MDF 3mm': 70 / (122 * 244),
        'MDF 6mm': 125 / (122 * 244),
        'Acrílico transparente': 400 / (122 * 244),
        'Acrílico negro': 475 / (122 * 244)
    };

    if (!costosMateriales[material]) {
        alert("Por favor selecciona un material válido.");
        return;
    }

    const area = ancho * largo;
    const costoUnitario = costosMateriales[material];
    const costo = (area * costoUnitario * cantidad).toFixed(2);
    const ganancia = (costo * 1.35).toFixed(2);

    // Muestra los resultados en la página
    document.getElementById('costo').innerText = 'Precio: Q.' + ganancia;
    document.getElementById('area').innerText = 'Área: ' + area + ' cm²';

    // Guarda los datos en Firestore
    try {
        const docRef = await addDoc(collection(db, "cotizaciones"), {
            material: material,
            ancho: ancho,
            largo: largo,
            cantidad: cantidad,
            costo: costo,
            ganancia: ganancia,
            timestamp: Timestamp.now()
        });
        console.log("Documento escrito con ID: ", docRef.id);
        mostrarHistorial();
    } catch (e) {
        console.error("Error al agregar el documento: ", e);
    }
}

// Función para mostrar el historial de cotizaciones
async function mostrarHistorial() {
    const querySnapshot = await getDocs(collection(db, "cotizaciones"));
    const historialElement = document.getElementById("historialCotizaciones");
    historialElement.innerHTML = "";
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const listItem = document.createElement("li");
        listItem.className = "list-group-item";
        listItem.innerHTML = `
            Material: ${data.material}, Ancho: ${data.ancho} cm, Largo: ${data.largo} cm, Cantidad: ${data.cantidad}, Costo: Q. ${data.costo}, Ganancia: Q. ${data.ganancia}
            <button class="btn btn-danger btn-sm float-end" onclick="eliminarCotizacion('${doc.id}')">Eliminar</button>
        `;
        historialElement.appendChild(listItem);
    });
}

// Función para eliminar una cotización
async function eliminarCotizacion(id) {
    try {
        await deleteDoc(doc(db, "cotizaciones", id));
        console.log("Documento eliminado con ID: ", id);
        mostrarHistorial();
    } catch (e) {
        console.error("Error al eliminar el documento: ", e);
    }
}

// Asegura que la función eliminarCotizacion esté disponible globalmente
window.eliminarCotizacion = eliminarCotizacion;

document.getElementById('Calcular').addEventListener('click', calcular);

// Inicializar historial al cargar la página
mostrarHistorial();
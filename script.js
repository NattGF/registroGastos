let totalGastos = 0;
let totalAmex = 0;
let totalMesAmex = 0;
let db;

function initDB() {
    const request = window.indexedDB.open('registro-gastos', 1);

    request.onerror = function(event) {
        console.error('Error al abrir la base de datos:', event.target.error);
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        const objectStore = db.createObjectStore('gastos', { keyPath: 'id', autoIncrement:true });
        objectStore.createIndex('tarjeta', 'tarjeta', { unique: false });
        objectStore.createIndex('motivo', 'motivo', { unique: false });
        objectStore.createIndex('fecha', 'fecha', { unique: false });
        objectStore.createIndex('monto', 'monto', { unique: false });
        objectStore.createIndex('mesAmex', 'mesAmex', { unique: false });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log('Base de datos abierta correctamente.');
        mostrarGastos();
    };
}

window.onload = function() {
    initDB();
};

function registrarGasto() {
    const tarjeta = document.getElementById('tarjeta').value;
    const motivo = document.getElementById('motivo').value;
    const fecha = document.getElementById('fecha').value;
    const monto = parseFloat(document.getElementById('monto').value);

    if (isNaN(monto)) {
        alert('Por favor ingresa un monto válido.');
        return;
    }

    const transaction = db.transaction(['gastos'], 'readwrite');
    const objectStore = transaction.objectStore('gastos');

    const nuevoGasto = {
        tarjeta: tarjeta,
        motivo: motivo,
        fecha: fecha,
        monto: monto,
        mesAmex: (tarjeta === 'amex' && monto >= 2500) ? (monto / 3).toFixed(2) : 0
    };

    const request = objectStore.add(nuevoGasto);
    
    request.onsuccess = function(event) {
        console.log('Gasto registrado correctamente.');
        mostrarGastos();
    };

    request.onerror = function(event) {
        console.error('Error al registrar el gasto:', event.target.error);
    };
}

function mostrarGastos() {
    const tablaBody = document.getElementById('tabla-body');
    tablaBody.innerHTML = '';

    const objectStore = db.transaction('gastos').objectStore('gastos');
    objectStore.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const gasto = cursor.value;

            const nuevaFila = tablaBody.insertRow();
            nuevaFila.insertCell().textContent = gasto.tarjeta;
            nuevaFila.insertCell().textContent = gasto.motivo;
            nuevaFila.insertCell().textContent = gasto.fecha;
            nuevaFila.insertCell().textContent = gasto.monto.toFixed(2);
            nuevaFila.insertCell().textContent = gasto.mesAmex;

            totalGastos += gasto.monto;
            if (gasto.tarjeta === 'amex') {
                totalAmex += gasto.monto;
                totalMesAmex += parseFloat(gasto.mesAmex);
            }

            cursor.continue();
        } else {
            document.getElementById('total-gastos').textContent = totalGastos.toFixed(2);
            document.getElementById('total-mes-amex').textContent = totalMesAmex.toFixed(2);
        }
    };
}
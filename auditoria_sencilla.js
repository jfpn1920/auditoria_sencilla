// ===== Auditoría Sencilla =====
// Clave con la que se guardan los datos en localStorage
const CLAVE = 'auditoriaSencilla';
// Elementos que aparecen la primera vez que se abre la página
const INICIALES = ['Extintores', 'Salidas de emergencia', 'Botiquín', 'Cámaras de seguridad', 'Iluminación', 'Inventario'];
// Estado: lista de elementos y filtro elegido
let estado = { items: [], filtro: 'todos' };
// ===== Referencias a elementos del HTML =====
const lista = document.getElementById('lista');             // lista de elementos
const formulario = document.getElementById('formulario');   // formulario de agregar
const texto = document.getElementById('texto');             // casilla de texto
const zonaFiltros = document.getElementById('filtros');     // contenedor de filtros
const filtros = document.querySelectorAll('.filtro');       // botones de filtro
const relleno = document.getElementById('relleno');         // relleno de la barra
const porcentaje = document.getElementById('porcentaje');   // texto del porcentaje
// ===== Funciones de localStorage =====
// Guarda el estado actual en el navegador (como texto JSON)
function guardar() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
// Carga el estado guardado; si no hay nada, crea la lista inicial
function cargar() {
    const datos = localStorage.getItem(CLAVE); // lee el texto guardado
    if (datos) {
        estado = { ...estado, ...JSON.parse(datos) };
    } else {
        estado.items = INICIALES.map((t, i) => ({ id: i + 1, texto: t, revisado: false }));
    }
}
// ===== Funciones de la interfaz =====
// Dibuja en pantalla la lista, el resumen y la barra de progreso
function actualizar() {
    // Aplica el filtro elegido para decidir qué elementos se ven
    const visibles = estado.items.filter(item =>
        estado.filtro === 'todos' || (estado.filtro === 'revisados') === item.revisado);
    // Vacía la lista y crea un <li> por cada elemento visible
    lista.innerHTML = '';
    visibles.forEach(item => {
        const li = document.createElement('li');
        li.dataset.id = item.id; // guarda el id para saber cuál se pulsó
        li.classList.toggle('revisado', item.revisado);
        li.innerHTML = '<input type="checkbox"><span></span><button>🗑️</button>';
        li.querySelector('input').checked = item.revisado;
        li.querySelector('span').textContent = item.texto; // textContent evita código malicioso
        lista.appendChild(li);
    });
    // Calcula los números del resumen
    const total = estado.items.length;
    const revisados = estado.items.filter(item => item.revisado).length;
    const avance = total === 0 ? 0 : Math.round((revisados / total) * 100);
    document.getElementById('total').textContent = total;
    document.getElementById('revisados').textContent = revisados;
    document.getElementById('pendientes').textContent = total - revisados;
    // Mueve la barra de progreso y escribe el porcentaje
    relleno.style.width = avance + '%';
    porcentaje.textContent = `${avance}% completado`;
    // Resalta solo el botón del filtro activo
    filtros.forEach(b => b.classList.toggle('activo', b.dataset.filtro === estado.filtro));
}
// Guarda y vuelve a dibujar (se usa después de cada cambio)
function cambiar() {
    guardar();
    actualizar();
}
// ===== Eventos =====
// Agregar un elemento nuevo
formulario.addEventListener('submit', (evento) => {
    evento.preventDefault(); // evita que la página se recargue
    const nuevo = texto.value.trim();
    if (!nuevo) return; // si está vacío, no hace nada
    estado.items.push({ id: Date.now(), texto: nuevo, revisado: false });
    texto.value = ''; cambiar();
});
// Un solo "oyente" en la lista: marcar casilla o eliminar con el botón
lista.addEventListener('click', (evento) => {
    const li = evento.target.closest('li');
    if (!li) return;
    const id = Number(li.dataset.id);
    if (evento.target.tagName === 'BUTTON') {
      estado.items = estado.items.filter(item => item.id !== id); // elimina
    } else if (evento.target.tagName === 'INPUT') {
        const item = estado.items.find(item => item.id === id);
        item.revisado = evento.target.checked; // marca o desmarca
    } else return;
    cambiar();
});
// Un solo "oyente" en los filtros
zonaFiltros.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.filtro');
    if (!boton) return;
    estado.filtro = boton.dataset.filtro; cambiar();
});
// Botón "Desmarcar todos": todos pasan a pendiente
document.getElementById('btn-desmarcar').addEventListener('click', () => {
    estado.items.forEach(item => item.revisado = false); cambiar();
});
// Botón "Quitar revisados": deja solo los pendientes
document.getElementById('btn-quitar').addEventListener('click', () => {
    estado.items = estado.items.filter(item => !item.revisado); cambiar();
});
// ===== Inicio =====
// Al cargar la página: lee lo guardado y dibuja
cargar();
actualizar();
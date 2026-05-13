// ===============================
// CAPTURA DE ELEMENTOS DEL DOM
// ===============================

// Formulario principal para crear tickets
const formulario = document.querySelector("#form-nuevo-ticket");

// Contenedor donde se renderizan todos los tickets creados
const lista = document.querySelector("#lista-tickets");

// Elementos del chat virtual
const tituloChat = document.querySelector(".chat-titulo"); // barra superior
const cuerpoChat = document.querySelector(".chat-cuerpo"); // mensajes
const chatPie = document.querySelector(".chat-pie"); // input y botón

// Inputs importantes
const descripcion = document.querySelector("#descripcion"); // textarea ticket
const botonEnviar = document.querySelector("#btn-enviar"); // botón chat
const inputMensaje = document.querySelector("#mensaje-usuario"); // input chat


// ===============================
// LOCAL STORAGE
// ===============================

// Recupera tickets guardados.
// localStorage guarda strings, por eso uso JSON.parse()
let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

// Recupera historial del chat
let mensajes = JSON.parse(localStorage.getItem("mensajes")) || [];


// ===============================
// ESTADO DEL CHATBOT
// ===============================

// Variable que controla en qué parte del flujo está el usuario
// inicio -> menu -> software/redes/hardware -> final
let estadoChat = "inicio";


// ===============================
// FUNCIONES DEL CHAT
// ===============================

// Agrega mensaje al array y actualiza localStorage + interfaz
function agregarMensaje(texto, tipo = "ia") {
  mensajes.push({
    texto: texto,
    tipo: tipo, // ia o usuario
  });

  // Guarda historial del chat
  localStorage.setItem("mensajes", JSON.stringify(mensajes));

  // Re-renderiza chat
  mostrarMensajes();
}


// Renderiza todos los mensajes visualmente
function mostrarMensajes() {
  cuerpoChat.innerHTML = "";

  mensajes.forEach((mensaje) => {
    cuerpoChat.innerHTML += `
      <div class="burbuja ${mensaje.tipo}">
        ${mensaje.texto.replace(/\n/g, "<br>")}
      </div>
    `;
  });

  // Baja automáticamente al último mensaje
  cuerpoChat.scrollTop = cuerpoChat.scrollHeight;
}


// Limpia conversación completa
function limpiarChat() {
  mensajes = [];

  // Elimina mensajes guardados del navegador
  localStorage.removeItem("mensajes");

  // Reinicia flujo
  estadoChat = "inicio";

  mostrarMensajes();
}


// Menú principal del chatbot
function mostrarMenuPrincipal() {
  agregarMensaje(`Bienvenido a Edu Labs Help Desk.

Selecciona una opción:

1️⃣ Software
2️⃣ Redes
3️⃣ Hardware`);
}


// ===============================
// ABRIR / CERRAR CHAT
// ===============================

// Cuando hago click en barra del chat,
// oculto o muestro cuerpo e input
tituloChat.addEventListener("click", () => {
  cuerpoChat.classList.toggle("oculto");
  chatPie.classList.toggle("oculto");
});


// ===============================
// RENDERIZAR TICKETS
// ===============================

function mostrarTickets() {
  lista.innerHTML = "";

  // Recorre array de tickets y pinta cada uno
  tickets.forEach((ticket, index) => {
    lista.innerHTML += `
      <article class="ticket ${ticket.prioridad}">
        <div class="ticket-info">
          <span class="estado">${ticket.estado}</span>
          <span>${ticket.prioridadTexto}</span>
        </div>

        <h3>${ticket.titulo}</h3>
        <p>${ticket.descripcion}</p>

        <div class="acciones-ticket">
          <small>${ticket.usuario}</small>

          <!-- Botones funcionales -->
          <button class="boton-ver" data-id="${index}">
            Ver detalle
          </button>

          <button class="boton-estado" data-id="${index}">
            Cambiar estado
          </button>

          <button class="boton-eliminar" data-id="${index}">
            Eliminar
          </button>
        </div>
      </article>
    `;
  });
}


// ===============================
// CREAR NUEVO TICKET
// ===============================

formulario.addEventListener("submit", (e) => {
  e.preventDefault(); // evita recargar página

  // Captura valores
  const titulo = document.querySelector("#titulo").value;
  const descripcionTexto = document.querySelector("#descripcion").value;
  const usuario = document.querySelector("#usuario").value || "Usuario anonimo";
  const prioridad = document.querySelector("#prioridad-selector").value;

  let prioridadTexto = "";

  // Traduce prioridad a texto visual
  if (prioridad === "ticketurgente") {
    prioridadTexto = "🚨 Urgente";
  } else if (prioridad === "ticketnormal") {
    prioridadTexto = "🌐 Redes";
  } else {
    prioridadTexto = "🖥️ Hardware";
  }

  // Crea objeto ticket
  const nuevoTicket = {
    titulo,
    descripcion: descripcionTexto,
    usuario,
    prioridad,
    prioridadTexto,

    // Todo ticket inicia abierto
    estado: "Abierto",

    // Historial inicial
    historial: [
      {
        anterior: "Sin estado",
        nuevo: "Abierto",
        fecha: new Date().toLocaleString(),
      },
    ],
  };

  // Guarda ticket
  tickets.push(nuevoTicket);

  localStorage.setItem("tickets", JSON.stringify(tickets));

  // Actualiza interfaz
  mostrarTickets();

  // Limpia formulario
  formulario.reset();
});


// ===============================
// IA SIMULADA EN FORMULARIO
// ===============================

// Analiza texto mientras usuario escribe
descripcion.addEventListener("input", () => {
  let texto = descripcion.value.toLowerCase();

  let categoria = "General";
  let prioridadIA = "Baja";

  // Detecta software
  if (
    texto.includes("error") ||
    texto.includes("sistema") ||
    texto.includes("bug") ||
    texto.includes("login")
  ) {
    categoria = "Software";
    prioridadIA = "Media";
  }

  // Detecta redes
  if (
    texto.includes("wifi") ||
    texto.includes("internet") ||
    texto.includes("red") ||
    texto.includes("conexion")
  ) {
    categoria = "Redes";
    prioridadIA = "Alta";
  }

  // Detecta hardware
  if (
    texto.includes("pantalla") ||
    texto.includes("no prende") ||
    texto.includes("ram") ||
    texto.includes("teclado") ||
    texto.includes("pc")
  ) {
    categoria = "Hardware";
    prioridadIA = "Alta";
  }

  // Consultas generales
  if (
    texto.includes("consulta") ||
    texto.includes("duda") ||
    texto.includes("informacion")
  ) {
    categoria = "General";
    prioridadIA = "Baja";
  }

  // Actualiza UI
  document.querySelector("#ia-cat").textContent = categoria;
  document.querySelector("#ia-prio").textContent = prioridadIA;
});


// ===============================
// CAMBIO DE ESTADOS DE TICKET
// ===============================

// Flujo requerido:
// Abierto -> En progreso -> Resuelto -> Cerrado
function siguienteEstado(estadoActual) {
  if (estadoActual === "Abierto") return "En progreso";
  if (estadoActual === "En progreso") return "Resuelto";
  if (estadoActual === "Resuelto") return "Cerrado";
  return "Cerrado";
}


// ===============================
// BOTONES DINÁMICOS
// ===============================

document.addEventListener("click", (e) => {
  const id = e.target.dataset.id;

  // -------- VER DETALLE --------
  if (e.target.classList.contains("boton-ver")) {
    const ticket = tickets[id];

    // Convierte historial en texto legible
    const historialTexto = ticket.historial
      .map((item) => `${item.fecha} | ${item.anterior} → ${item.nuevo}`)
      .join("\n");

    alert(`
Título: ${ticket.titulo}
Descripción: ${ticket.descripcion}
Usuario: ${ticket.usuario}
Estado: ${ticket.estado}

Historial:
${historialTexto}
    `);
  }

  // -------- CAMBIAR ESTADO --------
  if (e.target.classList.contains("boton-estado")) {
    const ticket = tickets[id];

    if (ticket.estado !== "Cerrado") {
      const estadoAnterior = ticket.estado;
      const nuevoEstado = siguienteEstado(ticket.estado);

      // actualiza estado
      ticket.estado = nuevoEstado;

      // guarda trazabilidad
      ticket.historial.push({
        anterior: estadoAnterior,
        nuevo: nuevoEstado,
        fecha: new Date().toLocaleString(),
      });

      localStorage.setItem("tickets", JSON.stringify(tickets));
      mostrarTickets();
    }
  }

  // -------- ELIMINAR --------
  if (e.target.classList.contains("boton-eliminar")) {
    const ticket = tickets[id];

    // solo eliminar si cerrado
    if (ticket.estado !== "Cerrado") {
      alert("Solo puedes eliminar tickets cerrados.");
      return;
    }

    tickets.splice(id, 1);

    localStorage.setItem("tickets", JSON.stringify(tickets));
    mostrarTickets();
  }
});


// ===============================
// CHATBOT IA SIMULADA
// ===============================

botonEnviar.addEventListener("click", () => {
  const texto = inputMensaje.value.trim();

  if (texto === "") return;

  agregarMensaje(texto, "usuario");
  inputMensaje.value = "";

  // primer mensaje abre menú
  if (estadoChat === "inicio") {
    mostrarMenuPrincipal();
    estadoChat = "menu";
    return;
  }

  // menú principal
  if (estadoChat === "menu") {
    if (texto === "1") {
      agregarMensaje(`Su error es de:

1. Fallas en el sistema
2. Error 500
3. Sistema lento`);
      estadoChat = "software";
    } else if (texto === "2") {
      agregarMensaje(`Su error es de:

1. Conectividad a internet
2. Fallos en cableado
3. Corte de servicios`);
      estadoChat = "redes";
    } else if (texto === "3") {
      agregarMensaje(`Su error es de:

1. Fallos en computadores
2. Fallas de RAM
3. Sistema operativo lento`);
      estadoChat = "hardware";
    }

    return;
  }

  // respuestas software
  if (estadoChat === "software") {
    if (texto === "1") agregarMensaje("Conflictos entre programas o archivos dañados.");
    if (texto === "2") agregarMensaje("Problema interno del servidor.");
    if (texto === "3") agregarMensaje("Demasiados procesos activos.");

    agregarMensaje(`¿Quieres ir al menú principal?

1. Eso es todo
2. Realizar otra consulta`);

    estadoChat = "final";
    return;
  }

  // respuestas redes
  if (estadoChat === "redes") {
    if (texto === "1") agregarMensaje("apeciado usuario su falla puede estar siendo causada por Mala señal Wi-Fi o falla del proveedor.");
    if (texto === "2") agregarMensaje("su Cable podria estar desconectado o algun cable dañado.");
    if (texto === "3") agregarMensaje("Mantenimiento técnico.");

    agregarMensaje(`¿Quieres ir al menú principal?

1. Eso es todo
2. Realizar otra consulta`);

    estadoChat = "final";
    return;
  }

  // respuestas hardware
  if (estadoChat === "hardware") {
    if (texto === "1") agregarMensaje("se debe a Sobrecalentamiento del equipo.");
    if (texto === "2") agregarMensaje("tal vez su memoria RAM esta mal conectada.");
    if (texto === "3") agregarMensaje("podria deberse a disco duro saturado.");

    agregarMensaje(`¿Quieres ir al menú principal?

1. Eso es todo
2. Realizar otra consulta`);

    estadoChat = "final";
    return;
  }

  // cierre final
  if (estadoChat === "final") {
    if (texto === "1") {
      agregarMensaje("¡Gracias por usar Edu Labs! ✅");

      setTimeout(() => {
        limpiarChat();
      }, 10000);
    }

    if (texto === "2") {
      limpiarChat();
      mostrarMenuPrincipal();
      estadoChat = "menu";
    }
  }
});


// ===============================
// CARGA INICIAL
// ===============================

// Cuando carga página:
// muestra tickets guardados y chat guardado
mostrarTickets();
mostrarMensajes();
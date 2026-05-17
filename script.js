const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycbwt4kKp5Rtp_YFRP1HzSI3_I9C895TfvD9Fqs8QYLqaDoN6ax2ruc7LYzfbHKyYO6c0/exec";

const preguntas = [
  {
    texto: "¿Qué debe hacer una persona antes de ingresar a una zona restringida?",
    opciones: [
      { texto: "Entrar rápidamente si no ve peligro", correcta: false },
      { texto: "Solicitar autorización y respetar instrucciones", correcta: true },
      { texto: "Ingresar solo si conoce el lugar", correcta: false }
    ]
  },
  {
    texto: "¿Cuál de estos elementos puede ser parte del equipo de protección personal?",
    opciones: [
      { texto: "Casco, calzado de seguridad y lentes", correcta: true },
      { texto: "Teléfono celular y reloj", correcta: false },
      { texto: "Mochila y audífonos", correcta: false }
    ]
  },
  {
    texto: "En caso de accidente se debe:",
    opciones: [
      { texto: "Retirarse del lugar sin avisar", correcta: false },
      { texto: "Informar inmediatamente al encargado o jefe directo", correcta: true },
      { texto: "Continuar trabajando normalmente", correcta: false }
    ]
  },
  {
    texto: "¿Por dónde se debe transitar dentro de una instalación?",
    opciones: [
      { texto: "Por cualquier lugar disponible", correcta: false },
      { texto: "Por zonas autorizadas y señalizadas", correcta: true },
      { texto: "Por accesos de emergencia", correcta: false }
    ]
  },
  {
    texto: "¿Qué actitud ayuda a prevenir accidentes?",
    opciones: [
      { texto: "Mantener atención, orden y respeto por las normas", correcta: true },
      { texto: "Apurarse para terminar antes", correcta: false },
      { texto: "Ignorar señalizaciones conocidas", correcta: false }
    ]
  }
];

const contenedorPreguntas = document.getElementById("contenedorPreguntas");
const form = document.getElementById("formInduccion");
const resultado = document.getElementById("resultado");

function cargarPreguntas() {
  preguntas.forEach((pregunta, index) => {
    const div = document.createElement("div");
    div.classList.add("pregunta");

    let html = `<p>${index + 1}. ${pregunta.texto}</p>`;

    pregunta.opciones.forEach((opcion, opcionIndex) => {
      html += `
        <label class="opcion">
          <input 
            type="radio" 
            name="pregunta${index}" 
            value="${opcion.correcta ? 1 : 0}" 
            required
          />
          ${opcion.texto}
        </label>
      `;
    });

    div.innerHTML = html;
    contenedorPreguntas.appendChild(div);
  });
}

function obtenerFechaHora() {
  const ahora = new Date();

  return {
    fecha: ahora.toLocaleDateString("es-CL"),
    hora: ahora.toLocaleTimeString("es-CL")
  };
}

async function enviarAGoogleSheets(datos) {
  await fetch(URL_GOOGLE_SCRIPT, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(datos)
  });
}

form.addEventListener("submit", async function(event) {
  event.preventDefault();

  let buenas = 0;
  const total = preguntas.length;

  preguntas.forEach((_, index) => {
    const respuesta = document.querySelector(`input[name="pregunta${index}"]:checked`);

    if (respuesta && respuesta.value === "1") {
      buenas++;
    }
  });

  const malas = total - buenas;
  const porcentaje = Math.round((buenas / total) * 100);
  const aprobado = porcentaje >= 80;

  const fechaHora = obtenerFechaHora();

  const datos = {
    fecha: fechaHora.fecha,
    hora: fechaHora.hora,
    nombre: document.getElementById("nombre").value,
    rut: document.getElementById("rut").value,
    correo: document.getElementById("correo").value,
    empresa: document.getElementById("empresa").value,
    cargo: document.getElementById("cargo").value,
    buenas: buenas,
    malas: malas,
    porcentaje: porcentaje + "%",
    estado: aprobado ? "Aprobado" : "Reprobado"
  };

  resultado.style.display = "block";
  resultado.className = aprobado ? "aprobado" : "reprobado";

  resultado.innerHTML = aprobado
    ? `${datos.nombre}, aprobaste con ${porcentaje}%.`
    : `${datos.nombre}, obtuviste ${porcentaje}%. Debes repasar el contenido.`;

  try {
    await enviarAGoogleSheets(datos);
  } catch (error) {
    console.error("Error al enviar datos:", error);
  }

  resultado.scrollIntoView({ behavior: "smooth" });
});

cargarPreguntas();
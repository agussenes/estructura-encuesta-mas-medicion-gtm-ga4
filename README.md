# Encuesta Web por Pasos con Medición GA4 y Envío a Servidor

Este proyecto es una encuesta web multi-step optimizada con las mejores prácticas de UX, medición avanzada y almacenamiento de datos.

## 🧩 Estructura General

- `index.html`: Encuesta principal por pasos.
- `script.js`: Lógica de validación, navegación, tracking y envío.
- `enviar.php`: API backend que recibe y procesa los datos.
- `gracias.html`: Página de agradecimiento post-envío.
- `error.html`: Página alternativa para manejo de errores.
- `GTM-M8BHFJW3_workspace2.json`: Workspace de GTM exportado listo para importar.

---

## 🚀 Tecnologías Usadas

- **HTML5 / JavaScript / PHP**
- **Bootstrap 5.3.3**: Estilado responsive y moderno.
- **SweetAlert2**: Alertas amigables y accesibles.
- **Google Analytics 4 + Measurement Protocol**
- **Google Tag Manager**: Para eventos de tracking sin hardcodear.

---

## ✅ Flujo de Encuesta

### 1. Inicio

Al presionar el botón "Comenzar":
- Se muestra el formulario paso a paso.
- Se guarda el flag `comenzo_encuesta = true` en `localStorage`.

### 2. Validación Paso a Paso

Cada paso (género, edad, provincia, imagen de China, email) se valida localmente:
- Edad entre 18 y 99.
- Email opcional con validación regex.
- Botón siguiente se habilita solo si el input es válido.

### 3. Seguimiento del Progreso

El último paso activo se guarda continuamente cada segundo en `localStorage` bajo la clave `ultimo_step`, para medir en qué punto se abandona la encuesta.

---

## 📡 Tracking: Google Analytics 4 + GTM

### 🔄 Eventos Enviados

1. `formulario_completado_api`
   - Cuando se envía exitosamente la encuesta.
   - Enviado vía `navigator.sendBeacon` al endpoint de GA4.
2. `abandono_inmediato_api`
   - Cuando se abandona la encuesta sin finalizar (cerrar pestaña, cambiar de ventana, recargar).
   - Se detecta con `beforeunload`, `pagehide` y `visibilitychange`.
   - Se envía automáticamente el último paso completado.

### 🔍 Datos Usados

- **`client_id` de GA4**: Obtenido dinámicamente usando `gtag('get', 'client_id', callback)`.
- Se guarda localmente para incluirlo en los eventos enviados vía API.

---

## 🎯 Envío de Respuestas

### Script: `enviar.php`

- Recibe los datos en JSON via `POST`.
- Guarda o reenvía la data (se puede conectar a Google Sheets o base de datos).
- Responde con `JSON` para indicar éxito o error.

### Seguridad

- Valida estructura JSON.
- Controla posibles errores de red o contenido vacío.
- Puede incluir validaciones del lado del servidor opcionalmente.

---

## 📦 Buenas Prácticas Aplicadas

- Uso de `navigator.sendBeacon()` para asegurar que los eventos de abandono se envíen incluso si el usuario cierra rápido.
- Almacenamiento persistente en `localStorage` para reintentos de envío y recuperación del paso activo.
- Validaciones UX-friendly con SweetAlert2.
- Compatible con todos los navegadores modernos.
- Código modular y comentarios explicativos.
- Manejo de fallos silenciosos si `client_id` no está disponible.

---

## 📊 Requisitos para Medición

- Una propiedad de **Google Analytics 4** activa.
- Crear un **API Secret** desde GA4 > Admin > Data Streams > Measurement Protocol.
- Cargar el contenedor `GTM-M8BHFJW3_workspace2.json` en tu cuenta de **Google Tag Manager**.
- Vincular el Measurement ID `G-3D07VCWRXT` en GA4.

---

## 🧪 Testeo y Debug

- Abrir DevTools (`F12`) para ver logs:
  - ✅ client_id seteado
  - 📤 Evento abandono enviado
  - ⛔ No se envió evento abandono (si no se cumple alguna condición)
- Debug activado con `debug_mode: true` en `gtag('config')`.

---

## ✨ Personalización

Podés modificar fácilmente:
- Opciones de provincias.
- Preguntas y pasos.
- Estilo con Bootstrap.
- Lógica del envío (`enviar.php`).

---

## 🔐 Consideraciones

- No se envían datos sensibles.
- Se puede integrar autenticación CAPTCHA si se requiere.
- El evento de abandono se envía **una sola vez por sesión**.

---

## 👨‍💻 Autor / Creditos

Desarrollado con enfoque en usabilidad, medición profesional y envío robusto de datos para toma de decisiones basadas en datos.

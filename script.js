window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

gtag('js', new Date());
gtag('config', 'G-3D07VCWRXT', {
    debug_mode: true
});

gtag('get', 'G-3D07VCWRXT', 'client_id', (clientId) => {
    if (clientId) {
        localStorage.setItem('ga_client_id', clientId);
        console.log("✅ client_id seteado:", clientId);
    } else {
        console.warn("⚠️ client_id no disponible aún.");
    }
});


document.addEventListener('DOMContentLoaded', () => {
    window.comenzoEncuesta = localStorage.getItem("comenzo_encuesta") === "true";
    window.formularioEnviado = localStorage.getItem("formulario_enviado") === "true";


    // const gaCookie = document.cookie.split('; ').find(row => row.startsWith('_ga='));
    // if (gaCookie) {
    //     const parts = gaCookie.split('.');
    //     const clientId = parts.slice(-2).join('.');
    //     localStorage.setItem('ga_client_id', clientId);
    // }

    const steps = document.querySelectorAll(".step");
    let currentStep = 0;
    const form = document.getElementById("chinaForm");

    // Mostrar el paso
    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.toggle("active", i === index);
            if (i === index) {
                const paso = steps[index].id;
                window.ultimoPaso = paso;
                localStorage.setItem("ultimo_step", paso);
            }
        });

        const nextButton = steps[index].querySelector(".nextBtn");
        if (nextButton) nextButton.disabled = true;
    }

    // Validar cada paso
    function validateStep() {
        const current = steps[currentStep];
        const radios = current.querySelectorAll('input[type="radio"]');
        const inputs = current.querySelectorAll('input[type="number"], input[type="email"], select');

        if (radios.length) return Array.from(radios).some(r => r.checked);

        for (let input of inputs) {
            if (input.required && input.value.trim() === '') return false;
            if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                Swal.fire('Email inválido', 'Ingresá un correo válido o dejá el campo vacío.', 'warning');
                return false;
            }
            if (input.name === 'edad' && (input.value < 18 || input.value > 99)) {
                Swal.fire('Edad inválida', 'Debés tener entre 18 y 99 años.', 'warning');
                return false;
            }
        }
        return true;
    }

    // Clicks: Siguiente, Anterior, Submit
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("nextBtn")) {
            if (!validateStep()) {
                Swal.fire('Faltan datos', 'Completá este paso antes de continuar.', 'warning');
                return;
            }
            const pasoActual = e.target.closest(".step");
            if (pasoActual?.id) {
                window.ultimoPaso = pasoActual.id;
                localStorage.setItem("ultimo_step", pasoActual.id);
            }
            currentStep++;
            showStep(currentStep);
        }

        if (e.target.classList.contains("prevBtn")) {
            currentStep--;
            showStep(currentStep);
        }


    });

    // Evento 'Comenzar'
    document.getElementById("botonComienzo").addEventListener("click", () => {
        document.querySelector('.contenedorBienvenida').style.display = 'none';
        document.querySelector('.contenedorForm').style.display = 'block';
        window.comenzoEncuesta = true;
        localStorage.setItem("comenzo_encuesta", "true");
        showStep(currentStep);
    });

    // Enviar formulario a PHP
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const submitBtn = form.querySelector('#submitBtn');
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Enviando...";

        const jsonData = {};
        formData.forEach((value, key) => jsonData[key] = value);

        const clientId = localStorage.getItem("ga_client_id");
        if (clientId) jsonData.client_id = clientId;

        fetch("enviar.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonData)
        })
            .then(res => res.json())
            .then(data => {
                window.formularioEnviado = true;
                localStorage.setItem("formulario_enviado", "true");

                if (clientId) {
                    const measurementId = 'G-3D07VCWRXT';
                    const apiSecret = 'LHIL9fY3Svuhvw8JfCktnQ';

                    navigator.sendBeacon(
                        `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
                        JSON.stringify({
                            client_id: clientId,
                            events: [{
                                name: "formulario_completado_api",
                                params: { completado: true }
                            }]
                        })
                    );
                }

                Swal.fire({
                    icon: 'success',
                    title: '¡Gracias por participar!',
                    text: 'Tu respuesta fue registrada exitosamente.',
                    confirmButtonText: 'Aceptar'
                }).then(() => window.location.href = "gracias.html");
            })
            .catch(err => {
                console.error("Error al enviar:", err);
                Swal.fire("Error", "Hubo un problema al enviar el formulario.", "error");
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
    });

    let eventoEnviado = false;

    function enviarEventoAbandono() {
        const paso = window.ultimoPaso || localStorage.getItem("ultimo_step") || 'step_1';
        let clientId = localStorage.getItem('ga_client_id');
        const yaEnviado = localStorage.getItem("evento_enviado") === "true";

        // ✅ Función que hace el envío real
        const enviar = (id) => {
            const apiSecret = 'LHIL9fY3Svuhvw8JfCktnQ';
            const measurementId = 'G-3D07VCWRXT';

            navigator.sendBeacon(
                `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
                JSON.stringify({
                    client_id: id,
                    events: [{
                        name: 'abandono_inmediato_api',
                        params: { paso_actual: paso }
                    }]
                })
            );

            // GTM tracking
            window.dataLayer.push({
                event: 'abandono_encuesta',
                ultimo_step_alcanzado: paso
            });

            eventoEnviado = true;
            localStorage.setItem("evento_enviado", "true");
            console.log('📤 Evento abandono enviado en:', paso);
        };

        // ⚠️ Condiciones
        if (yaEnviado || window.formularioEnviado) {
            console.log("⛔ No se envió evento abandono - condiciones no cumplidas", {
                clientId,
                yaEnviado,
                formularioEnviado: window.formularioEnviado
            });
            return;
        }

        // 😵 Si no hay clientId, intentar último recurso
        if (!clientId) {
            console.warn("⚠️ client_id no disponible. Reintentando vía gtag...");

            gtag('get', 'G-3D07VCWRXT', 'client_id', (id) => {
                if (id) {
                    localStorage.setItem('ga_client_id', id);
                    console.log("✅ client_id recuperado con gtag:", id);
                    enviar(id); // ahora sí
                } else {
                    console.error("❌ No se pudo obtener client_id. Evento abandono no enviado.");
                }
            });

            return; // salimos, esperar callback
        }

        // ✅ clientId válido, enviar directo
        enviar(clientId);
    }



    function actualizarUltimoPaso() {
        const visibleStep = Array.from(document.querySelectorAll('.step')).find(p => p.classList.contains('active'));
        if (visibleStep) {
            window.ultimoPaso = visibleStep.id;
            localStorage.setItem("ultimo_step", visibleStep.id);
        }
    }

    window.addEventListener("pagehide", () => {
        const comenzo = localStorage.getItem("comenzo_encuesta") === "true";
        const enviado = localStorage.getItem("evento_enviado") === "true";
        const formulario = localStorage.getItem("formulario_enviado") === "true";

        console.log('🧪 Chequeo abandono => comenzoEncuesta:', comenzo, '| enviado:', enviado, '| formularioEnviado:', formulario);

        if (comenzo && !formulario && !enviado) {
            actualizarUltimoPaso();
            enviarEventoAbandono();
        }
    });




    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            const comenzo = localStorage.getItem("comenzo_encuesta") === "true";
            const enviado = localStorage.getItem("evento_enviado") === "true";
            const formulario = localStorage.getItem("formulario_enviado") === "true";

            console.log('🧪 Chequeo abandono => comenzoEncuesta:', comenzo, '| enviado:', enviado, '| formularioEnviado:', formulario);


            if (comenzo && !formulario && !enviado) {
                actualizarUltimoPaso();
                enviarEventoAbandono();
            }

        }
    });

    window.addEventListener("beforeunload", () => {
        const comenzo = localStorage.getItem("comenzo_encuesta") === "true";
        const enviado = localStorage.getItem("evento_enviado") === "true";
        const formulario = localStorage.getItem("formulario_enviado") === "true";


        if (comenzo && !formulario && !enviado) {
            actualizarUltimoPaso();
            enviarEventoAbandono();
        }
    });





    // 🔁 Refresca constantemente el último paso visible cada segundo
    setInterval(() => {
        const pasoVisible = Array.from(document.querySelectorAll('.step')).find(p => p.classList.contains('active'));
        if (pasoVisible) {
            const pasoId = pasoVisible.id;
            if (window.ultimoPaso !== pasoId) {
                window.ultimoPaso = pasoId;
                localStorage.setItem("ultimo_step", pasoId);
            }
        }
    }, 1000);


    // Activar botones cuando inputs estén listos
    steps.forEach((step) => {
        const radios = step.querySelectorAll('input[type="radio"]');
        const numberInput = step.querySelector('input[type="number"]');
        const select = step.querySelector('select');
        const allInputs = step.querySelectorAll('input, select, textarea');

        allInputs.forEach(input => {
            input.addEventListener('input', () => {
                window.ultimoPaso = step.id;
                localStorage.setItem("ultimo_step", step.id);
            });
            input.addEventListener('change', () => {
                window.ultimoPaso = step.id;
                localStorage.setItem("ultimo_step", step.id);
            });
        });

        if (radios.length) {
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    step.querySelector('.nextBtn').disabled = false;
                });
            });
        }

        if (numberInput) {
            numberInput.addEventListener('input', () => {
                const edad = parseInt(numberInput.value, 10);
                step.querySelector('.nextBtn').disabled = !(edad >= 18 && edad <= 99);
            });
        }

        if (select) {
            select.addEventListener('change', () => {
                step.querySelector('.nextBtn').disabled = select.value === '';
            });
        }
    });

    // Inicial
    showStep(currentStep);
    document.querySelectorAll('.nextBtn').forEach(btn => btn.disabled = true);
});
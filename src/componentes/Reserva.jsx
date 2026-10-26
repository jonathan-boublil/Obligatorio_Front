import { useState, useEffect } from "react";

const ChevronLeftIcon = () => {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
};

const ChevronRightIcon = () => {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
};

const CheckCircleIcon = () => {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
};

const services = [
    "Veterinaria clínica",
    "Baño",
    "Corte de pelo y estilismo",
];

const schedules = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30",
];

const petTypes = ["Perro", "Gato", "Sapo", "Tortuga"];

const totalPasos = 3;

const reservaVacia = {
    servicio: "",
    fecha: "",
    horario: "",
    nombre: "",
    mascota: "",
    tipoMascota: "",
    telefono: "",
    email: "",
};

// campos que tienen que estar completos para pasar de cada paso
const camposPorPaso = {
    1: ["servicio"],
    2: ["fecha", "horario"],
    3: ["nombre", "mascota", "tipoMascota", "telefono", "email"],
};

// Fecha LOCAL YYYY-MM-DD (sin UTC)
const formatearFecha = (fecha) => {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
};

const esDomingo = (fechaTexto) => {
    const fecha = new Date(`${fechaTexto}T00:00:00`);
    return fecha.getDay() === 0;
};

// Próximos 15 días desde mañana, sin domingos
const obtenerFechasDisponibles = () => {
    const fechas = [];
    const hoy = new Date();
    let offset = 1;

    while (fechas.length < 15 && offset < 90) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() + offset);
        const fechaTexto = formatearFecha(fecha);
        if (!esDomingo(fechaTexto)) fechas.push(fechaTexto);
        offset++;
    }
    return fechas;
};

const Reserva = () => {
    const [pasoActual, setPasoActual] = useState(1);
    const [valores, setValores] = useState(reservaVacia);
    const [errorFecha, setErrorFecha] = useState("");
    const [confirmada, setConfirmada] = useState(false);

    const fechasDisponibles = obtenerFechasDisponibles();
    const fechaMinima = fechasDisponibles[0];
    const fechaMaxima = fechasDisponibles[fechasDisponibles.length - 1];

    //a los 3 segundos de confirmar vuelve al paso 1 con el formulario vacío
    useEffect(() => {
        if (!confirmada) return;

        const timer = setTimeout(() => {
            setConfirmada(false);
            setValores(reservaVacia);
            setPasoActual(1);
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [confirmada]);

    const cambiarValor = (name, value) => {
        const auxValores = { ...valores };
        auxValores[name] = value;
        setValores(auxValores);
    };

    const handleChange = (e) => {
        cambiarValor(e.target.name, e.target.value);
    };

    const fechaHandler = (e) => {
        const fecha = e.target.value;

        if (fecha && esDomingo(fecha)) {
            setErrorFecha("Los domingos está cerrado. Elija otro día.");
            cambiarValor("fecha", "");
            return;
        }
        if (fecha && (fecha < fechaMinima || fecha > fechaMaxima)) {
            setErrorFecha("La fecha está fuera del rango permitido.");
            cambiarValor("fecha", "");
            return;
        }
        setErrorFecha("");
        cambiarValor("fecha", fecha);
    };

    //hasta que no estén completos los campos del paso no se puede avanzar
    const pasoCompleto = camposPorPaso[pasoActual].every(
        (campo) => valores[campo].trim() !== ""
    );

    const anteriorHandler = () => {
        setPasoActual(pasoActual - 1);
    };

    const siguienteHandler = () => {
        setPasoActual(pasoActual + 1);
    };

    const confirmarHandler = () => {
        const reserva = { ...valores };

        //cuando esté el back acá se llama a la api con el token del usuario logueado
        //const reservaCreada = await crearReservaApi(reserva);
        console.log("Reserva a enviar:", reserva);

        setConfirmada(true);
    };

    return (
        <section id="reservas" className="booking-section">
            <div className="container">
                <div className="section-heading">
                    <h2>Reserva una cita</h2>

                    <p>
                        Paso {pasoActual} de {totalPasos}
                    </p>
                </div>

                {confirmada ? (
                    <div className="booking-success" role="status" aria-live="polite">
                        <CheckCircleIcon />
                        <h3>¡Reserva confirmada!</h3>
                        <p>
                            ¡Gracias, {valores.nombre}! Tu cita para {valores.mascota} ha sido
                            confirmada.
                        </p>
                        <p className="booking-success-sub">
                            Enviaremos un correo electrónico de confirmación a {valores.email}
                        </p>
                    </div>
                ) : (
                    <form className="booking-card" onSubmit={(e) => e.preventDefault()}>
                        {/* Paso 1: servicio */}
                        {pasoActual === 1 && (
                            <div className="booking-field">
                                <p className="booking-step-title">Seleccione un servicio</p>

                                <div className="booking-options">
                                    {services.map((service) => (
                                        <button
                                            className={`booking-option ${valores.servicio === service ? "selected" : ""}`}
                                            type="button"
                                            key={service}
                                            onClick={() => cambiarValor("servicio", service)}
                                        >
                                            {service}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Paso 2: fecha y horario */}
                        {pasoActual === 2 && (
                            <>
                                <div className="booking-field">
                                    <label className="booking-step-title" htmlFor="bookingDate">
                                        Seleccione una fecha
                                    </label>
                                    <input
                                        id="bookingDate"
                                        className={`form-control booking-input ${errorFecha ? "booking-input-error" : ""}`}
                                        type="date"
                                        min={fechaMinima}
                                        max={fechaMaxima}
                                        value={valores.fecha}
                                        onChange={fechaHandler}
                                    />
                                    {errorFecha && <p className="booking-error">{errorFecha}</p>}
                                </div>

                                <div className="booking-field">
                                    <p className="booking-step-title">Seleccione un horario</p>

                                    <div className="booking-times">
                                        {schedules.map((schedule) => (
                                            <button
                                                className={`booking-time ${valores.horario === schedule ? "selected" : ""}`}
                                                type="button"
                                                key={schedule}
                                                onClick={() => cambiarValor("horario", schedule)}
                                            >
                                                {schedule}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Paso 3: datos */}
                        {pasoActual === 3 && (
                            <>
                                <div className="booking-field">
                                    <label className="booking-label" htmlFor="bookingOwner">
                                        Nombre
                                    </label>
                                    <input
                                        id="bookingOwner"
                                        className="form-control booking-input"
                                        type="text"
                                        name="nombre"
                                        placeholder="Su nombre completo"
                                        value={valores.nombre}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="booking-field">
                                    <label className="booking-label" htmlFor="bookingPet">
                                        Nombre de la mascota
                                    </label>
                                    <input
                                        id="bookingPet"
                                        className="form-control booking-input"
                                        type="text"
                                        name="mascota"
                                        placeholder="El nombre de su mascota"
                                        value={valores.mascota}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="booking-field">
                                    <label className="booking-label" htmlFor="bookingPetType">
                                        Tipo de mascota
                                    </label>
                                    <select
                                        id="bookingPetType"
                                        className="form-select booking-input"
                                        name="tipoMascota"
                                        value={valores.tipoMascota}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione tipo</option>
                                        {petTypes.map((petType) => (
                                            <option key={petType}>{petType}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="booking-field">
                                    <label className="booking-label" htmlFor="bookingPhone">
                                        Teléfono
                                    </label>
                                    <input
                                        id="bookingPhone"
                                        className="form-control booking-input"
                                        type="tel"
                                        name="telefono"
                                        placeholder="093111222"
                                        value={valores.telefono}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="booking-field">
                                    <label className="booking-label" htmlFor="bookingEmail">
                                        Email
                                    </label>
                                    <input
                                        id="bookingEmail"
                                        className="form-control booking-input"
                                        type="email"
                                        name="email"
                                        placeholder="tu@email.com"
                                        value={valores.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}

                        <div className="booking-actions">
                            <button
                                className="booking-button booking-button-outline"
                                type="button"
                                disabled={pasoActual === 1}
                                onClick={anteriorHandler}
                            >
                                <ChevronLeftIcon />
                                Anterior
                            </button>

                            {pasoActual < totalPasos ? (
                                <button
                                    className="booking-button booking-button-primary"
                                    type="button"
                                    disabled={!pasoCompleto}
                                    onClick={siguienteHandler}
                                >
                                    Siguiente
                                    <ChevronRightIcon />
                                </button>
                            ) : (
                                <button
                                    className="booking-button booking-button-primary"
                                    type="button"
                                    disabled={!pasoCompleto}
                                    onClick={confirmarHandler}
                                >
                                    Confirmar reserva
                                </button>
                            )}
                        </div>

                        {/* Resumen de lo elegido */}
                        {valores.servicio && (
                            <div className="booking-summary">
                                <p><strong>Servicio:</strong> {valores.servicio}</p>
                                {valores.fecha && <p><strong>Fecha:</strong> {valores.fecha}</p>}
                                {valores.horario && <p><strong>Horario:</strong> {valores.horario}</p>}
                            </div>
                        )}
                    </form>
                )}
            </div>
        </section>
    );
};

export default Reserva;

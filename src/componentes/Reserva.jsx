import { useState, useEffect } from "react";
import { obtenerMensajeError } from "../services/mensajeError";
import { listarCategoriasApi, crearReservaApi } from "../services/reservaServices";
import { horarios, fechaParaBack, obtenerFechasDisponibles, validarFecha } from "../services/fechasReserva";
import SubirImagen from "./SubirImagen";

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

const petTypes = ["Perro", "Gato", "Sapo", "Tortuga"];

const totalPasos = 3;

// mismos nombres de campos que espera el back en POST /reservas
const reservaVacia = {
    categoriaId: "",
    fecha: "",
    hora: "",
    nombreMascota: "",
    mascota: "",
    edadMascota: "",
    motivo: "",
    imageUrl: "",
    imagePublicId: "",
};

// campos que tienen que estar completos para pasar de cada paso
const camposPorPaso = {
    1: ["categoriaId"],
    2: ["fecha", "hora"],
    3: ["nombreMascota", "mascota", "edadMascota", "motivo"],
};

// se dibuja la reserva por primera vez
const Reserva = ({ usuario, onReservaCreada }) => {
    const [pasoActual, setPasoActual] = useState(1);
    const [valores, setValores] = useState(reservaVacia);
    const [categorias, setCategorias] = useState([]);
    const [mensajeError, setMensajeError] = useState("");
    const [errorFecha, setErrorFecha] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [confirmada, setConfirmada] = useState(false);
    const [resetImagen, setResetImagen] = useState(0);

    const fechasDisponibles = obtenerFechasDisponibles();
    const fechaMinima = fechasDisponibles[0];
    const fechaMaxima = fechasDisponibles[fechasDisponibles.length - 1];

    //se cargan los servicios desde el back al mostrar el formulario
    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const resultado = await listarCategoriasApi();
                setCategorias(resultado);
            } catch (error) {
                console.error(error);
                setMensajeError(obtenerMensajeError(error, "No se pudieron cargar los servicios."));
            }
        };
        cargarCategorias();
    }, []);

    //a los 5 segundos de confirmar vuelve al paso 1 con el formulario vacío
    useEffect(() => {
        if (!confirmada) return;

        const limpiarFormulario = () => {
            setConfirmada(false);
            setValores({ ...reservaVacia });
            setPasoActual(1);
            setMensajeError("");
            setErrorFecha("");
            setResetImagen((valorActual) => valorActual + 1);
        };

        const timer = setTimeout(limpiarFormulario, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [confirmada]);

    const cambiarValor = (name, value) => {
        setValores((valoresActuales) => ({
                ...valoresActuales,
                [name]: value,
        }));
    };

    const handleImageUrl = (imageUrl) => {
        cambiarValor("imageUrl", imageUrl);
    };

    const handleImagePublicId = (imagePublicId) => {
        cambiarValor("imagePublicId", imagePublicId);
    };

    const handleChange = (e) => {
        cambiarValor(e.target.name, e.target.value);
    };

    const fechaHandler = (e) => {
        const fecha = e.target.value;
        const error = validarFecha(fecha, fechaMinima, fechaMaxima);

        setErrorFecha(error);
        cambiarValor("fecha", error ? "" : fecha);
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

    const confirmarHandler = async () => {
        const reserva = {
            ...valores,
            fecha: fechaParaBack(valores.fecha),
            nombreMascota: valores.nombreMascota.trim(),
            edadMascota: Number(valores.edadMascota),
            motivo: valores.motivo.trim(),
        };

        setMensajeError("");
        setEnviando(true);
        try {
            //el token del usuario logueado lo agrega el interceptor de axios
            await crearReservaApi(reserva);
            setConfirmada(true);
            //avisa para que "Mis reservas" vuelva a cargar la lista
            onReservaCreada?.();
        } catch (error) {
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudo crear la reserva."));
        } finally {
            setEnviando(false);
        }
    };

    const categoriaElegida = categorias.find(
        (categoria) => categoria.id === valores.categoriaId
    );

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
                            ¡Gracias, {usuario?.name}! Tu cita para {valores.nombreMascota} ha sido
                            confirmada.
                        </p>
                        <p className="booking-success-sub">
                            Enviaremos un correo electrónico de confirmación a {usuario?.email}
                        </p>
                    </div>
                ) : (
                    <form className="booking-card" onSubmit={(e) => e.preventDefault()}>
                        {mensajeError && (
                            <div className="alert alert-danger" role="alert">
                                {mensajeError}
                            </div>
                        )}

                        {/* Paso 1: servicio */}
                        {pasoActual === 1 && (
                            <div className="booking-field">
                                <p className="booking-step-title">Seleccione la categoria</p>

                                {/* los servicios son las categorías que creó el admin en el back */}
                                {categorias.length === 0 ? (
                                    <p>No hay servicios disponibles por el momento.</p>
                                ) : (
                                    <div className="booking-options">
                                        {categorias.map((categoria) => (
                                            <button
                                                className={`booking-option text-capitalize ${valores.categoriaId === categoria.id ? "selected" : ""}`}
                                                type="button"
                                                key={categoria.id}
                                                title={categoria.descripcion}
                                                onClick={() => cambiarValor("categoriaId", categoria.id)}
                                            >
                                                {categoria.nombre}
                                            </button>
                                        ))}
                                    </div>
                                )}
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
                                        {horarios.map((horario) => (
                                            <button
                                                className={`booking-time ${valores.hora === horario ? "selected" : ""}`}
                                                type="button"
                                                key={horario}
                                                onClick={() => cambiarValor("hora", horario)}
                                            >
                                                {horario}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Paso 3: datos */}
                        {pasoActual === 3 && (
                            <>
                                {/* el back toma el cliente del token, se muestra solo para que sepa con qué cuenta reserva */}
                                <div className="booking-field">
                                    <label className="booking-label" htmlFor="bookingUser">
                                        Usuario
                                    </label>
                                    <input
                                        id="bookingUser"
                                        className="form-control booking-input"
                                        type="text"
                                        value={usuario?.username ?? ""}
                                        readOnly
                                        disabled
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
                                        name="nombreMascota"
                                        placeholder="El nombre de su mascota"
                                        maxLength="50"
                                        value={valores.nombreMascota}
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
                                        name="mascota"
                                        value={valores.mascota}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione tipo</option>
                                        {petTypes.map((petType) => (
                                            <option key={petType}>{petType}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="booking-field">
                                    <label className="booking-label" htmlFor="bookingPetAge">
                                        Edad de la mascota (años)
                                    </label>
                                    <input
                                        id="bookingPetAge"
                                        className="form-control booking-input"
                                        type="number"
                                        name="edadMascota"
                                        min="0"
                                        max="100"
                                        step="1"
                                        placeholder="3"
                                        value={valores.edadMascota}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="booking-field">
                                    <label className="booking-label" htmlFor="bookingReason">
                                        Motivo de la consulta
                                    </label>
                                    <textarea
                                        id="bookingReason"
                                        className="form-control booking-input"
                                        name="motivo"
                                        rows="3"
                                        maxLength="200"
                                        placeholder="Contanos brevemente el motivo"
                                        value={valores.motivo}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}

                        <div className={pasoActual === 3 ? "" : "d-none"}>
                            <SubirImagen
                                key={resetImagen}
                                handleImgURL={handleImageUrl}
                                handleImgPublicId={handleImagePublicId}
                            />
                        </div>

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
                                    disabled={!pasoCompleto || enviando}
                                    onClick={confirmarHandler}
                                >
                                    {enviando ? "Enviando..." : "Confirmar reserva"}
                                </button>
                            )}
                        </div>

                        {/* Resumen de lo elegido */}
                        {categoriaElegida && (
                            <div className="booking-summary">
                                <p><strong>Servicio:</strong> <span className="text-capitalize">{categoriaElegida.nombre}</span></p>
                                {valores.fecha && <p><strong>Fecha:</strong> {fechaParaBack(valores.fecha)}</p>}
                                {valores.hora && <p><strong>Horario:</strong> {valores.hora}</p>}
                            </div>
                        )}
                    </form>
                )}
            </div>
        </section>
    );
};

export default Reserva;

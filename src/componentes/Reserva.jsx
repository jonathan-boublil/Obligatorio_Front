import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { cargaInicialCategoriasSlice } from "../redux/features/categoriasSlice";
import { cargarReservasInicialesSlice, agregarReservaSlice } from "../redux/features/reservasSlice";
import { obtenerMensajeError } from "../services/mensajeError";
import { listarCategoriasApi, crearReservaApi, horariosOcupadosApi } from "../services/reservaServices";
import { listarReservasApi } from "../services/userServices";
import { horarios, fechaParaBack, fechaDelBack, obtenerFechasDisponibles, validarFecha, estaOcupado } from "../services/fechasReserva";
import { validarEdadMascota } from "../services/validacionesReserva";
import SubirImagen from "./SubirImagen";

// mismo límite que el back (reserva.service): los clientes que no son premium tienen un tope por año calendario
const LIMITE_RESERVAS_ANUALES_PLUS = 4;
const MENSAJE_LIMITE = "Alcanzó el límite anual de reservas de su plan. Mejore su plan para obtener más beneficios.";

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
// las categorías y las reservas del usuario vienen de Redux (acá se cargan al mostrar el formulario)
const Reserva = ({ usuario }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const categorias = useSelector((state) => state.categoriasSlice);
    const reservas = useSelector((state) => state.reservaSlice.lista);

    const [pasoActual, setPasoActual] = useState(1);
    const [valores, setValores] = useState(reservaVacia);
    const [mensajeError, setMensajeError] = useState("");
    const [errorFecha, setErrorFecha] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [confirmada, setConfirmada] = useState(false);
    const [resetImagen, setResetImagen] = useState(0);
    // horas ocupadas del día elegido; se guarda la fecha para no mostrar las de otro día mientras carga
    const [ocupados, setOcupados] = useState({ fecha: "", horas: [] });

    const fechasDisponibles = obtenerFechasDisponibles();
    const fechaMinima = fechasDisponibles[0];
    const fechaMaxima = fechasDisponibles[fechasDisponibles.length - 1];

    //se cargan los servicios desde el back al mostrar el formulario y se guardan en Redux
    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const resultado = await listarCategoriasApi();
                dispatch(cargaInicialCategoriasSlice(resultado));
            } catch (error) {
                console.error(error);
                setMensajeError(obtenerMensajeError(error, "No se pudieron cargar los servicios."));
            }
        };
        cargarCategorias();
    }, [dispatch]);

    //se piden las reservas del usuario para saber cuántas tiene en cada año (límite del plan)
    useEffect(() => {
        const cargarReservas = async () => {
            try {
                const lista = await listarReservasApi();
                dispatch(cargarReservasInicialesSlice(lista));
            } catch (error) {
                //si falla no se bloquea el formulario: el back igual valida el límite al confirmar
                console.error(error);
            }
        };
        cargarReservas();
    }, [dispatch]);

    //cada vez que se elige un día se piden las horas ocupadas, así no se intenta reservar una que ya está tomada
    useEffect(() => {
        if (!valores.fecha) return;
        const controller = new AbortController();

        const cargarOcupados = async () => {
            try {
                const horas = await horariosOcupadosApi(fechaParaBack(valores.fecha), controller.signal);
                setOcupados({ fecha: valores.fecha, horas });
                //si el horario que ya estaba elegido quedó ocupado, se deselecciona
                setValores((valoresActuales) =>
                    valoresActuales.hora && estaOcupado(valoresActuales.hora, horas)
                        ? { ...valoresActuales, hora: "" }
                        : valoresActuales
                );
            } catch (error) {
                //si se canceló porque cambiaron la fecha, no es un error
                if (error.code === "ERR_CANCELED") return;
                //si falla no se bloquea nada: el back igual rechaza un horario ocupado al confirmar
                console.error(error);
            }
        };

        cargarOcupados();
        return () => {
            controller.abort();
        };
    }, [valores.fecha]);

    const horasOcupadas = ocupados.fecha === valores.fecha ? ocupados.horas : [];
    const sinHorariosLibres = valores.fecha !== "" &&
        horarios.every((horario) => estaOcupado(horario, horasOcupadas));

    const esPremium = usuario?.plan?.toLowerCase() === "premium";

    //el back cuenta las reservas del año calendario de la fecha pedida (anio en formato "AAAA")
    const limiteAlcanzado = (anio) => {
        if (esPremium) return false;
        const reservasDelAnio = reservas.filter(
            (reserva) => fechaDelBack(reserva.fecha).slice(0, 4) === anio
        );
        return reservasDelAnio.length >= LIMITE_RESERVAS_ANUALES_PLUS;
    };

    //si no queda cupo en ningún año de las fechas disponibles, no se deja empezar la reserva
    const aniosDisponibles = [...new Set(fechasDisponibles.map((fecha) => fecha.slice(0, 4)))];
    const sinCupo = aniosDisponibles.every(limiteAlcanzado);

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
        let error = validarFecha(fecha, fechaMinima, fechaMaxima);

        //las fechas disponibles pueden caer en otro año (fin de año), donde el cupo es otro
        if (!error && fecha && limiteAlcanzado(fecha.slice(0, 4))) {
            error = MENSAJE_LIMITE;
        }

        setErrorFecha(error);
        cambiarValor("fecha", error ? "" : fecha);
    };

    //el input number deja escribir negativos y decimales aunque tenga min y step, por eso se valida acá
    const errorEdad = validarEdadMascota(valores.edadMascota);

    //hasta que no estén completos (y válidos) los campos del paso no se puede avanzar
    const pasoCompleto = camposPorPaso[pasoActual].every(
        (campo) => valores[campo].trim() !== ""
    ) && (pasoActual !== 3 || errorEdad === "");

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
            const reservaCreada = await crearReservaApi(reserva);
            //se agrega a Redux con el nombre del servicio (el back devuelve solo el id de la categoría),
            //así cuenta para el límite del plan y aparece en "Mis reservas"
            dispatch(agregarReservaSlice({
                ...reservaCreada,
                categoriaId: { id: categoriaElegida.id, nombre: categoriaElegida.nombre },
            }));
            setConfirmada(true);
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
                ) : sinCupo ? (
                    <div className="booking-card">
                        <div className="alert alert-danger" role="alert">
                            {MENSAJE_LIMITE}
                        </div>

                        <button
                            className="btn btn-success"
                            type="button"
                            onClick={() => navigate("/mis-datos")}
                        >
                            Mejorar plan
                        </button>
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

                                    {/* los horarios ya reservados ese día aparecen tachados y no se pueden elegir */}
                                    <div className="booking-times">
                                        {horarios.map((horario) => {
                                            const ocupado = estaOcupado(horario, horasOcupadas);

                                            return (
                                                <button
                                                    className={`booking-time ${valores.hora === horario ? "selected" : ""}`}
                                                    type="button"
                                                    key={horario}
                                                    disabled={ocupado}
                                                    title={ocupado ? "Horario ocupado" : undefined}
                                                    onClick={() => cambiarValor("hora", horario)}
                                                >
                                                    {horario}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {sinHorariosLibres && (
                                        <p className="booking-error">
                                            No quedan horarios disponibles para ese día. Elija otra fecha.
                                        </p>
                                    )}
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
                                        className={`form-control booking-input ${errorEdad ? "booking-input-error" : ""}`}
                                        type="number"
                                        name="edadMascota"
                                        min="0"
                                        max="100"
                                        step="1"
                                        placeholder="3"
                                        value={valores.edadMascota}
                                        onChange={handleChange}
                                    />
                                    {errorEdad && <p className="booking-error">{errorEdad}</p>}
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

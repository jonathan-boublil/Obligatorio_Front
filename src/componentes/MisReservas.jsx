import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { cargarReservasInicialesSlice, actualizarReservaSlice, borrarReservaSlice } from "../redux/features/reservasSlice";
import { cargaInicialCategoriasSlice } from "../redux/features/categoriasSlice";
import { obtenerMensajeError } from "../services/mensajeError";
import { listarReservasApi } from "../services/userServices";
import { reprogramarReservaApi, eliminarReservaApi, obtenerReservaApi, obtenerQrReservaApi, listarCategoriasApi, horariosOcupadosApi } from "../services/reservaServices";
import { deleteImage } from "../services/imageServices";
import { horarios, fechaParaBack, fechaDelBack, obtenerFechasDisponibles, validarFecha, estaOcupado, reservaYaPaso } from "../services/fechasReserva";
import { validarEdadMascota } from "../services/validacionesReserva";
import SubirImagen from "./SubirImagen";

// mismos tipos de mascota que en el formulario de Reserva
const tiposMascota = ["Perro", "Gato", "Sapo", "Tortuga"];

// campos que se editan en el detalle (el estado y el motivo profesional no se editan)
const edicionVacia = {
    categoriaId: "",
    fecha: "",
    hora: "",
    nombreMascota: "",
    mascota: "",
    edadMascota: "",
    motivo: "",
};

// la fecha viene en UTC desde el back, se muestra tal cual sin correrla por la zona horaria
const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-UY", { timeZone: "UTC" });
};

// en la tabla el motivo se corta para que no ocupe toda la fila (el texto completo se ve en el detalle)
const recortarTexto = (texto = "", maximo = 10) => {
    return texto.length > maximo ? `${texto.slice(0, maximo)}...` : texto;
};

// Reservas del usuario logueado, con detalle (donde se edita) y eliminación.
// La lista y las categorías vienen de Redux: al editar o eliminar se actualiza el store con lo que devuelve el back
const MisReservas = () => {
    const dispatch = useDispatch();
    const reservas = useSelector((state) => state.reservaSlice.lista);
    const categorias = useSelector((state) => state.categoriasSlice);

    // "lista" | "detalle" | "eliminar"
    const [vista, setVista] = useState("lista");
    const [filtroMascota, setFiltroMascota] = useState("");

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [mensajeError, setMensajeError] = useState("");

    // true mientras se edita la reserva que está en detalle, y los nuevos valores
    const [editando, setEditando] = useState(false);
    const [valoresEdicion, setValoresEdicion] = useState(edicionVacia);
    const [errorFecha, setErrorFecha] = useState("");
    // horas ocupadas del día elegido al editar (se guarda la fecha para no mostrar las de otro día mientras carga)
    const [ocupadosEdicion, setOcupadosEdicion] = useState({ fecha: "", horas: [] });
    // imagen nueva subida al editar ("" si no se cambió); van en estados separados porque
    // SubirImagen avisa la url y el public_id uno detrás del otro
    const [nuevaImageUrl, setNuevaImageUrl] = useState("");
    const [nuevaImagePublicId, setNuevaImagePublicId] = useState("");

    // reserva que se va a eliminar
    const [reservaElegida, setReservaElegida] = useState(null);

    // reserva que se está viendo en detalle (la trae el back con todos sus datos)
    const [reservaDetalle, setReservaDetalle] = useState(null);

    // url local de la imagen del QR de la reserva en detalle, y si no se pudo generar
    const [qrUrl, setQrUrl] = useState("");
    const [errorQr, setErrorQr] = useState(false);

    //la url del QR ocupa memoria del navegador: se libera cuando cambia o se destruye el componente
    useEffect(() => {
        if (!qrUrl) return;

        return () => {
            URL.revokeObjectURL(qrUrl);
        };
    }, [qrUrl]);

    const fechasDisponibles = obtenerFechasDisponibles();
    const fechaMinima = fechasDisponibles[0];
    const fechaMaxima = fechasDisponibles[fechasDisponibles.length - 1];

    //se piden las reservas al mostrar la sección y se guardan en Redux
    useEffect(() => {
        const cargarReservas = async () => {
            setCargando(true);
            try {
                const lista = await listarReservasApi();
                dispatch(cargarReservasInicialesSlice(lista));
            } catch (error) {
                console.error(error);
                setMensajeError(obtenerMensajeError(error, "No se pudieron cargar las reservas."));
            } finally {
                setCargando(false);
            }
        };

        cargarReservas();
    }, [dispatch]);

    //al editar, cada vez que se elige un día se piden las horas ocupadas de ese día
    useEffect(() => {
        if (!editando || !valoresEdicion.fecha) return;
        const controller = new AbortController();

        const cargarOcupados = async () => {
            try {
                const horas = await horariosOcupadosApi(fechaParaBack(valoresEdicion.fecha), controller.signal);
                setOcupadosEdicion({ fecha: valoresEdicion.fecha, horas });
            } catch (error) {
                //si se canceló porque cambiaron la fecha, no es un error
                if (error.code === "ERR_CANCELED") return;
                //si falla no se bloquea nada: el back igual rechaza un horario ocupado al guardar
                console.error(error);
            }
        };

        cargarOcupados();
        return () => {
            controller.abort();
        };
    }, [editando, valoresEdicion.fecha]);

    //el detalle pasa a tener inputs con los valores actuales de la reserva
    //(se recibe la reserva porque desde el botón "Editar" de la tabla todavía no está en reservaDetalle)
    const empezarEdicion = async (reserva) => {
        setMensajeError("");
        setValoresEdicion({
            categoriaId: reserva.categoriaId?.id ?? "",
            fecha: fechaDelBack(reserva.fecha),
            hora: reserva.hora,
            nombreMascota: reserva.nombreMascota,
            mascota: reserva.mascota,
            edadMascota: String(reserva.edadMascota),
            motivo: reserva.motivo,
        });
        setErrorFecha("");
        setEditando(true);

        //las categorías ya están en Redux si se pasó por el formulario de reserva; si no, se piden
        if (categorias.length > 0) return;
        try {
            const lista = await listarCategoriasApi();
            dispatch(cargaInicialCategoriasSlice(lista));
        } catch (error) {
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudieron cargar los servicios."));
        }
    };

    //si se subió una imagen nueva y no se guardó, se borra de Cloudinary para que no quede suelta
    const descartarImagenNueva = async () => {
        if (nuevaImagePublicId) {
            try {
                await deleteImage(nuevaImagePublicId);
            } catch (error) {
                console.error(error);
            }
        }
        setNuevaImageUrl("");
        setNuevaImagePublicId("");
    };

    //cancelar descarta los cambios y vuelve a la lista de reservas
    const cancelarEdicion = () => {
        setErrorFecha("");
        descartarImagenNueva();
        volverALista();
    };

    const abrirEliminar = (reserva) => {
        setMensajeError("");
        setReservaElegida(reserva);
        setVista("eliminar");
    };

    //botón "Editar" de la tabla: se pide la reserva al back (con los datos que no entran en la tabla)
    //y se muestra completa, directamente en modo edición
    const verDetalle = async (reserva) => {
        setMensajeError("");
        setEditando(false);
        setReservaDetalle(null);
        setQrUrl("");
        setErrorQr(false);
        setVista("detalle");
        setCargando(true);
        try {
            const reservaBack = await obtenerReservaApi(reserva.id);
            setReservaDetalle(reservaBack);
            empezarEdicion(reservaBack);
        } catch (error) {
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudo cargar la reserva."));
            return;
        } finally {
            setCargando(false);
        }

        //el QR se pide aparte: si falla, el detalle se sigue viendo igual
        try {
            const imagenQr = await obtenerQrReservaApi(reserva.id);
            setQrUrl(URL.createObjectURL(imagenQr));
        } catch (error) {
            console.error(error);
            setErrorQr(true);
        }
    };

    //la lista ya tiene los cambios porque se actualizan en Redux al editar o eliminar
    const volverALista = () => {
        setMensajeError("");
        setReservaElegida(null);
        setReservaDetalle(null);
        setQrUrl("");
        setEditando(false);
        setVista("lista");
    };

    const cambiarValorEdicion = (name, value) => {
        const auxValores = { ...valoresEdicion };
        auxValores[name] = value;
        setValoresEdicion(auxValores);
    };

    const handleChangeEdicion = (e) => {
        cambiarValorEdicion(e.target.name, e.target.value);
    };

    const nuevaFechaHandler = (e) => {
        const fecha = e.target.value;
        const error = validarFecha(fecha, fechaMinima, fechaMaxima);

        setErrorFecha(error);
        cambiarValorEdicion("fecha", error ? "" : fecha);
    };

    //fecha y hora se mandan siempre (el back las pide); el resto solo si cambió
    const armarCambios = () => {
        const datos = {
            nuevaFecha: fechaParaBack(valoresEdicion.fecha),
            nuevaHora: valoresEdicion.hora,
        };
        for (const campo of ["categoriaId", "nombreMascota", "mascota", "motivo"]) {
            const valor = valoresEdicion[campo].trim();
            const original = campo === "categoriaId" ? reservaDetalle.categoriaId?.id : reservaDetalle[campo];
            if (valor !== original) {
                datos[campo] = valor;
            }
        }
        const edad = Number(valoresEdicion.edadMascota);
        if (edad !== reservaDetalle.edadMascota) {
            datos.edadMascota = edad;
        }
        if (nuevaImageUrl) {
            datos.imageUrl = nuevaImageUrl;
            datos.imagePublicId = nuevaImagePublicId;
        }
        return datos;
    };

    const errorEdad = validarEdadMascota(valoresEdicion.edadMascota);

    //el horario de la propia reserva no cuenta como ocupado mientras no se cambie el día
    const mismaFechaOriginal = reservaDetalle && valoresEdicion.fecha === fechaDelBack(reservaDetalle.fecha);
    const horasOcupadasEdicion = (ocupadosEdicion.fecha === valoresEdicion.fecha ? ocupadosEdicion.horas : [])
        .filter((hora) => !(mismaFechaOriginal && hora === reservaDetalle.hora));
    const errorHora = valoresEdicion.hora && estaOcupado(valoresEdicion.hora, horasOcupadasEdicion)
        ? "Ese horario está ocupado. Elija otro."
        : "";

    const edicionCompleta =
        Object.values(valoresEdicion).every((valor) => valor.trim() !== "") &&
        errorEdad === "" &&
        errorHora === "";

    const hayCambios =
        editando && reservaDetalle && (
            Object.keys(armarCambios()).length > 2 ||
            valoresEdicion.fecha !== fechaDelBack(reservaDetalle.fecha) ||
            valoresEdicion.hora !== reservaDetalle.hora
        );

    const guardarReserva = async () => {
        setMensajeError("");
        setGuardando(true);
        try {
            const reservaEditada = await reprogramarReservaApi(reservaDetalle.id, armarCambios());
            //el back devuelve la reserva completa (con el motivo profesional nuevo si cambió el motivo):
            //se muestra en el detalle y se reemplaza en Redux, así la lista ya queda actualizada
            setReservaDetalle(reservaEditada);
            dispatch(actualizarReservaSlice(reservaEditada));
            setNuevaImageUrl("");
            setNuevaImagePublicId("");
            setEditando(false);
        } catch (error) {
            //si falla sigue en edición para poder corregir
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudo editar la reserva."));
        } finally {
            setGuardando(false);
        }
    };

    const eliminarReserva = async () => {
        setMensajeError("");
        setCargando(true);
        try {
            await eliminarReservaApi(reservaElegida.id);
            dispatch(borrarReservaSlice(reservaElegida.id));
            volverALista();
        } catch (error) {
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudo eliminar la reserva."));
        } finally {
            setCargando(false);
        }
    };

    const subtitulos = {
        lista: "Consultá, editá o eliminá tus reservas",
        detalle: "Detalle de la reserva",
        eliminar: "Eliminar reserva",
    };

    //Logica de filtro de mascota
    const handlerFilter = (e) => {
        setFiltroMascota(e.target.value);
    };
    const reservasFiltradas = reservas.filter((reserva) =>
        reserva.nombreMascota
            .toLowerCase()
            .includes(filtroMascota.toLowerCase()),
    );

    return (
        <section id="mis-reservas" className="booking-section">
            <div className="container">
                <div className="section-heading">
                    <h2>Mis reservas</h2>

                    <p>{subtitulos[vista]}</p>
                </div>

                {vista === "lista" && (
                    <div className="admin-card mx-auto mb-4">
                        <label
                            className="booking-label"
                            htmlFor="filtroMascota"
                        >
                            Filtrar por mascota
                        </label>

                        <input
                            id="filtroMascota"
                            className="form-control booking-input"
                            type="text"
                            placeholder="Nombre de la mascota"
                            value={filtroMascota}
                            onChange={handlerFilter}
                        />
                    </div>
                )}

                <div className="booking-card admin-card">
                    {mensajeError && (
                        <div className="alert alert-danger" role="alert">
                            {mensajeError}
                        </div>
                    )}

                    {/* Lista de reservas */}
                    {vista === "lista" && (
                        <>
                            {cargando ? (
                                <p className="mb-0">Cargando reservas...</p>
                            ) : reservas.length === 0 ? (
                                <p className="mb-0">
                                    Todavía no tenés reservas.
                                </p>
                            ) : reservasFiltradas.length === 0 ? (
                                <p className="mb-0">
                                    No se encontraron reservas para esa mascota.
                                </p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Hora</th>
                                                <th>Servicio</th>
                                                <th>Mascota</th>
                                                <th>Motivo</th>
                                                <th>Estado</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reservasFiltradas.map((reserva) => (
                                                <tr key={reserva.id}>
                                                    <td>{formatearFecha(reserva.fecha)}</td>
                                                    <td>{reserva.hora}</td>
                                                    <td className="text-capitalize">{reserva.categoriaId?.nombre}</td>
                                                    <td>{reserva.nombreMascota}</td>
                                                    {/* primeros 10 caracteres del motivo; al pasar el mouse se ve completo */}
                                                    <td title={reserva.motivo}>{recortarTexto(reserva.motivo)}</td>
                                                    <td className="text-capitalize">{reserva.estado}</td>
                                                    <td>
                                                        {/* una reserva que ya pasó no se puede editar ni eliminar */}
                                                        {reservaYaPaso(reserva.fecha, reserva.hora) ? (
                                                            <span className="d-block text-end text-muted small">Finalizada</span>
                                                        ) : (
                                                            <div className="d-flex gap-1 justify-content-end">
                                                                {/* abre la reserva completa directamente en modo edición */}
                                                                <button
                                                                    className="btn btn-outline-success btn-sm"
                                                                    type="button"
                                                                    onClick={() => verDetalle(reserva)}
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    type="button"
                                                                    onClick={() => abrirEliminar(reserva)}
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {/* Detalle de una reserva */}
                    {vista === "detalle" && (
                        <>
                            {cargando ? (
                                <p>Cargando reserva...</p>
                            ) : reservaDetalle && (
                                <dl className="row">
                                    {/* al tocar "Editar" todos los campos se vuelven editables menos el estado y el motivo profesional */}
                                    <dt className="col-sm-4">Servicio</dt>
                                    <dd className="col-sm-8 text-capitalize">
                                        {editando ? (
                                            <select
                                                className="form-select form-select-sm text-capitalize"
                                                name="categoriaId"
                                                aria-label="Servicio"
                                                value={valoresEdicion.categoriaId}
                                                onChange={handleChangeEdicion}
                                            >
                                                <option value="">Seleccione el servicio</option>
                                                {categorias.map((categoria) => (
                                                    <option key={categoria.id} value={categoria.id}>
                                                        {categoria.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            reservaDetalle.categoriaId?.nombre
                                        )}
                                    </dd>

                                    <dt className="col-sm-4">Fecha</dt>
                                    <dd className="col-sm-8">
                                        {editando ? (
                                            <>
                                                <input
                                                    className={`form-control form-control-sm ${errorFecha ? "is-invalid" : ""}`}
                                                    type="date"
                                                    aria-label="Nueva fecha"
                                                    min={fechaMinima}
                                                    max={fechaMaxima}
                                                    value={valoresEdicion.fecha}
                                                    onChange={nuevaFechaHandler}
                                                />
                                                {errorFecha && <div className="invalid-feedback">{errorFecha}</div>}
                                            </>
                                        ) : (
                                            formatearFecha(reservaDetalle.fecha)
                                        )}
                                    </dd>

                                    <dt className="col-sm-4">Hora</dt>
                                    <dd className="col-sm-8">
                                        {editando ? (
                                            <>
                                                {/* los horarios ya reservados ese día aparecen como "(ocupado)" y no se pueden elegir */}
                                                <select
                                                    className={`form-select form-select-sm ${errorHora ? "is-invalid" : ""}`}
                                                    name="hora"
                                                    aria-label="Nuevo horario"
                                                    value={valoresEdicion.hora}
                                                    onChange={handleChangeEdicion}
                                                >
                                                    <option value="">Horario</option>
                                                    {horarios.map((horario) => {
                                                        const ocupado = estaOcupado(horario, horasOcupadasEdicion);

                                                        return (
                                                            <option key={horario} value={horario} disabled={ocupado}>
                                                                {ocupado ? `${horario} (ocupado)` : horario}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                {errorHora && <div className="invalid-feedback">{errorHora}</div>}
                                            </>
                                        ) : (
                                            reservaDetalle.hora
                                        )}
                                    </dd>

                                    <dt className="col-sm-4">Estado</dt>
                                    <dd className="col-sm-8 text-capitalize">{reservaDetalle.estado}</dd>

                                    <dt className="col-sm-4">Mascota</dt>
                                    <dd className="col-sm-8">
                                        {editando ? (
                                            <input
                                                className="form-control form-control-sm"
                                                type="text"
                                                name="nombreMascota"
                                                aria-label="Nombre de la mascota"
                                                maxLength="50"
                                                value={valoresEdicion.nombreMascota}
                                                onChange={handleChangeEdicion}
                                            />
                                        ) : (
                                            reservaDetalle.nombreMascota
                                        )}
                                    </dd>

                                    <dt className="col-sm-4">Tipo</dt>
                                    <dd className="col-sm-8">
                                        {editando ? (
                                            <select
                                                className="form-select form-select-sm"
                                                name="mascota"
                                                aria-label="Tipo de mascota"
                                                value={valoresEdicion.mascota}
                                                onChange={handleChangeEdicion}
                                            >
                                                <option value="">Seleccione tipo</option>
                                                {tiposMascota.map((tipo) => (
                                                    <option key={tipo}>{tipo}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            reservaDetalle.mascota
                                        )}
                                    </dd>

                                    <dt className="col-sm-4">Edad</dt>
                                    <dd className="col-sm-8">
                                        {editando ? (
                                            <>
                                                <input
                                                    className={`form-control form-control-sm ${errorEdad ? "is-invalid" : ""}`}
                                                    type="number"
                                                    name="edadMascota"
                                                    aria-label="Edad de la mascota (años)"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    value={valoresEdicion.edadMascota}
                                                    onChange={handleChangeEdicion}
                                                />
                                                {errorEdad && <div className="invalid-feedback">{errorEdad}</div>}
                                            </>
                                        ) : (
                                            <>{reservaDetalle.edadMascota} {reservaDetalle.edadMascota === 1 ? "año" : "años"}</>
                                        )}
                                    </dd>

                                    <dt className="col-sm-4">Motivo</dt>
                                    <dd className="col-sm-8">
                                        {editando ? (
                                            <textarea
                                                className="form-control form-control-sm"
                                                name="motivo"
                                                aria-label="Motivo de la consulta"
                                                rows="3"
                                                maxLength="200"
                                                value={valoresEdicion.motivo}
                                                onChange={handleChangeEdicion}
                                            />
                                        ) : (
                                            reservaDetalle.motivo
                                        )}
                                    </dd>

                                    {/* el back reescribe el motivo con IA para el veterinario; no se edita */}
                                    {reservaDetalle.motivoProfesional && (
                                        <>
                                            <dt className="col-sm-4">Motivo profesional</dt>
                                            <dd className="col-sm-8">
                                                {reservaDetalle.motivoProfesional}
                                                {editando && (
                                                    <div className="form-text">
                                                        Se vuelve a generar si cambiás el motivo.
                                                    </div>
                                                )}
                                            </dd>
                                        </>
                                    )}

                                    {(reservaDetalle.imageUrl || editando) && (
                                        <>
                                            <dt className="col-sm-4">Imagen</dt>
                                            <dd className="col-sm-8">
                                                {/* al editar, la imagen actual se reemplaza si se sube una nueva */}
                                                {reservaDetalle.imageUrl && !nuevaImageUrl && (
                                                    <img
                                                        className="booking-image-preview"
                                                        src={reservaDetalle.imageUrl}
                                                        alt={`Foto de ${reservaDetalle.nombreMascota}`}
                                                    />
                                                )}
                                                {editando && (
                                                    <SubirImagen
                                                        handleImgURL={setNuevaImageUrl}
                                                        handleImgPublicId={setNuevaImagePublicId}
                                                    />
                                                )}
                                            </dd>
                                        </>
                                    )}

                                    {/* QR con el id de la reserva para mostrar en recepción (se ve también al editar, pero no se edita) */}
                                    <dt className="col-sm-4">Código QR</dt>
                                    <dd className="col-sm-8">
                                        {qrUrl ? (
                                            <>
                                                <img
                                                    className="img-thumbnail"
                                                    src={qrUrl}
                                                    width="160"
                                                    height="160"
                                                    alt={`Código QR de la reserva de ${reservaDetalle.nombreMascota}`}
                                                />
                                                <div className="form-text">
                                                    Presentalo en recepción el día de la consulta.
                                                </div>
                                            </>
                                        ) : errorQr ? (
                                            <span className="text-danger">No se pudo generar el código QR.</span>
                                        ) : (
                                            <span className="text-muted">Generando código QR...</span>
                                        )}
                                    </dd>
                                </dl>
                            )}

                            <div className="d-flex justify-content-end gap-2">
                                {editando ? (
                                    <>
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            disabled={guardando}
                                            onClick={cancelarEdicion}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="btn btn-success"
                                            type="button"
                                            disabled={guardando || !edicionCompleta || !hayCambios}
                                            onClick={guardarReserva}
                                        >
                                            {guardando ? "Guardando..." : "Guardar"}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            disabled={cargando}
                                            onClick={volverALista}
                                        >
                                            Volver
                                        </button>
                                        {reservaDetalle && (
                                            <button
                                                className="btn btn-outline-success"
                                                type="button"
                                                onClick={() => empezarEdicion(reservaDetalle)}
                                            >
                                                Editar
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {/* Confirmación para eliminar una reserva */}
                    {vista === "eliminar" && reservaElegida && (
                        <>
                            <p>
                                ¿Seguro que quiere eliminar la reserva de {reservaElegida.nombreMascota} del
                                {" "}{formatearFecha(reservaElegida.fecha)} a las {reservaElegida.hora}?
                            </p>

                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    disabled={cargando}
                                    onClick={volverALista}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-danger"
                                    type="button"
                                    disabled={cargando}
                                    onClick={eliminarReserva}
                                >
                                    {cargando ? "Eliminando..." : "Eliminar"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default MisReservas;

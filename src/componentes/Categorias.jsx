import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  cargaInicialCategoriasSlice, crearCategoriaSlice,
  actualizarCategoriaSlice, eliminarCategoriaSlice
} from "../redux/features/categoriasSlice";
import { renombrarCategoriaEnReservasSlice } from "../redux/features/reservasSlice";
import { obtenerMensajeError } from "../services/mensajeError";
import {
  listarCategoriasApi, crearCategoriaApi, obtenerCategoriaApi,
  editarCategoriaApi, eliminarCategoriaApi
} from "../services/reservaServices";

const categoriaVacia = {
  nombre: "",
  descripcion: "",
};

// Sección de categorías para el admin: carga las categorías del back en Redux, las crea, edita y elimina
const Categorias = () => {
  const dispatch = useDispatch();
  const categorias = useSelector((state) => state.categoriasSlice);

  const [valores, setValores] = useState(categoriaVacia);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // id de la fila que se está editando / eliminando (null si ninguna)
  const [editandoId, setEditandoId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [valoresEdicion, setValoresEdicion] = useState(categoriaVacia);
  const [procesandoFila, setProcesandoFila] = useState(false);

  useEffect(() => {
    const cargarCategorias = async () => {
      setCargando(true);
      try {
        const lista = await listarCategoriasApi();
        dispatch(cargaInicialCategoriasSlice(lista));
      } catch (error) {
        console.error(error);
        setMensajeError(obtenerMensajeError(error, "No se pudieron cargar las categorías."));
      } finally {
        setCargando(false);
      }
    };

    cargarCategorias();
  }, [dispatch]);

  const formularioCompleto =
    valores.nombre.trim() !== "" &&
    valores.descripcion.trim() !== "";

  const handleChange = (e) => {
    const auxValores = { ...valores };
    auxValores[e.target.name] = e.target.value;
    setValores(auxValores);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setMensajeError("");
    setGuardando(true);
    try {
      const categoriaCreada = await crearCategoriaApi({
        nombre: valores.nombre.trim(),
        descripcion: valores.descripcion.trim(),
      });
      dispatch(crearCategoriaSlice(categoriaCreada));
      setValores(categoriaVacia);
    } catch (error) {
      console.error(error);
      setMensajeError(obtenerMensajeError(error, "No se pudo crear la categoría."));
    } finally {
      setGuardando(false);
    }
  };

  //se piden los datos actuales de la categoría al back y la fila pasa a tener inputs
  const empezarEdicion = async (categoria) => {
    setMensajeError("");
    setEliminandoId(null);
    setProcesandoFila(true);
    try {
      const categoriaBack = await obtenerCategoriaApi(categoria.id);
      setValoresEdicion({
        nombre: categoriaBack.nombre,
        descripcion: categoriaBack.descripcion,
      });
      setEditandoId(categoria.id);
    } catch (error) {
      console.error(error);
      setMensajeError(obtenerMensajeError(error, "No se pudo cargar la categoría."));
    } finally {
      setProcesandoFila(false);
    }
  };

  const empezarEliminacion = (categoria) => {
    setMensajeError("");
    setEditandoId(null);
    setEliminandoId(categoria.id);
  };

  const cancelar = () => {
    setMensajeError("");
    setEditandoId(null);
    setEliminandoId(null);
  };

  const handleChangeEdicion = (e) => {
    const auxValores = { ...valoresEdicion };
    auxValores[e.target.name] = e.target.value;
    setValoresEdicion(auxValores);
  };

  //solo se mandan los campos que cambiaron (el back pide al menos uno)
  const categoriaOriginal = categorias.find((categoria) => categoria.id === editandoId);
  const camposCambiados = {};
  if (categoriaOriginal) {
    for (const campo of Object.keys(categoriaVacia)) {
      const valor = valoresEdicion[campo].trim();
      if (valor !== categoriaOriginal[campo]) {
        camposCambiados[campo] = valor;
      }
    }
  }

  const edicionValida =
    valoresEdicion.nombre.trim() !== "" &&
    valoresEdicion.descripcion.trim() !== "" &&
    Object.keys(camposCambiados).length > 0;

  const guardarCategoria = async () => {
    const nombreAnterior = categoriaOriginal?.nombre;

    setMensajeError("");
    setProcesandoFila(true);
    try {
      const categoriaEditada = await editarCategoriaApi(editandoId, camposCambiados);
      //se reemplaza en Redux con lo que devolvió el back
      dispatch(actualizarCategoriaSlice(categoriaEditada));

      //Agenda, Informes y las reservas visibles cambian sin volver a pedir las listas a la API
      if (nombreAnterior && nombreAnterior !== categoriaEditada.nombre) {
        dispatch(renombrarCategoriaEnReservasSlice({
          nombreAnterior,
          nombreNuevo: categoriaEditada.nombre,
        }));
      }

      setEditandoId(null);
    } catch (error) {
      //si falla la fila sigue en edición para poder corregir
      console.error(error);
      setMensajeError(obtenerMensajeError(error, "No se pudo editar la categoría."));
    } finally {
      setProcesandoFila(false);
    }
  };

  //el aviso verde de eliminación se oculta solo a los 4 segundos
  useEffect(() => {
    if (!mensajeExito) return;

    const timer = setTimeout(() => {
      setMensajeExito("");
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [mensajeExito]);

  //el back no deja eliminarla si alguna reserva la usa, en ese caso se muestra su mensaje
  const eliminarCategoria = async () => {
    //se guarda el nombre antes de sacarla de Redux, para mostrarlo en el aviso
    const categoriaEliminada = categorias.find((categoria) => categoria.id === eliminandoId);

    setMensajeError("");
    setMensajeExito("");
    setProcesandoFila(true);
    try {
      await eliminarCategoriaApi(eliminandoId);
      dispatch(eliminarCategoriaSlice(eliminandoId));
      setEliminandoId(null);
      setMensajeExito(`Categoría ${categoriaEliminada?.nombre} borrada correctamente.`);
    } catch (error) {
      console.error(error);
      setMensajeError(obtenerMensajeError(error, "No se pudo eliminar la categoría."));
    } finally {
      setProcesandoFila(false);
    }
  };

  return (
    <section id="categorias" className="booking-section">
      <div className="container">
        <div className="section-heading">
          <h2>Categorías</h2>
          <p>Gestión de categorías de servicios</p>
        </div>

        <div className="booking-card admin-card">
          {mensajeError && (
            <div className="alert alert-danger" role="alert">
              {mensajeError}
            </div>
          )}

          {mensajeExito && (
            <div className="alert alert-success" role="status">
              {mensajeExito}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="booking-field">
              <label className="booking-step-title" htmlFor="categoriaNombre">
                Nombre
              </label>
              <input
                id="categoriaNombre"
                className="form-control booking-input"
                type="text"
                name="nombre"
                placeholder="Ej: Baño"
                value={valores.nombre}
                onChange={handleChange}
              />
            </div>

            <div className="booking-field">
              <label className="booking-step-title" htmlFor="categoriaDescripcion">
                Descripción
              </label>
              <textarea
                id="categoriaDescripcion"
                className="form-control booking-input"
                name="descripcion"
                rows="2"
                maxLength="300"
                placeholder="Ej: Baño e higiene de la mascota"
                value={valores.descripcion}
                onChange={handleChange}
              />
            </div>

            <button
              className="btn btn-success"
              type="submit"
              disabled={!formularioCompleto || guardando}
            >
              {guardando ? "Creando..." : "Crear categoría"}
            </button>
          </form>

          <hr />

          {cargando ? (
            <p className="mb-0">Cargando categorías...</p>
          ) : categorias.length === 0 ? (
            <p className="mb-0">Todavía no hay categorías.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((categoria) => {
                    const enEdicion = categoria.id === editandoId;
                    const enEliminacion = categoria.id === eliminandoId;

                    return (
                      <tr key={categoria.id} className={enEliminacion ? "table-danger" : ""}>
                        {/* nombre y descripción se vuelven editables en la fila que se está editando */}
                        <td className="text-capitalize">
                          {enEdicion ? (
                            <input
                              className="form-control form-control-sm"
                              type="text"
                              name="nombre"
                              aria-label="Nombre de la categoría"
                              value={valoresEdicion.nombre}
                              onChange={handleChangeEdicion}
                            />
                          ) : (
                            categoria.nombre
                          )}
                        </td>
                        <td>
                          {enEdicion ? (
                            <textarea
                              className="form-control form-control-sm"
                              name="descripcion"
                              aria-label="Descripción de la categoría"
                              rows="2"
                              maxLength="300"
                              value={valoresEdicion.descripcion}
                              onChange={handleChangeEdicion}
                            />
                          ) : (
                            categoria.descripcion
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-end">
                            {enEdicion ? (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  type="button"
                                  disabled={procesandoFila || !edicionValida}
                                  onClick={guardarCategoria}
                                >
                                  {procesandoFila ? "Guardando..." : "Guardar"}
                                </button>
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  type="button"
                                  disabled={procesandoFila}
                                  onClick={cancelar}
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : enEliminacion ? (
                              <>
                                <button
                                  className="btn btn-danger btn-sm"
                                  type="button"
                                  disabled={procesandoFila}
                                  onClick={eliminarCategoria}
                                >
                                  {procesandoFila ? "Eliminando..." : "Confirmar"}
                                </button>
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  type="button"
                                  disabled={procesandoFila}
                                  onClick={cancelar}
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  type="button"
                                  disabled={procesandoFila}
                                  onClick={() => empezarEdicion(categoria)}
                                >
                                  Editar
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  type="button"
                                  disabled={procesandoFila}
                                  onClick={() => empezarEliminacion(categoria)}
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categorias;

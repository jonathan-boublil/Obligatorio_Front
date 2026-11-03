import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerMensajeError } from "../services/mensajeError";
import { listarCategoriasApi, crearCategoriaApi } from "../services/reservaServices";

const categoriaVacia = {
  nombre: "",
  descripcion: "",
};

const CategoriasModal = () => {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [valores, setValores] = useState(categoriaVacia);
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  //al abrir se cargan las categorías que ya existen
  useEffect(() => {
    const cargarCategorias = async () => {
      setCargando(true);
      try {
        const lista = await listarCategoriasApi();
        setCategorias(lista);
      } catch (error) {
        console.error(error);
        setMensajeError(obtenerMensajeError(error, "No se pudieron cargar las categorías."));
      } finally {
        setCargando(false);
      }
    };

    cargarCategorias();
  }, []);

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
      //se agrega a la lista con el id que le asignó el back
      setCategorias([...categorias, categoriaCreada]);
      setValores(categoriaVacia);
    } catch (error) {
      console.error(error);
      setMensajeError(obtenerMensajeError(error, "No se pudo crear la categoría."));
    } finally {
      setGuardando(false);
    }
  };

  const cerrarModal = () => {
    navigate("/");
  };

  return (
    <>
      <div
        id="categoriasModal"
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="categoriasModalTitle"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h2
                id="categoriasModalTitle"
                className="modal-title fs-4"
              >
                Categorías
              </h2>

              <button
                className="btn-close"
                type="button"
                aria-label="Cerrar"
                onClick={cerrarModal}
              />
            </div>

            <div className="modal-body">
              {mensajeError && (
                <div className="alert alert-danger" role="alert">
                  {mensajeError}
                </div>
              )}

              {/* Alta de categoría */}
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="categoriaNombre">
                    Nombre
                  </label>
                  <input
                    id="categoriaNombre"
                    className="form-control"
                    type="text"
                    name="nombre"
                    placeholder="Ej: Baño"
                    value={valores.nombre}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="categoriaDescripcion">
                    Descripción
                  </label>
                  <textarea
                    id="categoriaDescripcion"
                    className="form-control"
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

              {/* Categorías existentes */}
              {cargando ? (
                <p className="mb-0">Cargando categorías...</p>
              ) : categorias.length === 0 ? (
                <p className="mb-0">Todavía no hay categorías.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorias.map((categoria) => (
                        <tr key={categoria.id}>
                          <td className="text-capitalize">{categoria.nombre}</td>
                          <td>{categoria.descripcion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    <div className="modal-backdrop fade show" onClick={cerrarModal}/>
  </>
  )
}

export default CategoriasModal

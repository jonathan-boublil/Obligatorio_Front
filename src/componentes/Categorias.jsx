import React, { useEffect, useState } from "react";
import { obtenerMensajeError } from "../services/mensajeError";
import { listarCategoriasApi, crearCategoriaApi } from "../services/reservaServices";

const categoriaVacia = {
  nombre: "",
  descripcion: "",
};

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [valores, setValores] = useState(categoriaVacia);
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

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
      setCategorias([...categorias, categoriaCreada]);
      setValores(categoriaVacia);
    } catch (error) {
      console.error(error);
      setMensajeError(obtenerMensajeError(error, "No se pudo crear la categoría."));
    } finally {
      setGuardando(false);
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
    </section>
  );
};

export default Categorias;

import { useEffect, useState } from "react";
import Grafica from "./Grafica";
import { informeReservasPorCategoriaApi } from "../services/reservaServices";
import { obtenerMensajeError } from "../services/mensajeError";

const reduceReservas = (acumulador, reserva) => {
  const categoria = reserva.categoriaId?.nombre;

  if (!categoria) {
    return acumulador;
  }

  if (acumulador[categoria]) {
    acumulador[categoria] = acumulador[categoria] + 1;
  } else {
    acumulador[categoria] = 1;
  }

  return acumulador;
};

const Informes = () => {
  const [listaReservas, setListaReservas] = useState([]);
  const [datos, setDatos] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  // Se obtienen las reservas cuando se muestra Informes
  useEffect(() => {
    const cargarInforme = async () => {
      setMensajeError("");
      setCargando(true);

      try {
        const reservas =
          await informeReservasPorCategoriaApi();

        setListaReservas(reservas);
      } catch (error) {
        console.error(error);

        setMensajeError(
          obtenerMensajeError(
            error,
            "No se pudo cargar el informe.",
          ),
        );
      } finally {
        setCargando(false);
      }
    };

    cargarInforme();
  }, []);


  // Se reducen las reservas a un objeto con categoría y cantidad
  useEffect(() => {
    const reservasPorCategoria = listaReservas.reduce(
      reduceReservas,
      {},
    );

    const nombresCategorias = Object.keys(
      reservasPorCategoria,
    );

    const etiquetasAux = nombresCategorias.map(
      (nombre) =>
        nombre.charAt(0).toUpperCase() + nombre.slice(1),
    );

    const datosAux = Object.values(reservasPorCategoria);

    setEtiquetas(etiquetasAux);
    setDatos(datosAux);
  }, [listaReservas]);

  return (
    <section id="informes" className="booking-section">
      <div className="container">
        <div className="section-heading">
          <h2>Informes</h2>

          <p>Cantidad de reservas por categoría</p>
        </div>

        <div className="booking-card admin-card">
          {mensajeError && (
            <div
              className="alert alert-danger"
              role="alert"
            >
              {mensajeError}
            </div>
          )}

          {cargando ? (
            <p className="mb-0">Cargando informe...</p>
          ) : datos.length === 0 ? (
            <p className="mb-0">
              No hay reservas para mostrar.
            </p>
          ) : (
            <div className="report-chart">
              <Grafica
                etiquetas={etiquetas}
                datos={datos}
                nombreGrafica="Reservas por categoría"
                nombreDatos="Cantidad de reservas"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Informes;

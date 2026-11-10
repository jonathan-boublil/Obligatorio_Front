import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Grafica from "./Grafica";
import { informeReservasPorCategoriaApi } from "../services/reservaServices";
import { obtenerMensajeError } from "../services/mensajeError";
import { cargarInformeSlice, limpiarClientesInformeSlice, filtrarInformePorClientes } from "../redux/features/reservasSlice";
import { useObtenerNombreUsuario } from "../utils/utils";

const reduceReservas = (acumulador, reserva) => {
  const categoria = reserva.categoriaId?.nombre;

  if (!categoria) {
    return acumulador;
  }

  if (acumulador[categoria]) {
    acumulador[categoria] += 1;
  } else {
    acumulador[categoria] = 1;
  }

  return acumulador;
};

// Gráfico de reservas por categoría para el admin.
// Sin clientes tildados en la lista de Clientes muestra el total del sistema;
// con clientes tildados suma solamente las reservas de esos clientes
const Informes = () => {
  const dispatch = useDispatch();
  //reservas ya filtradas por los clientes tildados (selector del slice, como en la clase)
  const reservasDelGrafico = useSelector(filtrarInformePorClientes);
  const clientesSeleccionados = useSelector(
    (state) => state.reservaSlice.clientesSeleccionados,
  );
  //custom hook de la clase: pasa del id de un cliente a su nombre
  const obtenerNombreUsuario = useObtenerNombreUsuario();

  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    const cargarInforme = async () => {
      setMensajeError("");
      setCargando(true);

      try {
        //Redux guarda las reservas con su categoría y su cliente; el gráfico se arma abajo según los tildados
        const reservas = await informeReservasPorCategoriaApi();
        dispatch(cargarInformeSlice(reservas));
      } catch (error) {
        console.error(error);
        dispatch(cargarInformeSlice([]));
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
  }, [dispatch]);

  const hayClientesSeleccionados = clientesSeleccionados.length > 0;

  const reservasPorCategoria = reservasDelGrafico.reduce(
    reduceReservas,
    {},
  );

  const etiquetas = Object.keys(reservasPorCategoria).map(
    (nombre) => nombre.charAt(0).toUpperCase() + nombre.slice(1),
  );

  const datos = Object.values(reservasPorCategoria);

  //nombres de los clientes tildados para el subtítulo (si todavía no cargó la lista, se omiten)
  const nombresSeleccionados = clientesSeleccionados
    .map((id) => obtenerNombreUsuario(id))
    .filter(Boolean)
    .join(", ");

  return (
    <section id="informes" className="booking-section">
      <div className="container">
        <div className="section-heading">
          <h2>Informes</h2>

          <p>
            {hayClientesSeleccionados
              ? `Reservas por categoría de: ${nombresSeleccionados || "los clientes seleccionados"}`
              : "Cantidad de reservas por categoría de todo el sistema"}
          </p>
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

          {/* para volver al total sin tener que destildar uno por uno */}
          {hayClientesSeleccionados && (
            <div className="d-flex justify-content-end mb-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={() => dispatch(limpiarClientesInformeSlice())}
              >
                Ver total del sistema
              </button>
            </div>
          )}

          {cargando ? (
            <p className="mb-0">Cargando informe...</p>
          ) : datos.length === 0 ? (
            <p className="mb-0">
              {hayClientesSeleccionados
                ? "Los clientes seleccionados no tienen reservas."
                : "No hay reservas para mostrar."}
            </p>
          ) : (
            <div className="report-chart">
              <Grafica
                etiquetas={etiquetas}
                datos={datos}
                nombreGrafica={
                  hayClientesSeleccionados
                    ? "Reservas por categoría de los clientes seleccionados"
                    : "Reservas por categoría"
                }
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

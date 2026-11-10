import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Grafica from "./Grafica";
import { informeReservasPorCategoriaApi } from "../services/reservaServices";
import { obtenerMensajeError } from "../services/mensajeError";
import { cargarInformeSlice } from "../redux/features/reservasSlice";

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

const Informes = () => {
  const dispatch = useDispatch();
  const informe = useSelector(
    (state) => state.reservaSlice.informe,
  );

  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    const cargarInforme = async () => {
      setMensajeError("");
      setCargando(true);

      try {
        const reservas = await informeReservasPorCategoriaApi();
        const reservasPorCategoria = reservas.reduce(
          reduceReservas,
          {},
        );

        //Redux guarda solamente los datos que necesita la gráfica.
        const datosInforme = Object.entries(
          reservasPorCategoria,
        ).map(([nombre, cantidad]) => ({
          nombre,
          cantidad,
        }));

        dispatch(cargarInformeSlice(datosInforme));
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

  const etiquetas = informe.map(
    (categoria) =>
      categoria.nombre.charAt(0).toUpperCase() +
      categoria.nombre.slice(1),
  );

  const datos = informe.map(
    (categoria) => categoria.cantidad,
  );

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

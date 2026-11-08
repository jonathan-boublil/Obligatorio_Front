import React from 'react'
import { useSelector } from "react-redux";

const LIMITE_RESERVAS_ANUALES_PLUS = 4;

const InformeUsoPlan = ({plan}) => {
    const reservas = useSelector((state) => state.reservaSlice.lista);
    const esPremium = plan?.toLowerCase() === "premium";
    const anioActual = new Date().getFullYear();

    //Recorre reservas de redux, convierte cada fecha en un objeto Date, obtiene anio de reserva,
    //compara ese anio con el actual y conserva solo las reservas del anio actual
    const reservasDelAnio = reservas.filter((reserva) => {
        const anioReserva = new Date(reserva.fecha).getUTCFullYear();
        return anioReserva === anioActual;
    });
    const cantidadReservasDelAnio = reservasDelAnio.length;
    const porcentajeUsado = Math.min(
        (
        cantidadReservasDelAnio /
        LIMITE_RESERVAS_ANUALES_PLUS
        ) * 100,
        100,
    );

  return (
    <div className="plan-usage">
      <h3 className="plan-usage-title">
        Uso del plan
      </h3>

      {esPremium ? (
        <div className="plan-usage-summary">
          <strong>
            Cantidad total de reservas:
          </strong>{" "}
          {reservas.length}
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between mb-2">
            <span>
              Reservas de {anioActual}:{" "}
              {cantidadReservasDelAnio} de{" "}
              {LIMITE_RESERVAS_ANUALES_PLUS}
            </span>

            <strong>{porcentajeUsado}%</strong>
          </div>

          <div
            className="progress plan-usage-progress"
            role="progressbar"
            aria-label="Porcentaje de reservas utilizadas"
            aria-valuenow={porcentajeUsado}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="progress-bar"
              style={{
                width: `${porcentajeUsado}%`,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default InformeUsoPlan

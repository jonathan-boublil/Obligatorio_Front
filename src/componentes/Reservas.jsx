import React from 'react';
import Reserva from './Reserva';

const Reservas = (propiedades) => {
    const { listaReservas, changedChecked, eliminarReserva } = propiedades;

    return <div className="Reservas">
        {
            listaReservas?.map(
                (reserva) => (
                    <Reserva key={reserva.id}
                        reserva={reserva}
                        changedChecked={changedChecked}
                        eliminarReserva={eliminarReserva} />
                )
            )
        }
    </div>;
};

export default Reservas;
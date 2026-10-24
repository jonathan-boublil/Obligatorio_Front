import React from 'react';

const Reserva = (propiedades) => {

    const { reserva, changedChecked, eliminarReserva } = propiedades;
    const { id, title, completed } = reserva;

    const onChangeHandler = (evento) => {
        const checked = evento.target.checked;
        console.log(`Reserva ${id} checked: ${checked}`);
        changedChecked(id, checked);
    }

    // Aca agregar la lógica para eliminar la reserva de la lista
    const borrarHandler = () => {
        console.log(`Reserva ${id} - ${title} eliminada`);
        eliminarReserva(id);
    }


    return (
        <div className="reserva">
            <input type="checkbox"
                id={`reserva_${id}`}
                className="checkbox"
                defaultChecked={completed}
                onChange={onChangeHandler} />
            <label className="checkLabel" htmlFor={`reserva_${id}`}>
                {title}
            </label>

            <button onClick={borrarHandler}>Eliminar</button>

        </div>
    );
};

export default Reserva;
import React from 'react';

// Lista de reservas (para más adelante: "mis reservas").
// Cada ítem se dibuja acá mismo, porque Reserva.jsx ahora es el formulario.
const Reservas = (propiedades) => {
    const { listaReservas, changedChecked, eliminarReserva } = propiedades;

    const onChangeHandler = (id, evento) => {
        const checked = evento.target.checked;
        console.log(`Reserva ${id} checked: ${checked}`);
        changedChecked(id, checked);
    }

    const borrarHandler = (id, title) => {
        console.log(`Reserva ${id} - ${title} eliminada`);
        eliminarReserva(id);
    }

    return <div className="Reservas">
        {
            listaReservas?.map(
                ({ id, title, completed }) => (
                    <div className="reserva" key={id}>
                        <input type="checkbox"
                            id={`reserva_${id}`}
                            className="checkbox"
                            defaultChecked={completed}
                            onChange={(evento) => onChangeHandler(id, evento)} />
                        <label className="checkLabel" htmlFor={`reserva_${id}`}>
                            {title}
                        </label>

                        <button onClick={() => borrarHandler(id, title)}>Eliminar</button>
                    </div>
                )
            )
        }
    </div>;
};

export default Reservas;

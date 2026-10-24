import React, { useState } from 'react'

const Agregar = (propiedades) => {
    const { agregarReserva } = propiedades;
    const [title, setTitle] = useState("");

    const agregarHandler = (evento) => {
        evento.preventDefault();
        if (!title.trim()) {
            return;
        }
        agregarReserva(title);
        setTitle("");
    }

    const titleHandler = (evento) => {
        setTitle(evento.target.value);
    }

    return (
        <div className="agregar">
            <label htmlFor="reservaInput">Agregar Reserva:</label>
            <input type="text" id="txtAgregar" name="txtAgregar" placeholder="Título de la reserva" value={title} onChange={titleHandler} />
            <input type="button" value="Agregar" onClick={agregarHandler} />
        </div>
    )
}

export default Agregar
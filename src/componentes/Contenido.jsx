import React, { useState } from 'react'
import Agregar from './Agregar'
import Reservas from './Reservas';

const reservasIniciales = [
    {
        "userId": 1,
        "id": 1,
        "title": "delectus aut autem",
        "completed": false
    },
    {
        "userId": 1,
        "id": 2,
        "title": "quis ut nam facilis et officia qui",
        "completed": false
    },
    {
        "userId": 1,
        "id": 3,
        "title": "fugiat veniam minus",
        "completed": false
    }
];

// Modificar el estado de la reserva en la lista de reservas
const Contenido = () => {
    const [listaReservas, setListaReservas] = useState(reservasIniciales);

    const changeChecked = (id, checked) => {
        console.log(`Tarea ${id} checked: ${checked}`);
        listaReservas.find((reserva) => reserva.id === id).completed = checked;

        console.log('Lista de reservas modificada:', listaReservas);
        setListaReservas([...listaReservas]); // Actualiza el estado para forzar la re-renderización

    }

    // Agregar reserva
    const agregarReserva = (title) => {
        const nuevoId = listaReservas.reduce(
            (maxId, reserva) => Math.max(maxId, reserva.id),
            0
        ) + 1;
        const tarea = {
            "userId": 1,
            "id": nuevoId,
            "title": title,
            "completed": false
        };
        console.log('Agregar Reserva:', tarea);
        const listaActualizada = [...listaReservas, tarea];
        setListaReservas(listaActualizada);
        console.log('Lista de reservas actualizada:', listaActualizada);
    }

    //Eliminar reserva
    const eliminarReserva = (id) => {
        console.log(`Eliminar reserva con id: ${id}`);
        const listaActualizada = listaReservas.filter((reserva) => reserva.id !== id);
        setListaReservas(listaActualizada);
        console.log('Lista de reservas actualizada:', listaActualizada);
    }

    return <div className="contenido">
        <Agregar agregarReserva={agregarReserva} />
        <Reservas
            listaReservas={listaReservas}
            changedChecked={changeChecked}
            eliminarReserva={eliminarReserva}
        />
    </div>
}

export default Contenido
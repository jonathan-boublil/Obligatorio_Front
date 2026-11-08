// Validaciones de los datos de la mascota compartidas por el alta (Reserva) y la edición (MisReservas)

// misma regla que el back (reserva.body.schema): edad entera entre 0 y 100
// devuelve el mensaje de error o "" si está bien (o si todavía está vacía)
export const validarEdadMascota = (edad) => {
    if (String(edad).trim() === "") {
        return "";
    }
    const numero = Number(edad);
    if (!Number.isInteger(numero) || numero < 0 || numero > 100) {
        return "La edad debe ser un número entero entre 0 y 100.";
    }
    return "";
};

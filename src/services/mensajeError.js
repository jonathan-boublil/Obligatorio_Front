// Arma el texto del error que se muestra en el alert de cada componente,
// con el mismo criterio que el login y registro de main
export const obtenerMensajeError = (error, mensajePorDefecto = "Ocurrió un error inesperado.") => {
    //sin respuesta: el servidor está caído o no hay conexión
    if (!error.response) {
        return "No se pudo conectar con el servidor. Intentá de nuevo más tarde.";
    }

    const respuesta = error.response.data;

    //errores de validación del back: [{ field, message }]
    if (respuesta?.errors?.length > 0) {
        return respuesta.errors
            .map((error) => error.message)
            .join(". ");
    }

    return respuesta?.message || respuesta?.error || mensajePorDefecto;
}

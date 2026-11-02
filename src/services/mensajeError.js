// Traduce los mensajes de validación del back que llegan en inglés
const traducirMensajeCampo = (error) => {
    if (error.message?.includes("does not match any of the allowed types")) {
        if (error.field === "identificador") {
            return "usuario o email con formato inválido";
        }
        return `${error.field} con formato inválido`;
    }
    return error.message;
}

// Arma el texto a mostrar a partir del error de axios
export const obtenerMensajeError = (error) => {
    //sin respuesta: el servidor está caído o no hay conexión
    if (!error.response) {
        return "No se pudo conectar con el servidor. Intentá de nuevo más tarde.";
    }

    const data = error.response.data;
    let mensaje = data?.message ?? "Ocurrió un error inesperado.";

    //errores de validación del back: [{ field, message }]
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
        const detalle = data.errors.map((e) => `- ${traducirMensajeCampo(e)}`).join("\n");
        mensaje = `${mensaje}\n${detalle}`;
    }

    return mensaje;
}

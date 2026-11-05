const URL_IMAGES = `${import.meta.env.VITE_API_URL_BACKEND}/images`;

const leerRespuesta = async (respuesta) => {
    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(
            datos.detalle || datos.error || datos.message || "Error en la operación de imagen"
        );
    }

    return datos;
};


export const uploadImage = async (base64) => {
    const respuesta = await fetch(URL_IMAGES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64 }),
    });
    return leerRespuesta(respuesta);
};

export const deleteImage = async (publicId) => {
    const respuesta = await fetch(
        `${URL_IMAGES}/${encodeURIComponent(publicId)}`,
        { method: "DELETE" }
    );

    return leerRespuesta(respuesta);
};

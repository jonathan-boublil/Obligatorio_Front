import api from "./authServices";

export const uploadImage = async (base64) => {
    const resultado = await api.post(
        "/images",
        {
            file: base64,
        },
    );
    return resultado.data;
};

export const deleteImage = async (publicId) => {
    const resultado = await api.delete(
        `/images/${encodeURIComponent(publicId)}`,
    );

    return resultado.data;
};

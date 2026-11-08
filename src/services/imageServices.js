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

// Las usan el alta (Reserva) y la edición (MisReservas): la imagen elegida se sube recién al confirmar

//Conversion de imagen a base64 ya que la imagen es un objeto File pero el frontend la envía como JSON
const convertirImagenABase64 = (archivo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error(
          "No se pudo leer la imagen.",
        ),
      );
    };

    reader.readAsDataURL(archivo);
  });
};

export const subirImagenSeleccionada = async (archivo) => {
  if (!archivo) {
    return null;
  }

  const base64 =
    await convertirImagenABase64(archivo);

  return await uploadImage(base64);
};

export const limpiarImagenSubida = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    await deleteImage(publicId);
  } catch (error) {
    console.error(
      "No se pudo eliminar la imagen de Cloudinary:",
      error,
    );
  }
};

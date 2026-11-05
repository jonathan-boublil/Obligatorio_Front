import { useEffect, useId, useState } from "react";
import {
  uploadImage,
  deleteImage,
} from "../services/imageServices";

const TAMANIO_MAXIMO_IMAGEN = 3_000_000;

const SubirImagen = ({
  handleImgURL,
  handleImgPublicId,
  resetKey,
}) => {
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState("");
  const [imagenSubida, setImagenSubida] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const inputId = useId();

  useEffect(() => {
    setArchivo(null);
    setPreview("");
    setImagenSubida(null);
    setMensajeError("");

    handleImgURL("");
    handleImgPublicId("");
  }, [resetKey]);

  useEffect(() => {
    if (!preview) return;

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (evento) => {
    const seleccionado = evento.target.files?.[0];

    if (!seleccionado) return;

    if (seleccionado.size > TAMANIO_MAXIMO_IMAGEN) {
      setArchivo(null);
      setPreview("");
      setMensajeError("La imagen no puede superar los 3 MB.");
      evento.target.value = "";
      return;
    }

    setMensajeError("");
    setArchivo(seleccionado);
    setPreview(URL.createObjectURL(seleccionado));
  };

  const quitarSeleccion = () => {
    setArchivo(null);
    setPreview("");
    setMensajeError("");

    handleImgURL("");
    handleImgPublicId("");
  };

  const handleUpload = async () => {
    if (!archivo) return;

    setLoading(true);
    setMensajeError("");

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () =>
          reject(new Error("No se pudo leer la imagen"));

        reader.readAsDataURL(archivo);
      });

      const resultado = await uploadImage(base64);

      setImagenSubida(resultado);
      handleImgURL(resultado.secure_url);
      handleImgPublicId(resultado.public_id);
    } catch (error) {
      setMensajeError(
        error.message || "No se pudo subir la imagen",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!imagenSubida?.public_id) return;

    setLoading(true);
    setMensajeError("");

    try {
      await deleteImage(imagenSubida.public_id);

      setImagenSubida(null);
      quitarSeleccion();
    } catch (error) {
      setMensajeError(
        error.message || "No se pudo eliminar la imagen",
      );
    } finally {
      setLoading(false);
    }
  };

  const imagenParaMostrar =
    imagenSubida?.secure_url || preview;

  return (
    <div className="booking-image-upload">
      <p className="booking-label">
        Imagen de la mascota (opcional)
      </p>

      {mensajeError && (
        <div className="alert alert-danger" role="alert">
          {mensajeError}
        </div>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading || Boolean(imagenSubida)}
        hidden
      />

      <label
        className={`btn btn-outline-success ${
          loading || imagenSubida ? "disabled" : ""
        }`}
        htmlFor={inputId}
        aria-disabled={loading || Boolean(imagenSubida)}
      >
        Seleccionar imagen
      </label>

      {imagenParaMostrar && (
        <img
          className="booking-image-preview"
          src={imagenParaMostrar}
          alt="Vista previa de la mascota"
        />
      )}

      {archivo && !imagenSubida && (
        <div className="booking-image-actions">
          <button
            className="btn btn-success"
            type="button"
            disabled={loading}
            onClick={handleUpload}
          >
            {loading ? "Subiendo..." : "Subir imagen"}
          </button>

          <button
            className="btn btn-outline-secondary"
            type="button"
            disabled={loading}
            onClick={quitarSeleccion}
          >
            Quitar selección
          </button>
        </div>
      )}

      {imagenSubida && (
        <div className="booking-image-actions">
          <span className="booking-image-status">
            Imagen subida correctamente
          </span>

          <button
            className="btn btn-outline-danger"
            type="button"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? "Eliminando..." : "Eliminar imagen"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubirImagen;

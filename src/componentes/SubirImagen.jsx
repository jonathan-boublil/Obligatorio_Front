import { useEffect, useId, useState } from "react";

const TAMANIO_MAXIMO_IMAGEN = 3_000_000;

const SubirImagen = ({ onArchivoSeleccionado }) => {
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState("");
  const [mensajeError, setMensajeError] =
    useState("");

  const inputId = useId();

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (evento) => {
    const seleccionado =
      evento.target.files?.[0];

    if (!seleccionado) {
      return;
    }

    if (
      !seleccionado.type.startsWith("image/")
    ) {
      setMensajeError(
        "El archivo seleccionado no es una imagen.",
      );
      evento.target.value = "";
      return;
    }

    if (
      seleccionado.size >
      TAMANIO_MAXIMO_IMAGEN
    ) {
      setMensajeError(
        "La imagen no puede superar los 3 MB.",
      );
      evento.target.value = "";
      return;
    }

    setMensajeError("");
    setArchivo(seleccionado);
    setPreview(
      URL.createObjectURL(seleccionado),
    );

    onArchivoSeleccionado(seleccionado);
  };

  const quitarSeleccion = () => {
    setArchivo(null);
    setPreview("");
    setMensajeError("");

    onArchivoSeleccionado(null);
  };

  return (
    <div className="booking-image-upload">
      <p className="booking-label">
        Imagen de la mascota (opcional)
      </p>

      {mensajeError && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {mensajeError}
        </div>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        hidden
      />

      <label
        className="btn btn-outline-success"
        htmlFor={inputId}
      >
        {archivo
          ? "Cambiar imagen"
          : "Seleccionar imagen"}
      </label>

      {preview && (
        <>
          <img
            className="booking-image-preview"
            src={preview}
            alt="Vista previa de la mascota"
          />

          <div className="booking-image-actions">
            <span className="booking-image-status">
              La imagen se subirá al confirmar
            </span>

            <button
              className="btn btn-outline-danger"
              type="button"
              onClick={quitarSeleccion}
            >
              Quitar imagen
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SubirImagen;
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { obtenerMensajeError } from "../services/mensajeError";
import { listarClientesApi } from "../services/userServices";
import { cargaInicialUsersSlice } from "../redux/features/usersSlice";
import ListaClientes from "./ListaClientes";

// Sección de clientes para el admin: carga los clientes del back y los guarda en Redux,
// la lista y el filtro se muestran en ListaClientes
const Clientes = () => {
    const dispatch = useDispatch();

    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const obtenerClientes = async () => {
            setCargando(true);
            try {
                const listaClientes = await listarClientesApi(controller.signal);
                dispatch(cargaInicialUsersSlice(listaClientes));
                setCargando(false);
            } catch (error) {
                //si se canceló porque el componente se destruyó, no es un error a mostrar
                if (error.code === "ERR_CANCELED") {
                    console.log("Petición cancelada");
                    return;
                }
                console.error(error);
                setMensajeError(obtenerMensajeError(error, "No se pudieron cargar los clientes."));
                setCargando(false);
            }
        };

        //llamamos al servicio de clientes
        obtenerClientes();
        //limpiar la llamada a la api cuando se destruya el componente
        return () => {
            controller.abort();
        };
    }, []);

    return (
        <section id="clientes" className="booking-section">
            <div className="container">
                <div className="section-heading">
                    <h2>Clientes</h2>

                    <p>Clientes registrados en Hüellas</p>
                </div>

                <div className="booking-card admin-card">
                    {mensajeError && (
                        <div className="alert alert-danger" role="alert">
                            {mensajeError}
                        </div>
                    )}

                    {cargando ? (
                        <p className="mb-0">Cargando clientes...</p>
                    ) : (
                        <ListaClientes />
                    )}
                </div>
            </div>
        </section>
    );
};

export default Clientes;

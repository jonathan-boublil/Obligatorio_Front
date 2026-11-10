import { useSelector } from "react-redux";

// custom hook (igual que en la clase): devuelve una función que, a partir del id de un usuario,
// busca su nombre en la lista de usuarios de Redux
export const useObtenerNombreUsuario = () => {
    const listaUsuarios = useSelector((state) => state.usersSlice);

    const obtenerNombreUsuario = (userId) => {
        const usuario = listaUsuarios?.find((u) => u.id === userId);
        const usuarioSalida = usuario ? usuario.name : undefined;
        return usuarioSalida;
    };

    return obtenerNombreUsuario;
};

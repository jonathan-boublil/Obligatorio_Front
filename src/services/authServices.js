import axios from "axios";

const api = axios.create({
    //TODO: cambiar esa url a http://localhost:3000/api/v1 para probar local
    baseURL: "https://obligatorio-full-stack-pearl.vercel.app/api/v1",
    headers: {
        "Content-Type": "application/json"
    }
});

//Interceptor del request
api.interceptors.request.use((config) => {
    //busca en el localStorage el token
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//Interceptor de la respuesta
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401) {
            localStorage.removeItem("token");
        }
        return Promise.reject(error);
    }
);

export const loginApi = async (dataLogin) => {
    // Ahi el api.post ya lleva el header con el token que se agrego en el interceptor
    const resultado = await api.post("/auth/login", dataLogin);
    console.log('resultadoAPI', resultado.data)
    return resultado.data;
}

export const registerApi = async (dataregister) => {
    const resultado = await api.post(
        "/auth/register",
        dataregister,
    );
    console.log("resultadoRegistro", resultado);

    return resultado.data;
}

export default api;
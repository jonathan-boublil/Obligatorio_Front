import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "../App.jsx";

// La app es one page: las secciones están todas en App y se llega con anclas (#reservas, #agenda...).
// Las rutas solo abren un modal encima de la página ("modalActivo")
const Rutas = () => {
  return (
    // useTransitions={false}: la URL cambia en el mismo render que la sesión. Si no, al eliminar la cuenta
    // desde /mis-datos (ruta protegida) se vería un instante "sin sesión en /mis-datos" y mandaría al login
    <BrowserRouter useTransitions={false}>
        <Routes>
            <Route path="/" element={<App />}> </Route>
            <Route path="/login" element={<App modalActivo="login" />}></Route>
            <Route path="/mis-datos" element={<App modalActivo="misDatos" />}></Route>
            <Route path="/register" element={<App modalActivo="registro" />}></Route>
            <Route
                path="*"
                element={<Navigate to="/" replace></Navigate>}
            ></Route>
        </Routes>
 </BrowserRouter>
  )
}

export default Rutas

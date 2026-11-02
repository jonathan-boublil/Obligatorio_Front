import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "../App.jsx";

const Rutas = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}> </Route>
            <Route path="/login" element={<App modalActivo="login" />}></Route>
            <Route path="/mis-datos" element={<App modalActivo="misDatos" />}></Route>
            <Route path="/agenda" element={<App modalActivo="agenda" />}></Route>
            <Route path="/informes" element={<App modalActivo="informes" />}></Route>
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

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import { store } from './redux/store.js'
import Rutas from './componentes/Rutas.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      {/* <App /> */}
       <Rutas />
    </Provider>
  </StrictMode>,
)

//TODO : revisar con IA de borrar todo los archivos y conexiones que no se usan en este proyecto

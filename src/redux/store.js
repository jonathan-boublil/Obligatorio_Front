import { configureStore } from '@reduxjs/toolkit'
import reservaSlice from "./features/tareasSlice.js"
export const store = configureStore({
    reducer: {
        reservaSlice
    },
})
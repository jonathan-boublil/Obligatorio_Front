import { configureStore } from '@reduxjs/toolkit'
import reservaSlice from "./features/reservasSlice.js"
export const store = configureStore({
    reducer: {
        reservaSlice
    },
})
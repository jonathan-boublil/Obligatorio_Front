import { configureStore } from '@reduxjs/toolkit'
import reservaSlice from "./features/reservasSlice.js"
import usersSlice from "./features/usersSlice.js"
export const store = configureStore({
    reducer: {
        reservaSlice, usersSlice
    },
})
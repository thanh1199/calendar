
import { createSlice } from "@reduxjs/toolkit";

const userId = createSlice({
    name: "userId",
    initialState: window.location.search.split("?")[1],
    reducers: {
        setUserId: (state, action) => action.payload
    }
})

const {reducer, actions} = userId
export const { setUserId } = actions
export default reducer

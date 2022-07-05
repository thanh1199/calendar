
import { createSlice } from "@reduxjs/toolkit";

const deleted = createSlice({
    name: "deleted",
    initialState: false,
    reducers: {
        setShowDeletedBox: (state, action) => action.payload
    }
})

const {reducer, actions} = deleted
export const { setShowDeletedBox } = actions
export default reducer

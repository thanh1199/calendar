
import { createSlice } from "@reduxjs/toolkit";

const attend = createSlice({
    name: "attend",
    initialState: [],
    reducers: {
        reloadAttend: (state, action) => {
            var newAttend = [...action.payload]
            return newAttend
        }
    }
})

const {reducer, actions} = attend
export const { reloadAttend } = actions
export default reducer

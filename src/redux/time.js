
import { createSlice } from "@reduxjs/toolkit";

const now = new Date()
const time = createSlice({
    name: "time",
    initialState: [now.getFullYear(), now.getMonth(), now.getDate()],
    reducers: {
        reSetTime: (state, action) => {
            var newTime = [...action.payload]
            return newTime
        }
    }
})

const {reducer, actions} = time
export const { reSetTime } = actions
export default reducer

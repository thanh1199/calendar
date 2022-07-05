
import { configureStore } from "@reduxjs/toolkit";
import timeReducer from "./time"
import attendReducer from "./attend"
import deletedReducer from "./deleteBox"
import userIdReducer from "./userId"

const rootReducer = {
    time: timeReducer,
    attend: attendReducer,
    deleted: deletedReducer,
    userId: userIdReducer
}

const store = configureStore({
    reducer: rootReducer
})

export default store
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer.js";
import { authApi } from "@/features/api/authApi.js";
import { courseApi } from "@/features/api/courseApi.js";
import { purchaseApi } from "@/features/api/purchaseApi.js";
import { courseProgressApi } from "@/features/api/courseProgressApi.js";

export const appStore = configureStore({
     reducer: rootReducer,
     middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware, courseApi.middleware, purchaseApi.middleware , courseProgressApi.middleware) 
});

//function to keep the datails of user when he refreshes

const initializeApp = async()=>{
    await appStore.dispatch(authApi.endpoints.loadUser.initiate({},{forceRefetch:true}))
} 

initializeApp();
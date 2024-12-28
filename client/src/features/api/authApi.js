//RTK query 
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

const USER_API = "https://lms-d2xb.onrender.com/api/v1/user/"

//https://lms-d2xb.onrender.com/api/v1/user/

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: USER_API,
        credentials: 'include'
    }),
    endpoints: (builder)=>({
        //POST krna ho -> to mutation use hota hai
        registerUser: builder.mutation({
            query: (inputdata) =>({
                url: "register",
                method: "POST",
                body: inputdata
            })
        }),

        loginUser: builder.mutation({
            query: (inputdata) =>({
                url: "login",
                method: "POST",
                body: inputdata
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}){
                 try{
                    const result = await queryFulfilled;
                   //dispath the action
                   dispatch(userLoggedIn({user: result.data.user}))
                 } catch(error){
                    console.log("The error is:",error);
                    
                 }
            }
        }),

        logoutUser : builder.mutation({
            query: () => ({
                url: "logout",
                method: "GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}){
                try{
                  //dispath the action
                  dispatch(userLoggedOut());
                } catch(error){
                   console.log("The error is:",error);
                   
                }
           }
        }),

        loadUser : builder.query({
            query: () => ({
                url : "profile",
                method: "GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}){
                try{
                   const result = await queryFulfilled;
                  //dispath the action
                  dispatch(userLoggedIn({user: result.data.user}))
                } catch(error){
                   console.log("The error is:",error);
                   
                }
           }
        }),
        
        updateUser: builder.mutation({
            query: (formData) => ({
                url: "profile/update",
                method: "PUT",
                body: formData,
                credentials:"include"
            })
        })

    })
});

//get krte wqt query use krte h ..Mutation nahi

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation
} = authApi;
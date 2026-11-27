import React from 'react';
export const useAuth=()=>({isAuthenticated:true,isLoading:false,userId:'demo-user',login:async()=>{},logout:async()=>{},refreshTokens:async()=>true});
export const AuthProvider=({children}:any)=>children;

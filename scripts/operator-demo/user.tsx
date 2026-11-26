import React from 'react';
export const user = {userId:'demo-user',name:'Zach Rodgers',email:'zach@example.test',role:'owner'};
export const lot = {lotId:'demo',displayLotId:'HC-001',lotName:'Harbour Centre',companyName:'Harbour Parking',address:'120 Harbour Street',city:'Toronto',state:'ON',zipCode:'M5J 2N8',role:'owner',lotCapacity:120,currentOccupancy:74,registryOn:true,ownerCustomerId:'demo-user',accountStatus:'active',developmentLot:true,isDeleted:false};
const value = {user,userLots:[lot],loading:false,error:null,isServerOffline:false,fetchUserData:async()=>{},fetchUserLots:async()=>[lot],logout:async()=>{},retryConnection:()=>{}};
export const useUser=()=>value;
export const UserProvider=({children}:any)=><>{children}</>;

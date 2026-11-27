import {completePayment} from './api';
export const confirmPaymentWeb=async()=>{completePayment();return {paymentIntent:{status:'Succeeded'}}};
export const confirmPlatformPayPaymentWeb=confirmPaymentWeb;

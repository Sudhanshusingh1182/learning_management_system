import React, { useEffect } from 'react'
import { Button } from './ui/button'
import { useCreateCheckoutSessionMutation } from '@/features/api/purchaseApi'
import { Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const BuyCourseButton = ({courseId}) => {
  const [createCheckoutSession,{data, isSuccess, isLoading, isError, error} ]= useCreateCheckoutSessionMutation();

  const purchaseCourseHandler = async()=>{
    await createCheckoutSession(courseId);
  };
  
  useEffect(()=>{
    if(isSuccess){
       if(data?.url){
         window.location.href = data.url //redirecting to stripe checkout url

       } else{
         toast.error('Invalid response from server')
       }
    }

    if(isError){
       toast.error(error?.data?.message || 'Failed to create checkout')
    }

  },[data,isSuccess,isError,error])
  return (
        <Button disabled={isLoading} onClick={purchaseCourseHandler} className='w-full' >
          {
            isLoading?(<><Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Please wait...
                </> 
            ) : "Purchase Course"
          }
         
        </Button>
  )
}

export default BuyCourseButton
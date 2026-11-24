import React from 'react';
import {toast} from 'sonner';
export default React.forwardRef<HTMLAnchorElement, any>(function Link({href, onClick, children, ...props},ref){
  return <a {...props} ref={ref} href={href} onClick={event=>{event.preventDefault();onClick?.(event);if(href!=='/inventory')toast.info('This preview covers Inventory. More workflows are coming.')}}>{children}</a>;
});

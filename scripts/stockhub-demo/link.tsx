import React from 'react';
import {navigate, usePathname} from './stubs';
export default React.forwardRef<HTMLAnchorElement, any>(function Link({href, onClick, children, ...props},ref){
  const path=usePathname();
  return <a {...props} ref={ref} href={href} onClick={event=>{event.preventDefault();onClick?.(event);if(href!==path)navigate(href)}}>{children}</a>;
});

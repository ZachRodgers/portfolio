import React from 'react';
export default function Image({src,priority, ...props}:any){return <img {...props} src={`./assets/${src.split('/').pop()}`} loading={priority?'eager':'lazy'}/>}

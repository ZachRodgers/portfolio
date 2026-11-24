import React from 'react';
import {cn} from '@/lib/utils';
export function BrandLogo({className}: {className?: string}) {
  return <div className={cn('stockhub-brand', className)}><img src="./assets/stockhub.png" alt="StockHub" /></div>;
}

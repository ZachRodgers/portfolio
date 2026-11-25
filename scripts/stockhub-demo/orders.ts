import {items} from './items';
import {team} from './people';

export const orderGroups = Array.from({length: 24}, (_, index) => {
  const status = index % 3 === 0 ? 'pending' : 'closed';
  const day = String(24 - index % 24).padStart(2, '0');
  const header = {
    nedco_document: `CB-${String(2401 + index)}`,
    customer_document: `PO-${String(7801 + index)}`,
    order_date: `2026-10-${day}`,
    ship_date: status === 'closed' ? `2026-11-${String(1 + index % 20).padStart(2, '0')}` : null,
    warehouse: index % 2 ? 'Ottawa' : 'Toronto',
    ordered_by: team[1 + index % 4].name,
    status,
  };
  const rows = Array.from({length: index === 23 ? 3 : 2 + index % 3}, (_, line) => {
    const item = items[(index * 3 + line) % items.length];
    const quantity = 4 + (index + line) % 12;
    return {...header, id:index * 10 + line, document_type:'order', item_number:item.item_number,
      description:item.description, reel_id:item.reel_id, qty_ordered:String(quantity),
      qty_shipped:String(status === 'closed' ? quantity : 0), uom:'EA'};
  });
  return {header, rows};
});

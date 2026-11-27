const key = (window as any).PARALLEL_MAP_CONFIG?.thunderforestKey || '';
const emptyTile = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
export const atlasTileUrl = key
    ? `https://api.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=${encodeURIComponent(key)}`
    : emptyTile;
export const mapAttribution = '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

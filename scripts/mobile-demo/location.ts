const sampleLocation = { coords: { latitude: 43.6455, longitude: -79.395, accuracy: 50 }, timestamp: Date.now() };
export const Accuracy = { Balanced: 3, High: 4 };
export const requestForegroundPermissionsAsync = async () => ({ status: 'granted', granted: true });
export const getCurrentPositionAsync = async () => sampleLocation;
export const getLastKnownPositionAsync = async () => sampleLocation;
export const watchPositionAsync = async (_options: unknown, callback: (value: typeof sampleLocation) => void) => { callback(sampleLocation); return { remove() {} }; };
export const geocodeAsync = async () => [];
export const reverseGeocodeAsync = async () => [];

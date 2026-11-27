module.exports = function adaptMap(contents) {
  const header = '<TopBar actions={topBarActions} onLogoPress={handleLogoRefresh} />';
  const card = '<LotFocusCard lot={focusLot} pricing={focusPricing} onClose={() => { setFocusLot(null); setFocusPricing(null); }} />';
  if (!contents.includes(header) || !contents.includes(card) || !contents.includes('top: 80,')) throw new Error('Map header or lot card source changed');
  return `import { LotFocusCard as IosLotFocusCard } from '../../components/LotFocusCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lotAdvancedPricingService as demoAdvancedPricing } from '../../api/api';
` + contents
    .replace(header, '<TopBar actions={topBarActions} onLogoPress={handleLogoRefresh} useGlassEffect />')
    .replace('top: 80,', 'top: 138,')
    .replaceAll('latitudeDelta: 0.0922', 'latitudeDelta: 0.045')
    .replace('showsUserLocation={true}', 'showsUserLocation={false}')
    .replace('const [focusLot, setFocusLot]', `const [demoFavorites, setDemoFavorites] = useState<Set<string>>(new Set());
    useEffect(() => { AsyncStorage.getItem('parking_lot_favorites').then(value => { if (value) setDemoFavorites(new Set(JSON.parse(value))); }); }, []);
    const toggleDemoFavorite = (lotId: string) => {
        setDemoFavorites(previous => {
            const next = new Set(previous);
            if (next.has(lotId)) next.delete(lotId); else next.add(lotId);
            void AsyncStorage.setItem('parking_lot_favorites', JSON.stringify([...next]));
            return next;
        });
    };
    const [focusLot, setFocusLot]`)
    .replace(card, `<DemoIosLotFocusCard
        lot={focusLot}
        pricing={focusPricing}
        visible
        isFavorite={demoFavorites.has(focusLot.lotId)}
        onToggleFavorite={() => toggleDemoFavorite(focusLot.lotId)}
        onClose={() => { setFocusLot(null); setFocusPricing(null); }}
        onSwipeNext={() => handleLocationSelect(parkingLots[(parkingLots.findIndex(lot => lot.lotId === focusLot.lotId) + 1) % parkingLots.length])}
        onSwipePrev={() => handleLocationSelect(parkingLots[(parkingLots.findIndex(lot => lot.lotId === focusLot.lotId) - 1 + parkingLots.length) % parkingLots.length])}
    />`) + `
function DemoIosLotFocusCard(props: any) {
 const [advancedPricing, setAdvancedPricing] = React.useState<any[]>([]);
 React.useEffect(() => { let active = true; setAdvancedPricing([]); if (props.lot.advancedPricingOn) demoAdvancedPricing.getActiveAdvancedPricing(props.lot.lotId).then((result: any[]) => { if (active) setAdvancedPricing(result); }); return () => { active = false; }; }, [props.lot.lotId]);
 return <IosLotFocusCard {...props} advancedPricing={advancedPricing} />;
}
`;
};

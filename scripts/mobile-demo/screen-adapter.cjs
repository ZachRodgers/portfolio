const path = require('path');
module.exports = (contents, file) => {
 const name = path.basename(file);
 let result = contents.replaceAll('paddingHorizontal: 24,', 'paddingHorizontal: 18,').replaceAll('paddingHorizontal: 20,', 'paddingHorizontal: 16,');
 if (['Wallet.tsx','Plates.tsx','AccountSettings.tsx','PreviousVisits.tsx','Pay.tsx'].includes(name)) {
   result = result.replace('paddingTop: 60', `paddingTop: ${name === 'Wallet.tsx' ? 125 : 108}`);
 }
 if (name === 'CurrentVisit.tsx') result = result.replaceAll('showsUserLocation={true}', 'showsUserLocation={false}').replaceAll('latitudeDelta: 0.0012', 'latitudeDelta: 0.008').replaceAll('longitudeDelta: 0.0012', 'longitudeDelta: 0.008');
 if (name === 'Wallet.tsx') result = result.replace('borderColor: colors.text,\n        borderWidth: 1.2,', 'borderColor: colors.blue,\n        borderWidth: 1.2,').replaceAll('thumbColor={colors.white}', 'thumbColor={colors.white} activeThumbColor={colors.white}');
 if (name === 'Plates.tsx' || name === 'AccountSettings.tsx') {
   result = result.replaceAll('placeholder="AAAA000"', 'placeholder="ABC123"').replaceAll('>AAAA000</Text>', '>ABC123</Text>');
   result = result.replaceAll("fontFamily: 'oxanium'", "fontFamily: 'Oxanium'");
   result = result.replace(/addPlateText: \{([\s\S]*?)fontSize: 22,/, 'addPlateText: {$1fontSize: 18,');
 }
 if (name === 'PreviousVisits.tsx') {
   result = result.replace('<Text style={styles.footerText}>All previous visits displayed</Text>', '').replace("flexDirection: 'row',\n      flexWrap: 'wrap',\n      gap: 12,", "flexDirection: 'column',\n      gap: 0,");
   result = result.replaceAll('latitudeDelta: 0.0009', 'latitudeDelta: 0.008').replaceAll('longitudeDelta: 0.0009', 'longitudeDelta: 0.008');
   result = result.replace('width: 130,\n    height: 130,', 'width: 100,\n    height: 130,').replace('right: 150, // just left of the map preview (map wrapper width is ~130 + margins)', 'right: 106,');
   result = result.replace('cardLeft: {\n    flex: 1,', 'cardLeft: {\n    flex: 1,\n    minWidth: 0,');
 }
 return result;
};

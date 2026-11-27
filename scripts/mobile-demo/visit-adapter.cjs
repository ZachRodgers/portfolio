module.exports = function adaptVisits(source) {
  return source
    .replaceAll("{Platform.OS !== 'web' && (", '{(')
    .replaceAll('<View style={styles.cardRightMapWrapper}>\n                        <View>', '<View style={styles.cardRightMapWrapper}>\n                        <View style={{flex: 1}}>')
    .replaceAll('latitudeDelta: 0.0009', 'latitudeDelta: 0.008')
    .replaceAll('longitudeDelta: 0.0009', 'longitudeDelta: 0.008')
    .replace('cardLeft: { flex: 1, paddingRight: 12 }', 'cardLeft: { flex: 1, minWidth: 0, paddingRight: 8 }')
    .replaceAll('right: 150,', 'right: 106,')
    .replace('width: 130,\n        height: 130,', 'width: 100,\n        height: 125,')
    .replace('marginTop: -20,\n        marginBottom: -15,\n        marginRight: -20,', 'marginTop: -14,\n        marginBottom: -14,\n        marginRight: -16,')
    .replace('<View style={styles.content}>\n                    {(loading || unpaidTotal > 0)', '<View nativeID="demo-visit-content" style={styles.content}>\n                    {(loading || unpaidTotal > 0)');
};

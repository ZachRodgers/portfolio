module.exports = contents => {
 const before = 'outputRange: [collapsedCardWidth, currentWindowWidth],';
 const glass = "glassContainer: {\n        width: '100%',\n        height: '100%',";
 if (!contents.includes(before) || !contents.includes(glass)) throw Error('Map search layout source changed');
 return contents.replace('<AnimatedGlassView\n                        intensity={100}', '<AnimatedGlassView\n                        nativeID="mobile-search-glass"\n                        intensity={100}')
   .replace(before, 'outputRange: [collapsedCardWidth, currentWindowWidth - 12],')
   .replace('outputRange: [COLLAPSED_BOTTOM_OFFSET + safeBottom, 0],', 'outputRange: [COLLAPSED_BOTTOM_OFFSET + safeBottom, 12],')
   .replace('top: COLLAPSED_CARD_PADDING / 2,\n        alignSelf:', "top: COLLAPSED_CARD_PADDING / 2,\n        left: '50%',\n        marginLeft: -23,\n        alignSelf:")
   .replace(glass, glass + "\n        overflow: 'hidden',");
};

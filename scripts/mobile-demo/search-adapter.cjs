module.exports = contents => {
 const before = 'outputRange: [collapsedCardWidth, currentWindowWidth],';
 const glass = "glassContainer: {\n        width: '100%',\n        height: '100%',";
 if (!contents.includes(before) || !contents.includes(glass)) throw Error('Map search layout source changed');
 return contents.replace(before, 'outputRange: [collapsedCardWidth, currentWindowWidth - 24],')
   .replace('outputRange: [COLLAPSED_BOTTOM_OFFSET + safeBottom, 0],', 'outputRange: [COLLAPSED_BOTTOM_OFFSET + safeBottom, 12],')
   .replace(glass, glass + "\n        overflow: 'hidden',");
};

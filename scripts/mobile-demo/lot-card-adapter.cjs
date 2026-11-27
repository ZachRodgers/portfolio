module.exports = function adaptLotCard(contents) {
  const handle = '<View style={styles.handleContainer} {...panResponder.panHandlers}>';
  if (!contents.includes(handle)) throw new Error('Lot card handle source changed');
  const width = 'const width = windowWidth - (progress * 32);';
  const margin = 'const margin = progress * 16;';
  const height = 'const EXPANDED_CARD_HEIGHT = windowHeight - SNAP_TOP;';
  if (!contents.includes(width) || !contents.includes(margin) || !contents.includes(height)) throw new Error('Lot card dimensions source changed');
  return contents
    .replace('<AnimatedGlassView\n                        intensity={100}', '<AnimatedGlassView\n                        nativeID="mobile-lot-glass"\n                        intensity={100}')
    .replace(width, 'const width = windowWidth - 12 - (progress * 20);')
    .replace(margin, 'const margin = 6 + progress * 10;')
    .replace(height, 'const EXPANDED_CARD_HEIGHT = windowHeight - SNAP_TOP - 12;')
    .replace('const panResponder = React.useRef(', `const webGesture = React.useRef<any>(null);
    const snapWebSheet = (target: number) => {
        setCurrentSnap(target === SNAP_TOP ? '10' : '65');
        Animated.spring(translateY, { toValue: target, useNativeDriver: false, ...CARD_STYLES.spring.snappy }).start(() => { if (target === windowHeight) onClose(); });
    };
    const webHandle = {
        onPointerDown: (event: any) => {
            event.preventDefault(); event.stopPropagation();
            webGesture.current = { x: event.clientX, y: event.clientY, top: lastPosition.current };
            event.currentTarget.setPointerCapture(event.pointerId);
        },
        onPointerMove: (event: any) => {
            const start = webGesture.current;
            if (!start) return;
            event.stopPropagation();
            const dy = event.clientY - start.y;
            if (Math.abs(dy) > 10) translateY.setValue(Math.max(SNAP_TOP, Math.min(windowHeight, start.top + dy)));
        },
        onPointerUp: (event: any) => {
            const start = webGesture.current;
            if (!start) return;
            event.stopPropagation(); webGesture.current = null;
            const dx = event.clientX - start.x, dy = event.clientY - start.y;
            if (Math.abs(dx) > 40 && Math.abs(dy) < 30 && currentSnap === '65') { void runHorizontalSwipe(dx > 0 ? 'next' : 'prev'); return; }
            if (Math.abs(dy) < 10) { snapWebSheet(currentSnap === '65' ? SNAP_TOP : SNAP_MID); return; }
            const position = lastPosition.current;
            snapWebSheet(position < (SNAP_TOP + SNAP_MID) / 2 ? SNAP_TOP : position > (SNAP_MID + windowHeight) / 2 ? windowHeight : SNAP_MID);
        },
        onPointerCancel: () => { webGesture.current = null; snapWebSheet(currentSnap === '65' ? SNAP_MID : SNAP_TOP); },
        onKeyDown: (event: any) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); snapWebSheet(currentSnap === '65' ? SNAP_TOP : SNAP_MID); } },
    };
    const panResponder = React.useRef(`)
    .replace(handle, '<View style={[styles.handleContainer, Platform.OS === "web" && { touchAction: "none", cursor: "grab" } as any]} accessibilityRole="button" accessibilityLabel="Expand or collapse lot details" {...(Platform.OS === "web" ? webHandle : panResponder.panHandlers)}>')
    .replaceAll('accessibilityLabel=', 'accessibilityRole="button" accessibilityLabel=')
    .replace('accessibilityRole="button" accessibilityRole="button"', 'accessibilityRole="button"')
    .replace('const openInMaps = () => {', `const openInMaps = () => {
        if (Platform.OS === 'web') return;`);
};

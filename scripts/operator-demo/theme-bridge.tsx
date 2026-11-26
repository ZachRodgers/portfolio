import React, { useEffect } from 'react';
import { useTheme } from 'operator/contexts/ThemeContext';

const replayKeys = [
  'ai_chat_width', 'ai_chat_visibility', 'ai_chat_mode_preferences',
  'ai_chat_active_conversations', 'ai_chat_last_agent_confirm', 'ai_chat_last_data_consent',
  'walkthrough_completed_v1', 'lastDashboardTab'
];

export default function DemoBridge() {
  const { isDarkMode, setThemeMode } = useTheme();

  useEffect(() => {
    window.parent.postMessage({ type: 'stockhub-theme', theme: isDarkMode ? 'dark' : 'light' }, window.location.origin);
  }, [isDarkMode]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type === 'stockhub-set-theme' && (event.data.theme === 'dark' || event.data.theme === 'light')) {
        setThemeMode(event.data.theme);
      } else if (event.data?.type === 'mc-demo' && event.data.action === 'replay') {
        replayKeys.forEach(key => localStorage.removeItem(key));
        sessionStorage.removeItem('operator_demo_walkthrough_session');
        if (process.env.SUPERADMIN_DEMO === 'true') sessionStorage.removeItem('superadmin_preview_mode');
        window.location.reload();
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [setThemeMode]);

  return null;
}

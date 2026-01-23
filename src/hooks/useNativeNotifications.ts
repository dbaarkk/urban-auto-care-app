'use client';

import { useState, useCallback } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const useNativeNotifications = () => {
  const [status, setStatus] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Push notifications are only available on native platforms');
      return false;
    }

    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive === 'granted') {
        await PushNotifications.register();
        setStatus('granted');
        return true;
      } else {
        setStatus('denied');
        return false;
      }
    } catch (err) {
      console.error('Error requesting notification permission', err);
      setStatus('error');
      return false;
    }
  }, []);

  return { requestPermission, status };
};

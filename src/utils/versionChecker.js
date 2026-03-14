import { useState, useEffect } from 'react';

const VERSION_CHECK_INTERVAL = 60000; // 60 seconds

export const useVersionChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const fetchVersion = async () => {
    try {
      const response = await fetch('/version.json', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch version: ${response.status}`);
      }

      const data = await response.json();
      const currentVersion = data.version;
      
      const storedVersion = localStorage.getItem('appVersion');

      if (storedVersion && storedVersion !== currentVersion) {
        setUpdateAvailable(true);
      }

      localStorage.setItem('appVersion', currentVersion);
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  useEffect(() => {
    fetchVersion();

    const interval = setInterval(fetchVersion, VERSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload(true);
  };

  return { updateAvailable, handleRefresh };
};
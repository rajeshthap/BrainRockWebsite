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
      const latestVersion = data.version;
      
      const storedVersion = localStorage.getItem('appVersion');

      // Initialize localStorage with current version on first load
      if (!storedVersion) {
        localStorage.setItem('appVersion', latestVersion);
        return;
      }

      // Check if version differs
      if (storedVersion !== latestVersion) {
        setUpdateAvailable(true);
      }
      
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
    // Get the latest version from version.json before reloading
    fetch('/version.json', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('appVersion', data.version);
        window.location.reload(true);
      })
      .catch(error => {
        console.error('Error fetching latest version before refresh:', error);
        window.location.reload(true);
      });
  };

  return { updateAvailable, handleRefresh };
};
import { useState, useEffect, useCallback } from 'react';

const AutoPoller = () => {
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/markets');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setLastUpdate(new Date().toLocaleTimeString());
      console.log('Data fetched:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isPolling) {
      // Initial fetch
      fetchData();
      // Set up polling every 30 seconds
      interval = setInterval(fetchData, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, fetchData]);

  return (
    <div className="auto-poller">
      <button
        onClick={() => setIsPolling(!isPolling)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: isPolling ? '#ff4444' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s'
        }}
      >
        {isPolling ? 'Stop Auto-Polling' : 'Start Auto-Polling'}
      </button>
      {lastUpdate && (
        <p>Last update: {lastUpdate}</p>
      )}
    </div>
  );
};

export default AutoPoller;

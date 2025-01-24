import { useState } from 'react';

const Buttons = () => {
  const [interval, setInterval] = useState('');

  const handleFetchOnce = () => {
    fetch('/fetchOnce')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response not ok.');
        }
        return response.text();
      })
      .then((data) => {
        console.log('fetchOnce response: ', data);
      })
      .catch((error) => {
        console.error('Error fetching once: ', error);
      });
  };

  const handleFetchInterval = async () => {
    const intValue = interval || 10000;
    
    try {
      // First try to fetch interval
      const response = await fetch(`/fetchInterval?interval=${intValue}`);
      const data = await response.text();
      
      if (!response.ok) {
        // If we get a 400, try fetching once first
        if (response.status === 400) {
          console.log('Market data not cached, fetching initial data...');
          const initResponse = await fetch('/fetchOnce');
          if (!initResponse.ok) {
            throw new Error('Failed to fetch initial data');
          }
          // Now try interval fetch again
          const retryResponse = await fetch(`/fetchInterval?interval=${intValue}`);
          if (!retryResponse.ok) {
            throw new Error('Failed to start interval after initial fetch');
          }
          console.log('Successfully started interval after initial fetch');
        } else {
          throw new Error('Network response not ok.');
        }
      } else {
        console.log('fetchInterval response: ', data);
      }
    } catch (error) {
      console.error('Error fetching interval: ', error);
    }
  };

  const handleEndIntervalFetch = () => {
    fetch('/endIntervalFetch')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response not ok.');
        }
        return response.text();
      })
      .then((data) => {
        console.log('endIntervalFetch response: ', data);
      })
      .catch((error) => {
        console.error('Error ending interval fetch: ', error);
      });
  };

  return (
    <div>
      <button onClick={handleFetchOnce}>Fetch Once</button>
      <div>
        <input
          type="number"
          placeholder="Enter int (ms)"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        />
        <button onClick={handleFetchInterval}>Fetch Interval</button>
      </div>
      <button onClick={handleEndIntervalFetch}>End Interval Fetch</button>
    </div>
  );
};

export default Buttons;

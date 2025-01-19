import { useState } from 'react';

const Buttons = () => {
  const [interval, setInterval] = useState('');

  const handleFetchOnce = () => {
    fetch('/api/fetchOnce')
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

  const handleFetchInterval = () => {
    const intValue = interval || 10000;
    fetch(`/api/fetchInterval?interval=${intValue}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response not ok.');
        }
        return response.text();
      })
      .then((data) => {
        console.log('fetchInterval response: ', data);
      })
      .catch((error) => {
        console.error('Error fetching interval: ', error);
      });
  };

  const handleEndIntervalFetch = () => {
    fetch('/api/endIntervalFetch')
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

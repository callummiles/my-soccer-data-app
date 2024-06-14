import { useState } from 'react';

const TestRoute = () => {
  const [message, setMessage] = useState('');

  const handleTestRoute = () => {
    fetch('/message')
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.error('Error testing route: ', error);
      });
  };

  return (
    <div>
      <button onClick={handleTestRoute}>Test Route</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TestRoute;

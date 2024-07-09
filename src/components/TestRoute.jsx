import { useState } from 'react';

const TestRoute = () => {
  const [message, setMessage] = useState('');

  const handleTestRoute = () => {
    if (message !== '') {
      console.log('Resetting message.');
      setMessage('');
    } else {
      fetch('/message')
        .then((response) => {
          //console.log(response);
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setMessage(data.message);
        })
        .catch((error) => {
          console.error('Error testing route: ', error);
        });
    }
  };

  return (
    <div>
      <button onClick={handleTestRoute}>Test Route</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TestRoute;

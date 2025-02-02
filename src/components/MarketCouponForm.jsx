import { useState } from 'react';
import { useAuth } from '../context/authUtils';

const MarketCouponForm = () => {
  const [couponName, setCouponName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/apply-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ couponName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply coupon');
      }

      setMessage({ type: 'success', text: 'Coupon applied successfully!' });
      setCouponName('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to apply coupon',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-5 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Apply Market Coupon
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            value={couponName}
            onChange={(e) => setCouponName(e.target.value)}
            placeholder="Enter coupon name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors duration-150 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? 'Applying...' : 'Apply Coupon'}
        </button>
      </form>
      {message.text && (
        <div
          className={`mt-4 p-3 rounded-md ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default MarketCouponForm;

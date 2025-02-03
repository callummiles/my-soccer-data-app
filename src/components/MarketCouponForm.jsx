import { useState } from 'react';

const COUPON_NAMES = ['FTS Leagues'];

const MarketCouponForm = () => {
  const [couponName, setCouponName] = useState(COUPON_NAMES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/applyCoupon', {
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
      setCouponName(COUPON_NAMES[0]);
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
    <div className="max-w-md mx-auto my-5 p-6 bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-white mb-4">
        Apply Market Coupon
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <select
            value={couponName}
            onChange={(e) => setCouponName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {COUPON_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? 'Applying...' : 'Apply Coupon'}
        </button>
      </form>
      {message.text && (
        <div
          className={`mt-4 p-3 rounded-md ${
            message.type === 'error'
              ? 'bg-red-900/50 text-red-200 border border-red-800'
              : 'bg-green-900/50 text-green-200 border border-green-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default MarketCouponForm;

import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.post('/apply-coupon', async (req, res) => {
  try {
    const { couponName } = req.body;

    // Get the auth token from the request headers
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const response = await fetch(
      'https://api.cwm18.com/api/guardian/v1.0/applyCoupon',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken, // Forward the auth token
        },
        body: JSON.stringify({
          couponName,
          clearOption: 'DONT_CLEAR',
          watchListNumber: 1,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to apply coupon');
    }

    res.json({ success: true, message: 'Coupon applied successfully' });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to apply coupon',
    });
  }
});

export default router;

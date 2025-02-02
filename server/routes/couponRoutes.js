import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.post('/apply-coupon', async (req, res) => {
  try {
    const { couponName } = req.body;
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const response = await fetch(
      'https://api.cwm18.com/api/guardian/v1.0/applyCoupon',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
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
      const errorMessage = data.message || 'Failed to apply coupon';
      console.error('API Error:', errorMessage);
      return res.status(response.status).json({
        success: false,
        message: errorMessage,
      });
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data,
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to apply coupon',
    });
  }
});

export default router;

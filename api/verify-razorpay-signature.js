import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.status(200).json({ valid: true });
    } else {
      return res.status(400).json({ valid: false, error: 'Invalid signature' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Signature verification failed' });
  }
}

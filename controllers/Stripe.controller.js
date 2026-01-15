import Stripe from "stripe";
import LoginCredentials from "../models/LoginCredentials.js";
import dotenv from 'dotenv'

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ------------------- CREATE CHECKOUT SESSION -------------------
export const getConfimation = async (req, res) => {
  try {
    const user = req.user; // from auth middleware

    if (!user)
      return res.status(401).json({ message: "Unauthorized" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Membership",
            },
            unit_amount: 500, // $5 for testing
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.CLIENT_ORIGIN}/premium-success`,
      cancel_url: `${process.env.CLIENT_ORIGIN}/premium-cancel`,
      metadata: {
        userId: user.id,
      },
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe checkout error", err);
    res.status(500).json({ message: "Stripe error", error: err.message });
  }
};



// ------------------- HANDLE WEBHOOK -------------------
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Payment completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;

    // Activate premium for 30 days
    await LoginCredentials.findByIdAndUpdate(userId, {
      isPremium: true,
      premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    console.log("Congrats Premium activated for user:", userId);
  }

  res.json({ received: true });
};

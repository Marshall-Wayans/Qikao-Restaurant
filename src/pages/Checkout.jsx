import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  PhoneIcon,
} from "lucide-react";
import "./Checkout.css";

const Checkout = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Restore form data, order step, and M-Pesa info from localStorage
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("checkoutFormData");
    return saved
      ? JSON.parse(saved)
      : {
          name: user?.name || "",
          email: user?.email || "",
          phone: "",
          address: "",
          city: "",
          zipCode: "",
          paymentMethod: "mpesa",
        };
  });

  const [orderStep, setOrderStep] = useState(() => {
    const savedStep = localStorage.getItem("checkoutOrderStep");
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  const [mpesaNumber, setMpesaNumber] = useState(
    localStorage.getItem("checkoutMpesaNumber") || ""
  );
  const [mpesaCode, setMpesaCode] = useState(
    localStorage.getItem("checkoutMpesaCode") || ""
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [showMpesaPrompt, setShowMpesaPrompt] = useState(false);

  // 🔹 Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("checkoutFormData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem("checkoutOrderStep", orderStep.toString());
  }, [orderStep]);

  useEffect(() => {
    localStorage.setItem("checkoutMpesaNumber", mpesaNumber);
    localStorage.setItem("checkoutMpesaCode", mpesaCode);
  }, [mpesaNumber, mpesaCode]);

  // 🔹 If cart gets cleared manually, reset progress
  useEffect(() => {
    if (items.length === 0 && orderStep !== 3) {
      setOrderStep(1);
    }
  }, [items, orderStep]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitDeliveryInfo = (e) => {
    e.preventDefault();
    setOrderStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (formData.paymentMethod === "mpesa") {
      setShowMpesaPrompt(true);
    } else {
      processOrder();
    }
  };

  const handleMpesaSubmit = (e) => {
    e.preventDefault();
    processOrder();
  };

  const processOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOrderStep(3);
      clearCart();
      localStorage.clear(); // clear storage after successful order
    }, 2000);
  };

  const handleContinueShopping = () => navigate("/menu");

  if (items.length === 0 && orderStep !== 3) {
    return (
      <>
        <Navbar />
        <div className="checkout-empty">
          <div className="checkout-empty-box">
            <ShoppingBagIcon className="checkout-empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items yet.</p>
            <Button onClick={() => navigate("/menu")} variant="primary">
              Browse Menu
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="checkout-wrapper">
        <header className="checkout-header">
          <h1>Checkout</h1>
          {orderStep !== 3 && <p>Complete your order in a few easy steps</p>}
        </header>

        {/* Step 1: Delivery Info */}
        {orderStep === 1 && (
          <div className="checkout-grid">
            <div className="checkout-left">
              <section className="checkout-section order-items">
                <h2>Your Order</h2>
                {items.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <img src={item.image} alt={item.name} />
                    <div className="checkout-item-info">
                      <h3>{item.name}</h3>
                      <p>${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="checkout-item-quantity">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <MinusIcon size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <PlusIcon size={16} />
                      </button>
                    </div>
                    <div className="checkout-item-total">
                      <p>${(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="checkout-remove"
                      >
                        <TrashIcon size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </section>

              <section className="checkout-section delivery-info">
                <h2>Delivery Information</h2>
                <form onSubmit={handleSubmitDeliveryInfo} className="checkout-form">
                  <input name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name" />
                  <input name="email" value={formData.email} onChange={handleChange} required placeholder="Email" />
                  <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone Number" />
                  <textarea name="address" value={formData.address} onChange={handleChange} required placeholder="Address" />
                  <input name="city" value={formData.city} onChange={handleChange} required placeholder="City" />
                  <input name="zipCode" value={formData.zipCode} onChange={handleChange} required placeholder="Postal/ZIP Code" />
                  <Button type="submit" variant="primary" fullWidth>
                    Continue to Payment
                  </Button>
                </form>
              </section>
            </div>

            <aside className="checkout-right">
              <div className="checkout-summary">
                <h2>Order Summary</h2>
                <p>Subtotal: ${totalPrice.toFixed(2)}</p>
                <p>Delivery Fee: $2.99</p>
                <p>Tax: ${(totalPrice * 0.16).toFixed(2)}</p>
                <hr />
                <p className="checkout-total">
                  Total: ${(totalPrice + 2.99 + totalPrice * 0.16).toFixed(2)}
                </p>
              </div>
            </aside>
          </div>
        )}

        {/* Step 2: Payment */}
        {orderStep === 2 && (
          <div className="checkout-section payment-method">
            <h2>Payment Method</h2>
            <form onSubmit={handlePaymentSubmit} className="checkout-form">
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mpesa"
                  checked={formData.paymentMethod === "mpesa"}
                  onChange={handleChange}
                />
                <PhoneIcon size={16} /> M-Pesa
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === "card"}
                  onChange={handleChange}
                />
                <CreditCardIcon size={16} /> Credit/Debit Card
              </label>
              <Button type="submit" variant="primary" fullWidth>
                Place Order
              </Button>
            </form>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {orderStep === 3 && (
          <div className="checkout-confirm">
            <div className="checkout-confirm-box">
              <div className="checkout-confirm-icon">✔</div>
              <h2>Thank You for Your Order!</h2>
              <p>Your order has been placed successfully.</p>
              <p className="checkout-order-id">
                Order Number: #QK{Math.floor(100000 + Math.random() * 900000)}
              </p>
              <Button onClick={handleContinueShopping} variant="primary">
                Continue Shopping
              </Button>
            </div>
          </div>
        )}

        {/* M-Pesa Payment Prompt */}
        {showMpesaPrompt && (
          <div className="checkout-overlay">
            <div className="checkout-mpesa">
              <h3>M-Pesa Payment</h3>
              <form onSubmit={handleMpesaSubmit}>
                <input
                  type="tel"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  required
                />
                <input
                  type="text"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value)}
                  placeholder="Enter M-Pesa Code (e.g. QK123456)"
                  required
                />
                <div className="checkout-mpesa-actions">
                  <button
                    type="button"
                    onClick={() => setShowMpesaPrompt(false)}
                    className="checkout-cancel"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary">
                    Confirm Payment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Checkout;

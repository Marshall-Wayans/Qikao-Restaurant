// src/pages/Checkout.jsx
// M-Pesa integration uses Daraja API (Safaricom).
// Setup instructions are in the comment block below.
// Payment options: STK Push, Paybill, Buy Goods, QR Code

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import {
  TrashIcon, PlusIcon, MinusIcon,
  ShoppingBagIcon, PhoneIcon, QrCodeIcon,
  BuildingIcon, ShoppingCartIcon, CheckCircleIcon,
  LoaderIcon, ArrowLeftIcon,
} from "lucide-react";
import { Orders, Notifications } from "../store/localStore";
import "./Checkout.css";

/* ================================================================
   MPESA DARAJA API SETUP INSTRUCTIONS
   ================================================================
   1. Go to https://developer.safaricom.co.ke and create an account
   2. Create an app — you'll get a Consumer Key and Consumer Secret
   3. For STK Push (Lipa na M-Pesa Online), you need:
      - Business Short Code (Paybill or Till Number)
      - Passkey (from Safaricom portal)
      - Callback URL (a public HTTPS URL — use ngrok for local dev)

   4. Create a backend endpoint (Node/Express example):

      POST /api/mpesa/stkpush
      Body: { phone, amount, orderId }

      // In your server.js:
      const axios = require("axios");

      async function getToken() {
        const res = await axios.get(
          "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
          { auth: { username: CONSUMER_KEY, password: CONSUMER_SECRET } }
        );
        return res.data.access_token;
      }

      app.post("/api/mpesa/stkpush", async (req, res) => {
        const token = await getToken();
        const { phone, amount, orderId } = req.body;
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
        const password = Buffer.from(SHORT_CODE + PASSKEY + timestamp).toString("base64");

        const response = await axios.post(
          "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
          {
            BusinessShortCode: SHORT_CODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phone,           // 254XXXXXXXXX format
            PartyB: SHORT_CODE,
            PhoneNumber: phone,
            CallBackURL: "https://yourdomain.com/api/mpesa/callback",
            AccountReference: orderId,
            TransactionDesc: "Qikao Grill Order"
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        res.json(response.data);
      });

   5. For production, change sandbox URLs to:
      https://api.safaricom.co.ke/...

   6. The callback URL receives payment confirmation — update your
      order status in the database from there.
   ================================================================ */

const MPESA_PAYBILL   = "174379";   // ← replace with your paybill
const MPESA_TILL      = "5678901";  // ← replace with your till
const MPESA_ACCOUNT   = "QIKAO";    // ← account reference

const PAYMENT_OPTIONS = [
  {
    id: "stk",
    label: "M-Pesa STK Push",
    icon: "📲",
    desc: "Enter phone number — get a payment prompt on your phone instantly",
    tag: "Recommended",
  },
  {
    id: "paybill",
    label: "M-Pesa Paybill",
    icon: "🏦",
    desc: `Go to M-Pesa → Lipa na M-Pesa → Pay Bill → ${MPESA_PAYBILL}`,
    tag: null,
  },
  {
    id: "buygoods",
    label: "Buy Goods (Till)",
    icon: "🛒",
    desc: `Go to M-Pesa → Lipa na M-Pesa → Buy Goods → Till ${MPESA_TILL}`,
    tag: null,
  },
  {
    id: "qr",
    label: "M-Pesa QR Code",
    icon: "📱",
    desc: "Scan the QR code with your M-Pesa app to pay",
    tag: "Coming Soon",
    disabled: true,
  },
];

export default function Checkout() {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=cart+delivery, 2=payment, 3=confirm
  const [formData, setFormData] = useState({
    name:    user?.name  || "",
    email:   user?.email || "",
    phone:   "",
    address: "",
    city:    "",
    zipCode: "",
  });
  const [paymentOption, setPaymentOption] = useState("stk");
  const [mpesaPhone, setMpesaPhone]       = useState(user?.phone || "");
  const [mpesaCode, setMpesaCode]         = useState("");
  const [stkState, setStkState]           = useState("idle"); // idle | pending | success | failed
  const [stkMessage, setStkMessage]       = useState("");
  const [orderId, setOrderId]             = useState("");
  const [processing, setProcessing]       = useState(false);
  const [errors, setErrors]               = useState({});

  const deliveryFee = 300;
  const tax         = Math.round(totalPrice * 0.16);
  const grandTotal  = totalPrice + deliveryFee + tax;

  useEffect(() => {
    if (items.length === 0 && step !== 3) setStep(1);
  }, [items]);

  const validate = () => {
    const e = {};
    if (!formData.name.trim())    e.name    = "Name is required";
    if (!formData.email.trim())   e.email   = "Email is required";
    if (!formData.phone.trim())   e.phone   = "Phone is required";
    if (!formData.address.trim()) e.address = "Address is required";
    if (!formData.city.trim())    e.city    = "City is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: undefined }));
  };

  /* ---- STK Push (calls your backend) ---- */
  async function initiateSTKPush() {
    if (!mpesaPhone.trim()) { setStkMessage("Please enter your M-Pesa phone number."); return; }

    // Normalize phone: 07XX → 2547XX
    let phone = mpesaPhone.replace(/\s/g, "");
    if (phone.startsWith("07")) phone = "254" + phone.slice(1);
    if (phone.startsWith("+"))  phone = phone.slice(1);

    setStkState("pending");
    setStkMessage("Sending payment request to your phone…");

    try {
      // Uncomment and point to your backend when ready:
      // const res = await fetch("/api/mpesa/stkpush", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ phone, amount: grandTotal, orderId }),
      // });
      // const data = await res.json();
      // if (data.ResponseCode === "0") { ... }

      // ---- SIMULATION (remove when backend is live) ----
      await new Promise((r) => setTimeout(r, 2500));
      setStkState("success");
      setStkMessage("✅ Payment request sent! Enter your M-Pesa PIN on your phone to complete.");
      // After real payment confirmation via callback, call finaliseOrder()
    } catch (err) {
      setStkState("failed");
      setStkMessage("Failed to send payment request. Check your number and try again.");
    }
  }

  /* ---- Finalise order (save + notify admin) ---- */
  async function finaliseOrder() {
    setProcessing(true);
    const id = `QK${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(id);

    Orders.add({
      orderId:   id,
      customer:  formData.name,
      email:     formData.email,
      phone:     formData.phone,
      address:   `${formData.address}, ${formData.city}`,
      items:     items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      subtotal:  totalPrice,
      deliveryFee,
      tax,
      total:     grandTotal,
      paymentMethod: paymentOption,
      status:    "Processing",
      userId:    user?.id || "guest",
    });

    Notifications.add({
      type:       "order",
      title:      "New Order Placed 🛒",
      message:    `${formData.name} placed order #${id} — Ksh ${grandTotal.toLocaleString()}`,
      targetRole: "admin",
      senderUid:  user?.id  || "guest",
      senderName: formData.name,
      senderRole: "user",
    });

    await new Promise((r) => setTimeout(r, 1200));
    clearCart();
    setStep(3);
    setProcessing(false);
  }

  if (items.length === 0 && step !== 3) {
    return (
      <>
        <Navbar />
        <div className="checkout-empty">
          <div className="checkout-empty-box">
            <ShoppingBagIcon className="checkout-empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items yet.</p>
            <Button onClick={() => navigate("/menu")} variant="primary">Browse Menu</Button>
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

        {/* Step indicator */}
        {step !== 3 && (
          <div className="ck-steps">
            {["Your Order", "Payment", "Confirmation"].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`ck-step ${step > i ? "done" : step === i + 1 ? "active" : ""}`}>
                  <div className="ck-step-num">{step > i + 1 ? "✓" : i + 1}</div>
                  <span>{s}</span>
                </div>
                {i < 2 && <div className={`ck-step-line ${step > i + 1 ? "done" : ""}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ===== STEP 1: Delivery ===== */}
        {step === 1 && (
          <div className="checkout-grid">
            <div className="checkout-left">
              <section className="checkout-section">
                <h2>Your Order</h2>
                {items.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <img src={item.image} alt={item.name} />
                    <div className="checkout-item-info">
                      <h3>{item.name}</h3>
                      <p>Ksh {item.price.toLocaleString()} each</p>
                    </div>
                    <div className="checkout-item-quantity">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><MinusIcon size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><PlusIcon size={14} /></button>
                    </div>
                    <div className="checkout-item-total">
                      <strong>Ksh {(item.price * item.quantity).toLocaleString()}</strong>
                      <button onClick={() => removeFromCart(item.id)} className="checkout-remove">
                        <TrashIcon size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </section>

              <section className="checkout-section">
                <h2>Delivery Information</h2>
                <div className="checkout-form">
                  {[
                    { name: "name",    label: "Full Name",    type: "text",  ph: "Your full name" },
                    { name: "email",   label: "Email",        type: "email", ph: "you@example.com" },
                    { name: "phone",   label: "Phone Number", type: "tel",   ph: "07XX XXX XXX" },
                    { name: "address", label: "Address",      type: "text",  ph: "Street address" },
                    { name: "city",    label: "City",         type: "text",  ph: "Nairobi" },
                    { name: "zipCode", label: "Postal Code",  type: "text",  ph: "00100" },
                  ].map((f) => (
                    <div key={f.name} className="ck-field">
                      <label>{f.label}</label>
                      <input
                        type={f.type}
                        name={f.name}
                        value={formData[f.name]}
                        onChange={handleChange}
                        placeholder={f.ph}
                        className={errors[f.name] ? "error" : ""}
                      />
                      {errors[f.name] && <span className="ck-error">{errors[f.name]}</span>}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="checkout-right">
              <div className="checkout-summary sticky-summary">
                <h2>Order Summary</h2>
                <div className="ck-summary-rows">
                  <div className="ck-summary-row"><span>Subtotal ({items.length} items)</span><span>Ksh {totalPrice.toLocaleString()}</span></div>
                  <div className="ck-summary-row"><span>Delivery</span><span>Ksh {deliveryFee.toLocaleString()}</span></div>
                  <div className="ck-summary-row"><span>VAT (16%)</span><span>Ksh {tax.toLocaleString()}</span></div>
                  <div className="ck-summary-row total"><span>Total</span><strong>Ksh {grandTotal.toLocaleString()}</strong></div>
                </div>
                <Button variant="primary" fullWidth onClick={() => { if (validate()) setStep(2); }}>
                  Continue to Payment →
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* ===== STEP 2: Payment ===== */}
        {step === 2 && (
          <div className="ck-payment-wrap">
            <button className="ck-back-btn" onClick={() => setStep(1)}>
              <ArrowLeftIcon size={15} /> Back to delivery
            </button>

            <div className="ck-payment-grid">
              {/* Left: Payment options */}
              <div className="ck-payment-left">
                <h2>Choose Payment Method</h2>
                <p className="ck-payment-sub">All payments are processed securely via M-Pesa</p>

                <div className="ck-options">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      className={`ck-option ${paymentOption === opt.id ? "selected" : ""} ${opt.disabled ? "disabled" : ""}`}
                      onClick={() => !opt.disabled && setPaymentOption(opt.id)}
                    >
                      <div className="ck-option-icon">{opt.icon}</div>
                      <div className="ck-option-body">
                        <div className="ck-option-label">
                          {opt.label}
                          {opt.tag && <span className={`ck-tag ${opt.tag === "Recommended" ? "green" : "gray"}`}>{opt.tag}</span>}
                        </div>
                        <div className="ck-option-desc">{opt.desc}</div>
                      </div>
                      <div className="ck-option-radio">
                        {paymentOption === opt.id && !opt.disabled && <div className="ck-radio-dot" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* STK Push input */}
                {paymentOption === "stk" && (
                  <div className="ck-stk-box">
                    <label>M-Pesa Phone Number</label>
                    <div className="ck-stk-input-row">
                      <input
                        type="tel"
                        placeholder="07XX XXX XXX or +254…"
                        value={mpesaPhone}
                        onChange={(e) => { setMpesaPhone(e.target.value); setStkState("idle"); setStkMessage(""); }}
                      />
                      <button
                        className="ck-stk-btn"
                        onClick={initiateSTKPush}
                        disabled={stkState === "pending" || stkState === "success"}
                      >
                        {stkState === "pending"
                          ? <><LoaderIcon size={14} className="spin" /> Sending…</>
                          : "Send Request"}
                      </button>
                    </div>
                    {stkMessage && (
                      <div className={`ck-stk-status ${stkState}`}>{stkMessage}</div>
                    )}
                    {stkState === "success" && (
                      <div className="ck-stk-confirm-box">
                        <p>After approving on your phone, enter the M-Pesa confirmation code:</p>
                        <input
                          type="text"
                          placeholder="e.g. QAZ123XYZ"
                          value={mpesaCode}
                          onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                          className="ck-code-input"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Paybill instructions */}
                {paymentOption === "paybill" && (
                  <div className="ck-manual-box">
                    <div className="ck-manual-steps">
                      <div className="ck-manual-step"><span>1</span><p>Open M-Pesa on your phone</p></div>
                      <div className="ck-manual-step"><span>2</span><p>Select <strong>Lipa na M-Pesa</strong> → <strong>Pay Bill</strong></p></div>
                      <div className="ck-manual-step"><span>3</span><p>Business number: <strong>{MPESA_PAYBILL}</strong></p></div>
                      <div className="ck-manual-step"><span>4</span><p>Account number: <strong>{MPESA_ACCOUNT}-{formData.name.split(" ")[0].toUpperCase()}</strong></p></div>
                      <div className="ck-manual-step"><span>5</span><p>Amount: <strong>Ksh {grandTotal.toLocaleString()}</strong></p></div>
                      <div className="ck-manual-step"><span>6</span><p>Enter your PIN and confirm</p></div>
                    </div>
                    <div className="ck-field" style={{ marginTop: 16 }}>
                      <label>Enter M-Pesa Confirmation Code</label>
                      <input
                        type="text"
                        placeholder="e.g. QAZ123XYZ"
                        value={mpesaCode}
                        onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                        className="ck-code-input"
                      />
                    </div>
                  </div>
                )}

                {/* Buy Goods instructions */}
                {paymentOption === "buygoods" && (
                  <div className="ck-manual-box">
                    <div className="ck-manual-steps">
                      <div className="ck-manual-step"><span>1</span><p>Open M-Pesa on your phone</p></div>
                      <div className="ck-manual-step"><span>2</span><p>Select <strong>Lipa na M-Pesa</strong> → <strong>Buy Goods and Services</strong></p></div>
                      <div className="ck-manual-step"><span>3</span><p>Till number: <strong>{MPESA_TILL}</strong></p></div>
                      <div className="ck-manual-step"><span>4</span><p>Amount: <strong>Ksh {grandTotal.toLocaleString()}</strong></p></div>
                      <div className="ck-manual-step"><span>5</span><p>Enter your PIN and confirm</p></div>
                    </div>
                    <div className="ck-field" style={{ marginTop: 16 }}>
                      <label>Enter M-Pesa Confirmation Code</label>
                      <input
                        type="text"
                        placeholder="e.g. QAZ123XYZ"
                        value={mpesaCode}
                        onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                        className="ck-code-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Summary + confirm */}
              <div className="ck-payment-right">
                <div className="checkout-summary">
                  <h2>Order Summary</h2>
                  <div className="ck-summary-rows">
                    {items.map((i) => (
                      <div key={i.id} className="ck-summary-row item">
                        <span>{i.name} ×{i.quantity}</span>
                        <span>Ksh {(i.price * i.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <hr />
                    <div className="ck-summary-row"><span>Subtotal</span><span>Ksh {totalPrice.toLocaleString()}</span></div>
                    <div className="ck-summary-row"><span>Delivery</span><span>Ksh {deliveryFee.toLocaleString()}</span></div>
                    <div className="ck-summary-row"><span>VAT (16%)</span><span>Ksh {tax.toLocaleString()}</span></div>
                    <div className="ck-summary-row total"><span>Total</span><strong>Ksh {grandTotal.toLocaleString()}</strong></div>
                  </div>

                  <Button
                    variant="primary" fullWidth
                    onClick={finaliseOrder}
                    disabled={
                      processing ||
                      (paymentOption === "stk" && stkState !== "success") ||
                      ((paymentOption === "paybill" || paymentOption === "buygoods") && !mpesaCode.trim())
                    }
                  >
                    {processing
                      ? <><LoaderIcon size={15} className="spin" /> Processing…</>
                      : "Confirm Order"}
                  </Button>

                  {paymentOption === "stk" && stkState !== "success" && (
                    <p className="ck-note">Send the M-Pesa request first, then confirm your order.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Confirmation ===== */}
        {step === 3 && (
          <div className="checkout-confirm">
            <div className="checkout-confirm-box">
              <div className="ck-confirm-anim">
                <CheckCircleIcon size={60} strokeWidth={1.5} />
              </div>
              <h2>Order Confirmed!</h2>
              <p>Thank you for ordering from Qikao Grill.</p>
              <p className="checkout-order-id">Order #{orderId}</p>
              <p className="ck-confirm-eta">Estimated delivery: <strong>30–45 minutes</strong></p>
              <div className="ck-confirm-actions">
                <Button onClick={() => navigate("/menu")} variant="primary">Continue Shopping</Button>
                <Button onClick={() => navigate("/")} variant="outline">Go Home</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>
    </>
  );
}
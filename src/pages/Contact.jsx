import React, { useState, useRef, useEffect } from "react";
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  SendIcon,
} from "lucide-react";
import Button from "../components/ui/Button";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Contact.css";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const heroRef = useRef(null);
  const infoRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    [heroRef, infoRef, formRef].forEach((ref) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="contact-page">
      <Navbar />

      {/* Hero Section */}
      <section className="contact-hero" ref={heroRef}>
        <div className="contact-hero-overlay">
          <div className="contact-hero-text">
            <h1>Contact Us</h1>
            <p>We'd love to hear from you. Get in touch with us!</p>
          </div>
        </div>
      </section>

      {/* Contact Info and Form */}
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info" ref={infoRef}>
              <h2>Get In Touch</h2>
              <p>
                Have questions about our menu, want to make a reservation, or
                interested in catering services? Contact us using the
                information below or fill out the form, and we'll get back to
                you as soon as possible.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <MapPinIcon size={28} className="contact-icon" />
                  <div>
                    <h3>Our Location</h3>
                    <p>Qikao Grill, 237G+43Q, Market Rd, Nanyuki</p>
                  </div>
                </div>

                <div className="contact-item">
                  <PhoneIcon size={28} className="contact-icon" />
                  <div>
                    <h3>Phone Number</h3>
                    <p>+254 720 499 349</p>
                  </div>
                </div>

                <div className="contact-item">
                  <MailIcon size={28} className="contact-icon" />
                  <div>
                    <h3>Email Address</h3>
                    <p>info@qikaogrill.com</p>
                  </div>
                </div>

                <div className="contact-item">
                  <ClockIcon size={28} className="contact-icon" />
                  <div>
                    <h3>Working Hours</h3>
                    <p>
                      Monday - Friday: 10am - 10pm <br />
                      Saturday & Sunday: 11am - 11pm
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="contact-map">
                <iframe
                  src="https://www.google.com/maps?q=Qikao+Grill,+237G%2B43Q,+Market+Rd,+Nanyuki&z=17&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Qikao Grill Location"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form" ref={formRef}>
              <h2>Send Us a Message</h2>

              {isSubmitted && (
                <div className="contact-success">
                  <p>✅ Thank you for your message! We'll get back to you soon.</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your Name"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email Address"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number (Optional)"
                  />
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="reservation">Make a Reservation</option>
                    <option value="catering">Catering Inquiry</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Your Message..."
                ></textarea>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting}
                  className="send-btn"
                >
                  {isSubmitting ? "Sending..." : <>Send Message <SendIcon size={18} /></>}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
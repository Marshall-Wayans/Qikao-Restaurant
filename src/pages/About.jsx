import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar"; 
import Footer from "../components/layout/Footer"; 
import Button from "../components/ui/Button";
import "./About.css";

export default function About() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Head Chef",
      image:
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=2068&q=80",
      bio: "With over 15 years of culinary experience, Sarah brings her passion for grilled cuisine to every dish she creates.",
    },
    {
      name: "Michael Ochieng",
      role: "Restaurant Manager",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=2069&q=80",
      bio: "Michael ensures that every guest at Qikao Grill receives exceptional service and an unforgettable dining experience.",
    },
    {
      name: "David Kimani",
      role: "Grill Master",
      image:
        "https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?auto=format&fit=crop&w=2071&q=80",
      bio: "David's expertise in grilling techniques and flavor combinations has made our signature dishes famous throughout the city.",
    },
  ];

  // Scroll reveal animation
  useEffect(() => {
    const elements = document.querySelectorAll(
      ".about-section, .about-card, .team-card, .cta-section"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            entry.target.style.transitionDelay = `${i * 0.1}s`;
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      <Navbar />

      {/* HERO */}
      <header className="about-hero">
        <div className="about-hero-overlay">
          <div className="about-hero-content">
            <h1>About Qikao Grill</h1>
            <p>Our story, our people, and our passion for exceptional food.</p>
          </div>
        </div>
      </header>

      {/* OUR STORY */}
      <section className="about-section story-section">
        <div className="about-grid">
          <div className="story-text">
            <h2>Our Story</h2>
            <p>
              Founded in 2010, Qikao Grill began as a small family-owned
              restaurant with a simple mission: to serve the most delicious
              grilled cuisine using only the finest ingredients and traditional
              techniques.
            </p>
            <p>
              Our founder, James Qikao, learned the art of grilling from his
              grandfather, combining traditional methods with innovation to
              create a unique dining experience.
            </p>
            <p>
              Over the years, Qikao Grill has grown from a humble establishment
              to one of the most beloved restaurants in the city. We remain
              committed to quality, authenticity, and exceptional service.
            </p>
          </div>

          <div className="story-images">
            <img
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1974&q=80"
              alt="Qikao Grill Food"
            />
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2069&q=80"
              alt="Qikao Grill Steak"
            />
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2070&q=80"
              alt="Qikao Grill Restaurant Interior"
            />
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="about-section values-section">
        <h2>Our Values</h2>
        <p className="about-subtext">
          The principles that guide everything we do at Qikao Grill.
        </p>
        <div className="values-grid">
          <div className="about-card">
            <div className="icon">✔</div>
            <h3>Quality</h3>
            <p>
              We source only the finest ingredients and never compromise on the
              quality of our food or service.
            </p>
          </div>
          <div className="about-card">
            <div className="icon">🔥</div>
            <h3>Tradition</h3>
            <p>
              We honor traditional grilling techniques while embracing
              innovation to create unique flavors.
            </p>
          </div>
          <div className="about-card">
            <div className="icon">🤝</div>
            <h3>Community</h3>
            <p>
              We believe in creating meaningful connections with our guests,
              staff, and local community.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="about-section team-section">
        <h2>Meet Our Team</h2>
        <p className="about-subtext">
          The talented individuals who make Qikao Grill an exceptional dining
          destination.
        </p>
        <div className="team-grid">
          {teamMembers.map((member, i) => (
            <div key={i} className="team-card">
              <img src={member.image} alt={member.name} />
              <div className="team-info">
                <h3>{member.name}</h3>
                <p className="role">{member.role}</p>
                <p>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Come Dine With Us</h2>
        <p>
          Experience the authentic taste of Qikao Grill and discover why our
          customers keep coming back.
        </p>
        <div className="cta-buttons">
          <Link to="/menu">
            <Button variant="primary" size="lg">View Our Menu</Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg">Make a Reservation</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
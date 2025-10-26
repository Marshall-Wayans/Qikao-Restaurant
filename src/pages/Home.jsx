import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../components/layout/Navbar"; 
import Footer from "../components/layout/Footer"; 
import "./Home.css";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef(null);
  const categoryRef = useRef(null);
  const aboutRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const sections = [heroRef, categoryRef, aboutRef, ctaRef];

    sections.forEach((ref) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 90%",
              toggleActions: "play none none none",
              markers: false, 
            },
          }
        );
      }
    });
  }, []);

  const featuredCategories = [
    {
      id: "grilled-meat",
      title: "Grilled Meat",
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2069&q=80",
      description: "Premium cuts of meat, expertly grilled to perfection.",
    },
    {
      id: "sides",
      title: "Sides",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1999&q=80",
      description: "Delicious accompaniments to complete your meal.",
    },
    {
      id: "drinks",
      title: "Drinks",
      image:
        "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1957&q=80",
      description: "Refreshing beverages to complement your dining experience.",
    },
    {
      id: "special-offers",
      title: "Special Offers",
      image:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1974&q=80",
      description: "Limited-time promotions and signature dishes.",
    },
  ];

  return (
    <div className="home-wrapper">
     
      <Navbar />

   
      <section className="hero-section" ref={heroRef}>
        <div className="hero-content">
          <h1>Welcome to Qikao Grill</h1>
          <p>
            Experience the authentic taste of premium grilled cuisine in a warm
            and welcoming atmosphere.
          </p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary">
              View Our Menu
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Place Your Order
            </Link>
          </div>
        </div>
      </section>

     
      <section className="categories-section" ref={categoryRef}>
        <div className="section-header">
          <h2>Our Menu Categories</h2>
          <p>
            Explore our wide variety of delicious options, from sizzling grilled
            meats to refreshing beverages.
          </p>
        </div>

        <div className="category-flex">
          {featuredCategories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-img">
                <img src={category.image} alt={category.title} />
              </div>
              <div className="category-content">
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <Link
                  to={`/menu?category=${category.id}`}
                  className="explore-link"
                >
                  Explore Menu <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="center-btn">
          <Link to="/menu" className="btn btn-primary">
            View Full Menu
          </Link>
        </div>
      </section>

      
      <section className="about-section" ref={aboutRef}>
        <div className="about-grid">
          <div className="about-text">
            <h2>Our Story</h2>
            <p>
              Founded in 2010, Qikao Grill has been serving authentic grilled
              cuisine with a modern twist. Our chefs use only the finest
              ingredients and traditional techniques to create unforgettable
              dining experiences.
            </p>
            <p>
              From humble beginnings as a small family-owned restaurant, we've
              grown to become one of the most beloved dining destinations in the
              city, known for our exceptional service and mouth-watering dishes.
            </p>
            <Link to="/about" className="btn btn-outline">
              Learn More About Us
            </Link>
          </div>
          <div className="about-img">
            <img
              src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1974&q=80"
              alt="Qikao Grill Interior"
            />
          </div>
        </div>
      </section>

     
      <section className="cta-section" ref={ctaRef}>
        <div className="cta-content">
          <h2>Ready to Experience Qikao Grill?</h2>
          <p>
            Join us for an unforgettable dining experience or order online for
            delivery or pickup.
          </p>
          <div className="cta-buttons">
            <Link to="/menu" className="btn btn-light">
              Order Online Now
            </Link>
            <Link to="/contact" className="btn btn-outline-light">
              Place Your Order
            </Link>
          </div>
        </div>
      </section>

     
      <Footer />
    </div>
  );
};

export default Home;
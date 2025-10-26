import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useCart } from "../context/CartContext";
import "./Menu.css";

import coffee from "../assets/coffee.jpg";
import chaiMoto from "../assets/chai moto.jpg";
import mandazi from "../assets/mandazi.jpg";
import burger from "../assets/burger.jpg";
import smokie from "../assets/smokie.jpg";
import sausage from "../assets/sausage.jpg";
import samosa from "../assets/samosa.jpg";
import boiledEggs from "../assets/boiled eggs.jpg";
import bhajia from "../assets/bhajia.jpg";
import smocha from "../assets/smocha.jpeg";
import spicyNoodles from "../assets/spicy noodles.jpg";
import chipsMasala from "../assets/chips masala.jpg";
import normalFries from "../assets/normal fries.jpg";
import pilau from "../assets/pilau.jpg";
import mshikaki from "../assets/mshikaki.jpg";
import bbq from "../assets/bbq.jpg";
import bbqChicken from "../assets/bbqchicken.jpg";
import plainRice from "../assets/plain.jpg";
import ugaliFish from "../assets/ugali with fish.jpg";
import ugaliMboga from "../assets/ugali with mboga.jpg";
import grilledMeat from "../assets/grilled meat.jpg";
import soda from "../assets/soda.jpg";
import specialOfferPilau from "../assets/pilau.jpg";

gsap.registerPlugin(ScrollTrigger);

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const heroRef = useRef(null);
  const filterRef = useRef(null);
  const gridRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    [heroRef, filterRef, gridRef].forEach((ref) => {
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

  const menuItems = [
    { id: "1", name: "Breakfast Combo 1", description: "Sausage, Smocha, Normal Fries and Chai Moto", price: 230, image: chaiMoto, category: "breakfast" },
    { id: "2", name: "Breakfast Combo 2", description: "2 Sausages, Mandazi, Normal Fries and Smocha", price: 250, image: mandazi, category: "breakfast" },
    { id: "3", name: "Coffee", description: "Freshly brewed hot coffee.", price: 350, image: coffee, category: "breakfast" },
    { id: "4", name: "Burger", description: "Beef burger served with lettuce and sauce.", price: 700, image: burger, category: "breakfast" },
    { id: "5", name: "Smokie", description: "Delicious grilled smokie sausage.", price: 100, image: smokie, category: "snacks" },
    { id: "6", name: "Smocha", description: "Smokie wrapped in chapati with sauce.", price: 200, image: smocha, category: "snacks" },
    { id: "7", name: "Sausage", description: "Crispy fried sausage.", price: 150, image: sausage, category: "snacks" },
    { id: "8", name: "Samosa", description: "Crispy fried pastry stuffed with spiced beef.", price: 120, image: samosa, category: "snacks" },
    { id: "9", name: "Boiled Eggs", description: "Two perfectly boiled eggs.", price: 100, image: boiledEggs, category: "snacks" },
    { id: "10", name: "Bhajia", description: "Crispy fried potato slices.", price: 250, image: bhajia, category: "snacks" },
    { id: "11", name: "Spicy Noodles", description: "Stir-fried spicy noodles with vegetables.", price: 600, image: spicyNoodles, category: "lunch" },
    { id: "12", name: "Chips Masala", description: "Fries tossed in masala and tomato sauce.", price: 400, image: chipsMasala, category: "lunch" },
    { id: "13", name: "Normal Fries", description: "Crispy golden fries with salt.", price: 300, image: normalFries, category: "lunch" },
    { id: "14", name: "Pilau", description: "Kenyan spiced rice with beef.", price: 700, image: pilau, category: "lunch" },
    { id: "15", name: "Mshikaki", description: "Grilled beef skewers with spice.", price: 500, image: mshikaki, category: "lunch" },
    { id: "16", name: "BBQ", description: "Assorted grilled barbecue platter.", price: 800, image: bbq, category: "lunch" },
    { id: "17", name: "BBQ Chicken", description: "Marinated BBQ chicken pieces.", price: 700, image: bbqChicken, category: "lunch" },
    { id: "18", name: "Plain Rice", description: "Steamed white rice.", price: 250, image: plainRice, category: "lunch" },
    { id: "19", name: "Ugali with Fish", description: "Traditional ugali served with fried fish.", price: 900, image: ugaliFish, category: "supper" },
    { id: "20", name: "Ugali with Mboga", description: "Ugali served with sautéed greens.", price: 500, image: ugaliMboga, category: "supper" },
    { id: "21", name: "Grilled Meat", description: "Perfectly grilled beef cuts.", price: 1000, image: grilledMeat, category: "supper" },
    { id: "22", name: "BBQ Chicken Special", description: "Exclusive BBQ chicken recipe.", price: 1000, image: bbqChicken, category: "specials" },
    { id: "23", name: "Soda", description: "Chilled bottled soda.", price: 150, image: soda, category: "drinks" },
    { id: "24", name: "Pilau Offer", description: "Discounted pilau meal offer.", price: 450, image: specialOfferPilau, category: "special-offer" },
  ];

  const categories = [
    { id: "all", name: "All Items", icon: "🍽️" },
    { id: "breakfast", name: "Breakfast", icon: "☕" },
    { id: "lunch", name: "Lunch", icon: "🍛" },
    { id: "supper", name: "Supper", icon: "🍽️" },
    { id: "snacks", name: "Snacks", icon: "🥪" },
    { id: "specials", name: "Specials", icon: "🔥" },
    { id: "drinks", name: "Drinks", icon: "🥤" },
    { id: "special-offer", name: "Special Offer", icon: "💰" },
  ];

  const filteredItems = menuItems.filter(
    (item) =>
      (activeCategory === "all" || item.category === activeCategory) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddToCart = (item, e) => {
    const img = e.currentTarget.closest(".menu-card").querySelector("img");
    const cartIcon = document.querySelector(".cart-icon");
    if (img && cartIcon) {
      const imgClone = img.cloneNode(true);
      const imgRect = img.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();
      imgClone.style.position = "fixed";
      imgClone.style.top = `${imgRect.top}px`;
      imgClone.style.left = `${imgRect.left}px`;
      imgClone.style.width = `${imgRect.width}px`;
      imgClone.style.height = `${imgRect.height}px`;
      imgClone.style.borderRadius = "12px";
      imgClone.style.zIndex = 9999;
      imgClone.style.pointerEvents = "none";
      document.body.appendChild(imgClone);
      gsap.to(imgClone, {
        top: cartRect.top,
        left: cartRect.left,
        width: 20,
        height: 20,
        opacity: 0.6,
        duration: 0.8,
        ease: "power1.inOut",
        onComplete: () => imgClone.remove(),
      });
    }
    addToCart({ ...item, quantity: 1 });
  };

  return (
    <div className="menu-page">
      <Navbar />
      <section className="menu-hero" ref={heroRef}>
        <div className="menu-hero-content">
          <h1>Our Menu</h1>
          <p>Explore our meals — breakfast, lunch, supper, and more!</p>
        </div>
      </section>
      <section className="menu-filters-section" ref={filterRef}>
        <div className="menu-filters">
          <div className="search-box">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="category-buttons">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={activeCategory === cat.id ? "active" : ""}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="category-emoji">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="menu-grid-section" ref={gridRef}>
        {filteredItems.length > 0 ? (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-card modern">
                <div className="menu-card-img">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="menu-card-content">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="menu-card-footer">
                    <span>Ksh {item.price.toLocaleString()}</span>
                    <button onClick={(e) => handleAddToCart(item, e)}>Add to Order</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">No items found.</div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Menu;
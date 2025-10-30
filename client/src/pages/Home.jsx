import React, { useState, useContext, useEffect } from "react";
import { Play, ChevronDown } from "lucide-react";
import { DataContext } from "../context/Context.jsx";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import homeIllustration from "./Assets/home-illustration.png";
import {
  Plane,
  Building2,
  Bus,
  Train,
  Package,
  Drone,
  Route,
  CalendarCheck,
  BusFront,
} from "lucide-react";

const services = [
  {
    id: "flights",
    name: "Flights",
    icon: Plane,
    bgColor: "bg-blue-500",
    textColor: "text-blue-600",
  },
  {
    id: "parking",
    name: "Parking",
    icon: Building2,
    bgColor: "bg-green-500",
    textColor: "text-green-600",
  },
  {
    id: "buses",
    name: "Buses",
    icon: Bus,
    bgColor: "bg-orange-500",
    textColor: "text-orange-600",
  },
  {
    id: "trains",
    name: "Trains",
    icon: Train,
    bgColor: "bg-red-500",
    textColor: "text-red-600",
  },
  {
    id: "packages",
    name: "Packages",
    icon: Package,
    bgColor: "bg-purple-500",
    textColor: "text-purple-600",
  },
];

const faqs = [
  {
    question: "How do you ensure payment security?",
    answer:
      "We use industry-standard SSL encryption for all transactions and offer multiple secure payment options including bank transfers and credit cards processed through PCI-compliant gateways.",
  },
  {
    question: "What if I need to change my shipping plan?",
    answer:
      "You can upgrade or modify your shipping plan anytime before your shipment is dispatched. Contact our support team for assistance with plan changes.",
  },
  {
    question: "When should I expect to receive my shipment?",
    answer:
      "Delivery times vary based on destination and service selected. Domestic shipments typically arrive within 2-5 business days, while international shipments may take 7-15 business days. You'll receive tracking information once your shipment is processed.",
  },
  {
    question: "What happens if I need to cancel my shipment?",
    answer:
      "Cancellations are possible before the shipment is in transit. A partial fee may apply depending on how far along the process is. Once in transit, we can arrange for return shipping at standard rates.",
  },
  {
    question: "What types of goods do you specialize in transporting?",
    answer:
      "We handle a wide range of goods including general cargo, perishable items (with temperature-controlled options), fragile goods, oversized loads, and hazardous materials (with proper documentation). Contact us for specialized requirements.",
  },
];

const LogisticsWebsite = () => {
  const { user, loading } = useContext(DataContext);
  const [isAuthenticated, setisAuthenticated] = useState(false);

  useEffect(() => {
    if (user?._id) {
      setisAuthenticated(true);
    } else {
      setisAuthenticated(false);
    }
  }, [user]);

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Exact match with isometric illustration */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl font-bold text-black leading-tight mb-4">
                <span className="text-royalblue">Smart & Seamless</span>
                <br />
                Transportation for You
              </h1>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Making daily transit easier for commuters.
              </p>
              <div className="flex items-center gap-6">
                {isAuthenticated ? (
                  <Link
                    to="/live-map"
                    className="bg-royalblue text-white px-4 py-2 rounded hover:bg-cyan transition font-medium"
                  >
                    Live Map
                  </Link>
                ) : (
                  <Link
                    to="/user-login"
                    className="bg-royalblue text-white px-4 py-2 rounded hover:bg-cyan transition font-medium"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>

            {/* Isometric warehouse illustration - exact match */}
            <div className="relative">
              <div className="relative">
                <img
                  src={homeIllustration}
                  alt="A smart and seamless transportation hub"
                  className="animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transpotation vehicals */}
      <section className="py-8 bg-white">
        <div className="w-full py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div
                    key={service.id}
                    className="flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div
                      className={`p-2 rounded-full ${service.bgColor} group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <span
                      className={`font-medium ${service.textColor} group-hover:text-gray-800 transition-colors`}
                    >
                      {service.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Blue section - exact match */}
      <section className="bg-royalblue py-16 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Features That Keep You Moving
            </h2>
            <p className="text-gray max-w-xl mx-auto">
              From live tracking to smart routing, our platform makes your
              commute smarter and faster.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-6 text-center transform hover:scale-105 transition duration-300 shadow-md hover:shadow-xl">
              <div className="mx-auto mb-4 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center animate-bounce-slow hover:animate-bounce-fast">
                <BusFront className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-black font-semibold mb-1">
                Car-Pooling
              </h3>
              <p className="text-sm text-black mb-2">
                Helps you in taking a shared car.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-6 text-center transform hover:scale-105 transition duration-300 shadow-md hover:shadow-xl">
              <div className="mx-auto mb-4 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center animate-bounce-slow hover:animate-bounce-fast">
                <Route className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-black font-semibold mb-1">
                Smart Route Planner
              </h3>
              <p className="text-sm text-black mb-2">
                Find the best route with real-time traffic info.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-6 text-center transform hover:scale-105 transition duration-300 shadow-md hover:shadow-xl">
              <div className="mx-auto mb-4 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center animate-bounce-slow hover:animate-bounce-fast">
                <Drone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-black font-semibold mb-1">Drone Delivery</h3>
              <p className="text-sm text-black mb-2">
                Fast, contactless delivery to remote or high-demand locations
                using smart drone tech.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-6 text-center transform hover:scale-105 transition duration-300 shadow-md hover:shadow-xl">
              <div className="mx-auto mb-4 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center animate-bounce-slow hover:animate-bounce-fast">
                <CalendarCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-black font-semibold mb-1">
                Schedule Overview
              </h3>
              <p className="text-sm text-black mb-2">
                View full schedules and plan ahead with ease.
              </p>
            </div>
          </div>
        </div>

        {/* Custom animation styles */}
        <style>
          {`
      @keyframes float-animation {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-20px);
        }
      }
      .animate-float {
        animation: float-animation 4s ease-in-out infinite;
      }
      @keyframes bounce-slow {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
      }

      @keyframes bounce-fast {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      .animate-bounce-slow {
        animation: bounce-slow 2s infinite;
      }

      .hover\\:animate-bounce-fast:hover {
        animation: bounce-fast 0.6s infinite;
      }
    `}
        </style>
      </section>

      {/* Why choose us section - exact match */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Why choose us for
                <br />
                your logistics needs
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Reliable transportation solutions with
                <br />
                real-time tracking and dedicated support
                <br />
                for all your shipping requirements.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-medium rounded transition duration-300">
                Learn More →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* 24/7 Support */}
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2 text-lg">
                  24/7 Support
                </h3>
                <p className="text-gray-600 text-sm">
                  Dedicated customer service
                  <br />
                  available round the clock
                  <br />
                  for all your queries.
                </p>
              </div>

              {/* Real-Time Tracking */}
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2 text-lg">
                  Real-Time Tracking
                </h3>
                <p className="text-gray-600 text-sm">
                  Track your shipments
                  <br />
                  in real-time with our
                  <br />
                  advanced system.
                </p>
              </div>

              {/* Fast Delivery */}
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2 text-lg">
                  Fast Delivery
                </h3>
                <p className="text-gray-600 text-sm">
                  On-time deliveries with
                  <br />
                  our optimized routes
                  <br />
                  and fleet.
                </p>
              </div>

              {/* Cost Effective */}
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2 text-lg">
                  Cost Effective
                </h3>
                <p className="text-gray-600 text-sm">
                  Competitive pricing
                  <br />
                  without compromising
                  <br />
                  on quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - exact match */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked
            <br />
            Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-${index}`}
                >
                  <span className="font-semibold text-gray-900 text-lg">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFaq === index && (
                  <div
                    id={`faq-${index}`}
                    className="px-6 pb-4 pt-2 bg-white text-gray-600"
                  >
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Link to="/contact" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Contact Our Support Team
            </Link>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default LogisticsWebsite;

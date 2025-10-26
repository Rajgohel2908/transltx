import { MapPin, Facebook, Instagram, Twitter, Phone } from "lucide-react";
const Footer = () => {
  const date = new Date();
  const year = date.getFullYear();

  return (
    <footer className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold text-black mb-6">TransItIx</h3>

            <div className="space-y-2 text-gray-600">
              <div className="font-semibold text-black">Address</div>
              <div>
                Sardarnagar, Bhavnagar - 364001
              </div>
              <button className="flex items-center gap-2 text-black hover:text-blue-600 mt-4">
                <MapPin className="w-4 h-4" />
                Find on Map
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-black mb-4">Home</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Blog Update
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Get A Quote
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Testimonial
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-black mb-4">Service</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-black mb-4">Contact</h4>
            <div className="space-y-2 text-gray-600">
              <div>(+91) 9544573464</div>
              <div>transitix@gmail.com</div>
              <div className="flex gap-4 mt-4">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-pointer" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-pink-600 cursor-pointer" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
                <Phone className="w-5 h-5 text-gray-400 hover:text-green-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex justify-between items-center">
          <div className="text-gray-600 text-sm">
            Copyright © {new Date().getFullYear()} Minimal | All rights reserved.
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-blue-600 font-semibold">stripe</span>
            <span className="text-blue-600 font-semibold">visa</span>
            <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center">
              💳
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

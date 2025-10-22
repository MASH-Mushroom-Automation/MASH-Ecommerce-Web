import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#333333] text-white font-['Roboto']">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid: Logo/Info (col-1), Shop (col-2), Customer Service (col-3), About MASH (col-4) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-16 gap-y-10">
          {/* Column 1: MASH Logo/Brand Info and Social Media */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold font-['Roboto'] text-[#6A994E] mb-6">
              MASH MARKET
            </h3>

            {/* Accepted Payments Section */}
            <h4 className="text-sm font-light mb-3 text-gray-200">
              Accepted Payments:
            </h4>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Image
                src="/placeholder.png"
                alt="Visa"
                width={50}
                height={15}
                className="h-4 w-auto"
                style={{ filter: "invert(100%)" }}
              />
              <Image
                src="/placeholder.png"
                alt="Cash on Delivery"
                width={50}
                height={15}
                className="h-4 w-auto"
                style={{ filter: "invert(100%)" }}
              />
              <Image
                src="/placeholder.png"
                alt="GCash"
                width={50}
                height={15}
                className="h-4 w-auto"
                style={{ filter: "invert(100%)" }}
              />
              <Image
                src="/placeholder.png"
                alt="Maya"
                width={50}
                height={15}
                className="h-4 w-auto"
                style={{ filter: "invert(100%)" }}
              />
            </div>

            {/* Social Media */}
            <div className="flex space-x-4 mt-6">
              <Link
                href="#"
                className="text-white hover:text-[#6A994E]"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </Link>
              <Link
                href="#"
                className="text-white hover:text-[#6A994E]"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </Link>
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div className="md:pl-6">
            <h3 className="text-lg font-semibold mb-4 text-[#6A994E]">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/catalog" className="hover:underline">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:underline">
                  Stores
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline">
                  How to Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#6A994E]">
              Customer Service
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/faq" className="hover:underline">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping-info" className="hover:underline">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns-policy" className="hover:underline">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About MASH & Contact Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#6A994E]">
              About MASH
            </h3>
            <ul className="space-y-3 text-sm mb-8">
              <li>
                <Link href="/about" className="hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about#mission" className="hover:underline">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link href="/sell-with-us" className="hover:underline">
                  Become a Grower
                </Link>
              </li>
            </ul>

            {/* Contact Details */}
            <div className="text-sm space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Caloocan</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+63 956 955 2608</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>hi@mash.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-700 pt-3 pb-4 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} ZenThesis. All rights reserved.</p>
        <p className="mt-1">
          Made with{" "}
          <span role="img" aria-label="heart">
            ❤️
          </span>{" "}
          from Zen Garden
        </p>
      </div>
    </footer>
  );
}

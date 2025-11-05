import Link from "next/link";
import Image from "next/image";
import { Facebook, MapPin, Phone, Mail, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#333333] text-white font-['Roboto']">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid: Logo/Info (col-1), Shop (col-2), Customer Service (col-3), About MASH (col-4) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-16 gap-y-10">
          {/* Column 1: MASH Logo/Brand Info and Social Media */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center text-center">
            {/* MASH Logo */}
            <div className="mb-6">
              <Image
                src="/Logo  v6 - Market.png"
                alt="MASH Market"
                width={180}
                height={60}
                className="h-auto w-auto max-w-[180px]"
              />
            </div>

            {/* Accepted Payments Section */}
            <h4 className="text-sm luz font-light mb-3 text-gray-200">
              Accepted Payments:
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <Image
                src="/payment-logos/gcash-logo.png"
                alt="GCash"
                width={50}
                height={50}
                className="h-7 w-7 object-contain"
              />
              <Image
                src="/payment-logos/Maya_Logo.svg"
                alt="Maya"
                width={50}
                height={50}
                className="h-8 w-12 object-contain"
              />
            </div>

            {/* Social Media */}
            <div className="flex justify-center space-x-4 mt-6">
              <a
                href="https://www.facebook.com/MASHMarketPH/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#6A994E]"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://www.youtube.com/@MASH-UCC"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#6A994E]"
                aria-label="YouTube"
              >
                <Youtube size={24} />
              </a>
              <a
                href="mailto:mash.mushroom.automation@gmail.com"
                className="text-white hover:text-[#6A994E]"
                aria-label="Email"
              >
                <Mail size={24} />
              </a>
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
                <Link href="/grower" className="hover:underline">
                  Growers
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
                <Link href="/start-selling" className="hover:underline">
                  Become a Grower
                </Link>
              </li>
            </ul>

            {/* Contact Details */}
            <div className="text-sm space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <a
                  href="https://maps.app.goo.gl/fSRj6x1EwbNM3X3C9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  UCC Congressional Campus
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+63 956 955 2608</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>zenGarden@gmail.com</span>
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

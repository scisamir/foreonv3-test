"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Twitter, Mail, MessageCircle, Send } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#22005D] text-white text-sm py-4 md:py-0 md:h-[68px] flex flex-col md:flex-row items-center md:justify-between px-6 md:px-8 space-y-3 md:space-y-0">
      {/* Left section — desktop only */}
      <div className="hidden md:flex items-center space-x-2">
        <span className="font-medium">
          © 2025 Foreon. All Rights Reserved.
        </span>
      </div>

      {/* Mobile layout top — logo + name */}
      <div className="flex flex-col items-center md:hidden">
        <div className="flex items-center space-x-2">
          <Image
            src="/foreon-logo.svg"
            alt="Foreon Logo"
            width={24}
            height={24}
            className="md:w-8 md:h-8"
          />
          <span className="text-base font-semibold">Foreon</span>
        </div>
      </div>

      {/* Center section — navigation links */}
      <div className="flex flex-wrap justify-center md:justify-center items-center gap-x-6 gap-y-2 text-center">
        <Link href="/about" className="hover:underline">
          About
        </Link>
        <Link href="/whitepaper" className="hover:underline">
          Whitepaper
        </Link>
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>
        <Link href="/privacy-policy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms-of-service" className="hover:underline">
          Terms of Service
        </Link>
      </div>

      {/* Right section — icons */}
      <div className="flex items-center justify-center space-x-4">
        <Link
          href="https://x.com/foreon"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          className="hover:text-gray-300 transition-colors"
        >
          <Twitter size={18} />
        </Link>
        <Link
          href="https://discord.gg/foreon"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discord"
          className="hover:text-gray-300 transition-colors"
        >
          <MessageCircle size={18} />
        </Link>
        <Link
          href="https://t.me/foreon"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram"
          className="hover:text-gray-300 transition-colors"
        >
          <Send size={18} />
        </Link>
        <Link
          href="mailto:contact@foreon.io"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Email"
          className="hover:text-gray-300 transition-colors"
        >
          <Mail size={18} />
        </Link>
      </div>

      {/* Mobile layout bottom — copyright */}
      <div className="md:hidden text-xs text-center mt-2">
        © 2025 Foreon. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;

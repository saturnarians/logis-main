'use client';

import React from 'react';
import { Youtube, Facebook, Linkedin, Instagram } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#f8f8f8] text-gray-700 border-t border-gray-200 text-xs mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {/* Column 1: Quick Links */}
        <div>
          <h4 className="font-extrabold text-sm text-[#D40511] mb-3">Quick Links</h4>
          <ul className="space-y-2 text-gray-600 font-medium">
            <li className="hover:text-black cursor-pointer">Customer Service</li>
            <li className="hover:text-black cursor-pointer">Customer Portal Logins</li>
            <li className="hover:text-black cursor-pointer">Developer Portal ↗</li>
            <li className="hover:text-black cursor-pointer">Get a Quote</li>
            <li className="hover:text-black cursor-pointer">DHL for Business</li>
          </ul>
        </div>

        {/* Column 2: Our Divisions */}
        <div>
          <h4 className="font-extrabold text-sm text-[#D40511] mb-3">Our Divisions</h4>
          <ul className="space-y-2 text-gray-600 font-medium">
            <li className="hover:text-black cursor-pointer">DHL Express</li>
            <li className="hover:text-black cursor-pointer">DHL Global Forwarding</li>
            <li className="hover:text-black cursor-pointer">Other Global Divisions</li>
          </ul>
        </div>

        {/* Column 3: Company Information */}
        <div>
          <h4 className="font-extrabold text-sm text-[#D40511] mb-3">Company Information</h4>
          <ul className="space-y-2 text-gray-600 font-medium">
            <li className="hover:text-black cursor-pointer">About DHL</li>
            <li className="hover:text-black cursor-pointer">Delivered ↗</li>
            <li className="hover:text-black cursor-pointer">Careers ↗</li>
            <li className="hover:text-black cursor-pointer">Press Center</li>
            <li className="hover:text-black cursor-pointer">Investors ↗</li>
            <li className="hover:text-black cursor-pointer">Sustainability</li>
            <li className="hover:text-black cursor-pointer">Brand Partnerships</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar (Matching Image 1) */}
      <div className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="bg-[#D40511] text-[#FFCC00] font-black italic tracking-tighter text-lg px-2 py-0.5 rounded-sm">
              DHL
            </div>
            <span className="font-bold text-gray-900 text-sm">Group</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-500 font-medium">
            <span className="hover:text-black cursor-pointer">Fraud Awareness</span>
            <span className="hover:text-black cursor-pointer">Legal Notice</span>
            <span className="hover:text-black cursor-pointer">Terms of Use</span>
            <span className="hover:text-black cursor-pointer">Privacy Notice</span>
            <span className="hover:text-black cursor-pointer">Additional Information</span>
            <span className="hover:text-black cursor-pointer">Cookie Settings</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <Youtube className="w-4 h-4 hover:text-[#D40511] cursor-pointer" />
            <Facebook className="w-4 h-4 hover:text-[#D40511] cursor-pointer" />
            <Linkedin className="w-4 h-4 hover:text-[#D40511] cursor-pointer" />
            <Instagram className="w-4 h-4 hover:text-[#D40511] cursor-pointer" />
          </div>
        </div>

        <div className="text-center text-[11px] text-gray-400 mt-4">
          2026 © - all rights reserved | DHL Logistics Real-Time Operations Platform
        </div>
      </div>
    </footer>
  );
};

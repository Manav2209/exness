"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TradingInstrument } from "@/lib/types";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

interface HeaderProps {
  assets: TradingInstrument[];
}

export const Header = ({ assets }: HeaderProps) => {
  const router = useRouter();

  const { token, logout } = useAuthStore();

  
  const [balance, setBalance] = useState<number | null>(null);
  const [lockedBalance, setLockedBalance] = useState<number | null>(null);
  const [showBalancePopup, setShowBalancePopup] = useState(false);

  // Fetch balance on mount
  useEffect(() => {
    if (!token) return;
    const fetchBalance = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/v1/balance", {
          headers:{
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setBalance(res.data.usd);
        setLockedBalance(res.data.locked_usd);
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };
    fetchBalance();
  }, [token]);

  // Logout handler
  const handleLogout = () => {
    logout();
    router.push("/signin")
  };

  return (
    <div className="bg-[#141d22] w-full flex justify-between items-center text-neutral-400 px-4 py-2 relative">
      {/* Left: Logo */}
      <div>
        <Image
          src="/logo_yellow.svg"
          alt="Logo"
          width={120}
          height={40}
          className="ml-2"
        />
      </div>

      {/* Center: Assets */}
      <div className="flex space-x-16 justify-start items-center">
        {assets?.map((asset) => (
          <div
            key={asset.symbol}
            className="flex flex-col items-center cursor-pointer hover:opacity-100 transition"
          >
            <Image
              src={asset.img_url}
              alt={asset.symbol}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Right: Buttons */}
      <div className="flex items-center space-x-4 relative cursor-pointer">
        {/* BALANCE Button + Popup */}
        <div
          className="relative"
          onMouseEnter={() => setShowBalancePopup(true)}
          onMouseLeave={() => setShowBalancePopup(false)}
        >
          <button className="flex items-center gap-2 text-sm bg-neutral-800 text-neutral-300 px-8 py-1.5 rounded-lg transition hover:bg-[#2a3441]">
            Balance
          </button>

          {showBalancePopup && (
            <div className="absolute top-12 left-0 bg-[#1e262e] border border-[#2a3441] rounded-lg p-3 text-sm text-white shadow-xl z-50 w-48">
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span>${balance?.toFixed(2) ?? "0.00"}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-400">Locked:</span>
                <span>${lockedBalance?.toFixed(2) ?? "0.00"}</span>
              </div>
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm bg-neutral-800 text-neutral-300 px-8 py-1.5 rounded-lg hover:bg-[#2a3441] transition"
        >
          Logout
        </button>

        {/* DEPOSIT */}
        <button className="flex items-center gap-2 text-sm bg-neutral-800 text-neutral-300 px-12 py-1.5 rounded-lg hover:bg-[#2a3441] transition">
          <PlusCircle className="w-4 h-4" />
          Deposit
        </button>
      </div>
    </div>
  );
};

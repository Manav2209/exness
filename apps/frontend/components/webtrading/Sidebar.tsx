"use client";
import { TradingInstrument } from "@/lib/types";
import { Search } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";

interface SidebarProps {
    selectedInstrument: TradingInstrument ;
    onSelectInstrument: (instrument: TradingInstrument) => void;
    assets: TradingInstrument[];
}

export const Sidebar = ({ selectedInstrument, onSelectInstrument, assets }: SidebarProps) => {
    return (
    <div className="w-[20%] h-screen bg-[#121212] text-gray-200 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between curosr-pointer">
            <h2 className="text-sm font-semibold tracking-wide uppercase">Instruments</h2>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-3 border-b border-gray-700">
            <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
                placeholder="Search"
                className="pl-9 bg-[#1e1e1e] border-none text-sm text-gray-300 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            </div>
        </div>

        <div className="py-4 px-2">
            <table className="w-full font-medium text-sm">
            <thead>
            <tr className="border-b border-[#2a3441]">
                <th className="text-left py-2">Symbol</th>
                <th className="text-right py-2">Bid</th>
                <th className="text-right py-2">Ask</th>
            </tr>
            </thead>
        </table>
            
        <div className="flex-1 overflow-y-auto trading-scrollbar" >
        <table className="w-full text-sm">
                <tbody>
                {assets?.map((asset) => (
                    <tr
                    key={asset.symbol}
                    onClick={() => onSelectInstrument(asset)}
                    className={`cursor-pointer hover:bg-[#1a1f26] transition-colors ${
                        selectedInstrument?.symbol === asset.symbol
                        ? 'bg-[#1a1f26] border-l-2 border-l-[#ff6b00]'
                        : ''
                    }`}
                    >
                    {/* Symbol */}
                    <td className="px-4 py-3 text-white font-medium">
                        {asset.symbol}
                    </td>

                    {/* Bid */}
                    <td className="px-4 py-3 text-right text-green-400 font-mono">
                        {Number(asset.buyPrice).toFixed(asset.decimals)}
                    </td>

                    {/* Ask */}
                    <td className="px-4 py-3 text-right text-red-400 font-mono">
                        {Number(asset.sellPrice).toFixed(asset.decimals)}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>

            </div>
        </div>
        </div>
  );
};

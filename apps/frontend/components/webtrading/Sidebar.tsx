"use client";
import { TradingInstrument } from "@/lib/types";
import { Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { WsManager } from "@/lib/WsManager";
import axios from "axios";
import Image from "next/image";

export interface WsTradeData{
    data: {
        buy: number;
        market: string;
        sell: number;
        time: number;
    },
    market: string;
    type: "TRADE";
  }

interface SidebarProps {
    selectedInstrument: TradingInstrument ;
    onSelectInstrument: (instrument: TradingInstrument) => void;
    assets: TradingInstrument[];
}

export const Sidebar = ({ selectedInstrument, onSelectInstrument, assets: fetchAssets }: SidebarProps) => {

    const [searchTerm, setSearchTerm] = useState('');
    // const [activeTab, setActiveTab] = useState('all');
    const [assets, setAssets] = useState<TradingInstrument[]>(fetchAssets);
    const selectedInstrumentRef = useRef(selectedInstrument);
  
    useEffect(() => {
      selectedInstrumentRef.current = selectedInstrument;
    }, [selectedInstrument]);
  

    useEffect(() => {
        async function fetchAndSubscribe() {
          try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:4000/api/v1/asset", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const initialAssets: TradingInstrument[] = res.data.assets;
            setAssets(initialAssets);
    
            const wsInstance = WsManager.getInstance();

            wsInstance.registerCallback('trade', (data: WsTradeData) => {
    
              setAssets(prevAssets => 
                prevAssets.map(asset => {
                  if (asset.symbol.toLowerCase() === data.market) {
                    return {
                      ...asset,
                      buyPrice: String(data.data.buy),
                      sellPrice: String(data.data.sell),
                    };
                  }

                  return asset;
                })
              );
    
              const currentSelectedInstrument = selectedInstrumentRef.current;
              if (currentSelectedInstrument && currentSelectedInstrument.symbol.toLowerCase() === data.market) {
                onSelectInstrument({
                  ...currentSelectedInstrument,
                  buyPrice: String(data.data.buy),
                  sellPrice: String(data.data.sell),
                });
              }
            }, 'all-trades');
    
          } catch (error) {
            console.error('Error fetching assets:', error);
          }
        }
    
        fetchAndSubscribe();
    
        return () => {
          const wsInstance = WsManager.getInstance();
          wsInstance.deRegisterCallback('trade', 'all-trades');
        };
      }, [onSelectInstrument]);

    return (
    <div className="w-[20%] h-screen bg-[#141d22] text-gray-200 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between curosr-pointer">
            <h2 className="text-sm text-neutral-400 font-semibold tracking-wide uppercase">Instruments</h2>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-3 border-b border-gray-700">
            <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
                onClick={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                placeholder="Search"
                className="pl-9 bg-neutral-800 border-none text-sm text-gray-300 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            </div>
        </div>

        <div className="py-4 px-2">
            <table className="w-full font-medium text-sm custom-scrollbar">
            <thead>
            <tr className="border-b-2 border-[#2a3441]">
                
                <th className="text-left py-2">Symbol</th>
                <th className="text-right py-2">Bid</th>
                <th className="text-right py-2">Ask</th>
            </tr>
            </thead>
        </table>
            
        <div className="flex-1 overflow-y-auto custom-scrollbar">
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
        <td className="px-4 py-3">
        <div className="w-6 h-6 bg-gray-800">
          <Image
            src={asset.img_url}
            alt={asset.symbol}
            width={24}
            height={24}
            className="rounded-full object-cover"
          />
        </div>
      </td>
          <td className="px-4 py-3 text-white font-medium">
            {asset.symbol}
          </td>
          <td className="px-4 py-3 text-right text-green-400 font-mono">
            {Number(asset.buyPrice).toFixed(asset.decimals)}
          </td>
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

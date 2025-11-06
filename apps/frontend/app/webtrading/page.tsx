"use client";
import OrderForm from "@/components/webtrading/OrderForm";
import { WsManager } from "@/lib/WsManager";
import { TradingInstrument } from "@/lib/types";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Sidebar } from "@/components/webtrading/Sidebar";
import { useEffect, useState } from "react";
import TradeView from "@/components/webtrading/tradeView";
import { Orders } from "@/components/webtrading/Orders";
import { Header } from "@/components/webtrading/Header";
import { useAuthStore } from "@/store/authStore"; 

const Webtrading = () => {
    const token = useAuthStore((state) => state.token);
    const [selectedInstrument, setSelectedInstrument] = useState<TradingInstrument | null>(null);
    const [assets, setAssets] = useState<TradingInstrument[]>([]);;


    useEffect(() => {
        if (token === null) {
            return;
        }
    
        fetchAssets(token);
        const wsInstance = WsManager.getInstance();
        const decoded = jwtDecode(token);
        const userId = (decoded as any)?.userId || "guest"

        wsInstance.sendMessage({
                type: "IDENTIFY",
                userId: userId
            })
        },[token])

    async function fetchAssets(token: string) {
            try {
        
            const res = await axios.get("http://localhost:4000/api/v1/asset", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = res.data;
            if (!data?.assets || !Array.isArray(data.assets)) {
                console.error("Invalid assets response");
                return;
            }

            console.log("Fetched assets:", data.assets);
            const cleanAssets = data.assets.filter(
                (a: any): a is TradingInstrument =>
                a && typeof a.symbol === "string" && a.symbol.length > 0
            );
            setAssets(cleanAssets);
            if (cleanAssets.length > 0 && !selectedInstrument) {
                setSelectedInstrument(cleanAssets[1]);
            }
            } catch (err) {
            console.error("Error fetching assets:", err);
            }
    }


    return (
        <div className="h-full w-full flex flex-col">
        
        <div className="p-4 bg-[#141d22] border-b-4 border-neutral-500">
            <Header 
            assets={assets} />
        </div>

        {/* Main Layout */}
        <div className="flex flex-row bg-[#141920] ">
            <Sidebar
            // @ts-ignore
            selectedInstrument={selectedInstrument}
            onSelectInstrument={setSelectedInstrument}
            assets={assets}/>

            <div className="w-[60%] border-l-4  border-neutral-700">
                <TradeView
                //@ts-ignore
                    market={selectedInstrument?.symbol}/>
                <Orders
                //@ts-ignore
                selectedInstrument={selectedInstrument}
                
                />
            </div>

        
            <div className="w-[20%] border-l-4 border-neutral-700 ml-1">
            
            <OrderForm selectedInstrument={selectedInstrument} />
            </div>
        </div>
        </div>
    );
};

export default Webtrading;

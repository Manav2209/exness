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


const Webtrading = () => {

    const [selectedInstrument, setSelectedInstrument] = useState<TradingInstrument | null>(null);
    const [assets, setAssets] = useState<TradingInstrument[]>([]);
    useEffect(() => {

        fetchAssets();
        },[])

    async function fetchAssets() {
            try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found in localStorage");
                return;
            }

            const decoded = jwtDecode(token);
            const userId = (decoded as any)?.userId;
            if (!userId) {
                console.error("Invalid token: no userId found");
                return;
            }

            const res = await axios.get("http://localhost:3000/api/v1/asset", {
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

    useEffect(() => {
        fetchAssets();
    }, []);

    return (
        <div className="h-full w-full flex flex-col">
        {/* Navbar */}
        <div className="border-b p-4 font-semibold">Navbar</div>

        {/* Main Layout */}
        <div className="flex flex-row ">
        
        
            <Sidebar
            // @ts-ignore
            selectedInstrument={selectedInstrument}
            onSelectInstrument={setSelectedInstrument}
            assets={assets}/>

            <div className="w-[60%] p-4 border-r">
                <TradeView
                //@ts-ignore
                    market={selectedInstrument?.symbol}/>
                <Orders
                //@ts-ignore
                selectedInstrument={selectedInstrument}
                
                />
            </div>

        
            <div className="w-[20%] p-4">
            
            <OrderForm selectedInstrument={selectedInstrument} />
            </div>
        </div>
        </div>
    );
};

export default Webtrading;

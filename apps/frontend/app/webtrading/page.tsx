
import { WsManager } from "@/lib/WsManager";
import { TradingInstrument } from "@/lib/types";
import axios from "axios";
import { useEffect, useState } from "react";

const Webtrading = () => {

    const [selectedInstrument, setSelectedInstrument] =  useState<TradingInstrument| null> (null);
    const [assets, setAssets] = useState<TradingInstrument[]>([]);

    // Fix the code 
    
    async function fetchAssets() {

        const token = localStorage.getItem("token"); 
        if(!token) {
            console.error("No token found in localStorage");
            return;
        }
        const res = await axios.get("/api/v1/assets" , {
            headers:{
                "Authorization":`Bearer ${token}`
            }
        });
        const data = res.data;
        setAssets(data.assets);

        setSelectedInstrument(data.assets[0]);

        const wsInstance = WsManager.getInstance();

        data.assets.forEach((asset: TradingInstrument) => {
            wsInstance.subscribe(asset.symbol.toLowerCase(), "random-user-id");
        });

    }

    useEffect(() => {

        fetchAssets();

    }, []);


    return (
    <div className="h-full w-full">

    
        <div className="flex flex-col items-center justify-center">
            <div>
                {/* Navbar */}
            </div>
            <div className=" flex ">
                <div>
                    Sidebar
                </div>
                <div>
                    Trading View
                </div>
                <div>
                    Trading panel
                </div>
            </div>
        </div>
    </div>
    )
}

export default Webtrading;
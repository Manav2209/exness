"use client";
import { useState } from "react";
import { Plus, Minus, TrendingUp, TrendingDown } from "lucide-react";
import { TradingInstrument } from "@/lib/types";

interface OrderFormProps {
  selectedInstrument: TradingInstrument | null;
}

const OrderForm = ({ selectedInstrument }: OrderFormProps) => {


  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [volume, setVolume] = useState("0.01");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [leverage, setLeverage] = useState(1);

  const formatPrice = (price: number) => price.toFixed(3);

  const incrementVolume = () => {
    setVolume((prev) => (parseFloat(prev) + 0.01).toFixed(2));
  };

  const decrementVolume = () => {
    setVolume((prev) => Math.max(0.01, parseFloat(prev) - 0.01).toFixed(2));
  };

  const marginRequired =
    orderType === "buy"
      ? selectedInstrument
        ? (Number(selectedInstrument.buyPrice) * parseFloat(volume)) / leverage
        : 0
      : selectedInstrument
      ? (Number(selectedInstrument.sellPrice) * parseFloat(volume)) / leverage
      : 0;

  const handlePlaceOrder = async () => {
    if (!selectedInstrument) return;
    const data = {
      type: "market",
      side: orderType,
      leverage,
      QTY: parseFloat(volume),
      TP: takeProfit ? parseFloat(takeProfit) : undefined,
      SL: stopLoss ? parseFloat(stopLoss) : undefined,
      market: selectedInstrument.symbol,
    };

    console.log("Placing order", data);

    try {
      const res = await fetch("http://localhost:4000/api/v1/trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        console.log("✅ Order placed");
        setVolume("0.01");
        setTakeProfit("");
        setStopLoss("");
       // await fetchBalance();
      } else {
        console.error("❌ Failed to place order");
      }
    } catch (err) {
      console.error("Error placing order:", err);
    }
  };

  return (
    <div className="bg-[#141920] rounded-xl p-6 w-full">
      <div className="text-center mb-4">
        <div className="text-gray-400 text-sm font-medium">
          {selectedInstrument?.symbol || "Select Market"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingDown size={16} className="text-red-400 mr-1" />
            <span className="text-red-400 text-xs font-medium">SELL</span>
          </div>
          <div className="text-red-400 text-lg font-mono font-bold">
            {selectedInstrument
              ? formatPrice(Number(selectedInstrument.sellPrice))
              : "--"}
          </div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp size={16} className="text-green-400 mr-1" />
            <span className="text-green-400 text-xs font-medium">BUY</span>
          </div>
          <div className="text-green-400 text-lg font-mono font-bold">
            {selectedInstrument
              ? formatPrice(Number(selectedInstrument.buyPrice))
              : "--"}
          </div>
        </div>
      </div>

      {/* Order type buttons */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setOrderType("buy")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            orderType === "buy"
              ? "bg-green-500 text-white"
              : "bg-[#1a1f26] border border-[#2a3441] text-gray-400"
          }`}
        >
          Market Buy
        </button>
        <button
          onClick={() => setOrderType("sell")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            orderType === "sell"
              ? "bg-red-500 text-white"
              : "bg-[#1a1f26] border border-[#2a3441] text-gray-400"
          }`}
        >
          Market Sell
        </button>
      </div>

      {/* Volume */}
      <div className="mb-4">
        <label className="text-xs text-gray-400 mb-2 block font-medium">
          Volume (Lots)
        </label>
        <div className="flex items-center space-x-2">
          <button
            onClick={decrementVolume}
            className="w-8 h-8 flex justify-center items-center bg-[#1a1f26] border border-[#2a3441] rounded text-gray-400 hover:border-[#ff6b00]"
          >
            <Minus size={14} />
          </button>

          <input
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="max-w-sm w-full bg-[#1a1f26] border border-[#2a3441] rounded-lg px-3 py-2 text-white text-center font-mono focus:border-[#ff6b00]"
          />

          <button
            onClick={incrementVolume}
            className="w-8 h-8 flex justify-center items-center bg-[#1a1f26] border border-[#2a3441] rounded text-gray-400 hover:border-[#ff6b00]"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>


      {/* Take Profit */}
      <div className="mb-4">
        <label className="text-xs text-gray-400 mb-2 block font-medium">
          Take Profit
        </label>
        <input
          value={takeProfit}
          onChange={(e) => setTakeProfit(e.target.value)}
          placeholder="Not set"
          className="w-full bg-[#1a1f26] border border-[#2a3441] rounded-lg px-3 py-2 text-white font-mono focus:border-[#ff6b00]"
        />
      </div>

      {/* Stop Loss */}
      <div className="mb-4">
        <label className="text-xs text-gray-400 mb-2 block font-medium">
          Stop Loss
        </label>
        <input
          value={stopLoss}
          onChange={(e) => setStopLoss(e.target.value)}
          placeholder="Not set"
          className="w-full bg-[#1a1f26] border border-[#2a3441] rounded-lg px-3 py-2 text-white font-mono focus:border-[#ff6b00]"
        />
      </div>

      {/* Leverage */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-gray-400 font-medium">Leverage</label>
          <span className="text-xs text-white font-mono bg-[#2a3441] px-2 py-1 rounded">
            1:{leverage}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="40"
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Margin Info */}
      <div className="bg-[#1a1f26] rounded-lg cursor-pointer p-4 mb-4">
        <div className="text-xs text-gray-400 mb-1">Margin Required:</div>
        <div className="text-white font-mono text-sm">
          {marginRequired.toFixed(2)} USD
        </div>
      </div>

      {/* Place Order Button */}
      <button
        className={`w-full py-3 rounded-lg font-bold text-white ${
          orderType === "buy"
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
        }`}
        onClick={handlePlaceOrder}
        disabled={!selectedInstrument}
      >
        {orderType === "buy" ? "BUY" : "SELL"} {volume} lots
      </button>
    </div>
  );
};

export default OrderForm;

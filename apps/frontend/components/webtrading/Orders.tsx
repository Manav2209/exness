import { TradingInstrument } from '@/lib/types';
import React, { useEffect, useState } from 'react'

export const Orders = ({selectedInstrument}: {
    selectedInstrument: TradingInstrument
}) => {

    const [openOrders, setOpenOrders] = useState<any[]>([]);
    const [closedOrders, setClosedOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'open' | 'pending' | 'closed'>('open');

    const formatPrice = (price: number) => price.toFixed(3);



    useEffect(() => {
        const fetchOpenOrders = async () => {
            try {
                const res = await fetch("http://localhost:4000/api/v1/trade/open", {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
                });
                if (res.ok) {
                const data = await res.json();
                console.log('Fetched orders:', data);
                setOpenOrders(data.orders);
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
            }
            }
        
            const fetchClosedOrders = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/v1/trade/close", {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
                });
                if (res.ok) {
                const data = await res.json();
                console.log('Fetched closed orders:', data);
                setClosedOrders(data.orders);
                }
            }
        
            catch (err) {
                console.error('Error fetching closed orders:', err);
            }
            }
        
            fetchOpenOrders();
            fetchClosedOrders();
        },[])
  return (
    <div className="flex-1 flex flex-col bg-[#141920] ">
        <div className="flex items-center justify-between p-4 border-b border-[#2a3441]">
          <div className="flex space-x-6">
            {['open', 'closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`text-sm capitalize transition-colors ${
                  activeTab === tab 
                    ? 'text-[#ff6b00] border-b-2 border-[#ff6b00] pb-1 font-medium' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'open' ? (
          openOrders.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              {openOrders.map((order, index) => {
                if (!order) return null;
                return(
                <div
                  key={index}
                  className="p-4 border-b border-[#2a3441] hover:bg-[#1a1f26] transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-white font-mono font-bold">
                      {order?.side?.toUpperCase()} {order.QTY} lots
                    </div>
                    <div className={`text-sm font-mono font-bold ${order?.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {order?.side === 'buy' ? '+' : '-'}{selectedInstrument ? formatPrice(Number(selectedInstrument?.buyPrice) / 100) : '0.000'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">Market: {order?.market}</div>
                  <div className="text-xs text-gray-400">TP: {Number(order?.TP)/100 || 'N/A'} | SL: {Number(order?.SL)/100 || 'N/A'}</div>
            </div>
          )
})}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#1a1f26] rounded-full flex items-center justify-center mb-4 mx-auto">
                  
                </div>
                <div className="text-gray-400 text-sm mb-2">No open positions</div>
                <div className="text-gray-500 text-xs">Your open trades will appear here</div>
              </div>
            </div>
            
          )) : (
            closedOrders.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
                {closedOrders.map((order, index) => {
                  if (!order) return null;
                return(
                <div
                    key={index}
                    className="p-4 border-b border-[#2a3441] hover:bg-[#1a1f26] transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-white font-mono font-bold">
                        {order?.side.toUpperCase()} {order.QTY} lots
                      </div>
                      <div className={`text-sm font-mono font-bold ${order?.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {order?.side === 'buy' ? '+' : '-'}{selectedInstrument ? formatPrice(Number(selectedInstrument.buyPrice)/100) : '0.000'}
                    </div>
                  </div>
                  <div className="text-xs
                    text-gray-400 mb-1">Market: {order?.market}</div>
                  <div className="text-xs text-gray-400">TP: {order?.TP || 'N/A'} | SL: {order?.SL || 'N/A'}</div>
                  </div>
                )
})}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#1a1f26] rounded-full flex items-center justify-center mb-4 mx-auto">
                      
                    </div>
                    <div className="text-gray-400 text-sm mb-2">No closed positions</div>
                    <div className="text-gray-500 text-xs">Your closed trades will appear here</div>
                  </div>
                </div>
              )
            
        )}
      </div>
      
  )
}

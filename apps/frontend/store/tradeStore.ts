import { create} from 'zustand';

interface TradeStore {
    orderUpdateCount: number;
    triggerOrderUpdate: () => void;
}

export const useTradeStore = create<TradeStore>((set) => ({
  orderUpdateCount: 0,
  triggerOrderUpdate: () => 
    set((state) => ({ orderUpdateCount: state.orderUpdateCount + 1 })),
}));
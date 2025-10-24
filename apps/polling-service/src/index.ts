import { BINANCE_WS_URL, POLLING_ENGINE_QUEUE_NAME , POLLING_ENGINE_EVENT_CHANNEL } from "@repo/common";
import { publisher , subscriber , redis } from "@repo/shared-redis";

interface msgType {
  type: "SUBSCRIBE" | "UNSUBSCRIBE";
  market: string;
}
let SUBSCRIBED_MARKETS: Map<string, WebSocket> = new Map(); // this is to tell which markets are subscribed   <market , Websocket> type ==>  <"btc" : WebSocket>

async function main () {

    const subscribeClient =  subscriber;

    subscribeClient.subscribe(POLLING_ENGINE_EVENT_CHANNEL, (msg) => {
      const data: msgType = JSON.parse(msg);
  
      if (data.type === "SUBSCRIBE") {
        handleSubscribeMarket(data.market);
      } else if (data.type === "UNSUBSCRIBE") {
        handleUnsubscribeMarket(data.market);
      }
    });

}

async function handleSubscribeMarket (market : string) {

  console.log(`Subscribed to market: ${market}`);
  // Add your logic to handle market subscription here

  if(SUBSCRIBED_MARKETS.has(market)){
    console.log(`Market ${market} is already subscribed.`);
    return;
  }
  // Example: Create a new WebSocket connection for the market
  const webSocket = new WebSocket(
    `${BINANCE_WS_URL}${market.toLowerCase()}@trade`
  );

  webSocket.onopen = () => {
    console.log(`WebSocket connection established for market: ${market}`);
    SUBSCRIBED_MARKETS.set(market, webSocket);
  };

  webSocket.onmessage =  async (msg) => {
    const tradeData = JSON.parse(msg.data);
    console.log(`Trade data for ${market}:`, tradeData);

    // these data is push for batch update in db
    await publisher.lPush(
      POLLING_ENGINE_QUEUE_NAME,
      JSON.stringify(tradeData.data)
    );

    const tickerData = {
      // I will sell you in more but buy in less
      buy: parseFloat(tradeData.data.p) - parseFloat(tradeData.data.p) * 0.01 * 0.4,
      sell: parseFloat(tradeData.data.p) + parseFloat(tradeData.data.p) * 0.01 * 0.4,
      market: market,
      time: tradeData.data.E,
    }
    console.log("Publishing to this market", market);

    await publisher.publish(
      market.toLowerCase(),
      JSON.stringify(tickerData)
    )

  };

  webSocket.onclose = () => {
    SUBSCRIBED_MARKETS.delete(market);
  };

  webSocket.onerror = (err) => {
    console.log("Get Error on websocket connection", err);
  };

}

async function handleUnsubscribeMarket (market : string) {
  console.log(`Unsubscribed from market: ${market}`);
  // Add your logic to handle market unsubscription here
  if (SUBSCRIBED_MARKETS.has(market)) {
    const ws = SUBSCRIBED_MARKETS.get(market);
    ws?.close();
    SUBSCRIBED_MARKETS.delete(market);
  }
}


main();
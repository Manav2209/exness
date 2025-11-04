import  express  from'express';
import cors from 'cors';
import authRouter from './routes/authRoute.js';
import tradeRouter from './routes/tradeRoute.js';
import startTradeListening from './tradeListener.js';
import { assetRouter } from './routes/assetRoute.js';
import { systemRouter } from './routes/systemRoutes.js';
import { balanceRouter } from './routes/balanceRoute.js';
import { candleRouter } from './routes/candleRoute.js';



const app = express();
app.use(express.json());
app.use(cors());

startTradeListening().catch((err) => {
    console.error("Failed to start trade listener:", err);
    process.exit(1);
});



app.use("/api/v1/auth", authRouter);
app.use("/api/v1/trade" , tradeRouter);
app.use("/api/v1/asset" , assetRouter);
app.use("/api/v1/system", systemRouter);
app.use("/api/v1/balance" , balanceRouter);
app.use("/api/v1/candles" , candleRouter);

app.listen(4000, () => {
    console.log('API server is running on http://localhost:4000');
});




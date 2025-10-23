import  express  from'express';
import cors from 'cors';
import authRouter from './routes/authRoute.js';
import tradeRouter from './routes/tradeRoute.js';
import startTradeListening from './tradeListener.js';



const app = express();
app.use(express.json());
app.use(cors());

startTradeListening().catch((err) => {
    console.error("Failed to start trade listener:", err);
    process.exit(1);
});



app.use("/api/v1/auth", authRouter);
app.use("/api/v1/trade" , tradeRouter);

app.listen(3000, () => {
    console.log('API server is running on http://localhost:3000');
});




import  express  from'express';
import cors from 'cors';
import authRouter from './routes/authRoute.ts';
import tradeRouter from './routes/tradeRoute.ts';



const app = express();
app.use(express.json());
app.use(cors());


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/trade" , tradeRouter);

app.listen(3000, () => {
    console.log('API server is running on http://localhost:3000');
});




import { Request , Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  { prismaClient } from "@repo/db/client";
import { redis } from "@repo/shared-redis";
import dotenv from "dotenv";
dotenv.config();




export const signin =  async  (req : Request, res: Response) => {
  
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
        }
    
    const user = await prismaClient.user.findUnique({
        where: {
            username: username,
        },
        });
    
    if (!user) {
        return res.status(403).json({ error: "" });
        }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
        return res.status(403).json({ error: "Error while signing up" });
      }
    
    const JSON_WEB_TOKEN_SECRET = process.env.JSON_WEB_TOKEN_SECRET;
    
      if (!JSON_WEB_TOKEN_SECRET) {
        return res.status(500).json({ error: "Error while signing up" });
        }
    
      const token = jwt.sign({ username, userId: user.id }, JSON_WEB_TOKEN_SECRET);
  
      res.status(200).json({ userId: user.id, token: token });

};

export const signup = async (req : Request, res : Response) => {

    const { username, password, email } = req.body;
  
    if (!username || !password || !email) {
      return res.status(400).json({ error: "Missing username or password" });
    }
  
    const userExists = await prismaClient.user.findUnique({
      where: {
        username: username,
      },
    });

    if(userExists){
      return  res.status(409).json({ error: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prismaClient.user.create({
      data: {
        email,
        username,
        password: passwordHash,
      },
    });

    redis.hSet(user.id, {
      username: user.username,
      email: user.email,
      balance: JSON.stringify({
        usd: "500000",
        locked_usd: "0",
      }),
      locked_balance: "0",
    });
  
    const JSON_WEB_TOKEN_SECRET = process.env.JSON_WEB_TOKEN_SECRET;
  
    if (!JSON_WEB_TOKEN_SECRET) {
      return res.status(500).json({ error: "Missing JSON_WEB_TOKEN_SECRET" });
    }
    const token = jwt.sign(
      { username: user.username, userId: user.id },
      JSON_WEB_TOKEN_SECRET
    );
  
    res.status(201).json({ userId: user.id, token: token });
  };
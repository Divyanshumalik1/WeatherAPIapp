import { Router } from "express";
import 'dotenv/config'; // or require('dotenv').config();

// example
// https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/London,UK?key=YOUR_API_KEY 

//const router = Router();

//const express = require('express')
import express from 'express'
import cors from 'cors';

const key = process.env.API_KEY;
console.log(key);

const app = express();
app.use(cors({
    origin: 'http://localhost:5173'
}));

import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-10269.c245.us-east-1-3.ec2.cloud.redislabs.com',
        port: 10269
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar


// GET REQUEST to endpoints
app.get('/:city', async (req, res) => {

  let data = null;
  let inredis = await client.get(req.params.city);

  if (inredis) {
    data = JSON.parse(inredis);              // 🔁 string → object
  } else {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${req.params.city}?key=${key}`;
    const response = await fetch(url);
    data = await response.json();
    await client.set(req.params.city, JSON.stringify(data), {EX: 60}); // 🔁 object → string
  }

  res.json(data.days[0]);
});

let arr = []

app.post('/hello', (req, res) => {
    arr = [...arr, "buffalo"];
    res.json(arr);
})

app.put('/hello', (req, res) => {
    arr[0] = "dfgdfgdfg";
    arr[2] = "sfasafasfa";
    res.json(arr);
})

const port = 3001

app.listen(port, () => {
    console.log(`hi i am listening to port ${port}`);
})




/* 
In this Code we implement this project specifications 

https://roadmap.sh/projects/weather-api-wrapper-service?fl=0

*/


import { Router } from "express";
import 'dotenv/config'; // or require('dotenv').config();

// example
// https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/London,UK?key=YOUR_API_KEY 

//const router = Router();

//const express = require('express')

/*
Just a basic express server we created here
*/
import express from 'express'
import cors from 'cors';

const key = process.env.API_KEY;
console.log(key);

const app = express();
app.use(cors({
    origin: 'http://localhost:5173'
}));


/*
Here we connect basically to the redis server by calling createClient and giving it certain keys to set up the connections
*/

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


/*
This is most important part we basically have a route specified on the root path and allow for a user specified parameter using colon :city
so whenever we make a get request on this path say localhost:3000/city_name  or maybe curl 'localhost:3000/city_name' then this request is processed
it includes a callback function which processes the request and returns a response. 

we basically check if data i.e req.params.city is already pressent in the redis cache DB or not. If it is there we fetch it and return as response.
If the data is not present in cache we make an API call to the weather API by sepcifying the city name as req.params.city and also the API key we obtained from 
their website. Then we call async fetch which returns our needed data. 

We then cache this data and specify an expiration timeline (EX flag in the set command) as well so our redis DB is not full that easily.

We also have to add the rate limiter to prevent abuse of the weather API. 
*/

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



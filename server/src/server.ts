import mongoose from 'mongoose';import {app} from './app.js';import {env} from './config/env.js';
if(!env.mongoUri){console.error('MONGODB_URI is required. Copy .env.example to .env and configure MongoDB.');process.exit(1);}
try{await mongoose.connect(env.mongoUri);app.listen(env.port,()=>console.log(`AI Mystery Room API listening on http://localhost:${env.port}`));}catch(error){console.error('Could not connect to MongoDB:',error instanceof Error?error.message:'unknown error');process.exit(1);}

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

export default async function dbConnect() {
    if (mongoose.connection.readyState >= 1) {
         return   mongoose.connection.asPromise();
    }
    
    if (!MONGO_URI) {
        throw new Error('Please define the MONGO_URI enviroment varible inside .env');
    } 
    
   

  return await  mongoose.connect(MONGO_URI) ;
}
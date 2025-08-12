import mongoose from 'mongoose';

export const ConnectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
}
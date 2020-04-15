import * as mongoose from 'mongoose';

export interface ILogin extends mongoose.Document {
    username: string;
    password: string;
}

const LoginSchema: mongoose.Schema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

export default mongoose.model<ILogin>('login', LoginSchema);
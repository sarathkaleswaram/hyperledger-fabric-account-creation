import * as mongoose from 'mongoose';

export interface IUsers extends mongoose.Document {
    accountId: string;
    onBoard: boolean;
    ccKey?: string;
}

const UserSchema: mongoose.Schema = new mongoose.Schema({
    accountId: { type: String, required: true, unique: true },
    onBoard: { type: Boolean, required: true },
    ccKey: { type: String },
});

export default mongoose.model<IUsers>('user', UserSchema);
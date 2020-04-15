import * as express from "express";
import * as bodyParser from 'body-parser';
import * as mongoose from "mongoose";
import * as fs from 'fs';
import * as path from 'path';
import * as morgan from 'morgan';
import cors = require('cors');
import logins from './models/logins';

import login from "./api/login"
import enrollAdmin from "./api/enrollAdmin"
import registerUser from "./api/registerUser"
import createUser from "./api/createUser"
import getAllUsers from "./api/getAllUsers"
import getUserTxs from "./api/getUserTxs"
import { setUsers, getUsers } from "./api/users"

// Hyperledger
const configPath = path.join(__dirname, '..', 'config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
export const config = JSON.parse(configJSON);

const connection_file = config.connection_file;
export const ccpPath = path.resolve(__dirname, '..', '..', connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
export const ccp = JSON.parse(ccpJSON);

// MongoDB
const PORT = config.port || 3003
const MONGO_URL = config.MONGO_URL || '127.0.0.1:27017'

let mongoConnectionString = `mongodb://${MONGO_URL}/account_creation`;

mongoose.connect(mongoConnectionString, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false });
let db = mongoose.connection;
db.once('open', async () => {
    console.log('MongoDB Successfully Connected! \n');

    let user = await logins.findOne({ username: config.username, password: config.password }).exec();
    if (user == null) {
        await logins.create({
            username: config.username,
            password: config.password
        });
    }
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Express
const app = express()

app.options('*', cors())
app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())

app.get("/", (req, res) => {
    res.send("<h1>Hyperledger Server Running</h1>")
})

app.get("/enrollAdmin", enrollAdmin)
app.get("/registerUser", registerUser)
app.post("/login", login)
app.post("/setUsers", setUsers)
app.get("/getUsers", getUsers)
// Chaincode methods
app.post("/createUser", createUser)
app.get("/getAllUsers", getAllUsers)
app.post("/getUserTxs", getUserTxs)

app.listen(PORT, () => {
    console.log(`\nServer is running on port: ${PORT}`)
})

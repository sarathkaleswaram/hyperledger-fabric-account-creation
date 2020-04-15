import { FileSystemWallet, Gateway } from 'fabric-network';
import * as path from 'path';
import { config, ccpPath } from '../server';
import { encrypt, decrypt } from '../lib/crypto';
import users from '../models/users';

export default async function createUser(req, res) {
    console.log("\n/createUser", req.body);
    try {
        if (req.body === undefined ||
            req.body === null ||
            req.body.accountId == undefined ||
            req.body.firstname == undefined ||
            req.body.lastname == undefined ||
            req.body.status == undefined) {
            res.json({
                status: 'FAILED',
                message: "Invalid Request. missing input information"
            })
            return;
        }
        var channel = config.channel;
        var chaincode = config.chaincode;
        var gatewayDiscovery = config.gatewayDiscovery;

        var user = config.user;

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the enrollmentID.
        const userExists = await wallet.exists(user);
        if (!userExists) {
            console.log('Run the registerUser.ts application before retrying');
            res.json({
                status: 'FAILED',
                message: `An identity for the enrollmentID ${user} does not exist in the wallet`
            })
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: user, discovery: gatewayDiscovery });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channel);

        // Get the contract from the network.
        const contract = network.getContract(chaincode);

        const allUsers = await contract.evaluateTransaction('getAllUsers');
        let usersRecords = JSON.parse(allUsers.toString());
        let acKey = "AC" + usersRecords.length;

        console.log("New Key: ", acKey);

	await users.findOneAndUpdate({accountId: req.body.accountId}, {
	    onBoard: true,
            ccKey: acKey
	});

        let data = {
            firstname: req.body.firstname,
            lastname: req.body.lastname
        }

        let sensitive_data = encrypt(JSON.stringify(data));
        console.log("Encrypted data: ", sensitive_data);

        // Submit the specified transaction.
        let result = await contract.submitTransaction('createUser', acKey, req.body.accountId, req.body.status, sensitive_data);
        if (result.toString().length > 1) {
            res.json({
                status: 'FAILED',
                message: result.toString()
            })
        } else {
            res.json({
                status: 'SUCCESS',
                message: `Transaction has been submitted`
            })
        }
    } catch (error) {
        res.json({
            status: 'FAILED',
            message: `${error}`
        })
    }
}

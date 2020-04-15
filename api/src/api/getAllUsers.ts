import { FileSystemWallet, Gateway } from 'fabric-network';
import * as path from 'path';
import { config, ccpPath } from '../server';

export default async function getAllUsers(req, res) {
    console.log("\n/getAllUsers");
    try {
        var channel = config.channel;
        var chaincode = config.chaincode;
        var gatewayDiscovery = config.gatewayDiscovery;

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        var user = config.user;

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

        // Evaluate the specified transaction.
        const result = await contract.evaluateTransaction('getAllUsers');
        res.json({
            status: 'SUCCESS',
            data: JSON.parse(result.toString())
        })

    } catch (error) {
        res.json({
            status: 'FAILED',
            message: `Failed to evaluate transaction: ${error}`
        })
    }
}

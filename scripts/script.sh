#!/bin/bash

ORDERER=orderer.example.com:7050
CHANNEL_NAME=mychannel
CC_NAME=ac
CC_VERSION=1.0
CC_LANG=golang
CC_PATH=github.com/chaincode/
DELAY=3
COUNTER=1
MAX_RETRY=10

verifyResult() {
    if [ $1 -ne 0 ]; then
        echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
        echo "========= ERROR !!! FAILED to start network ==========="
        echo
        exit 1
    fi
}

createChannel() {
    sleep $DELAY

    set -x
    peer channel create \
        -o $ORDERER \
        -c $CHANNEL_NAME \
        -f ./channel-artifacts/channel.tx \
        --tls \
        --cafile $ORDERER_CA >&log.txt

    res=$?
    set +x
    cat log.txt
    verifyResult $res "Channel creation failed"
    echo "===================== Channel '$CHANNEL_NAME' created ===================== "
    echo
}

joinChannel() {
    sleep $DELAY

    CORE_PEER_ADDRESS=peer0.org1.example.com:7051
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA_CERT

    set -x
    peer channel join -b $CHANNEL_NAME.block >&log.txt
    res=$?
    set +x
    cat log.txt
    if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
        COUNTER=$(expr $COUNTER + 1)
        echo "peer0.org1 failed to join the channel, Retry after $DELAY seconds"
        sleep $DELAY
        joinChannel
    else
        COUNTER=1
    fi
    verifyResult $res "After $MAX_RETRY attempts, peer0.org1 has failed to join channel '$CHANNEL_NAME' "

    echo "===================== peer0.org1 joined channel '$CHANNEL_NAME' ===================== "

    CORE_PEER_ADDRESS=peer1.org1.example.com:8051
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER1_ORG1_CA_CERT

    set -x
    peer channel join -b $CHANNEL_NAME.block >&log.txt
    res=$?
    set +x
    cat log.txt
    if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
        COUNTER=$(expr $COUNTER + 1)
        echo "peer1.org1 failed to join the channel, Retry after $DELAY seconds"
        sleep $DELAY
        joinChannel
    else
        COUNTER=1
    fi
    verifyResult $res "After $MAX_RETRY attempts, peer1.org1 has failed to join channel '$CHANNEL_NAME' "

    echo "===================== peer1.org1 joined channel '$CHANNEL_NAME' ===================== "
    echo
    echo "===================== Peers joined channel '$CHANNEL_NAME' ===================== "
    echo
}

updateAnchorPeers() {
    sleep $DELAY

    CORE_PEER_ADDRESS=peer0.org1.example.com:7051
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA_CERT

    set -x
    peer channel update \
        -o $ORDERER \
        -c $CHANNEL_NAME \
        -f ./channel-artifacts/Org1MSPanchors.tx \
        --tls \
        --cafile $ORDERER_CA >&log.txt
    res=$?
    set +x
    cat log.txt
    verifyResult $res "Anchor peer update failed"

    echo "===================== Anchor peers updated on channel '$CHANNEL_NAME' ===================== "
    echo
}

installChaincode() {
    sleep $DELAY

    CORE_PEER_ADDRESS=peer0.org1.example.com:7051
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA_CERT

    set -x
    peer chaincode install \
        -n $CC_NAME \
        -v $CC_VERSION \
        -p $CC_PATH \
        -l $CC_LANG >&log.txt
    res=$?
    set +x
    cat log.txt
    verifyResult $res "Chaincode installation on peer0.org1 has failed"

    CORE_PEER_ADDRESS=peer1.org1.example.com:8051
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER1_ORG1_CA_CERT

    set -x
    peer chaincode install \
        -n $CC_NAME \
        -v $CC_VERSION \
        -p $CC_PATH \
        -l $CC_LANG >&log.txt
    res=$?
    set +x
    cat log.txt
    verifyResult $res "Chaincode installation on peer1.org1 has failed"

    echo "===================== Chaincode is installed on all peers ===================== "
    echo
    peer chaincode list --installed
    echo "===================== Chaincode installed list ===================== "
    echo
}

instantiateChaincode() {
    sleep $DELAY

    CORE_PEER_ADDRESS=peer0.org1.example.com:7051
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA_CERT

    set -x
    peer chaincode instantiate \
        -o $ORDERER \
        -C $CHANNEL_NAME \
        -n $CC_NAME \
        -l $CC_LANG \
        -v $CC_VERSION \
        -c '{"Args":[]}' \
        --tls \
        --cafile $ORDERER_CA \
        --peerAddresses $CORE_PEER_ADDRESS \
        --tlsRootCertFiles $PEER0_ORG1_CA_CERT >&log.txt
    res=$?
    set +x
    cat log.txt
    verifyResult $res "Chaincode instantiation on peer0.org1 on channel '$CHANNEL_NAME' failed"

    echo "===================== Chaincode is instantiated on channel '$CHANNEL_NAME' ===================== "
    echo
}

chaincodeQuery() {
    sleep $DELAY

    CORE_PEER_ADDRESS=peer1.org1.example.com:8051
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER1_ORG1_CA_CERT

    set -x
    peer chaincode query \
        -C $CHANNEL_NAME \
        -n $CC_NAME \
        -c '{"Args":["getAllUsers"]}' >&log.txt
    res=$?
    set +x
    cat log.txt

    CORE_PEER_ADDRESS=peer0.org1.example.com:7051
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA_CERT

    echo "===================== Chaincode query success ===================== "
    echo
    peer chaincode list --instantiated -C $CHANNEL_NAME
    echo "===================== Chaincode instantiated list ===================== "
    echo
}

CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
CORE_PEER_LOCALMSPID="Org1MSP"
PEER0_ORG1_CA_CERT=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
PEER1_ORG1_CA_CERT=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt
ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo
echo "Creating channel..."
createChannel

echo "Having all peers join the channel..."
joinChannel

echo "Updating anchor peers..."
updateAnchorPeers

echo "Installing chaincode..."
installChaincode

echo "Instantiating chaincode..."
instantiateChaincode

echo "Querying chaincode..."
chaincodeQuery

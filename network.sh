#!/bin/bash

function printHelp() {
  echo "Usage: "
  echo "	./network.sh generate"
  echo "	./network.sh up"
  echo "	./network.sh down"
  echo "	./network.sh start-api"
  echo "	./network.sh start-web"
  echo "	./network.sh start-explorer"
  echo "	./network.sh init"
}

function generateCerts() {
  which cryptogen
  if [ "$?" -ne 0 ]; then
    echo "cryptogen tool not found. exiting"
    exit 1
  fi

  echo "============== Generate certificates using cryptogen tool =============="
  if [ -d "crypto-config" ]; then
    rm -Rf crypto-config
  fi

  cryptogen generate --config=./crypto-config.yaml
  res=$?
  if [ $res -ne 0 ]; then
    echo "Failed to generate certificates..."
    exit 1
  fi

  echo
  echo "Generate CCP files for Org1"
  ./ccp-generate.sh
}

function generateChannelArtifacts() {
  which configtxgen
  if [ "$?" -ne 0 ]; then
    echo "configtxgen tool not found. exiting"
    exit 1
  fi

  if [ -d channel-artifacts ]; then
    echo
  else
    mkdir channel-artifacts
  fi

  echo "==============  Generating Orderer Genesis block =============="
  configtxgen -profile ACOrdererGenesis -channelID $SYS_CHANNEL -outputBlock ./channel-artifacts/genesis.block
  res=$?
  if [ $res -ne 0 ]; then
    echo "Failed to generate orderer genesis block..."
    exit 1
  fi
  echo
  echo "==============  Generating channel configuration transaction 'channel.tx' =============="
  configtxgen -profile ACChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME
  res=$?
  if [ $res -ne 0 ]; then
    echo "Failed to generate channel configuration transaction..."
    exit 1
  fi
  echo
  echo "==============  Generating anchor peer update for Org1MSP  =============="
  configtxgen -profile ACChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
  res=$?
  if [ $res -ne 0 ]; then
    echo "Failed to generate anchor peer update for Org1MSP..."
    exit 1
  fi
}

function networkUp() {
  export AC_CA1_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk)

  docker-compose up -d
  docker ps -a
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to start network"
    exit 1
  fi

  echo
  echo "Sleep 5 sec to run all containers"
  sleep 5

  docker exec cli scripts/script.sh
  if [ $? -ne 0 ]; then
    echo "ERROR !!!!"
    exit 1
  fi
}

function networkDown() {
  export AC_CA1_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk)

  docker-compose down --volumes --remove-orphans
  docker-compose -f explorer-docker-compose.yaml down --volumes --remove-orphans
  
  CONTAINER_IDS=$(docker ps -a | awk '($13 ~ /dev-peer.*.ac.*/) {print $1}')
  if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" == " " ]; then
    echo "---- No containers available for deletion ----"
  else
    docker rm -f $CONTAINER_IDS
  fi

  docker rmi -f $(docker images | grep dev | awk {'print $3'})
  y | docker network prune
  echo

  rm -rf api/wallet
  sudo rm -rf data/
  echo
}

function startAPI() {
  cd api
  echo
  if [ -d node_modules ]; then
    echo "============== node modules installed already ============="
  else
    echo "============== Installing node modules ============="
    npm install
  fi
  echo

  echo "============== Running API ============="
  npm run start:watch
}

function startWeb() {
  cd web
  echo
  if [ -d node_modules ]; then
    echo "============== node modules installed already ============="
  else
    echo "============== Installing node modules ============="
    npm install
  fi
  echo

  echo "============== Running Web ============="
  npm start
}

function startExplorer() {
  echo "============== Running Explorer ============="
  docker-compose -f explorer-docker-compose.yaml up -d
}

function init() {
  cd api
  if [ -d wallet/admin ]; then
    echo "============== Wallet already exists ============="
  else
    echo "============== Generating Wallet ============="
    mkdir wallet

    curl http://localhost:3003/enrollAdmin
    echo
    curl http://localhost:3003/registerUser
    echo

  fi
}

CHANNEL_NAME=mychannel
SYS_CHANNEL=ac-sys-channel
MODE=$1
if [ "${MODE}" == "up" ]; then
  networkUp
elif [ "${MODE}" == "down" ]; then
  networkDown
elif [ "${MODE}" == "generate" ]; then
  generateCerts
  generateChannelArtifacts
elif [ "${MODE}" == "start-api" ]; then
  startAPI
elif [ "${MODE}" == "start-web" ]; then
  startWeb
elif [ "${MODE}" == "start-explorer" ]; then
  startExplorer
elif [ "${MODE}" == "init" ]; then
  init
else
  printHelp
  exit 1
fi

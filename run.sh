#!/bin/bash
#
# Title: Alyra Project - Timelapse - run.sh
# Description: This script will help to run the Dapp in local
#
network=$1
if [ -z "${network}" ];then
   network="timelapse"
fi
export PATH=$PATH:node_modules/.bin
#rm -rf client/src/contracts/*.json
rm -rf doc/contracts/*.md
truffle comile
truffle deploy --network ${network} --reset
npm run doc
npm --prefix client/ install
truffle run contract-size
rm -rf ./node_modules/webpack
npm --prefix client/ run start

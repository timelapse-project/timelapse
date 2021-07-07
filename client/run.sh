#!/bin/bash
#
# Title: Alyra Project - Timelapse - run.sh
# Description: This script will help to run the Dapp in local
#
cd ../
truffle migrate --reset
cd client/
npm install
npm run start

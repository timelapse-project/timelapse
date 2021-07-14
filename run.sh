#!/bin/bash
#
# Title: Alyra Project - Timelapse - run.sh
# Description: This script will help to run the Dapp in local
#
truffle migrate --network timelapse --reset
npm --prefix client/ install
rm -rf ./node_modules/webpack
npm --prefix client/ run start

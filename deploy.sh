#!/bin/bash
#
# Title: Alyra Project - Timelapse - deploy.sh
# Description: This script will help to deploy the Dapp in Heroku
#
# Update Doc
timelapseContractAddress=$(grep "\"address\": \"0x" client/src/contracts/Timelapse.json | cut -d '"' -f 4)
offeringContractAddress=$(grep "\"address\": \"0x" client/src/contracts/Offering.json | cut -d '"' -f 4)
billingContractAddress=$(grep "\"address\": \"0x" client/src/contracts/Billing.json | cut -d '"' -f 4)
sed -E 's/(Timelapse)([^0]*)(0[xX][0-9a-fA-F]{40})/\1\2'${timelapseContractAddress}'/g' doc/deployed_addresses.md >doc/deployed_addresses.md.tmp;mv doc/deployed_addresses.md.tmp doc/deployed_addresses.md
sed -E 's/(Offering)([^0]*)(0[xX][0-9a-fA-F]{40})/\1\2'${offeringContractAddress}'/g' doc/deployed_addresses.md >doc/deployed_addresses.md.tmp;mv doc/deployed_addresses.md.tmp doc/deployed_addresses.md
sed -E 's/(Billing)([^0]*)(0[xX][0-9a-fA-F]{40})/\1\2'${billingContractAddress}'/g' doc/deployed_addresses.md >doc/deployed_addresses.md.tmp;mv doc/deployed_addresses.md.tmp doc/deployed_addresses.md

# Deploy
heroku login
git add client/src/contracts/*.json
git add doc/deployed_addresses.md
git commit -m "Heroku deployment"
git subtree push --prefix client/ heroku master
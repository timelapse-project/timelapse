#!/bin/bash
#
# Title: Alyra Project - Timelapse - deploy.sh
# Description: This script will help to deploy the Dapp in Heroku
#
# Update Doc
timelapseContractTimelapseAddress=$(grep "\"address\": \"0x" client/src/contracts/Timelapse.json | cut -d '"' -f 4 | tail -1)
offeringContractTimelapseAddress=$(grep "\"address\": \"0x" client/src/contracts/Offering.json | cut -d '"' -f 4 | tail -1)
billingContractTimelapseAddress=$(grep "\"address\": \"0x" client/src/contracts/Billing.json | cut -d '"' -f 4 | tail -1)
migrationsContractTimelapseAddress=$(grep "\"address\": \"0x" client/src/contracts/Migrations.json | cut -d '"' -f 4 | tail -1)
timelapseContractRopstenAddress=$(grep "\"address\": \"0x" client/src/contracts/Timelapse.json | cut -d '"' -f 4 | head -1)
offeringContractRopstenAddress=$(grep "\"address\": \"0x" client/src/contracts/Offering.json | cut -d '"' -f 4 | head -1)
billingContractRopstenAddress=$(grep "\"address\": \"0x" client/src/contracts/Billing.json | cut -d '"' -f 4 | head -1)
migrationsContractRopstenAddress=$(grep "\"address\": \"0x" client/src/contracts/Migrations.json | cut -d '"' -f 4 | head -1)
sed -E 's/( Timelapse)([^0]*)(0[xX][0-9a-fA-F]{40})/\1\2'${timelapseContractTimelapseAddress}'/g' doc/deployed_addresses.md >doc/deployed_addresses.md.tmp;mv doc/deployed_addresses.md.tmp doc/deployed_addresses.md
sed -E 's/( Offering)([^0]*)(0[xX][0-9a-fA-F]{40})/\1\2'${offeringContractTimelapseAddress}'/g' doc/deployed_addresses.md >doc/deployed_addresses.md.tmp;mv doc/deployed_addresses.md.tmp doc/deployed_addresses.md
sed -E 's/( Billing)([^0]*)(0[xX][0-9a-fA-F]{40})/\1\2'${billingContractTimelapseAddress}'/g' doc/deployed_addresses.md >doc/deployed_addresses.md.tmp;mv doc/deployed_addresses.md.tmp doc/deployed_addresses.md
sed -E 's/( Migrations)([^0]*)(0[xX][0-9a-fA-F]{40})/\1\2'${migrationsContractTimelapseAddress}'/g' doc/deployed_addresses.md >doc/deployed_addresses.md.tmp;mv doc/deployed_addresses.md.tmp doc/deployed_addresses.md
sed -E 's/(Timelapse )([^0]*)(0[xX][0-9a-fA-F]{40})/\1\2'${timelapseContractRopstenAddress}'/g' doc/deployed_addresses.md >doc/deployed_addresses.md.tmp;mv doc/deployed_addresses.md.tmp doc/deployed_addresses.md
sed -E 's/(Offering )([^0]*)(0[xX][0-9a-fA-F]{40})/\1\2'${offeringContractRopstenAddress}'/g' doc/deployed_addresses.md >doc/deployed_addresses.md.tmp;mv doc/deployed_addresses.md.tmp doc/deployed_addresses.md
sed -E 's/(Billing )([^0]*)(0[xX][0-9a-fA-F]{40})/\1\2'${billingContractRopstenAddress}'/g' doc/deployed_addresses.md >doc/deployed_addresses.md.tmp;mv doc/deployed_addresses.md.tmp doc/deployed_addresses.md
sed -E 's/(Migrations )([^0]*)(0[xX][0-9a-fA-F]{40})/\1\2'${migrationsContractRopstenAddress}'/g' doc/deployed_addresses.md >doc/deployed_addresses.md.tmp;mv doc/deployed_addresses.md.tmp doc/deployed_addresses.md

# Deploy
heroku login
git add client/src/contracts/*.json
git add doc/deployed_addresses.md
git commit -m "Heroku deployment"
git subtree push --prefix client/ heroku master
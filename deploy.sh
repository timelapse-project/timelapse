#!/bin/bash
#
# Title: Alyra Project - Timelapse - deploy.sh
# Description: This script will help to deploy the Dapp in Heroku
#
heroku login
git add client/src/contracts/*.json
git commit -m "Heroku deployment"
git subtree push --prefix client/ heroku master
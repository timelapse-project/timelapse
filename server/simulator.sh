#!/bin/bash
#
# Title: Alyra Project - Timelapse - Telecom Operator Simulator
# Description: This script will help to simulate the Telecom operator for the POC demonstration
#
SEPARATOR="#################################"
TITLE="         Telecom Operator Simulator       "
phoneHash1="0x718CEA3706787aa03Bd936b76303fA00660C5f42"
phoneHash2="0x3ad53d26D15A658A84Fe8cA9FFc8aA3a7240C1a0"
phoneHash3="0x8f748A5f24C9Bb2ee47727fB07018614B0b25897"
generatedID="0x0000000000000000000000000000000000000000"
serverURL=http://localhost:8081

generateRandomId() {
    generatedID="0x"$(openssl ecparam -name secp256k1 -genkey -noout | openssl ec -text -noout | grep pub -A 5 | tail -n +2 | tr -d '\n[:space:]:' | sed 's/^04//' | keccak-256sum -x -l | tr -d ' -' | tail -c 41)
}

while [ TRUE ];do
    clear
    echo $SEPARATOR
    echo $TITLE
    echo " "
    echo "Select your option: "
    echo "0 : Exit simulator"
    echo "1 : Initialize Smart contract"
    echo "10: Send lowBalance (" ${phoneHash1} ")"
    echo "11: Send lowBalance (" ${phoneHash2} ")"
    echo "12: Send lowBalance (" ${phoneHash3} ")"
    echo "20: Send acceptance (" ${phoneHash1} ")"
    echo "21: Send acceptance (" ${phoneHash2} ")"
    echo "30: Send topUp (" ${phoneHash1} ")"
    echo "31: Send topUp (" ${phoneHash2} ")"
    echo " "
    read -p "Your choice: " choice
    if [ "${choice}" -eq "${choice}" 2>/dev/null ];then
        if [ ${choice} -eq 0 ];then
           exit 0
        elif [ ${choice} -eq 1 ];then
           echo " "
           generateRandomId
           curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"id":"'${generatedID}'","minScoring":8,"description":"10€ + 0.5€"}' \
                ${serverURL}/addPackage
           generateRandomId
           curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"id":"'${generatedID}'","minScoring":6,"description":"8€ + 0.5€"}' \
                ${serverURL}/addPackage
           generateRandomId
           curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"id":"'${generatedID}'","minScoring":4,"description":"5€ + 0.5€"}' \
                ${serverURL}/addPackage
           generateRandomId
           curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"id":"'${generatedID}'","minScoring":2,"description":"2€ + 0.5€"}' \
                ${serverURL}/addPackage
           echo " "
           read -p "Press any key to continue"
        elif [ ${choice} -eq 10 ];then
            generateRandomId
            echo "lowBalance" $generatedID
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":0,"id":"'${generatedID}'","phoneHash":"'${phoneHash1}'"}' \
                ${serverURL}/lowBalance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 11 ];then
            generateRandomId
            echo "lowBalance" $generatedID
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":0,"id":"'${generatedID}'","phoneHash":"'${phoneHash2}'"}' \
                ${serverURL}/lowBalance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 12 ];then
            generateRandomId
            echo "lowBalance" $generatedID
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":0,"id":"'${generatedID}'","phoneHash":"'${phoneHash3}'"}' \
                ${serverURL}/lowBalance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 20 ];then
            generateRandomId
            echo " "
            read -p "Enter offerId: " offerId 
            read -p "Enter proposalId: " proposalId
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":2,"id":"'${generatedID}'","phoneHash":"'${phoneHash1}'","offerId":"'${offerId}'","proposalId":"'${proposalId}'"}' \
                ${serverURL}/acceptance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 21 ];then
            generateRandomId
            echo " "
            read -p "Enter offerId: " offerId 
            read -p "Enter proposalId: " proposalId
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":2,"id":"'${generatedID}'","phoneHash":"'${phoneHash2}'","offerId":"'${offerId}'","proposalId":"'${proposalId}'"}' \
                ${serverURL}/acceptance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 30 ];then
            generateRandomId
            echo " "
            read -p "Enter productId: " productId 
            read -p "Enter amount: " amount
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":4,"id":"'${generatedID}'","phoneHash":"'${phoneHash1}'","productId":"'${productId}'","amount":'${amount}'}' \
                ${serverURL}/topUp
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 31 ];then
            generateRandomId
            echo " "
            read -p "Enter productId: " productId 
            read -p "Enter amount: " amount
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":4,"id":"'${generatedID}'","phoneHash":"'${phoneHash2}'","productId":"'${productId}'","amount":'${amount}'}' \
                ${serverURL}/topUp
            echo " "
            read -p "Press any key to continue"
        else
            echo "Wrong choice ! (" ${choice} ")"
            read -p "Press any key to continue"
        fi
    fi
done


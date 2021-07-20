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
reference=0
serverURL=http://localhost:8081
partnerCode="TL";

generateRandomId() {
    generatedID="0x"$(openssl ecparam -name secp256k1 -genkey -noout | openssl ec -text -noout | grep pub -A 5 | tail -n +2 | tr -d '\n[:space:]:' | sed 's/^04//' | keccak-256sum -x -l | tr -d ' -' | tail -c 41)
}

generateReference() {
    reference=$(($reference+1))
}

timestamp() {
  date +"%s"
}

while [ TRUE ];do
    clear
    echo $SEPARATOR
    echo $TITLE
    echo " "
    echo "Select your option: "
    echo "0 : Exit simulator"
    echo "1 : Initialize Smart contract"
    echo ""
    echo "Scenario A"
    echo "10: External TopUps (21)"
    echo "11: Send lowBalance"
    echo "12: Send acceptance"
    echo "13: Send topUp"
    echo ""
    echo "Scenario B"
    echo "110: Send lowBalance (" ${phoneHash2} ")"
    echo "120: Send lowBalance (" ${phoneHash3} ")"
    echo "200: Send acceptance (" ${phoneHash1} ")"
    echo "210: Send acceptance (" ${phoneHash2} ")"
    echo "300: Send topUp (" ${phoneHash1} ")"
    echo "310: Send topUp (" ${phoneHash2} ")"
    echo " "
    read -p "Your choice: " choice
    if [ "${choice}" -eq "${choice}" 2>/dev/null ];then
        if [ ${choice} -eq 0 ];then
           exit 0
        elif [ ${choice} -eq 1 ];then
           echo " "
           curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"minScoring":49,"capital":200,"interest":50,"description":"2€ + 0.5€"}' \
                ${serverURL}/addProposal
           sleep 1
           curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"minScoring":118,"capital":400,"interest":100,"description":"4€ + 1€"}' \
                ${serverURL}/addProposal
           sleep 1
           curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"minScoring":185,"capital":600,"interest":150,"description":"6€ + 1.5€"}' \
                ${serverURL}/addProposal
           sleep 1
           echo " "
           read -p "Press any key to continue"
        elif [ ${choice} -eq 10 ];then
            for i in {1..21};do
                generateReference
                echo " "
                curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"type":4,"phoneHash":"'${phoneHash1}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"XX"}' \
                    ${serverURL}/topUp
                sleep 1
                echo " "
            done
            read -p "Press any key to continue"
        elif [ ${choice} -eq 11 ];then
            generateReference
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":0,"phoneHash":"'${phoneHash1}'","ref":"'$(printf "%010d" $reference)'"}' \
                ${serverURL}/lowBalance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 12 ];then
            generateReference
            echo " "
            read -p "Enter offerId: " offerId 
            read -p "Enter proposalId: " proposalId
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":2,"phoneHash":"'${phoneHash1}'","offerId":'${offerId}',"proposalId":'${proposalId}',"ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)'}' \
                ${serverURL}/acceptance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 13 ];then 
            generateReference
            echo " "
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":4,"phoneHash":"'${phoneHash1}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"'${partnerCode}'"}' \
                ${serverURL}/topUp
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 110 ];then
            generateReference
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":0,"phoneHash":"'${phoneHash2}'","ref":"'$(printf "%010d" $reference)'"}' \
                ${serverURL}/lowBalance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 120 ];then
            generateReference
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":0,"phoneHash":"'${phoneHash3}'","ref":"'$(printf "%010d" $reference)'"}' \
                ${serverURL}/lowBalance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 200 ];then
            generateReference
            echo " "
            read -p "Enter offerId: " offerId 
            read -p "Enter proposalId: " proposalId
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":2,"phoneHash":"'${phoneHash1}'","offerId":'${offerId}',"proposalId":'${proposalId}',"ref":"'$(printf "%010d" $reference)'"}' \
                ${serverURL}/acceptance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 210 ];then
            generateReference
            echo " "
            read -p "Enter offerId: " offerId 
            read -p "Enter proposalId: " proposalId
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":2,"phoneHash":"'${phoneHash2}'","offerId":'${offerId}',"proposalId":'${proposalId}',"ref":"'$(printf "%010d" $reference)'"}' \
                ${serverURL}/acceptance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 300 ];then
            generateReference
            echo " "
            read -p "Enter productId: " productId 
            read -p "Enter amount: " amount
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":4,"phoneHash":"'${phoneHash1}'","productId":'${productId}',"amount":'${amount}',"ref":"'$(printf "%010d" $reference)'"}' \
                ${serverURL}/topUp
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 310 ];then
            generateReference
            echo " "
            read -p "Enter productId: " productId 
            read -p "Enter amount: " amount
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":4,"phoneHash":"'${phoneHash2}'","productId":'${productId}',"amount":'${amount}',"ref":"'$(printf "%010d" $reference)'"}' \
                ${serverURL}/topUp
            echo " "
            read -p "Press any key to continue"
        else
            echo "Wrong choice ! (" ${choice} ")"
            read -p "Press any key to continue"
        fi
    fi
done


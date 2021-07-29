#!/bin/bash
#
# Title: Alyra Project - Timelapse - Telecom Operator Simulator
# Description: This script will help to simulate the Telecom operator for the POC demonstration
#
SEPARATOR="#################################"
TITLE="         Telecom Operator Simulator       "
phoneHash1="0x718CEA3706787aa03Bd936b76303fA00660C5f42"
phoneHash2="0xf52db2c07f37c8cef63cf3d0cf80c18b5e2dac18"
phoneHash3="0x8f748A5f24C9Bb2ee47727fB07018614B0b25897"
randomPhoneHash="0x0000000000000000000000000000000000000000"
reference=0
offerId=0
serverURL=http://localhost:8081
partnerCode="TL";
thinkTime=5
scenarioLoop=100
scenarioThinkTime=10
nextCustomer=$phoneHash1
nextProposal=0

generateRandomPhoneHash() {
    randomPhoneHash="0x"$(openssl ecparam -name secp256k1 -genkey -noout | openssl ec -text -noout | grep pub -A 5 | tail -n +2 | tr -d '\n[:space:]:' | sed 's/^04//' | keccak-256sum -x -l | tr -d ' -' | tail -c 41)
}

getNextCustomer() {
    NUMBER=$[ ( $RANDOM % 3 )  + 1 ]
    phoneHashx=phoneHash${NUMBER}
    nextCustomer=${!phoneHashx}
}

getNextProposal() {
    nextProposal=$[ $RANDOM % 2 ]
}

getNextOfferId() {
    offerId=$(($offerId+1))
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
    echo "1 : Initialize Smart contract (Proposals)"
    echo "2 : Initialize Smart contract (History)"
    echo ""
    echo "Scenario A (" ${phoneHash1} ")"
    echo "10: Send external topUp"
    echo "11: Send lowBalance"
    echo "12: Send acceptance"
    echo "13: Send topUp"
    echo ""
    echo "Scenario B (" ${phoneHash2} ")"
    echo "20: Send external topUp"
    echo "21: Send lowBalance"
    echo "22: Send acceptance"
    echo "23: Send topUp"
    echo ""
    echo "Scenario C (" ${phoneHash3} ")"
    echo "30: Send external topUp"
    echo "31: Send lowBalance"
    echo "32: Send acceptance"
    echo "33: Send topUp"
    echo ""
    echo "Scenario D (Demo)"
    echo "40: Launch Scenario"
    echo ""
    read -p "Your choice: " choice
    if [ "${choice}" -eq "${choice}" 2>/dev/null ];then
        if [ ${choice} -eq 0 ];then
           exit 0
        elif [ ${choice} -eq 1 ];then
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"minScoring":49,"capital":200,"interest":50,"description":"2 $ + 0.5 $"}' \
                ${serverURL}/addProposal
            echo " "
            sleep ${thinkTime}
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"minScoring":118,"capital":400,"interest":100,"description":"4 $ + 1 $"}' \
                ${serverURL}/addProposal
            echo " "
            sleep ${thinkTime}
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"minScoring":185,"capital":600,"interest":150,"description":"6 $ + 1.5 $"}' \
                ${serverURL}/addProposal
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 2 ];then
            echo " "
            for i in {1..21};do
                generateReference
                curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"type":4,"phoneHash":"'${phoneHash1}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"XX"}' \
                    ${serverURL}/topUp
                echo " "
                sleep ${thinkTime}
                generateReference
                curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"type":4,"phoneHash":"'${phoneHash2}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"XX"}' \
                    ${serverURL}/topUp
                echo " "
                sleep ${thinkTime}
                generateReference
                curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"type":4,"phoneHash":"'${phoneHash3}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"XX"}' \
                    ${serverURL}/topUp
                echo " "
                sleep ${thinkTime}
            done
            read -p "Press any key to continue"
        elif [ ${choice} -eq 10 ];then
            generateReference
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":4,"phoneHash":"'${phoneHash1}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"XX"}' \
                ${serverURL}/topUp
            echo " "
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
        elif [ ${choice} -eq 20 ];then
            generateReference
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":4,"phoneHash":"'${phoneHash2}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"XX"}' \
                ${serverURL}/topUp
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 21 ];then
            generateReference
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":0,"phoneHash":"'${phoneHash2}'","ref":"'$(printf "%010d" $reference)'"}' \
                ${serverURL}/lowBalance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 22 ];then
            generateReference
            echo " "
            read -p "Enter offerId: " offerId 
            read -p "Enter proposalId: " proposalId
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":2,"phoneHash":"'${phoneHash2}'","offerId":'${offerId}',"proposalId":'${proposalId}',"ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)'}' \
                ${serverURL}/acceptance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 23 ];then 
            generateReference
            echo " "
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":4,"phoneHash":"'${phoneHash2}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"'${partnerCode}'"}' \
                ${serverURL}/topUp
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 30 ];then
            generateReference
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":4,"phoneHash":"'${phoneHash3}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"XX"}' \
                ${serverURL}/topUp
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 31 ];then
            generateReference
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":0,"phoneHash":"'${phoneHash3}'","ref":"'$(printf "%010d" $reference)'"}' \
                ${serverURL}/lowBalance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 32 ];then
            generateReference
            echo " "
            read -p "Enter offerId: " offerId 
            read -p "Enter proposalId: " proposalId
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":2,"phoneHash":"'${phoneHash3}'","offerId":'${offerId}',"proposalId":'${proposalId}',"ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)'}' \
                ${serverURL}/acceptance
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 33 ];then 
            generateReference
            echo " "
            curl --header "Content-Type: application/json" \
                --request POST \
                --data '{"type":4,"phoneHash":"'${phoneHash3}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"'${partnerCode}'"}' \
                ${serverURL}/topUp
            echo " "
            read -p "Press any key to continue"
        elif [ ${choice} -eq 40 ];then 
            read -p "Enter initial offerId: " offerId 
            for ((n=0;n<${scenarioLoop};n++));do
                echo "Scenario D - Loop ${n}"
                # 1 External topUp
                getNextCustomer
                generateReference
                curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"type":4,"phoneHash":"'${nextCustomer}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"XX"}' \
                    ${serverURL}/topUp
                echo " "
                sleep ${scenarioThinkTime}
                # 1 Low Balance (With no response)
                getNextCustomer
                generateReference
                curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"type":0,"phoneHash":"'${nextCustomer}'","ref":"'$(printf "%010d" $reference)'"}' \
                    ${serverURL}/lowBalance
                getNextOfferId                    
                echo " "
                sleep ${scenarioThinkTime}
                # Complete flow (Low Balance + Acceptance + TopUp )
                getNextCustomer
                generateReference
                curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"type":0,"phoneHash":"'${nextCustomer}'","ref":"'$(printf "%010d" $reference)'"}' \
                    ${serverURL}/lowBalance
                echo " "
                sleep ${scenarioThinkTime}
                generateReference
                getNextProposal
                curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"type":2,"phoneHash":"'${nextCustomer}'","offerId":'${offerId}',"proposalId":'${nextProposal}',"ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)'}' \
                    ${serverURL}/acceptance
                echo " "
                getNextOfferId
                sleep ${scenarioThinkTime}
                generateReference
                curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"type":4,"phoneHash":"'${nextCustomer}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"'${partnerCode}'"}' \
                    ${serverURL}/topUp
                echo " "
                sleep ${scenarioThinkTime}
                # Partial flow (Low Balance + Acceptance but NO topUp )
                generateRandomPhoneHash
                for i in {1..23};do
                    generateReference
                    curl --header "Content-Type: application/json" \
                        --request POST \
                        --data '{"type":4,"phoneHash":"'${randomPhoneHash}'","ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)',"partner":"XX"}' \
                        ${serverURL}/topUp
                    echo " "
                    sleep ${thinkTime}
                done
                generateReference
                curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"type":0,"phoneHash":"'${randomPhoneHash}'","ref":"'$(printf "%010d" $reference)'"}' \
                    ${serverURL}/lowBalance
                echo " "
                sleep ${scenarioThinkTime}
                generateReference
                getNextProposal
                curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"type":2,"phoneHash":"'${randomPhoneHash}'","offerId":'${offerId}',"proposalId":'${nextProposal}',"ref":"'$(printf "%010d" $reference)'","timestamp":'$(timestamp)'}' \
                    ${serverURL}/acceptance
                echo " "
                getNextOfferId
                sleep ${scenarioThinkTime}
            done
            echo " "
            read -p "Press any key to continue"
        else
            echo "Wrong choice ! (" ${choice} ")"
            read -p "Press any key to continue"
        fi
    fi
done


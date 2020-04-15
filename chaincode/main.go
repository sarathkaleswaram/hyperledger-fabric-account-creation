package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type AccountCreation struct {
	AccountId     string `json:"account_id"`
	Status        string `json:"status"`
	SensitiveData string `json:"sensitive_data"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()

	fmt.Printf("Function: %s\n", function)
	fmt.Printf("args: %s\n", args)

	if function == "createUser" {
		return s.createUser(APIstub, args)
	} else if function == "getUser" {
		return s.getUser(APIstub, args)
	} else if function == "getAllUsers" {
		return s.getAllUsers(APIstub)
	} else if function == "getUserTxs" {
		return s.getUserTxs(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) createUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	var ac = AccountCreation{AccountId: args[1], Status: args[2], SensitiveData: args[3]}

	acAsBytes, _ := json.Marshal(ac)
	APIstub.PutState(args[0], acAsBytes)
	return shim.Success(nil)
}

func (s *SmartContract) getUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	acAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(acAsBytes)
}

func (s *SmartContract) getAllUsers(APIstub shim.ChaincodeStubInterface) sc.Response {
	startKey := "AC0"
	endKey := "AC9999"
	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	fmt.Printf("- getAllAccounts:\n")
	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) getUserTxs(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	if args[0] == "admin" {
		startKey := "AC0"
		endKey := "AC9999"
		acResultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
		if err != nil {
			return shim.Error(err.Error())
		}
		var buffer bytes.Buffer
		buffer.WriteString("[")
		addComma := false
		i := 0
		for acResultsIterator.HasNext() {
			acResultsIterator.Next()
			acTxResultsIterator, err := APIstub.GetHistoryForKey("AC" + strconv.Itoa(i))
			if err != nil {
				return shim.Error(err.Error())
			}
			bArrayMemberAlreadyWritten := false
			for acTxResultsIterator.HasNext() {
				response, err := acTxResultsIterator.Next()
				if err != nil {
					return shim.Error(err.Error())
				}
				if bArrayMemberAlreadyWritten == true {
					buffer.WriteString(",")
				}
				if addComma == true {
					buffer.WriteString(",")
				}
				addComma = false

				buffer.WriteString("{\"TxId\":")
				buffer.WriteString("\"")
				buffer.WriteString(response.TxId)
				buffer.WriteString("\"")

				buffer.WriteString(", \"Value\":")
				if response.IsDelete {
					buffer.WriteString("null")
				} else {
					buffer.WriteString(string(response.Value))
				}
				buffer.WriteString(", \"Timestamp\":")
				buffer.WriteString("\"")
				buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
				buffer.WriteString("\"")

				buffer.WriteString(", \"IsDelete\":")
				buffer.WriteString("\"")
				buffer.WriteString(strconv.FormatBool(response.IsDelete))
				buffer.WriteString("\"")

				buffer.WriteString("}")
				bArrayMemberAlreadyWritten = true
			}
			if bArrayMemberAlreadyWritten == true {
				addComma = true
			}
			i = i + 1
		}
		buffer.WriteString("]")
		return shim.Success(buffer.Bytes())
	} else {
		resultsIterator, err := APIstub.GetHistoryForKey(strings.ToUpper(args[0]))
		if err != nil {
			return shim.Error(err.Error())
		}
		defer resultsIterator.Close()
		var buffer bytes.Buffer
		buffer.WriteString("[")
		bArrayMemberAlreadyWritten := false
		for resultsIterator.HasNext() {
			response, err := resultsIterator.Next()
			if err != nil {
				return shim.Error(err.Error())
			}
			if bArrayMemberAlreadyWritten == true {
				buffer.WriteString(",")
			}
			buffer.WriteString("{\"TxId\":")
			buffer.WriteString("\"")
			buffer.WriteString(response.TxId)
			buffer.WriteString("\"")

			buffer.WriteString(", \"Value\":")
			if response.IsDelete {
				buffer.WriteString("null")
			} else {
				buffer.WriteString(string(response.Value))
			}
			buffer.WriteString(", \"Timestamp\":")
			buffer.WriteString("\"")
			buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
			buffer.WriteString("\"")

			buffer.WriteString(", \"IsDelete\":")
			buffer.WriteString("\"")
			buffer.WriteString(strconv.FormatBool(response.IsDelete))
			buffer.WriteString("\"")

			buffer.WriteString("}")
			bArrayMemberAlreadyWritten = true
		}
		buffer.WriteString("]")
		return shim.Success(buffer.Bytes())
	}
}

func main() {
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}


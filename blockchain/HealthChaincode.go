package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-protos-go/peer"
)

// HealthChaincode implementation
type HealthChaincode struct {
}

// HealthRecord metadata stored on public ledger
type HealthRecordMetadata struct {
	ID         string    `json:"id"`
	PatientID  string    `json:"patientId"`
	DoctorID   string    `json:"doctorId"`
	RecordHash string    `json:"recordHash"` // Hash of private data
	Type       string    `json:"type"`
	Timestamp  time.Time `json:"timestamp"`
	DocType    string    `json:"docType"`
}

// PrivateHealthData stored in Private Data Collection
type PrivateHealthData struct {
	ID             string `json:"id"`
	Diagnosis      string `json:"diagnosis"`
	TreatmentPlan  string `json:"treatmentPlan"`
	PersonalNotes  string `json:"personalNotes"`
}

// Init is called during chaincode instantiation
func (t *HealthChaincode) Init(stub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success(nil)
}

// Invoke is called on every transaction
func (t *HealthChaincode) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	fn, args := stub.GetFunctionAndParameters()

	if fn == "createRecord" {
		return t.createRecord(stub, args)
	} else if fn == "queryRecord" {
		return t.queryRecord(stub, args)
	} else if fn == "getPrivateData" {
		return t.getPrivateData(stub, args)
	}

	return shim.Error("Invalid function name")
}

// createRecord stores metadata on ledger and sensitive data in private collection
func (t *HealthChaincode) createRecord(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	if len(args) != 7 {
		return shim.Error("Incorrect number of arguments. Expecting 7")
	}

	id := args[0]
	patientId := args[1]
	doctorId := args[2]
	recordHash := args[3]
	recordType := args[4]
	diagnosis := args[5]
	treatment := args[6]

	// 1. Store Public Metadata
	metadata := &HealthRecordMetadata{
		ID:         id,
		PatientID:  patientId,
		DoctorID:   doctorId,
		RecordHash: recordHash,
		Type:       recordType,
		Timestamp:  time.Now(),
		DocType:    "healthRecord",
	}

	metadataBytes, _ := json.Marshal(metadata)
	err := stub.PutState(id, metadataBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// 2. Store Private Data (HIPAA Compliant)
	privateData := &PrivateHealthData{
		ID:            id,
		Diagnosis:     diagnosis,
		TreatmentPlan: treatment,
	}
	privateDataBytes, _ := json.Marshal(privateData)

	// "collectionHealthRecords" is the private data collection name
	err = stub.PutPrivateData("collectionHealthRecords", id, privateDataBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// queryRecord retrieves public metadata
func (t *HealthChaincode) queryRecord(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting ID")
	}

	recordBytes, err := stub.GetState(args[0])
	if err != nil || recordBytes == nil {
		return shim.Error("Record not found")
	}

	return shim.Success(recordBytes)
}

// getPrivateData retrieves sensitive data from collection (only for authorized peers)
func (t *HealthChaincode) getPrivateData(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting ID")
	}

	privateDataBytes, err := stub.GetPrivateData("collectionHealthRecords", args[0])
	if err != nil || privateDataBytes == nil {
		return shim.Error("Private data not found or access denied")
	}

	return shim.Success(privateDataBytes)
}

func main() {
	err := shim.Start(new(HealthChaincode))
	if err != nil {
		fmt.Printf("Error starting HealthChaincode: %s", err)
	}
}

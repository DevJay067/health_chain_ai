from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import os
import hashlib
import json
import base64
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import uvicorn

app = FastAPI(title="Health Records Blockchain API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "health_records_db")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Collections
health_records_collection = db.health_records
blockchain_collection = db.blockchain

class HealthRecordMetadata(BaseModel):
    weight: Optional[str] = None
    height: Optional[str] = None
    bloodPressure: Optional[str] = None
    heartRate: Optional[str] = None
    temperature: Optional[str] = None
    notes: Optional[str] = None

class HealthRecordCreate(BaseModel):
    type: str
    title: str
    description: str
    date: str
    doctor: Optional[str] = None
    metadata: Optional[HealthRecordMetadata] = None
    attachments: Optional[List[str]] = None

class BlockchainBlock(BaseModel):
    index: int
    timestamp: str
    data: Dict[str, Any]
    previous_hash: str
    hash: str
    nonce: int = 0

def calculate_hash(index: int, timestamp: str, data: Dict[str, Any], previous_hash: str, nonce: int = 0) -> str:
    """Calculate SHA-256 hash for blockchain block"""
    block_string = json.dumps({
        "index": index,
        "timestamp": timestamp,
        "data": data,
        "previous_hash": previous_hash,
        "nonce": nonce
    }, sort_keys=True)
    return hashlib.sha256(block_string.encode()).hexdigest()

def create_genesis_block() -> Dict[str, Any]:
    """Create the first block in the blockchain"""
    timestamp = datetime.utcnow().isoformat()
    genesis_data = {"message": "Genesis Block - Health Records Blockchain"}
    genesis_hash = calculate_hash(0, timestamp, genesis_data, "0")
    
    return {
        "index": 0,
        "timestamp": timestamp,
        "data": genesis_data,
        "previous_hash": "0",
        "hash": genesis_hash,
        "nonce": 0
    }

async def get_latest_block() -> Dict[str, Any]:
    """Get the latest block from blockchain"""
    latest_block = await blockchain_collection.find_one(
        sort=[("index", -1)]
    )
    
    if not latest_block:
        # Create genesis block if blockchain is empty
        genesis = create_genesis_block()
        await blockchain_collection.insert_one(genesis)
        return genesis
    
    # Remove MongoDB _id from response
    if "_id" in latest_block:
        del latest_block["_id"]
    
    return latest_block

async def add_block_to_chain(data: Dict[str, Any]) -> Dict[str, Any]:
    """Add a new block to the blockchain"""
    latest_block = await get_latest_block()
    
    new_index = latest_block["index"] + 1
    timestamp = datetime.utcnow().isoformat()
    previous_hash = latest_block["hash"]
    
    # Simple proof of work (find hash with leading zeros)
    nonce = 0
    while True:
        new_hash = calculate_hash(new_index, timestamp, data, previous_hash, nonce)
        if new_hash.startswith("00"):  # Difficulty level: 2 leading zeros
            break
        nonce += 1
        if nonce > 100000:  # Limit iterations for demo
            break
    
    new_block = {
        "index": new_index,
        "timestamp": timestamp,
        "data": data,
        "previous_hash": previous_hash,
        "hash": new_hash,
        "nonce": nonce
    }
    
    await blockchain_collection.insert_one(new_block.copy())
    return new_block

@app.get("/")
async def root():
    return {"message": "Health Records Blockchain API", "status": "active"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/records")
async def create_health_record(record: HealthRecordCreate):
    """Create a new health record and store on blockchain"""
    try:
        # Prepare record data
        record_data = record.dict()
        record_data["created_at"] = datetime.utcnow().isoformat()
        record_data["is_secure"] = True
        
        # Create blockchain hash for data integrity
        data_string = json.dumps(record_data, sort_keys=True)
        data_hash = hashlib.sha256(data_string.encode()).hexdigest()
        
        # Add to blockchain
        blockchain_data = {
            "record_type": "health_record",
            "record_id": str(ObjectId()),
            "data_hash": data_hash,
            "timestamp": record_data["created_at"]
        }
        
        block = await add_block_to_chain(blockchain_data)
        
        # Store record in database with blockchain reference
        record_data["blockchain_hash"] = block["hash"]
        record_data["blockchain_index"] = block["index"]
        record_data["data_hash"] = data_hash
        
        result = await health_records_collection.insert_one(record_data)
        record_data["id"] = str(result.inserted_id)
        
        # Remove MongoDB _id for response
        if "_id" in record_data:
            del record_data["_id"]
        
        return {
            "success": True,
            "message": "Health record saved securely on blockchain",
            "record": record_data,
            "blockchain_proof": {
                "hash": block["hash"],
                "index": block["index"],
                "timestamp": block["timestamp"]
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create record: {str(e)}")

@app.get("/api/records")
async def get_all_records():
    """Get all health records"""
    try:
        records = []
        cursor = health_records_collection.find().sort("date", -1).limit(100)
        
        async for record in cursor:
            record["id"] = str(record["_id"])
            del record["_id"]
            records.append(record)
        
        return {
            "success": True,
            "records": records,
            "total": len(records)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch records: {str(e)}")

@app.get("/api/records/{record_id}")
async def get_record(record_id: str):
    """Get a specific health record"""
    try:
        record = await health_records_collection.find_one({"_id": ObjectId(record_id)})
        
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        
        record["id"] = str(record["_id"])
        del record["_id"]
        
        return {"success": True, "record": record}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch record: {str(e)}")

@app.get("/api/blockchain/verify/{record_id}")
async def verify_record(record_id: str):
    """Verify a health record against blockchain"""
    try:
        # Get the record
        record = await health_records_collection.find_one({"_id": ObjectId(record_id)})
        
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        
        # Get the blockchain block
        block = await blockchain_collection.find_one({"index": record.get("blockchain_index")})
        
        if not block:
            return {
                "success": False,
                "verified": False,
                "message": "Blockchain block not found"
            }
        
        # Verify the hash
        record_copy = dict(record)
        if "_id" in record_copy:
            del record_copy["_id"]
        if "blockchain_hash" in record_copy:
            del record_copy["blockchain_hash"]
        if "blockchain_index" in record_copy:
            del record_copy["blockchain_index"]
        if "data_hash" in record_copy:
            stored_hash = record_copy["data_hash"]
            del record_copy["data_hash"]
        else:
            stored_hash = None
        
        # Recalculate hash
        data_string = json.dumps(record_copy, sort_keys=True)
        calculated_hash = hashlib.sha256(data_string.encode()).hexdigest()
        
        verified = (calculated_hash == stored_hash) if stored_hash else False
        
        return {
            "success": True,
            "verified": verified,
            "blockchain_hash": block["hash"],
            "blockchain_index": block["index"],
            "data_hash": stored_hash,
            "message": "Record integrity verified" if verified else "Record may have been tampered"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.get("/api/blockchain/stats")
async def get_blockchain_stats():
    """Get blockchain statistics"""
    try:
        total_blocks = await blockchain_collection.count_documents({})
        latest_block = await get_latest_block()
        total_records = await health_records_collection.count_documents({})
        
        return {
            "success": True,
            "stats": {
                "total_blocks": total_blocks,
                "total_records": total_records,
                "latest_block_index": latest_block["index"],
                "latest_block_hash": latest_block["hash"],
                "blockchain_status": "active"
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file and return base64 encoded data"""
    try:
        contents = await file.read()
        
        # Limit file size to 5MB
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
        
        # Encode file to base64
        encoded = base64.b64encode(contents).decode('utf-8')
        
        # Create file hash
        file_hash = hashlib.sha256(contents).hexdigest()
        
        return {
            "success": True,
            "file_name": file.filename,
            "file_type": file.content_type,
            "file_size": len(contents),
            "file_hash": file_hash,
            "file_data": encoded
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

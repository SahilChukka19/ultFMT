from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List
import json
import os

router = APIRouter(prefix="/api/v1", tags=["metadata"])

def load_json_file(filename: str) -> Dict[str, Any]:
    file_path = os.path.join(os.path.dirname(__file__), "..", "data", filename)
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

@router.get("/models")
def get_models():
    data = load_json_file("models.json")
    return data

@router.get("/pricing")
def get_pricing():
    data = load_json_file("pricing.json")
    return data

# """
# FastAPI ML Service with RAG Chat — port 8001
# Uses all 4 CSV datasets + Groq LLM for chat
# """
# import os
# import json
# import pickle
# import traceback
# import numpy as np
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List, Optional, Dict
# from dotenv import load_dotenv


# # Load environment variables
# load_dotenv()


# # Import RAG
# from rag_chat import get_rag


# # ── Global RAG instance ───────────────────────────────────
# rag = None  # Will hold the initialized RAG
# doctor_rag = None


# # ── Load ML artifacts ─────────────────────────────────────
# BASE      = os.path.dirname(os.path.abspath(__file__))
# MODEL_DIR = os.path.join(BASE, 'models')


# with open(os.path.join(MODEL_DIR, 'disease_model.pkl'),  'rb') as f: model = pickle.load(f)
# with open(os.path.join(MODEL_DIR, 'label_encoder.pkl'),  'rb') as f: le    = pickle.load(f)
# with open(os.path.join(MODEL_DIR, 'symptoms_list.json'))       as f: ALL_SYMPTOMS   = json.load(f)
# with open(os.path.join(MODEL_DIR, 'diseases_list.json'))       as f: ALL_DISEASES   = json.load(f)
# with open(os.path.join(MODEL_DIR, 'descriptions.json'))        as f: DESCRIPTIONS   = json.load(f)
# with open(os.path.join(MODEL_DIR, 'precautions.json'))         as f: PRECAUTIONS    = json.load(f)
# with open(os.path.join(MODEL_DIR, 'severity.json'))            as f: SEVERITY       = json.load(f)


# print(f"✅ ML Service ready | {len(ALL_SYMPTOMS)} symptoms | {len(ALL_DISEASES)} diseases")


# # ── Get Groq API key ──────────────────────────────────────
# # GROQ_API_KEY = os.getenv("LLM_API_KEY")
# # Now strips quotes AND whitespace automatically
# GROQ_API_KEY = os.getenv("LLM_API_KEY", "").strip().strip('"').strip("'")
# if not GROQ_API_KEY:
#     print("⚠️ WARNING: GROQ_API_KEY not found in .env!")
# else:
#     print(f"✅ Groq API Key loaded: {GROQ_API_KEY[:10]}...")


# # ── Initialize RAG on startup ─────────────────────────────
# def initialize_rag():
#     """Initialize RAG pipeline on server startup"""
#     global rag
#     if not GROQ_API_KEY:
#         print("⚠️ RAG initialization skipped: No Groq API key")
#         return
    
#     try:
#         print("\n🚀 Initializing RAG pipeline...")
#         rag = get_rag(groq_api_key=GROQ_API_KEY)
#         rag.initialize()  # Force initialization now
#         print("✅ RAG initialized successfully!")
#         print("="*70 + "\n")
#     except Exception as e:
#         print(f"❌ RAG initialization failed: {str(e)}")
#         traceback.print_exc()


# def initialize_doctor_rag():
#     """Initialize doctor RAG pipeline on server startup"""
#     global doctor_rag
#     if not GROQ_API_KEY:
#         print("⚠️ Doctor RAG initialization skipped: No Groq API key")
#         return

#     try:
#         print("\n🚀 Initializing DOCTOR RAG pipeline...")
#         doctor_rag = get_rag(groq_api_key=GROQ_API_KEY)
#         doctor_rag.initialize()
#         print("✅ Doctor RAG initialized successfully!")
#         print("="*70 + "\n")
#     except Exception as e:
#         print(f"❌ Doctor RAG initialization failed: {str(e)}")
#         traceback.print_exc()

# # Call it now
# initialize_rag()
# initialize_doctor_rag()


# # ── FastAPI App ───────────────────────────────────────────
# app = FastAPI(
#     title="Healthcare ML Service with RAG Chat",
#     version="2.0.0",
#     description="Symptom prediction + AI Medical Assistant chat"
# )


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # ── Pydantic Models ───────────────────────────────────────
# class PredictRequest(BaseModel):
#     symptoms: List[str]
#     top_n: Optional[int] = 5


# class SymptomDetail(BaseModel):
#     name: str
#     severity: int


# class DiseaseResult(BaseModel):
#     rank: int
#     disease: str
#     probability: float
#     description: str
#     precautions: List[str]


# class PredictResponse(BaseModel):
#     predictions: List[DiseaseResult]
#     risk_level: str
#     risk_score: float
#     matched_symptoms: List[SymptomDetail]
#     unknown_symptoms: List[str]
#     total_severity: int


# class ChatRequest(BaseModel):
#     message: str
#     history: Optional[List[Dict[str, str]]] = []


# class ChatResponse(BaseModel):
#     response: str
#     sources: List[str] = []

# class DoctorChatRequest(BaseModel):
#     message: str
#     patient_id: Optional[int] = None
#     history: Optional[List[Dict[str, str]]] = []

# class DoctorChatResponse(BaseModel):
#     response: str
#     sources: List[str] = []
#     patient_id: Optional[int] = None


# # ── Helper Functions ──────────────────────────────────────
# SYM_LOWER = {s.strip().lower(): s for s in ALL_SYMPTOMS}


# def match_symptoms(sent: List[str]):
#     """Case-insensitive match against known symptoms"""
#     matched, unknown = [], []
#     for s in sent:
#         key = s.strip().lower()
#         if key in SYM_LOWER:
#             matched.append(SYM_LOWER[key])
#         else:
#             unknown.append(s)
#     return matched, unknown


# def symptoms_to_vector(matched: List[str]) -> np.ndarray:
#     s_set = {s.strip().lower() for s in matched}
#     return np.array([1 if sym.strip().lower() in s_set else 0
#                      for sym in ALL_SYMPTOMS]).reshape(1, -1)


# def calc_risk(top_prob: float, total_sev: int) -> tuple:
#     sev_score = min(total_sev * 2, 60)
#     prob_score = top_prob * 0.4
#     score = round(min(sev_score + prob_score, 100), 1)
#     if score < 30:
#         level = "Low"
#     elif score < 60:
#         level = "Medium"
#     else:
#         level = "High"
#     return level, score


# # ── Routes ────────────────────────────────────────────────

# @app.get("/")
# def root():
#     return {
#         "service": "Healthcare ML Service with RAG Chat",
#         "status": "running",
#         "version": "2.0.0",
#         "endpoints": [
#             "/health",
#             "/symptoms",
#             "/diseases",
#             "/disease/{name}",
#             "/predict",
#             "/chat",
#             "/doctor/chat"

#         ]
#     }


# @app.get("/health")
# def health():
#     global rag
#     return {
#         "status": "ok",
#         "model": "loaded",
#         "symptoms": len(ALL_SYMPTOMS),
#         "diseases": len(ALL_DISEASES),
#         "rag": "initialized" if (rag and rag.initialized) else "pending"
#     }


# @app.get("/symptoms")
# def get_symptoms():
#     """Get all symptoms with severity weights"""
#     symptoms_with_severity = [
#         {"name": s, "severity": SEVERITY.get(s, 3)}
#         for s in ALL_SYMPTOMS
#     ]
#     return {
#         "symptoms": ALL_SYMPTOMS,
#         "symptoms_detail": symptoms_with_severity,
#         "total": len(ALL_SYMPTOMS)
#     }


# @app.get("/diseases")
# def get_diseases():
#     """Get all diseases with info"""
#     diseases_with_info = []
#     for d in ALL_DISEASES:
#         diseases_with_info.append({
#             "name": d,
#             "description": DESCRIPTIONS.get(d, ""),
#             "precautions": PRECAUTIONS.get(d, []),
#         })
#     return {
#         "diseases": ALL_DISEASES,
#         "diseases_detail": diseases_with_info,
#         "total": len(ALL_DISEASES)
#     }


# @app.get("/disease/{name}")
# def get_disease(name: str):
#     """Get single disease info"""
#     match = next((d for d in ALL_DISEASES if d.lower() == name.lower()), None)
#     if not match:
#         raise HTTPException(status_code=404, detail=f"Disease '{name}' not found")
#     return {
#         "name": match,
#         "description": DESCRIPTIONS.get(match, "No description available"),
#         "precautions": PRECAUTIONS.get(match, [])
#     }


# @app.post("/predict", response_model=PredictResponse)
# def predict(req: PredictRequest):
#     """Predict disease from symptoms"""
#     if not req.symptoms:
#         raise HTTPException(status_code=400, detail="Provide at least one symptom")
    
#     matched_names, unknown = match_symptoms(req.symptoms)
    
#     if not matched_names:
#         raise HTTPException(
#             status_code=400,
#             detail=f"None of the symptoms were recognized. Unknown: {unknown}"
#         )
    
#     matched_details = [
#         SymptomDetail(name=s, severity=SEVERITY.get(s, 3))
#         for s in matched_names
#     ]
#     total_severity = sum(d.severity for d in matched_details)
    
#     vector = symptoms_to_vector(matched_names)
#     proba = model.predict_proba(vector)[0]
#     top_n = min(req.top_n, len(ALL_DISEASES))
#     top_idx = np.argsort(proba)[::-1][:top_n]
    
#     predictions = []
#     for rank, i in enumerate(top_idx):
#         disease_name = le.classes_[i]
#         predictions.append(DiseaseResult(
#             rank=rank + 1,
#             disease=disease_name,
#             probability=round(float(proba[i]) * 100, 2),
#             description=DESCRIPTIONS.get(disease_name, "No description available"),
#             precautions=PRECAUTIONS.get(disease_name, [])
#         ))
    
#     top_prob = predictions[0].probability
#     risk_level, risk_score = calc_risk(top_prob, total_severity)
    
#     return PredictResponse(
#         predictions=predictions,
#         risk_level=risk_level,
#         risk_score=risk_score,
#         matched_symptoms=matched_details,
#         unknown_symptoms=unknown,
#         total_severity=total_severity
#     )


# @app.post("/chat", response_model=ChatResponse)
# def chat_with_ai(request: ChatRequest):
#     """
#     RAG-powered chat with AI Medical Assistant
#     Uses Groq LLM + your disease database
#     """
#     global rag
#     try:
#         # Use global rag (already initialized on startup)
#         if rag is None or not rag.initialized:
#             if not GROQ_API_KEY:
#                 raise HTTPException(status_code=500, detail="Groq API key not configured")
#             rag = get_rag(groq_api_key=GROQ_API_KEY)
#             rag.initialize()
        
#         # Convert history format - FIX: Use proper LangChain message types
#         from langchain.schema import HumanMessage, AIMessage
        
#         history_messages = []
#         if request.history:
#             for msg in request.history[-5:]:
#                 if 'user' in msg and msg['user']:
#                     history_messages.append(HumanMessage(content=msg['user']))
#                 if 'assistant' in msg and msg['assistant']:
#                     history_messages.append(AIMessage(content=msg['assistant']))
        
#         # Get response - FIX: Pass history_messages instead of plain tuples
#         response_text = rag.chat(request.message, history_messages)
        
#         # Extract disease mentions as sources
#         sources = []
#         query_lower = request.message.lower()
#         for disease in rag.all_diseases:
#             if disease.lower() in query_lower:
#                 sources.append(disease)
        
#         return ChatResponse(
#             response=response_text,
#             sources=sources[:3]
#         )
        
#     except Exception as e:
#         print(f"❌ Chat error: {str(e)}")
#         print(traceback.format_exc())
#         raise HTTPException(
#             status_code=500,
#             detail=f"Chat error: {str(e)}"
#         )

# @app.post("/doctor/chat", response_model=DoctorChatResponse)
# def doctor_chat(request: DoctorChatRequest):
#     """
#     RAG-powered chat for doctor
#     Uses Groq LLM + your disease database + optional patient context
#     """
#     global doctor_rag
#     try:
#         if doctor_rag is None or not doctor_rag.initialized:
#             if not GROQ_API_KEY:
#                 raise HTTPException(status_code=500, detail="Groq API key not configured")
#             doctor_rag = get_rag(groq_api_key=GROQ_API_KEY)
#             doctor_rag.initialize()

#         from langchain.schema import HumanMessage, AIMessage

#         history_messages = []
#         if request.history:
#             for msg in request.history[-5:]:
#                 if 'user' in msg and msg['user']:
#                     history_messages.append(HumanMessage(content=msg['user']))
#                 if 'assistant' in msg and msg['assistant']:
#                     history_messages.append(AIMessage(content=msg['assistant']))

#         doctor_query = request.message
#         if request.patient_id is not None:
#             doctor_query = f"Patient ID: {request.patient_id}\nDoctor question: {request.message}"

#         response_text = doctor_rag.chat(doctor_query, history_messages)

#         sources = []
#         query_lower = request.message.lower()
#         for disease in doctor_rag.all_diseases:
#             if disease.lower() in query_lower:
#                 sources.append(disease)

#         return DoctorChatResponse(
#             response=response_text,
#             sources=sources[:3],
#             patient_id=request.patient_id
#         )

#     except Exception as e:
#         print(f"❌ Doctor chat error: {str(e)}")
#         print(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Doctor chat error: {str(e)}")


# # ── Run Server ────────────────────────────────────────────
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8001)


# 


"""
FastAPI ML Service with RAG Chat — port 8001
Uses all 4 CSV datasets + Groq LLM for chat
Patient RAG + Doctor RAG with file upload support + Agentic AI
"""
import os
import json
import pickle
import traceback
import io
import base64
import httpx
import numpy as np
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from dotenv import load_dotenv
import fitz  # PyMuPDF
from docx import Document
import mimetypes

# Load environment variables
load_dotenv()

# Import RAG
from rag_chat import get_rag
from doctor_rag_chat import get_doctor_rag


# ── Global RAG instances ───────────────────────────────────
rag = None  # Patient RAG
doctor_rag = None  # Doctor RAG


# ── Load ML artifacts ─────────────────────────────────────
BASE      = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE, 'models')

with open(os.path.join(MODEL_DIR, 'disease_model.pkl'),  'rb') as f: model = pickle.load(f)
with open(os.path.join(MODEL_DIR, 'label_encoder.pkl'),  'rb') as f: le    = pickle.load(f)
with open(os.path.join(MODEL_DIR, 'symptoms_list.json'))       as f: ALL_SYMPTOMS   = json.load(f)
with open(os.path.join(MODEL_DIR, 'diseases_list.json'))       as f: ALL_DISEASES   = json.load(f)
with open(os.path.join(MODEL_DIR, 'descriptions.json'))        as f: DESCRIPTIONS   = json.load(f)
with open(os.path.join(MODEL_DIR, 'precautions.json'))         as f: PRECAUTIONS    = json.load(f)
with open(os.path.join(MODEL_DIR, 'severity.json'))            as f: SEVERITY       = json.load(f)

print(f"✅ ML Service ready | {len(ALL_SYMPTOMS)} symptoms | {len(ALL_DISEASES)} diseases")


# ── Get Groq API key ──────────────────────────────────────
GROQ_API_KEY = os.getenv("LLM_API_KEY", "").strip().strip('"').strip("'")
if not GROQ_API_KEY:
    print("⚠️ WARNING: Groq API key not found in .env!")
else:
    print(f"✅ Groq API Key loaded: {GROQ_API_KEY[:10]}...")


# ── Initialize RAG on startup ─────────────────────────────
def initialize_rag():
    """Initialize patient RAG pipeline on server startup"""
    global rag
    if not GROQ_API_KEY:
        print("⚠️ Patient RAG initialization skipped: No Groq API key")
        return
    
    try:
        print("\n🚀 Initializing PATIENT RAG pipeline...")
        rag = get_rag(groq_api_key=GROQ_API_KEY)
        rag.initialize()
        print("✅ Patient RAG initialized successfully!")
        print("="*70 + "\n")
    except Exception as e:
        print(f"❌ Patient RAG initialization failed: {str(e)}")
        traceback.print_exc()

def initialize_doctor_rag():
    """Initialize doctor RAG pipeline on server startup"""
    global doctor_rag
    if not GROQ_API_KEY:
        print("⚠️ Doctor RAG initialization skipped: No Groq API key")
        return

    try:
        print("\n🚀 Initializing DOCTOR RAG pipeline...")
        doctor_rag = get_doctor_rag(groq_api_key=GROQ_API_KEY)
        doctor_rag.initialize()
        print("✅ Doctor RAG initialized successfully!")
        print("="*70 + "\n")
    except Exception as e:
        print(f"❌ Doctor RAG initialization failed: {str(e)}")
        traceback.print_exc()

# Call it now
initialize_rag()
initialize_doctor_rag()


# ── FastAPI App ───────────────────────────────────────────
app = FastAPI(
    title="Healthcare ML Service with RAG Chat",
    version="4.0.0",
    description="Symptom prediction + AI Medical Assistant (Patient + Doctor + File Upload + Agentic AI)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/doctors/search')
async def search_external_doctors(specialization: Optional[str] = None):
    """
    Search doctors - returns hardcoded list (fallback)
    You can replace this with your Django backend call later
    """
    # Hardcoded doctor database (for testing)
    DOCTORS_DATABASE = [
        {
            "id": 1,
            "name": "Dr. Rajesh Kumar, MD",
            "specialization": "Cardiologist",
            "qualification": "MD",
            "experience": 15,
            "hospital": "Texas Heart Institute",
            "phone": "(713) 790-9401",
            "email": "dr.kumar@texasheart.org",
            "consultation_fee": "2500.00",
            "available": True
        },
        {
            "id": 2,
            "name": "Dr. Priya Sharma, DM",
            "specialization": "Cardiologist",
            "qualification": "DM",
            "experience": 12,
            "hospital": "Houston Medical Center",
            "phone": "(832) 400-3957",
            "email": "dr.sharma@hmc.org",
            "consultation_fee": "3000.00",
            "available": True
        },
        {
            "id": 3,
            "name": "Dr. Amit Patel, MD",
            "specialization": "Cardiologist",
            "qualification": "MD",
            "experience": 10,
            "hospital": "Memorial Herman Hospital",
            "phone": "(713) 955-5555",
            "email": "dr.patel@memorial.org",
            "consultation_fee": "2800.00",
            "available": True
        },
        {
            "id": 4,
            "name": "Dr. Sarah Johnson, MD",
            "specialization": "General Physician",
            "qualification": "MD",
            "experience": 8,
            "hospital": "Houston General Hospital",
            "phone": "(713) 555-1234",
            "email": "dr.johnson@houstongeneral.org",
            "consultation_fee": "1500.00",
            "available": True
        },
        {
            "id": 5,
            "name": "Dr. Michael Chen, MD",
            "specialization": "Dermatologist",
            "qualification": "MD",
            "experience": 11,
            "hospital": "Houston Skin Clinic",
            "phone": "(832) 555-6789",
            "email": "dr.chen@skinclinic.org",
            "consultation_fee": "2000.00",
            "available": True
        }
    ]
    
    if specialization:
        filtered = [d for d in DOCTORS_DATABASE if specialization.lower() in d['specialization'].lower()]
        return {'doctors': filtered, 'count': len(filtered)}
    
    return {'doctors': DOCTORS_DATABASE, 'count': len(DOCTORS_DATABASE)}


# ── Pydantic Models ───────────────────────────────────────
class PredictRequest(BaseModel):
    symptoms: List[str]
    top_n: Optional[int] = 5

class SymptomDetail(BaseModel):
    name: str
    severity: int

class DiseaseResult(BaseModel):
    rank: int
    disease: str
    probability: float
    description: str
    precautions: List[str]

class PredictResponse(BaseModel):
    predictions: List[DiseaseResult]
    risk_level: str
    risk_score: float
    matched_symptoms: List[SymptomDetail]
    unknown_symptoms: List[str]
    total_severity: int

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []
    agentic_actions: Optional[List[Dict]] = None

class DoctorChatRequest(BaseModel):
    message: str
    doctor_user_id: Optional[int] = None
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []

class DoctorChatResponse(BaseModel):
    response: str
    sources: List[str] = []
    patient_id: Optional[int] = None
    agentic_actions: Optional[List[Dict]] = None


# ── Helper Functions ──────────────────────────────────────
SYM_LOWER = {s.strip().lower(): s for s in ALL_SYMPTOMS}

def match_symptoms(sent: List[str]):
    """Case-insensitive match against known symptoms"""
    matched, unknown = [], []
    for s in sent:
        key = s.strip().lower()
        if key in SYM_LOWER:
            matched.append(SYM_LOWER[key])
        else:
            unknown.append(s)
    return matched, unknown

def symptoms_to_vector(matched: List[str]) -> np.ndarray:
    s_set = {s.strip().lower() for s in matched}
    return np.array([1 if sym.strip().lower() in s_set else 0
                     for sym in ALL_SYMPTOMS]).reshape(1, -1)

def calc_risk(top_prob: float, total_sev: int) -> tuple:
    sev_score = min(total_sev * 2, 60)
    prob_score = top_prob * 0.4
    score = round(min(sev_score + prob_score, 100), 1)
    if score < 30:
        level = "Low"
    elif score < 60:
        level = "Medium"
    else:
        level = "High"
    return level, score

def extract_pdf_text(file_bytes: bytes) -> str:
    """Extract text from PDF files"""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        for page in doc:
            page_text = page.get_text("text")
            if page_text:
                text_parts.append(page_text)
        return "\n".join(text_parts).strip()
    except Exception as e:
        print(f"PDF text extraction error: {e}")
        return "Error extracting PDF text. File may be image-based."

def extract_docx_text(file_bytes: bytes) -> str:
    """Extract text from DOCX files"""
    try:
        doc = Document(io.BytesIO(file_bytes))
        paras = [p.text for p in doc.paragraphs if p.text and p.text.strip()]
        return "\n".join(paras).strip()
    except Exception as e:
        print(f"DOCX text extraction error: {e}")
        return "Error extracting DOCX text."

def extract_txt_text(file_bytes: bytes) -> str:
    """Extract text from TXT files"""
    try:
        return file_bytes.decode("utf-8", errors="ignore").strip()
    except Exception as e:
        print(f"TXT extraction error: {e}")
        return "Error extracting TXT text."


# def detect_medical_intent(message: str) -> Dict:
#     """Agentic AI: Detect intent and suggest actions"""
#     intent = {
#         "type": "general",
#         "actions": [],
#         "confidence": 0.0
#     }
    
#     message_lower = message.lower()
    
#     # Disease prediction intent
#     if any(word in message_lower for word in ["symptom", "suffering", "what disease", "have", "feeling"]):
#         if any(word in message_lower for word in ["symptom", "cough", "fever", "headache", "pain"]):
#             intent["type"] = "disease_prediction"
#             intent["actions"] = [
#                 {"action": "suggest_predict_endpoint", "message": "I can help predict your disease based on symptoms. Would you like to use the symptom predictor?"}
#             ]
#             intent["confidence"] = 0.85
    
#     # Doctor appointment intent
#     elif any(word in message_lower for word in ["doctor", "hospital", "clinic", "appointment", "see medical"]):
#         intent["type"] = "appointment"
#         intent["actions"] = [
#             {"action": "suggest_doctor_search", "message": "I can help you find doctors. Would you like me to search for available doctors?"}
#         ]
#         intent["confidence"] = 0.90
    
#     # Medication intent
#     elif any(word in message_lower for word in ["medication", "medicine", "drug", "prescription", "take"]):
#         intent["type"] = "medication"
#         intent["actions"] = [
#             {"action": "suggest_disease_lookup", "message": "I can provide information about medications. What condition are you asking about?"}
#         ]
#         intent["confidence"] = 0.80
    
#     # Emergency intent
#     elif any(word in message_lower for word in ["emergency", "urgent", "critical", "severe", "help me now", "death"]):
#         intent["type"] = "emergency"
#         intent["actions"] = [
#             {"action": "show_emergency_warning", "message": "⚠️ If this is a medical emergency, please call emergency services immediately or visit the nearest hospital."}
#         ]
#         intent["confidence"] = 0.95
    
#     return intent

def detect_medical_intent(message: str) -> Dict:
    """Agentic AI: Detect intent and suggest actions"""
    intent = {
        "type": "general",
        "actions": [],
        "confidence": 0.0
    }
    
    message_lower = message.lower()
    
    # Check 1: Disease prediction intent
    if any(word in message_lower for word in ["symptom", "suffering", "what disease", "have", "feeling"]):
        if any(word in message_lower for word in ["symptom", "cough", "fever", "headache", "pain"]):
            intent["type"] = "disease_prediction"
            intent["actions"] = [
                {
                    "action": "suggest_predict_endpoint",
                    "message": "I can help predict your disease based on symptoms. Would you like to use the symptom predictor?"
                }
            ]
            intent["confidence"] = 0.85
    
    # Check 2: Doctor appointment intent - UPDATED
    elif any(word in message_lower for word in ["doctor", "hospital", "clinic", "appointment", "see medical"]):
        intent["type"] = "appointment"
        
        # Extract specialization from message
        specialization = None
        if "cardiologist" in message_lower:
            specialization = "Cardiologist"
        elif "dermatologist" in message_lower:
            specialization = "Dermatologist"
        elif "neurologist" in message_lower:
            specialization = "Neurologist"
        elif "orthopedic" in message_lower or "orthopedic" in message_lower:
            specialization = "Orthopedic"
        elif "pediatrician" in message_lower:
            specialization = "Pediatrician"
        elif "general" in message_lower and ("physician" in message_lower or "doctor" in message_lower):
            specialization = "General Physician"
        
        # Fetch doctors from API
        doctors = []
        if specialization:
            try:
                import httpx
                import asyncio
                loop = asyncio.get_event_loop()
                doctors = loop.run_until_complete(_fetch_doctors(specialization))
            except:
                doctors = []
        
        intent["actions"] = [
            {
                "action": "show_doctor_list",
                "message": f"I found {specialization or 'medical'} doctors for you:",
                "specialization": specialization,
                "doctors": doctors[:5]  # Show top 5
            }
        ]
        intent["confidence"] = 0.90
    
    # Check 3: Medication intent
    elif any(word in message_lower for word in ["medication", "medicine", "drug", "prescription", "take"]):
        intent["type"] = "medication"
        intent["actions"] = [
            {
                "action": "suggest_disease_lookup",
                "message": "I can provide information about medications. What condition are you asking about?"
            }
        ]
        intent["confidence"] = 0.80
    
    # Check 4: Emergency intent
    elif any(word in message_lower for word in ["emergency", "urgent", "critical", "severe", "help me now", "death"]):
        intent["type"] = "emergency"
        intent["actions"] = [
            {
                "action": "show_emergency_warning",
                "message": "⚠️ If this is a medical emergency, please call emergency services immediately or visit the nearest hospital."
            }
        ]
        intent["confidence"] = 0.95
    
    return intent


async def _fetch_doctors(specialization: str) -> List[Dict]:
    """Fetch doctors from FastAPI endpoint"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            'http://localhost:8001/doctors/search',
            params={'specialization': specialization}
        )
        if resp.status_code == 200:
            return resp.json()["doctors"]
    return []


# ── Routes ────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "service": "Healthcare ML Service with RAG Chat v4.0",
        "status": "running",
        "version": "4.0.0",
        "endpoints": [
            "/health", "/symptoms", "/diseases", "/disease/{name}",
            "/predict", "/chat", "/doctor/chat", "/doctor/chat-with-file",
            "/chat-with-file"
        ]
    }

@app.get("/health")
def health():
    global rag, doctor_rag
    return {
        "status": "ok",
        "model": "loaded",
        "symptoms": len(ALL_SYMPTOMS),
        "diseases": len(ALL_DISEASES),
        "patient_rag": "initialized" if (rag and rag.initialized) else "pending",
        "doctor_rag": "initialized" if (doctor_rag and doctor_rag.initialized) else "pending"
    }

@app.get("/symptoms")
def get_symptoms():
    symptoms_with_severity = [
        {"name": s, "severity": SEVERITY.get(s, 3)}
        for s in ALL_SYMPTOMS
    ]
    return {
        "symptoms": ALL_SYMPTOMS,
        "symptoms_detail": symptoms_with_severity,
        "total": len(ALL_SYMPTOMS)
    }

@app.get("/diseases")
def get_diseases():
    diseases_with_info = []
    for d in ALL_DISEASES:
        diseases_with_info.append({
            "name": d,
            "description": DESCRIPTIONS.get(d, ""),
            "precautions": PRECAUTIONS.get(d, []),
        })
    return {
        "diseases": ALL_DISEASES,
        "diseases_detail": diseases_with_info,
        "total": len(ALL_DISEASES)
    }

@app.get("/disease/{name}")
def get_disease(name: str):
    match = next((d for d in ALL_DISEASES if d.lower() == name.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Disease '{name}' not found")
    return {
        "name": match,
        "description": DESCRIPTIONS.get(match, "No description available"),
        "precautions": PRECAUTIONS.get(match, [])
    }

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if not req.symptoms:
        raise HTTPException(status_code=400, detail="Provide at least one symptom")
    
    matched_names, unknown = match_symptoms(req.symptoms)
    
    if not matched_names:
        raise HTTPException(
            status_code=400,
            detail=f"None of the symptoms were recognized. Unknown: {unknown}"
        )
    
    matched_details = [
        SymptomDetail(name=s, severity=SEVERITY.get(s, 3))
        for s in matched_names
    ]
    total_severity = sum(d.severity for d in matched_details)
    
    vector = symptoms_to_vector(matched_names)
    proba = model.predict_proba(vector)[0]
    top_n = min(req.top_n, len(ALL_DISEASES))
    top_idx = np.argsort(proba)[::-1][:top_n]
    
    predictions = []
    for rank, i in enumerate(top_idx):
        disease_name = le.classes_[i]
        predictions.append(DiseaseResult(
            rank=rank + 1,
            disease=disease_name,
            probability=round(float(proba[i]) * 100, 2),
            description=DESCRIPTIONS.get(disease_name, "No description available"),
            precautions=PRECAUTIONS.get(disease_name, [])
        ))
    
    top_prob = predictions[0].probability
    risk_level, risk_score = calc_risk(top_prob, total_severity)
    
    return PredictResponse(
        predictions=predictions,
        risk_level=risk_level,
        risk_score=risk_score,
        matched_symptoms=matched_details,
        unknown_symptoms=unknown,
        total_severity=total_severity
    )

@app.post("/chat", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest):
    """RAG-powered chat for PATIENTS with Agentic AI"""
    global rag
    try:
        if rag is None or not rag.initialized:
            if not GROQ_API_KEY:
                raise HTTPException(status_code=500, detail="Groq API key not configured")
            rag = get_rag(groq_api_key=GROQ_API_KEY)
            rag.initialize()
        
        from langchain.schema import HumanMessage, AIMessage
        
        history_messages = []
        if request.history:
            for msg in request.history[-5:]:
                if msg.get("user"):
                    history_messages.append(HumanMessage(content=msg["user"]))
                if msg.get("assistant"):
                    history_messages.append(AIMessage(content=msg["assistant"]))
        
        response_text = rag.chat(request.message, history_messages)
        
        # Agentic AI: Detect intent and suggest actions
        agentic_actions = detect_medical_intent(request.message)
        
        # Extract disease mentions as sources
        sources = []
        query_lower = request.message.lower()
        for disease in rag.all_diseases:
            if disease.lower() in query_lower:
                sources.append(disease)
        
        return ChatResponse(
            response=response_text,
            sources=sources[:3],
            agentic_actions=agentic_actions["actions"] if agentic_actions["actions"] else None
        )
        
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")



@app.post("/doctor/chat", response_model=DoctorChatResponse)
def doctor_chat(request: DoctorChatRequest):
    """RAG-powered chat for DOCTORS with Agentic AI"""
    global doctor_rag
    try:
        if doctor_rag is None or not doctor_rag.initialized:
            if not GROQ_API_KEY:
                raise HTTPException(status_code=500, detail="Groq API key not configured")
            doctor_rag = get_doctor_rag(groq_api_key=GROQ_API_KEY)
            doctor_rag.initialize()
        
        from langchain.schema import HumanMessage, AIMessage
        
        history_messages = []
        if request.history:
            for msg in request.history[-5:]:
                if msg.get("user"):
                    history_messages.append(HumanMessage(content=msg["user"]))
                if msg.get("assistant"):
                    history_messages.append(AIMessage(content=msg["assistant"]))
        
        response_text = doctor_rag.chat(
            query=request.message,
            history=history_messages,
            patient_id=request.patient_id,
            doctor_user_id=request.doctor_user_id,
            patient_name=request.patient_name,
        )
        
        # Agentic AI: Detect intent
        agentic_actions = detect_medical_intent(request.message)
        
        sources = []
        query_lower = request.message.lower()
        for disease in doctor_rag.all_diseases:
            if disease.lower() in query_lower:
                sources.append(disease)
        
        return DoctorChatResponse(
            response=response_text,
            sources=sources[:3],
            patient_id=request.patient_id,
            agentic_actions=agentic_actions["actions"] if agentic_actions["actions"] else None
        )
        
    except Exception as e:
        print(f"❌ Doctor chat error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Doctor chat error: {str(e)}")

@app.post("/chat-with-file")
async def chat_with_file(
    message: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Patient chat with uploaded file.
    Supports: images (Groq vision), PDF, DOCX, TXT
    """
    global rag
    try:
        if rag is None or not rag.initialized:
            if not GROQ_API_KEY:
                raise HTTPException(status_code=500, detail="Groq API key not configured")
            rag = get_rag(groq_api_key=GROQ_API_KEY)
            rag.initialize()
        
        file_bytes = await file.read()
        content_type = file.content_type or ""
        file_name = file.filename or "uploaded_file"
        
        extracted_text = ""
        use_vision = False
        image_b64 = None
        
        if content_type.startswith("image/"):
            use_vision = True
            image_b64 = base64.b64encode(file_bytes).decode("utf-8")
        elif content_type == "application/pdf":
            extracted_text = extract_pdf_text(file_bytes)
            if not extracted_text:
                extracted_text = "No selectable text found in PDF."
        elif content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            extracted_text = extract_docx_text(file_bytes)
        elif content_type == "text/plain":
            extracted_text = extract_txt_text(file_bytes)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {content_type}")
        
        async with httpx.AsyncClient(timeout=90.0) as client:
            if use_vision:
                user_content = [
                    {
                        "type": "text",
                        "text": f"""You are a helpful medical assistant for patients.
                        
Doctor's question: {message}
File name: {file_name}

Please analyze this image and provide medical information based on what you see.
Include:
1. What seems to be shown in the image
2. Relevant medical context
3. When to see a doctor
4. Disclaimer

End with: This is for informational purposes only. Always consult a qualified healthcare provider."""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{content_type};base64,{image_b64}"
                        }
                    }
                ]
                
                groq_response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
                        "messages": [{"role": "user", "content": user_content}],
                        "max_tokens": 1200,
                        "temperature": 0.2,
                    }
                )
            else:
                prompt = f"""You are a helpful medical assistant for patients.

Doctor's question: {message}
File name: {file_name}

Extracted content:
{extracted_text or "No text extracted."}

Please provide a clear, patient-friendly response with:
1. Summary of the content
2. Key medical findings
3. When to see a doctor
4. Relevant precautions

End with: This is for informational purposes only. Always consult a qualified healthcare provider for diagnosis and treatment."""
                
                groq_response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": "You are a helpful medical assistant for patients."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 1400,
                        "temperature": 0.2,
                    }
                )
        
        if groq_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Groq API error: {groq_response.text}")
        
        result = groq_response.json()
        response_text = result["choices"][0]["message"]["content"].strip()
        
        # Agentic AI
        agentic_actions = detect_medical_intent(message)
        
        return ChatResponse(
            response=response_text,
            sources=[],
            agentic_actions=agentic_actions["actions"] if agentic_actions["actions"] else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ File chat error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"File chat error: {str(e)}")

@app.post("/doctor/chat-with-file")
async def doctor_chat_with_file(
    message: str = Form(...),
    doctor_user_id: Optional[int] = Form(None),
    patient_id: Optional[int] = Form(None),
    patient_name: Optional[str] = Form(None),
    file: UploadFile = File(...),
):
    """Doctor chat with uploaded file (same as before)"""
    global doctor_rag
    try:
        if doctor_rag is None or not doctor_rag.initialized:
            if not GROQ_API_KEY:
                raise HTTPException(status_code=500, detail="Groq API key not configured")
            doctor_rag = get_doctor_rag(groq_api_key=GROQ_API_KEY)
            doctor_rag.initialize()

        file_bytes = await file.read()
        content_type = file.content_type or ""
        file_name = file.filename or "uploaded_file"

        extracted_text = ""
        use_vision = False
        image_b64 = None

        if content_type.startswith("image/"):
            use_vision = True
            image_b64 = base64.b64encode(file_bytes).decode("utf-8")
        elif content_type == "application/pdf":
            extracted_text = extract_pdf_text(file_bytes)
            if not extracted_text:
                extracted_text = "No selectable text found in PDF."
        elif content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            extracted_text = extract_docx_text(file_bytes)
        elif content_type == "text/plain":
            extracted_text = extract_txt_text(file_bytes)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {content_type}")

        async with httpx.AsyncClient(timeout=90.0) as client:
            if use_vision:
                user_content = [
                    {
                        "type": "text",
                        "text": f"""You are an AI clinical assistant for doctors.

Doctor's question: {message}
File name: {file_name}

Please analyze this medical image and provide:
1. Clinical summary
2. Key findings
3. Possible differentials
4. Red flags
5. Next steps

End with: This is for clinical decision support only."""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{content_type};base64,{image_b64}"
                        }
                    }
                ]
                
                groq_response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
                        "messages": [{"role": "user", "content": user_content}],
                        "max_tokens": 1200,
                        "temperature": 0.2,
                    }
                )
            else:
                prompt = f"""You are an AI clinical assistant for doctors.

Doctor's question: {message}
File name: {file_name}

Extracted content:
{extracted_text or "No text extracted."}

Please provide a structured clinical response with:
1. File summary
2. Key extracted findings
3. Clinical interpretation
4. Possible differentials
5. Red flags
6. Recommended next steps

End with: This is for clinical decision support only."""
                
                groq_response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": "You are a helpful clinical assistant for doctors."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 1400,
                        "temperature": 0.2,
                    }
                )

        if groq_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Groq API error: {groq_response.text}")

        result = groq_response.json()
        response_text = result["choices"][0]["message"]["content"].strip()

        agentic_actions = detect_medical_intent(message)

        return DoctorChatResponse(
            response=response_text,
            sources=[],
            patient_id=patient_id,
            agentic_actions=agentic_actions["actions"] if agentic_actions["actions"] else None
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Doctor file chat error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"File chat error: {str(e)}")

# ── Run Server ────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
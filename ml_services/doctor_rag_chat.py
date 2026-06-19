# """
# Doctor RAG Chat Pipeline with Groq LLM
# Provides AI medical assistant for doctors to ask about patients and medical knowledge
# """
# import os
# import json
# from typing import List, Dict, Optional
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_community.embeddings import HuggingFaceEmbeddings
# from langchain_community.vectorstores import FAISS
# from langchain_groq import ChatGroq
# from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain.schema import Document, HumanMessage, AIMessage
# from typing import Tuple, Dict, Any, Optional, List
# from dataclasses import dataclass

# @dataclass
# class PatientInfo:
#     """Container for patient information"""
#     user_id: int
#     username: str
#     full_name: str
#     age: Optional[int] = None
#     gender: Optional[str] = None
#     blood_type: Optional[str] = None


# class PatientHistoryQuery:
#     """Handles patient history queries from Django database"""
    
#     def find_patient_by_name(self, patient_name: str, doctor_user=None) -> Optional[PatientInfo]:
#         """Find patient by name (partial match). If doctor_user provided, only search among doctor's patients"""
#         from django.contrib.auth import get_user_model
#         User = get_user_model()
        
#         query = User.objects.filter(
#             role="patient",
#             username__icontains=patient_name
#         )
        
#         if doctor_user is not None:
#             doctor_patients = self._get_doctor_patients(doctor_user)
#             query = query.filter(id__in=doctor_patients)
        
#         patient = query.first()
        
#         if patient:
#             return PatientInfo(
#                 user_id=patient.id,
#                 username=patient.username,
#                 full_name=patient.get_full_name() or patient.username,
#                 age=patient.age,
#                 gender=patient.gender,
#                 blood_type=patient.blood_type
#             )
        
#         return None
    
#     def _get_doctor_patients(self, doctor_user) -> List[int]:
#         """Get list of patient IDs assigned to a doctor based on completed appointments"""
#         from accounts.models import User, Doctor
#         from appointments.models import Appointment
        
#         doctor_profile = Doctor.objects.filter(user=doctor_user).first()
        
#         if not doctor_profile:
#             return []
        
#         patient_ids = Appointment.objects.filter(
#             doctor=doctor_profile,
#             status="completed"
#         ).values_list("user_id", flat=True)
        
#         return list(patient_ids)
    
#     def get_medications(self, patient_user_id: int) -> List[Dict]:
#         """Get all medications for a patient"""
#         from accounts.models import Medication
        
#         medications = Medication.objects.filter(user_id=patient_user_id).order_by("-start_date")
        
#         return [
#             {
#                 "medicine_name": med.medicine_name,
#                 "dosage": med.dosage,
#                 "frequency": med.frequency,
#                 "start_date": med.start_date,
#                 "end_date": med.end_date,
#                 "reason": med.reason,
#                 "status": med.status,
#                 "prescribed_by": med.prescribed_by.doctor_name if med.prescribed_by else None,
#                 "notes": med.notes
#             }
#             for med in medications
#         ]
    
#     def get_allergies(self, patient_user_id: int) -> List[Dict]:
#         """Get all allergies for a patient"""
#         from accounts.models import Allergy
        
#         allergies = Allergy.objects.filter(user_id=patient_user_id)
        
#         return [
#             {
#                 "allergen": allergy.allergen,
#                 "severity": allergy.severity,
#                 "reaction": allergy.reaction
#             }
#             for allergy in allergies
#         ]
    
#     def get_medical_history(self, patient_user_id: int, history_type: str = None) -> List[Dict]:
#         """Get medical history for a patient. history_type: 'patient', 'family', or None for all"""
#         from accounts.models import MedicalHistory
        
#         query = MedicalHistory.objects.filter(user_id=patient_user_id)
        
#         if history_type:
#             query = query.filter(history_type=history_type)
        
#         history = query.order_by("diagnosis_date")
        
#         return [
#             {
#                 "condition_name": h.condition_name,
#                 "diagnosis_date": h.diagnosis_date,
#                 "status": h.status,
#                 "history_type": h.history_type,
#                 "parent_relation": h.parent_relation,
#                 "notes": h.notes
#             }
#             for h in history
#         ]
    
#     def get_consultations(self, patient_user_id: int, specialist: str = None) -> List[Dict]:
#         """Get consultation/appointment history for a patient"""
#         from accounts.models import Doctor
#         from appointments.models import Appointment
        
#         query = Appointment.objects.filter(
#             user_id=patient_user_id,
#             status="completed"
#         ).order_by("-appointment_date")
        
#         if specialist:
#             query = query.filter(doctor__specialization=specialist)
        
#         consultations = []
#         for app in query:
#             consultations.append({
#                 "date": app.appointment_date,
#                 "doctor_name": app.doctor.doctor_name,
#                 "specialization": app.doctor.specialization,
#                 "reason": app.reason,
#                 "notes": app.notes
#             })
        
#         return consultations
    
#     def get_surgeries(self, patient_user_id: int) -> List[Dict]:
#         """Get surgical history for a patient"""
#         from accounts.models import MedicalHistory
        
#         surgeries = MedicalHistory.objects.filter(
#             user_id=patient_user_id,
#             history_type="patient",
#             condition_name__icontains="surgery"
#         ).order_by("diagnosis_date")
        
#         return [
#             {
#                 "condition_name": s.condition_name,
#                 "diagnosis_date": s.diagnosis_date,
#                 "status": s.status,
#                 "notes": s.notes
#             }
#             for s in surgeries
#         ]
    
#     def get_patient_summary(self, patient_user_id: int) -> Dict:
#         """Get complete patient summary"""
#         return {
#             "medications": self.get_medications(patient_user_id),
#             "allergies": self.get_allergies(patient_user_id),
#             "medical_history": self.get_medical_history(patient_user_id),
#             "family_history": self.get_medical_history(patient_user_id, history_type="family"),
#             "consultations": self.get_consultations(patient_user_id),
#             "surgeries": self.get_surgeries(patient_user_id)
#         }



# class DoctorMedicalRAG:
#     def __init__(self, models_dir: str, groq_api_key: str):
#         self.models_dir = models_dir
#         self.groq_api_key = groq_api_key
        
#         # Load your existing disease/symptom data
#         self.descriptions = self._load_json('descriptions.json')
#         self.precautions = self._load_json('precautions.json')
#         self.severity = self._load_json('severity.json')
#         self.all_symptoms = self._load_json('symptoms_list.json')
#         self.all_diseases = self._load_json('diseases_list.json')
        
#         # Text splitter for creating chunks
#         self.text_splitter = RecursiveCharacterTextSplitter(
#             chunk_size=500,
#             chunk_overlap=50,
#             length_function=len
#         )
        
#         # Free embeddings (no API key needed)
#         self.embeddings = HuggingFaceEmbeddings(
#             model_name='all-MiniLM-L6-v2',
#             model_kwargs={'device': 'cpu'}
#         )
        
#         self.vectorstore = None
#         self.llm = None
#         self.initialized = False
        
#     def _load_json(self, filename: str) -> Dict:
#         """Load JSON file from models directory"""
#         filepath = os.path.join(self.models_dir, filename)
#         with open(filepath, 'r', encoding='utf-8') as f:
#             return json.load(f)
    
#     def _create_documents(self) -> List[Document]:
#         """Create documents from YOUR disease database + clinical info for doctors"""
#         documents = []
        
#         # Add disease info from your data
#         for disease, description in self.descriptions.items():
#             if description:
#                 text = f"### DISEASE: {disease}\n\n**DESCRIPTION**: {description}"
                
#                 if disease in self.precautions:
#                     precautions = self.precautions[disease]
#                     text += f"\n\n**PRECAUTIONS & SYMPTOMS TO WATCH**:\n"
#                     for i, prec in enumerate(precautions, 1):
#                         text += f"{i}. {prec}\n"
                
#                 if disease in self.severity:
#                     text += f"\n**SEVERITY WEIGHT**: {self.severity[disease]}"
                
#                 documents.append(Document(
#                     page_content=text,
#                     metadata={'disease': disease, 'type': 'disease'}
#                 ))
        
#         # Clinical info for doctors (more professional tone)
#         clinical_info = [
#             "CLINICAL CONTEXT FOR DOCTORS: Use differential diagnosis approach. Consider patient history, symptoms, lab results, and risk factors. Always verify with additional tests when needed.",
            
#             "DIFFERENTIAL DIAGNOSIS PRINCIPLES: Order conditions by likelihood. Consider common conditions first, then less common but serious conditions. Rule out life-threatening conditions early.",
            
#             "CLINICAL DECISION-MAKING: Base recommendations on evidence-based guidelines. Consider patient age, comorbidities, medications, allergies, and contraindications.",
            
#             "IMPORTANT CLINICAL DISCLAIMER: This information is for educational purposes and clinical decision support only. Always use professional judgment and verify with additional clinical data.",
            
#             "PATIENT SAfETY: When symptoms suggest severe conditions (chest pain, difficulty breathing, severe headache, neurological deficits, uncontrolled bleeding), recommend immediate medical attention or emergency care."
#         ]
        
#         for i, info in enumerate(clinical_info):
#             documents.append(Document(
#                 page_content=info,
#                 metadata={'type': 'clinical', 'id': i}
#             ))
        
#         return documents
    
#     def initialize(self):
#         """Initialize vectorstore and Groq LLM"""
#         if self.initialized:
#             return
        
#         print("\n" + "="*70)
#         print("🚀 Initializing DOCTOR RAG Pipeline with Groq LLM")
#         print("="*70)
        
#         print("📄 Creating documents from your disease database...")
#         documents = self._create_documents()
#         print(f"✅ Created {len(documents)} documents")
        
#         print("✂️ Splitting documents into chunks...")
#         splits = self.text_splitter.split_documents(documents)
#         print(f"✅ Created {len(splits)} chunks")
        
#         print("🗄️ Creating FAISS vectorstore...")
#         self.vectorstore = FAISS.from_documents(splits, self.embeddings)
#         print("✅ Vectorstore ready")
        
#         print("⚡ Initializing Groq LLM (Llama 3)...")
#         self.llm = ChatGroq(
#             api_key=self.groq_api_key,
#             model_name="llama-3.1-8b-instant",
#             temperature=0.2,  # Lower temp for more clinical responses
#             max_tokens=512
#         )
#         print("✅ Groq LLM initialized (super fast!)")
        
#         print("="*70)
#         print(f"🎯 DOCTOR RAG READY!")
#         print(f"   • {len(self.all_symptoms)} symptoms in database")
#         print(f"   • {len(self.all_diseases)} diseases in database")
#         print(f"   • {len(splits)} knowledge chunks")
#         print("="*70 + "\n")
        
#         self.initialized = True
    
#     def chat(self, query: str, history=None, patient_id: Optional[int] = None) -> str:
#         """
#         Answer medical questions for doctors
        
#         Args:
#             query: Doctor's question
#             history: List of HumanMessage/AIMessage objects
#             patient_id: Optional patient ID for patient-specific queries
        
#         Returns:
#             AI response string
#         """
#         if not self.initialized:
#             self.initialize()
        
#         docs = self.vectorstore.similarity_search(query, k=3)
#         context = "\n\n---\n\n".join([doc.page_content for doc in docs])
        
#         patient_context = ""
#         if patient_id is not None:
#             patient_context = f"⚕️ PATIENT ID: {patient_id}\nThis is a doctor asking about a specific patient.\n\n"
        
#         prompt = ChatPromptTemplate.from_messages([
#             ("system", f"""{patient_context}You are an AI clinical assistant for doctors. You have access to a comprehensive medical database.


# ═══════════════════════════════════════════════════════════
# 📚 RELEVANT MEDICAL INFORMATION FROM DATABASE:
# ═══════════════════════════════════════════════════════════
# {context}
# ═══════════════════════════════════════════════════════════


# ⚠️ IMPORTANT GUIDELINES FOR DOCTORS:
# 1. Answer ONLY using information from the context above
# 2. If information is NOT in context: "I'm not certain about this specific question. Please verify with additional clinical data or guidelines."
# 3. Use professional, clinical language (not patient-friendly simplification)
# 4. Provide differential diagnosis when appropriate
# 5. Include precautions and contraindications
# 6. Be concise and evidence-based
# 7. When symptoms suggest severe conditions, recommend immediate action
# 8. Always include disclaimer at the end


# ⚕️ REQUIRED DISCLAIMER:
# End every response with: "This is for clinical decision support only. Always use professional judgment and verify with additional clinical data."""),
            
#             MessagesPlaceholder(variable_name="history"),
#             ("human", "{query}")
#         ])
        
#         formatted_prompt = prompt.format(
#             context=context,
#             history=history,
#             query=query
#         )
        
#         response = self.llm.invoke(formatted_prompt)
        
#         return response.content.strip()
    
#     def get_disease_info(self, disease_name: str) -> Optional[Dict]:
#         """Get detailed info about specific disease"""
#         disease_name = disease_name.lower()
        
#         match = None
#         for disease in self.all_diseases:
#             if disease.lower() == disease_name:
#                 match = disease
#                 break
        
#         if not match:
#             return None
        
#         return {
#             'name': match,
#             'description': self.descriptions.get(match, ''),
#             'precautions': self.precautions.get(match, []),
#             'severity': self.severity.get(match, 3)
#         }
    
#     def search_symptoms(self, keyword: str) -> List[str]:
#         """Search symptoms by keyword"""
#         keyword = keyword.lower()
#         return [s for s in self.all_symptoms if keyword in s.lower()]
    
#     def search_diseases(self, keyword: str) -> List[str]:
#         """Search diseases by keyword"""
#         keyword = keyword.lower()
#         return [d for d in self.all_diseases if keyword in d.lower()]


# # new patient recpords questuin 

# def chat(self, query: str, history=None, patient_id: Optional[int] = None, 
#          doctor_user=None, patient_name: Optional[str] = None) -> str:
#     """
#     Answer medical questions for doctors with patient history integration
#     """
#     if not self.initialized:
#         self.initialize()
    
#     # STEP 1: Check if this is a patient count query
#     is_patient_count, count_type = self._is_patient_count_query(query)
#     if is_patient_count:
#         return self.get_patient_count_from_django(count_type, doctor_user)
    
#     # STEP 2: Check if this is a patient history query
#     is_history, history_type, extracted_name = self._is_patient_history_query(query)
    
#     if extracted_name:
#         patient_name = extracted_name
    
#     if is_history:
#         target_patient_id = patient_id
        
#         if target_patient_id is None and patient_name:
#             query_handler = PatientHistoryQuery()
#             patient_info = query_handler.find_patient_by_name(patient_name, doctor_user)
            
#             if patient_info:
#                 target_patient_id = patient_info.user_id
#                 patient_context_prefix = f"[PATIENT] {patient_info.full_name} (ID: {patient_info.user_id})\n\n"
#             else:
#                 return f'Patient "{patient_name}" not found. Please verify the patient name or provide patient ID.'
#         elif target_patient_id is None:
#             return "I need a patient ID or name to retrieve history. Please provide patient ID or specify which patient you are asking about."
        
#         history_response = self.get_patient_history_from_django(history_type, target_patient_id)
        
#         return patient_context_prefix + history_response + "\n\n[DOCTOR] Disclaimer: This is for clinical decision support only. Always use professional judgment and verify with additional clinical data."
    
#     # STEP 3: Normal RAG pipeline for general medical questions
#     docs = self.vectorstore.similarity_search(query, k=3)
#     context = "\n\n---\n\n".join([doc.page_content for doc in docs])
    
#     patient_context = ""
#     if patient_id is not None:
#         patient_context = f"[DOCTOR] PATIENT ID: {patient_id}\nThis is a doctor asking about a specific patient.\n\n"
    
#     prompt = ChatPromptTemplate.from_messages([
#         ("system", f"""{patient_context}You are an AI clinical assistant for doctors. You have access to a comprehensive medical database.

# ===========================================================
# [DATA] RELEVANT MEDICAL INFORMATION FROM DATABASE:
# ===========================================================
# {context}
# ===========================================================

# [WARN] IMPORTANT GUIDELINES FOR DOCTORS:
# 1. Answer ONLY using information from the context above
# 2. If information is NOT in context: "I am not certain about this specific question. Please verify with additional clinical data or guidelines."
# 3. Use professional, clinical language (not patient-friendly simplification)
# 4. Provide differential diagnosis when appropriate
# 5. Include precautions and contraindications
# 6. Be concise and evidence-based
# 7. When symptoms suggest severe conditions, recommend immediate action
# 8. Always include disclaimer at the end

# [DOCTOR] REQUIRED DISCLAIMER:
# End every response with: "This is for clinical decision support only. Always use professional judgment and verify with additional clinical data."""),
        
#         MessagesPlaceholder(variable_name="history"),
#         ("human", "{query}")
#     ])
    
#     formatted_prompt = prompt.format(context=context, history=history, query=query)
#     response = self.llm.invoke(formatted_prompt)
    
#     return response.content.strip()


# def get_disease_info(self, disease_name: str) -> Optional[Dict]:
#     """Get detailed info about specific disease"""
#     disease_name = disease_name.lower()
    
#     match = None
#     for disease in self.all_diseases:
#         if disease.lower() == disease_name:
#             match = disease
#             break
    
#     if not match:
#         return None
    
#     return {
#         'name': match,
#         'description': self.descriptions.get(match, ''),
#         'precautions': self.precautions.get(match, []),
#         'severity': self.severity.get(match, 3)
#     }

    



# # ========== GLOBAL SINGLETON INSTANCE ==========
# _doctor_rag_instance = None



# def get_doctor_rag(groq_api_key: str) -> DoctorMedicalRAG:
#     """Get or create doctor RAG instance (singleton pattern)"""
#     global _doctor_rag_instance
#     if _doctor_rag_instance is None:
#         models_dir = os.path.join(os.path.dirname(__file__), 'models')
#         _doctor_rag_instance = DoctorMedicalRAG(models_dir=models_dir, groq_api_key=groq_api_key)
#     return _doctor_rag_instance


"""
Doctor RAG Chat Pipeline with Groq LLM
Supports:
  - "How many patients do I have?"
  - "Show me my patients list"
  - "Tell me about [patient name]" → full profile, medications, history, allergies
"""

import os
import sys
import json
import re
import traceback
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import Document, HumanMessage, AIMessage

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DJANGO_PROJECT_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "healthcare_symptom_analysis"))
if DJANGO_PROJECT_DIR not in sys.path:
    sys.path.append(DJANGO_PROJECT_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()


@dataclass
class PatientInfo:
    user_id: int
    username: str
    fullname: str
    age: Optional[int] = None
    gender: Optional[str] = None
    bloodtype: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    phone: Optional[str] = None


class DjangoPatientFetcher:
    def get_doctor_profile(self, doctor_user_id: int):
        from accounts.models import Doctor
        return Doctor.objects.filter(user_id=doctor_user_id).first()

    def get_patient_ids_for_doctor(self, doctor_user_id: int) -> List[int]:
        from appointments.models import Appointment
        doctor = self.get_doctor_profile(doctor_user_id)
        if not doctor:
            return []
        return list(
            Appointment.objects.filter(doctor=doctor, status="completed")
            .values_list("user_id", flat=True)
            .distinct()
        )

    def get_patients_for_doctor(self, doctor_user_id: int) -> List[PatientInfo]:
        from accounts.models import User
        patient_ids = self.get_patient_ids_for_doctor(doctor_user_id)
        patients = User.objects.filter(id__in=patient_ids, role="patient")
        return [
            PatientInfo(
                user_id=p.id,
                username=p.username,
                fullname=getattr(p, "get_full_name", lambda: p.username)() if callable(getattr(p, "get_full_name", None)) else p.username,
                age=getattr(p, "age", None),
                gender=getattr(p, "gender", None),
                bloodtype=getattr(p, "bloodtype", None),
                weight=getattr(p, "weight", None),
                height=getattr(p, "height", None),
                phone=getattr(p, "phone", None),
            )
            for p in patients
        ]

    def find_patient_by_name(self, name: str, doctor_user_id: int) -> Optional[PatientInfo]:
        from accounts.models import User
        from django.db.models import Q

        patient_ids = self.get_patient_ids_for_doctor(doctor_user_id)
        patient = (
            User.objects.filter(id__in=patient_ids, role="patient")
            .filter(
                Q(first_name__icontains=name)
                | Q(last_name__icontains=name)
                | Q(username__icontains=name)
            )
            .first()
        )
        if not patient:
            return None

        return PatientInfo(
            user_id=patient.id,
            username=patient.username,
            fullname=getattr(patient, "get_full_name", lambda: patient.username)() if callable(getattr(patient, "get_full_name", None)) else patient.username,
            age=getattr(patient, "age", None),
            gender=getattr(patient, "gender", None),
            bloodtype=getattr(patient, "bloodtype", None),
            weight=getattr(patient, "weight", None),
            height=getattr(patient, "height", None),
            phone=getattr(patient, "phone", None),
        )

    def get_medications(self, patient_user_id: int) -> List[Dict]:
        from accounts.models import Medication
        meds = Medication.objects.filter(user_id=patient_user_id).order_by("-start_date")
        return [
            {
                "medicine_name": m.medicine_name,
                "dosage": m.dosage,
                "frequency": m.frequency,
                "start_date": str(m.start_date),
                "end_date": str(m.end_date) if m.end_date else "Ongoing",
                "reason": getattr(m, "reason", ""),
                "status": getattr(m, "status", ""),
                "prescribed_by": getattr(getattr(m, "prescribed_by", None), "doctor_name", "Unknown"),
                "notes": getattr(m, "notes", "") or "",
            }
            for m in meds
        ]

    def get_allergies(self, patient_user_id: int) -> List[Dict]:
        from accounts.models import Allergy
        allergies = Allergy.objects.filter(user_id=patient_user_id)
        return [
            {
                "allergen": a.allergen,
                "severity": a.severity,
                "reaction": a.reaction,
            }
            for a in allergies
        ]

    def get_medical_history(self, patient_user_id: int, history_type: str = None) -> List[Dict]:
        from accounts.models import MedicalHistory
        qs = MedicalHistory.objects.filter(user_id=patient_user_id)
        if history_type:
            qs = qs.filter(history_type=history_type)
        return [
            {
                "condition_name": h.condition_name,
                "diagnosis_date": str(h.diagnosis_date),
                "status": h.status,
                "history_type": h.history_type,
                "parent_relation": getattr(h, "parent_relation", "") or "",
                "notes": getattr(h, "notes", "") or "",
            }
            for h in qs.order_by("-diagnosis_date")
        ]

    def get_consultations(self, patient_user_id: int) -> List[Dict]:
        from appointments.models import Appointment
        appts = Appointment.objects.filter(user_id=patient_user_id, status="completed").order_by("-appointment_date")
        return [
            {
                "date": str(a.appointment_date),
                "doctor_name": getattr(a.doctor, "doctor_name", ""),
                "specialization": getattr(a.doctor, "specialization", ""),
                "reason": getattr(a, "reason", ""),
                "notes": getattr(a, "notes", "") or "",
            }
            for a in appts
        ]

    def get_full_patient_summary(self, patient_user_id: int) -> Dict:
        return {
            "medications": self.get_medications(patient_user_id),
            "allergies": self.get_allergies(patient_user_id),
            "personal_history": self.get_medical_history(patient_user_id, "personal"),
            "family_history": self.get_medical_history(patient_user_id, "family"),
            "consultations": self.get_consultations(patient_user_id),
        }


COUNTKEYWORDS = [
    "how many patients",
    "total patients",
    "total patient",
    "my total patients",
    "my total patient",
    "my patients",
    "my patient",
    "show my patients",
    "list my patients",
    "all my patients",
    "patients i have",
    "patient list",
    "patient count",
    "number of patients",
]

HISTORYKEYWORDS = [
    "patient history",
    "medical history",
    "medications",
    "allergies",
    "tell me about",
    "show me",
    "details for",
    "profile of",
    "what medications",
    "health record",
    "patient record",
    "consultations",
    "family history",
    "patient info",
]


def is_count_query(query: str) -> bool:
    q = query.lower().strip()
    return any(kw in q for kw in COUNTKEYWORDS)


def is_patient_query(query: str) -> Tuple[bool, Optional[str]]:
    q = query.lower().strip()
    if not any(kw in q for kw in HISTORYKEYWORDS):
        return False, None

    patterns = [
        r"about\s+([a-zA-Z\s]+)",
        r"for\s+([a-zA-Z\s]+)",
        r"of\s+([a-zA-Z\s]+)",
        r"patient\s+([a-zA-Z\s]+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, q)
        if match:
            candidate = match.group(1).strip()
            stopwords = {"the", "my", "a", "this", "that", "patient", "history", "all"}
            if candidate and candidate not in stopwords:
                return True, candidate

    return True, None


def format_patient_list(patients: List[PatientInfo]) -> str:
    if not patients:
        return "You currently have no patients with completed appointments."

    lines = [f"You have {len(patients)} patients:"]
    for i, p in enumerate(patients, 1):
        age_str = f", Age: {p.age}" if p.age else ""
        gender_str = f", Gender: {p.gender}" if p.gender else ""
        lines.append(f"{i}. {p.fullname}{age_str}{gender_str}")
    lines.append("You can ask me about any patient by name for full details.")
    return "\n".join(lines)


def format_patient_detail(patient: PatientInfo, summary: Dict) -> str:
    lines = []
    lines.append(f"PATIENT: {patient.fullname}")
    lines.append("")
    lines.append("BASIC INFORMATION")
    lines.append(f"Age: {patient.age or 'NA'}")
    lines.append(f"Gender: {patient.gender or 'NA'}")
    lines.append(f"Blood Type: {patient.bloodtype or 'NA'}")

    if patient.weight and patient.height:
        bmi = round(patient.weight / ((patient.height / 100) ** 2), 2)
        lines.append(f"Weight: {patient.weight} kg")
        lines.append(f"Height: {patient.height} cm")
        lines.append(f"BMI: {bmi}")

    meds = summary.get("medications", [])
    lines.append("")
    lines.append(f"MEDICATIONS: {len(meds)} total")
    if meds:
        for m in meds[:5]:
            lines.append(f"- {m['medicine_name']} {m['dosage']} {m['frequency']}")
            lines.append(f"  Reason: {m['reason']} | Status: {m['status']}")
            lines.append(f"  Period: {m['start_date']} to {m['end_date']}")
            lines.append(f"  Prescribed by: Dr. {m['prescribed_by']}")
            if m["notes"]:
                lines.append(f"  Notes: {m['notes']}")
    else:
        lines.append("No medications on record.")

    allergies = summary.get("allergies", [])
    lines.append("")
    lines.append(f"ALLERGIES: {len(allergies)} total")
    if allergies:
        for a in allergies:
            lines.append(f"- {a['allergen']} | Severity: {a['severity']} | Reaction: {a['reaction']}")
    else:
        lines.append("No allergies on record.")

    personal = summary.get("personal_history", [])
    lines.append("")
    lines.append(f"PERSONAL MEDICAL HISTORY: {len(personal)} conditions")
    if personal:
        for h in personal[:5]:
            lines.append(f"- {h['condition_name']} | {h['status']} | Since: {h['diagnosis_date']}")
            if h["notes"]:
                lines.append(f"  Notes: {h['notes']}")
    else:
        lines.append("No personal history on record.")

    family = summary.get("family_history", [])
    lines.append("")
    lines.append(f"FAMILY HISTORY: {len(family)} conditions")
    if family:
        for h in family[:5]:
            rel = f" ({h['parent_relation']})" if h["parent_relation"] else ""
            lines.append(f"- {h['condition_name']}{rel} | {h['status']}")
    else:
        lines.append("No family history on record.")

    consults = summary.get("consultations", [])
    lines.append("")
    lines.append(f"CONSULTATION HISTORY: {len(consults)} visits")
    if consults:
        for c in consults[:5]:
            lines.append(f"- {c['date']} | Dr. {c['doctor_name']} | {c['specialization']}")
            lines.append(f"  Reason: {c['reason']}")
            if c["notes"]:
                lines.append(f"  Notes: {c['notes']}")
    else:
        lines.append("No consultations on record.")

    lines.append("")
    lines.append("Clinical decision support only. Always verify with additional data.")
    return "\n".join(lines)


class DoctorMedicalRAG:
    def __init__(self, models_dir: str, groq_api_key: str):
        self.models_dir = models_dir
        self.groq_api_key = groq_api_key
        self.descriptions = self.load_json("descriptions.json")
        self.precautions = self.load_json("precautions.json")
        self.severity = self.load_json("severity.json")
        self.all_symptoms = self.load_json("symptoms_list.json")
        self.all_diseases = self.load_json("diseases_list.json")
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2", model_kwargs={"device": "cpu"})
        self.vectorstore = None
        self.llm = None
        self.initialized = False
        self.db = DjangoPatientFetcher()

    def load_json(self, filename: str):
        with open(os.path.join(self.models_dir, filename), "r", encoding="utf-8") as f:
            return json.load(f)

    def create_documents(self) -> List[Document]:
        docs = []
        for disease, desc in self.descriptions.items():
            if not desc:
                continue
            text = f"DISEASE: {disease}\nDESCRIPTION: {desc}"
            if disease in self.precautions:
                text += "\nPRECAUTIONS:\n" + "\n".join([f"{i}. {p}" for i, p in enumerate(self.precautions[disease], 1)])
            if disease in self.severity:
                text += f"\nSEVERITY: {self.severity[disease]}"
            docs.append(Document(page_content=text, metadata={"disease": disease, "type": "disease"}))

        clinical_notes = [
            "CLINICAL CONTEXT: Use differential diagnosis. Consider patient history, symptoms, labs, and risk factors.",
            "DIFFERENTIAL DIAGNOSIS: Order conditions by likelihood. Prioritise common conditions and rule out life-threatening ones early.",
            "CLINICAL DECISION-MAKING: Follow evidence-based guidelines. Account for age, comorbidities, medications, allergies.",
            "PATIENT SAFETY: Chest pain, dyspnoea, severe headache, neurological deficits require emergency care immediately.",
            "DISCLAIMER: This is clinical decision support only. Always apply professional judgment and verify with clinical data.",
        ]

        for i, note in enumerate(clinical_notes):
            docs.append(Document(page_content=note, metadata={"type": "clinical", "id": i}))

        return docs

    def initialize(self):
        if self.initialized:
            return

        docs = self.create_documents()
        splits = self.text_splitter.split_documents(docs)
        self.vectorstore = FAISS.from_documents(splits, self.embeddings)
        self.llm = ChatGroq(
            api_key=self.groq_api_key,
            model_name="llama-3.1-8b-instant",
            temperature=0.2,
            max_tokens=512,
        )
        self.initialized = True

    def chat(
        self,
        query: str,
        history: Optional[List] = None,
        patient_id: Optional[int] = None,
        doctor_user_id: Optional[int] = None,
        patient_name: Optional[str] = None,
    ) -> str:
        if not self.initialized:
            self.initialize()

        if history is None:
            history = []

        if is_count_query(query):
            if doctor_user_id is None:
                return "I need your doctor account ID to look up your patients. Please ensure you are logged in."
            patients = self.db.get_patients_for_doctor(doctor_user_id)
            return format_patient_list(patients)

        is_history_query, extracted_name = is_patient_query(query)
        if patient_name is None and extracted_name:
            patient_name = extracted_name

        if is_history_query or patient_name or patient_id:
            resolved_id = patient_id
            if resolved_id is None and patient_name and doctor_user_id:
                patient_info = self.db.find_patient_by_name(patient_name, doctor_user_id)
                if patient_info is None:
                    return f"No patient named '{patient_name}' found among your patients. Please check the name or ask me to list your patients."
                resolved_id = patient_info.user_id
            elif resolved_id is None:
                return "Please provide a patient name or ID so I can look up their details. You can also ask 'show me my patients list' to see all your patients."

            from accounts.models import User as DjangoUser
            try:
                p = DjangoUser.objects.get(id=resolved_id, role="patient")
                patient_info = PatientInfo(
                    user_id=p.id,
                    username=p.username,
                    fullname=getattr(p, "get_full_name", lambda: p.username)() if callable(getattr(p, "get_full_name", None)) else p.username,
                    age=getattr(p, "age", None),
                    gender=getattr(p, "gender", None),
                    bloodtype=getattr(p, "bloodtype", None),
                    weight=getattr(p, "weight", None),
                    height=getattr(p, "height", None),
                    phone=getattr(p, "phone", None),
                )
            except DjangoUser.DoesNotExist:
                return f"Patient with ID {resolved_id} not found."

            summary = self.db.get_full_patient_summary(resolved_id)
            return format_patient_detail(patient_info, summary)

        return self.rag_answer(query, history, patient_id)

    def rag_answer(self, query: str, history: Optional[List], patient_id: Optional[int] = None) -> str:
        docs = self.vectorstore.similarity_search(query, k=3)
        context = "\n---\n".join(d.page_content for d in docs)
        patient_ctx = f"Context: Doctor is asking about Patient ID {patient_id}\n" if patient_id else ""

        prompt = ChatPromptTemplate.from_messages([
            ("system", f"{patient_ctx}You are an AI clinical assistant for doctors. Answer using the medical database below.\n\nMEDICAL DATABASE CONTEXT:\n{context}\n\nGuidelines:\n1. Use professional clinical language.\n2. Provide differential diagnoses when relevant.\n3. Include precautions and contraindications.\n4. If the answer is not in context, say 'I'm not certain; please verify with clinical guidelines.'\n5. End every response with the disclaimer below.\n\nDisclaimer: This is for clinical decision support only. Always apply professional judgment and verify with additional clinical data."),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{query}"),
        ])

        formatted = prompt.format_messages(history=history, query=query)
        response = self.llm.invoke(formatted)
        return response.content.strip()

    def get_disease_info(self, disease_name: str) -> Optional[Dict]:
        match = next((d for d in self.all_diseases if d.lower() == disease_name.lower()), None)
        if not match:
            return None
        return {
            "name": match,
            "description": self.descriptions.get(match, ""),
            "precautions": self.precautions.get(match, []),
            "severity": self.severity.get(match, 3),
        }

    def search_symptoms(self, keyword: str) -> List[str]:
        kw = keyword.lower()
        return [s for s in self.all_symptoms if kw in s.lower()]

    def search_diseases(self, keyword: str) -> List[str]:
        kw = keyword.lower()
        return [d for d in self.all_diseases if kw in d.lower()]


doctor_rag_instance: Optional[DoctorMedicalRAG] = None


def get_doctor_rag(groq_api_key: str) -> DoctorMedicalRAG:
    global doctor_rag_instance
    if doctor_rag_instance is None:
        models_dir = os.path.join(os.path.dirname(__file__), "models")
        doctor_rag_instance = DoctorMedicalRAG(models_dir=models_dir, groq_api_key=groq_api_key)
    return doctor_rag_instance


def get_doctor_rag_instance() -> Optional[DoctorMedicalRAG]:
    return doctor_rag_instance
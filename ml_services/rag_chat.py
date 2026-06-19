# """
# RAG Chat Pipeline with Groq LLM
# Provides AI medical assistant with disease/symptom knowledge
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


# class MedicalRAG:
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
#         """Create documents from YOUR disease database"""
#         documents = []
        
#         # Add disease info from your data
#         for disease, description in self.descriptions.items():
#             if description:
#                 text = f"### DISEASE: {disease}\n\n**DESCRIPTION**: {description}"
                
#                 # Add precautions from your data
#                 if disease in self.precautions:
#                     precautions = self.precautions[disease]
#                     text += f"\n\n**PRECAUTIONS & SYMPTOMS TO WATCH**:\n"
#                     for i, prec in enumerate(precautions, 1):
#                         text += f"{i}. {prec}\n"
                
#                 # Add severity weight
#                 if disease in self.severity:
#                     text += f"\n**SEVERITY WEIGHT**: {self.severity[disease]}"
                
#                 documents.append(Document(
#                     page_content=text,
#                     metadata={'disease': disease, 'type': 'disease'}
#                 ))
        
#         # Add general medical information
#         general_info = [
#             "COMMON SYMPTOMS INCLUDE: fever, headache, fatigue, cough, nausea, vomiting, diarrhea, body pain, chills, sweating, sore throat, runny nose, dizziness, chest pain, shortness of breath, abdominal pain, bloating, joint pain, muscle pain, rash, itching, sneezing, congestion, loss of appetite",
            
#             "SEE A DOCTOR IMMEDIATELY IF: severe difficulty breathing, chest pain or pressure, sudden confusion or trouble speaking, severe headache with fever and stiff neck, persistent vomiting or inability to keep liquids down, severe abdominal pain, sudden severe pain anywhere in body, uncontrolled bleeding, sudden vision changes, severe allergic reaction (difficulty breathing, swelling of face/lips/tongue), seizures",
            
#             "IMPORTANT MEDICAL DISCLAIMER: Always consult a qualified healthcare provider for proper diagnosis and treatment. Self-diagnosis can be dangerous. Symptoms may indicate various conditions requiring professional medical evaluation. This information is for educational purposes only.",
            
#             "SYMPTOM TRACKING TIPS: Keep track of when symptoms started, their severity (scale 1-10), what makes them better or worse, any medications taken, temperature readings if fever, and other relevant health information to share with your doctor.",
            
#             "WHEN SYMPTOMS PERSIST: If symptoms last more than a few days, worsen over time, or interfere with daily activities, consult a healthcare provider. Chronic symptoms may require ongoing management."
#         ]
        
#         for i, info in enumerate(general_info):
#             documents.append(Document(
#                 page_content=info,
#                 metadata={'type': 'general', 'id': i}
#             ))
        
#         return documents
    
#     def initialize(self):
#         """Initialize vectorstore and Groq LLM"""
#         if self.initialized:
#             return
        
#         print("\n" + "="*70)
#         print("🚀 Initializing RAG Pipeline with Groq LLM")
#         print("="*70)
        
#         # Create documents
#         print("📄 Creating documents from your disease database...")
#         documents = self._create_documents()
#         print(f"✅ Created {len(documents)} documents")
        
#         # Split documents
#         print("✂️ Splitting documents into chunks...")
#         splits = self.text_splitter.split_documents(documents)
#         print(f"✅ Created {len(splits)} chunks")
        
#         # Create vectorstore
#         print("🗄️ Creating FAISS vectorstore...")
#         self.vectorstore = FAISS.from_documents(splits, self.embeddings)
#         print("✅ Vectorstore ready")
        
#         # Initialize Groq LLM
#         print("⚡ Initializing Groq LLM (Llama 3)...")
#         self.llm = ChatGroq(
#             api_key=self.groq_api_key,
#             model_name="llama-3.1-8b-instant",  # FREE tier - very fast
#             temperature=0.3,
#             max_tokens=512
#         )
#         print("✅ Groq LLM initialized (super fast!)")
        
#         print("="*70)
#         print(f"🎯 RAG READY!")
#         print(f"   • {len(self.all_symptoms)} symptoms in database")
#         print(f"   • {len(self.all_diseases)} diseases in database")
#         print(f"   • {len(splits)} knowledge chunks")
#         print("="*70 + "\n")
        
#         self.initialized = True
    
#     def chat(self, query: str, history=None) -> str:
#         """
#         Answer medical questions using RAG
        
#         Args:
#             query: User's question
#             history: List of HumanMessage/AIMessage objects from LangChain
        
#         Returns:
#             AI response string
#         """
#         if not self.initialized:
#             self.initialize()
        
#         # Retrieve relevant context
#         docs = self.vectorstore.similarity_search(query, k=3)
#         context = "\n\n---\n\n".join([doc.page_content for doc in docs])
        
#         # Create smart prompt
#         prompt = ChatPromptTemplate.from_messages([
#             ("system", """You are a helpful, accurate, and empathetic medical assistant with access to a comprehensive medical database.

# ═══════════════════════════════════════════════════════════
# 📚 RELEVANT MEDICAL INFORMATION FROM DATABASE:
# ═══════════════════════════════════════════════════════════
# {context}
# ═══════════════════════════════════════════════════════════

# ⚠️ IMPORTANT GUIDELINES:
# 1. Answer ONLY using information from the context above
# 2. If information is NOT in context: "I'm not certain about this specific question. Please consult a healthcare provider for accurate medical information."
# 3. Be clear, empathetic, and helpful
# 4. ALWAYS include disclaimer to consult a doctor
# 5. NEVER diagnose - provide information only
# 6. Use simple, patient-friendly language (avoid jargon)
# 7. For symptoms: mention possible conditions from context
# 8. For diseases: provide description + precautions from your data
# 9. Be honest about limitations
# 10. If symptoms are severe, recommend immediate medical attention

# ⚕️ REQUIRED DISCLAIMER:
# End every response with: "This is for informational purposes only. Always consult a qualified healthcare provider for diagnosis and treatment."""),
            
#             MessagesPlaceholder(variable_name="history"),
#             ("human", "{query}")
#         ])
        
#         # Format and execute
#         formatted_prompt = prompt.format(
#             context=context,
#             history=history,
#             query=query
#         )
        
#         # Get response from Groq
#         response = self.llm.invoke(formatted_prompt)
        
#         return response.content.strip()
    
#     def get_disease_info(self, disease_name: str) -> Optional[Dict]:
#         """Get detailed info about specific disease"""
#         disease_name = disease_name.lower()
        
#         # Find matching disease (case-insensitive)
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


# # ========== GLOBAL SINGLETON INSTANCE ==========
# _rag_instance = None


# def get_rag(groq_api_key: str) -> MedicalRAG:
#     """Get or create RAG instance (singleton pattern)"""
#     global _rag_instance
#     if _rag_instance is None:
#         models_dir = os.path.join(os.path.dirname(__file__), 'models')
#         _rag_instance = MedicalRAG(models_dir=models_dir, groq_api_key=groq_api_key)
#     return _rag_instance


"""
RAG Chat Pipeline with Groq LLM v2.0
Provides AI medical assistant with disease/symptom knowledge
+ Agentic AI support
"""
import os
import json
from typing import List, Dict, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import Document, HumanMessage, AIMessage


class MedicalRAG:
    def __init__(self, models_dir: str, groq_api_key: str):
        self.models_dir = models_dir
        self.groq_api_key = groq_api_key
        
        self.descriptions = self._load_json('descriptions.json')
        self.precautions = self._load_json('precautions.json')
        self.severity = self._load_json('severity.json')
        self.all_symptoms = self._load_json('symptoms_list.json')
        self.all_diseases = self._load_json('diseases_list.json')
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len
        )
        
        self.embeddings = HuggingFaceEmbeddings(
            model_name='all-MiniLM-L6-v2',
            model_kwargs={'device': 'cpu'}
        )
        
        self.vectorstore = None
        self.llm = None
        self.initialized = False
        
    def _load_json(self, filename: str) -> Dict:
        filepath = os.path.join(self.models_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _create_documents(self) -> List[Document]:
        documents = []
        
        for disease, description in self.descriptions.items():
            if description:
                text = f"### DISEASE: {disease}\n\n**DESCRIPTION**: {description}"
                
                if disease in self.precautions:
                    precautions = self.precautions[disease]
                    text += f"\n\n**PRECAUTIONS & SYMPTOMS TO WATCH**:\n"
                    for i, prec in enumerate(precautions, 1):
                        text += f"{i}. {prec}\n"
                
                if disease in self.severity:
                    text += f"\n**SEVERITY WEIGHT**: {self.severity[disease]}"
                
                documents.append(Document(
                    page_content=text,
                    metadata={'disease': disease, 'type': 'disease'}
                ))
        
        general_info = [
            "COMMON SYMPTOMS INCLUDE: fever, headache, fatigue, cough, nausea, vomiting, diarrhea, body pain, chills, sweating, sore throat, runny nose, dizziness, chest pain, shortness of breath, abdominal pain, bloating, joint pain, muscle pain, rash, itching, sneezing, congestion, loss of appetite",
            "SEE A DOCTOR IMMEDIATELY IF: severe difficulty breathing, chest pain or pressure, sudden confusion or trouble speaking, severe headache with fever and stiff neck, persistent vomiting or inability to keep liquids down, severe abdominal pain, sudden severe pain anywhere in body, uncontrolled bleeding, sudden vision changes, severe allergic reaction (difficulty breathing, swelling of face/lips/tongue), seizures",
            "IMPORTANT MEDICAL DISCLAIMER: Always consult a qualified healthcare provider for proper diagnosis and treatment. Self-diagnosis can be dangerous. Symptoms may indicate various conditions requiring professional medical evaluation. This information is for educational purposes only.",
            "SYMPTOM TRACKING TIPS: Keep track of when symptoms started, their severity (scale 1-10), what makes them better or worse, any medications taken, temperature readings if fever, and other relevant health information to share with your doctor.",
            "WHEN SYMPTOMS PERSIST: If symptoms last more than a few days, worsen over time, or interfere with daily activities, consult a healthcare provider. Chronic symptoms may require ongoing management."
        ]
        
        for i, info in enumerate(general_info):
            documents.append(Document(
                page_content=info,
                metadata={'type': 'general', 'id': i}
            ))
        
        return documents
    
    def initialize(self):
        if self.initialized:
            return
        
        print("\n" + "="*70)
        print("🚀 Initializing RAG Pipeline with Groq LLM v2.0")
        print("="*70)
        
        print("📄 Creating documents from your disease database...")
        documents = self._create_documents()
        print(f"✅ Created {len(documents)} documents")
        
        print("✂️ Splitting documents into chunks...")
        splits = self.text_splitter.split_documents(documents)
        print(f"✅ Created {len(splits)} chunks")
        
        print("🗄️ Creating FAISS vectorstore...")
        self.vectorstore = FAISS.from_documents(splits, self.embeddings)
        print("✅ Vectorstore ready")
        
        print("⚡ Initializing Groq LLM (Llama 3)...")
        self.llm = ChatGroq(
            api_key=self.groq_api_key,
            model_name="llama-3.1-8b-instant",
            temperature=0.3,
            max_tokens=512
        )
        print("✅ Groq LLM initialized (super fast!)")
        
        print("="*70)
        print(f"🎯 RAG READY!")
        print(f"   • {len(self.all_symptoms)} symptoms in database")
        print(f"   • {len(self.all_diseases)} diseases in database")
        print(f"   • {len(splits)} knowledge chunks")
        print("="*70 + "\n")
        
        self.initialized = True
    
    def chat(self, query: str, history=None) -> str:
        if not self.initialized:
            self.initialize()
        
        docs = self.vectorstore.similarity_search(query, k=3)
        context = "\n\n---\n\n".join([doc.page_content for doc in docs])
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a helpful, accurate, and empathetic medical assistant with access to a comprehensive medical database.


═══════════════════════════════════════════════════════════
📚 RELEVANT MEDICAL INFORMATION FROM DATABASE:
═══════════════════════════════════════════════════════════
{context}
═══════════════════════════════════════════════════════════


⚠️ IMPORTANT GUIDELINES:
1. Answer ONLY using information from the context above
2. If information is NOT in context: "I'm not certain about this specific question. Please consult a healthcare provider for accurate medical information."
3. Be clear, empathetic, and helpful
4. ALWAYS include disclaimer to consult a doctor
5. NEVER diagnose - provide information only
6. Use simple, patient-friendly language (avoid jargon)
7. For symptoms: mention possible conditions from context
8. For diseases: provide description + precautions from your data
9. Be honest about limitations
10. If symptoms are severe, recommend immediate medical attention


⚕️ REQUIRED DISCLAIMER:
End every response with: "This is for informational purposes only. Always consult a qualified healthcare provider for diagnosis and treatment."""),
            
            MessagesPlaceholder(variable_name="history"),
            ("human", "{query}")
        ])
        
        formatted_prompt = prompt.format(
            context=context,
            history=history,
            query=query
        )
        
        response = self.llm.invoke(formatted_prompt)
        
        return response.content.strip()
    
    def get_disease_info(self, disease_name: str) -> Optional[Dict]:
        disease_name = disease_name.lower()
        
        match = None
        for disease in self.all_diseases:
            if disease.lower() == disease_name:
                match = disease
                break
        
        if not match:
            return None
        
        return {
            'name': match,
            'description': self.descriptions.get(match, ''),
            'precautions': self.precautions.get(match, []),
            'severity': self.severity.get(match, 3)
        }
    
    def search_symptoms(self, keyword: str) -> List[str]:
        keyword = keyword.lower()
        return [s for s in self.all_symptoms if keyword in s.lower()]
    
    def search_diseases(self, keyword: str) -> List[str]:
        keyword = keyword.lower()
        return [d for d in self.all_diseases if keyword in d.lower()]


# ========== GLOBAL SINGLETON INSTANCE ==========
_rag_instance = None

def get_rag(groq_api_key: str) -> MedicalRAG:
    global _rag_instance
    if _rag_instance is None:
        models_dir = os.path.join(os.path.dirname(__file__), 'models')
        _rag_instance = MedicalRAG(models_dir=models_dir, groq_api_key=groq_api_key)
    return _rag_instance
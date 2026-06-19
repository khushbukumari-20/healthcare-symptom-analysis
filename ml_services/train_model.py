"""
TRAIN MODEL — uses all 4 Kaggle CSV files
==========================================
Files needed in ml_service/data/:
  - dataset.csv
  - symptom_Description.csv
  - symptom_precaution.csv
  - Symptom-severity.csv

Run once:
    cd ml_service
    python train_model.py
"""

import os, json, pickle
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

BASE      = os.path.dirname(os.path.abspath(__file__))
DATA_DIR  = os.path.join(BASE, 'data')
MODEL_DIR = os.path.join(BASE, 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

# ── Load all 4 CSVs ──────────────────────────────────────
print("\n📂 Loading CSV files...")
df_main = pd.read_csv(os.path.join(DATA_DIR, 'dataset.csv'))
df_desc = pd.read_csv(os.path.join(DATA_DIR, 'symptom_Description.csv'))
df_prec = pd.read_csv(os.path.join(DATA_DIR, 'symptom_precaution.csv'))
df_sev  = pd.read_csv(os.path.join(DATA_DIR, 'Symptom-severity.csv'))

print(f"  dataset.csv          : {df_main.shape}")
print(f"  symptom_Description  : {df_desc.shape}")
print(f"  symptom_precaution   : {df_prec.shape}")
print(f"  Symptom-severity     : {df_sev.shape}")

def clean(df):
    return df.applymap(lambda x: x.strip() if isinstance(x, str) else x)

df_main = clean(df_main)
df_desc = clean(df_desc)
df_prec = clean(df_prec)
df_sev  = clean(df_sev)

# ── Build symptom list ───────────────────────────────────
symptom_cols = [c for c in df_main.columns if c.lower().startswith('symptom')]
all_symptoms = set()
for col in symptom_cols:
    all_symptoms.update(df_main[col].dropna().unique())
all_symptoms = sorted([s for s in all_symptoms if s.strip()])
print(f"\n  Unique symptoms : {len(all_symptoms)}")
print(f"  Unique diseases : {df_main['Disease'].nunique()}")

# ── Binary feature matrix ────────────────────────────────
print("\n  Building feature matrix...")
def row_to_vector(row):
    present = set()
    for col in symptom_cols:
        val = row[col]
        if pd.notna(val) and str(val).strip():
            present.add(str(val).strip())
    return [1 if s in present else 0 for s in all_symptoms]

X    = np.array([row_to_vector(row) for _, row in df_main.iterrows()])
y    = df_main['Disease'].values
le   = LabelEncoder()
y_enc = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=42, stratify=y_enc)

# ── Train ────────────────────────────────────────────────
print("  Training Random Forest...")
model = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)
acc = accuracy_score(y_test, model.predict(X_test))
print(f"  Accuracy : {acc*100:.2f}%")

# ── Description lookup ───────────────────────────────────
desc_lookup = {}
d_col = df_desc.columns[0]
v_col = df_desc.columns[1]
for _, row in df_desc.iterrows():
    if pd.notna(row[d_col]) and pd.notna(row[v_col]):
        desc_lookup[str(row[d_col]).strip()] = str(row[v_col]).strip()
print(f"  Descriptions : {len(desc_lookup)}")

# ── Precaution lookup ────────────────────────────────────
prec_lookup = {}
prec_cols    = [c for c in df_prec.columns if c.lower().startswith('precaution')]
dis_col      = df_prec.columns[0]
for _, row in df_prec.iterrows():
    disease = str(row[dis_col]).strip()
    precs   = [str(row[c]).strip() for c in prec_cols
               if pd.notna(row[c]) and str(row[c]).strip() not in ('', 'nan')]
    if precs:
        prec_lookup[disease] = precs
print(f"  Precautions  : {len(prec_lookup)}")

# ── Severity lookup ──────────────────────────────────────
sev_lookup = {}
s_col = df_sev.columns[0]
w_col = df_sev.columns[1]
for _, row in df_sev.iterrows():
    sym = str(row[s_col]).strip()
    try:
        sev_lookup[sym] = int(row[w_col])
    except Exception:
        sev_lookup[sym] = 3
print(f"  Severities   : {len(sev_lookup)}")

# ── Save ─────────────────────────────────────────────────
print("\n💾 Saving artifacts...")
with open(os.path.join(MODEL_DIR, 'disease_model.pkl'),  'wb') as f: pickle.dump(model, f)
with open(os.path.join(MODEL_DIR, 'label_encoder.pkl'),  'wb') as f: pickle.dump(le, f)
with open(os.path.join(MODEL_DIR, 'symptoms_list.json'), 'w')  as f: json.dump(all_symptoms,      f, indent=2)
with open(os.path.join(MODEL_DIR, 'diseases_list.json'), 'w')  as f: json.dump(list(le.classes_), f, indent=2)
with open(os.path.join(MODEL_DIR, 'descriptions.json'),  'w')  as f: json.dump(desc_lookup,       f, indent=2)
with open(os.path.join(MODEL_DIR, 'precautions.json'),   'w')  as f: json.dump(prec_lookup,       f, indent=2)
with open(os.path.join(MODEL_DIR, 'severity.json'),      'w')  as f: json.dump(sev_lookup,        f, indent=2)

print("  disease_model.pkl  disease_model.pkl label_encoder.pkl")
print("  symptoms_list.json   diseases_list.json")
print("  descriptions.json    precautions.json    severity.json")
print(f"\nDone. Accuracy = {acc*100:.2f}%")
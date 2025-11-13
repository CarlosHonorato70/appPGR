import json
import os
from datetime import datetime
from uuid import uuid4

# Mapeamento das questões para as 14 dimensões do COPSOQ-II (versão curta)
# Assumindo que as questões q1-q56 seguem a ordem definida no formulário
DIMENSION_MAP = {
    "Demandas Quantitativas": ["q1", "q2", "q3", "q4"],
    "Demandas Emotivas": ["q5", "q6", "q7", "q8"],
    "Demandas Cognitivas": ["q9", "q10", "q11", "q12"],
    "Influência": ["q13", "q14", "q15", "q16"],
    "Desenvolvimento": ["q17", "q18", "q19", "q20"],
    "Variedade": ["q21", "q22", "q23", "q24"],
    "Significado": ["q25", "q26", "q27", "q28"],
    "Compromisso": ["q29", "q30", "q31", "q32"],
    "Suporte do Gestor": ["q33", "q34", "q35", "q36"],
    "Suporte dos Colegas": ["q37", "q38", "q39", "q40"],
    "Justiça Organizacional": ["q41", "q42", "q43", "q44"],
    "Qualidade da Liderança": ["q45", "q46", "q47", "q48"],
    "Segurança do Emprego": ["q49", "q50", "q51", "q52"],
    "Bem-estar (Burnout)": ["q53", "q54", "q55", "q56"],
}

class COPSOQResponsesManager:
    def __init__(self, db_file='copsoq_responses_db.json'):
        self.db_file = db_file
        self.ensure_db_exists()
    
    def ensure_db_exists(self):
        if not os.path.exists(self.db_file):
            self.save_responses([])
    
    def load_responses(self):
        try:
            with open(self.db_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('responses', [])
        except:
            return []
    
    def save_responses(self, responses):
        with open(self.db_file, 'w', encoding='utf-8') as f:
            json.dump({'responses': responses}, f, indent=2, ensure_ascii=False)
    
    def calculate_dimension_scores(self, responses_data):
        scores = {}
        for dim_name, q_keys in DIMENSION_MAP.items():
            dim_values = [responses_data.get(q, 0) for q in q_keys if q in responses_data]
            if dim_values:
                scores[dim_name] = sum(dim_values) / len(dim_values)
            else:
                scores[dim_name] = 0 # Ou None, dependendo da sua preferência
        return scores

    def add_response(self, assessment_id: str, employee_name: str, employee_email: str, department: str, responses: dict, token: str):
        all_responses = self.load_responses()
        
        # Calcular scores por dimensão
        dimension_scores = self.calculate_dimension_scores(responses)
        
        # Calcular score geral (média de todas as dimensões)
        overall_score = sum(dimension_scores.values()) / len(dimension_scores) if dimension_scores else 0

        response_entry = {
            "id": str(uuid4()),
            "assessment_id": assessment_id,
            "employee_name": employee_name,
            "employee_email": employee_email,
            "department": department,
            "token": token,
            "responses": responses, # Respostas individuais (q1, q2, etc.)
            "dimension_scores": dimension_scores, # Scores médios por dimensão
            "overall_score": overall_score, # Score médio geral
            "created_at": datetime.now().isoformat()
        }
        all_responses.append(response_entry)
        self.save_responses(all_responses)
        return response_entry
    
    def get_all_responses(self):
        return self.load_responses()

    def get_responses_by_assessment(self, assessment_id: str):
        return [r for r in self.load_responses() if r['assessment_id'] == assessment_id]

# Instância global
copsoq_responses_manager = COPSOQResponsesManager()

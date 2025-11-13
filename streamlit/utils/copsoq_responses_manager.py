import json
import os
from datetime import datetime
from uuid import uuid4
import hashlib

class COPSOQResponsesManager:
    def __init__(self, db_file='copsoq_responses_db.json'):
        self.db_file = db_file
        self.ensure_db_exists()
    
    def ensure_db_exists(self):
        """Garante que o arquivo de banco existe"""
        if not os.path.exists(self.db_file):
            self.save_responses([])
    
    def load_responses(self):
        """Carrega todas as respostas"""
        try:
            with open(self.db_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('responses', [])
        except:
            return []
    
    def save_responses(self, responses):
        """Salva respostas no banco"""
        with open(self.db_file, 'w', encoding='utf-8') as f:
            json.dump({'responses': responses}, f, indent=2, ensure_ascii=False)
    
    def generate_response_link(self, assessment_id, employee_email=None):
        """Gera um link único para o colaborador responder"""
        # Criar token único
        token = str(uuid4())
        
        link_data = {
            "token": token,
            "assessment_id": assessment_id,
            "employee_email": employee_email,
            "created_at": datetime.now().isoformat(),
            "accessed": False,
            "completed": False,
            "responses": None
        }
        
        return token, link_data
    
    def add_response(self, assessment_id, employee_name, employee_email, 
                    department, responses, token=None):
        """Adiciona uma nova resposta ao COPSOQ"""
        all_responses = self.load_responses()
        
        # Calcular scores por dimensão
        scores = self.calculate_dimension_scores(responses)
        
        new_response = {
            "id": str(uuid4()),
            "assessment_id": assessment_id,
            "token": token,
            "employee_name": employee_name,
            "employee_email": employee_email,
            "department": department,
            "responses": responses,
            "dimension_scores": scores,
            "overall_score": sum(scores.values()) / len(scores),
            "created_at": datetime.now().isoformat(),
            "ip_address": None  # Pode ser capturado se necessário
        }
        
        all_responses.append(new_response)
        self.save_responses(all_responses)
        return new_response
    
    def calculate_dimension_scores(self, responses):
        """Calcula os scores para cada dimensão"""
        scores = {}
        
        # Estrutura das dimensões (simplificada)
        dimensions = {
            "Demandas Quantitativas": ["q1", "q2", "q3", "q4"],
            "Demandas Emotivas": ["q5", "q6", "q7", "q8"],
            "Demandas Cognitivas": ["q9", "q10", "q11", "q12"],
            "Influência": ["q13", "q14", "q15", "q16"],
            "Desenvolvimento": ["q17", "q18", "q19", "q20"],
            "Variedade": ["q21", "q22", "q23", "q24"],
            "Significado": ["q25", "q26", "q27", "q28"],
            "Compromisso": ["q29", "q30", "q31", "q32"],
            "Suporte Gestor": ["q33", "q34", "q35", "q36"],
            "Suporte Colegas": ["q37", "q38", "q39", "q40"],
            "Justiça": ["q41", "q42", "q43", "q44"],
            "Liderança": ["q45", "q46", "q47", "q48"],
            "Segurança": ["q49", "q50", "q51", "q52"],
            "Bem-estar": ["q53", "q54", "q55", "q56"],
        }
        
        for dimension, questions in dimensions.items():
            values = [responses.get(q, 0) for q in questions if q in responses]
            if values:
                scores[dimension] = round(sum(values) / len(values), 2)
        
        return scores
    
    def get_responses_by_assessment(self, assessment_id):
        """Retorna todas as respostas de uma avaliação"""
        all_responses = self.load_responses()
        return [r for r in all_responses if r['assessment_id'] == assessment_id]
    
    def get_response_by_token(self, token):
        """Busca uma resposta pelo token"""
        all_responses = self.load_responses()
        for r in all_responses:
            if r['token'] == token:
                return r
        return None
    
    def calculate_assessment_report(self, assessment_id):
        """Calcula relatório agregado para uma avaliação"""
        responses = self.get_responses_by_assessment(assessment_id)
        
        if not responses:
            return None
        
        # Agregação
        total_respondents = len(responses)
        
        # Scores médios por dimensão
        dimension_averages = {}
        all_dimensions = set()
        
        for response in responses:
            for dim, score in response['dimension_scores'].items():
                all_dimensions.add(dim)
                if dim not in dimension_averages:
                    dimension_averages[dim] = []
                dimension_averages[dim].append(score)
        
        # Calcular médias
        final_scores = {dim: round(sum(vals)/len(vals), 2) 
                       for dim, vals in dimension_averages.items()}
        
        # Identificar dimensões críticas (score > 3)
        critical_dimensions = {dim: score for dim, score in final_scores.items() 
                              if score > 3}
        
        report = {
            "assessment_id": assessment_id,
            "total_respondents": total_respondents,
            "response_rate": None,  # Calculado separadamente
            "dimension_scores": final_scores,
            "overall_average": round(sum(final_scores.values()) / len(final_scores), 2),
            "critical_dimensions": critical_dimensions,
            "generated_at": datetime.now().isoformat()
        }
        
        return report
    
    def get_all_responses(self):
        """Retorna todas as respostas"""
        return self.load_responses()

# Instância global
copsoq_responses_manager = COPSOQResponsesManager()

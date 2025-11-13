import json
import os
from datetime import datetime
from uuid import uuid4

class RiskAssessmentsManager:
    def __init__(self, db_file='risk_assessments_db.json'):
        self.db_file = db_file
        self.ensure_db_exists()
    
    def ensure_db_exists(self):
        """Garante que o arquivo de banco existe"""
        if not os.path.exists(self.db_file):
            self.save_assessments([])
    
    def load_assessments(self):
        """Carrega todas as avaliações"""
        try:
            with open(self.db_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('assessments', [])
        except:
            return []
    
    def save_assessments(self, assessments):
        """Salva avaliações no banco"""
        with open(self.db_file, 'w', encoding='utf-8') as f:
            json.dump({'assessments': assessments}, f, indent=2, ensure_ascii=False)
    
    def get_all_assessments(self):
        """Retorna todas as avaliações"""
        return self.load_assessments()
    
    def get_assessment_by_id(self, assessment_id):
        """Busca uma avaliação por ID"""
        assessments = self.load_assessments()
        for assessment in assessments:
            if assessment['id'] == assessment_id:
                return assessment
        return None
    
    def calculate_risk_score(self, factors):
        """
        Calcula o score de risco baseado nos fatores
        Retorna: score (0-100) e nível (baixo, médio, alto, muito_alto)
        """
        # Média dos fatores (cada um vai de 0-10, convertemos para 0-100)
        avg_score = (sum(factors.values()) / len(factors)) * 10
        
        if avg_score <= 25:
            level = "Baixo"
        elif avg_score <= 50:
            level = "Médio"
        elif avg_score <= 75:
            level = "Alto"
        else:
            level = "Muito Alto"
        
        return round(avg_score, 2), level
    
    def add_assessment(self, client_name, sector, employees_count, factors, 
                      recommendations, preventive_actions):
        """Adiciona uma nova avaliação"""
        assessments = self.load_assessments()
        
        # Calcular score e nível de risco
        score, risk_level = self.calculate_risk_score(factors)
        
        new_assessment = {
            "id": str(uuid4()),
            "client_name": client_name,
            "sector": sector,
            "employees_count": employees_count,
            "factors": factors,
            "risk_score": score,
            "risk_level": risk_level,
            "recommendations": recommendations,
            "preventive_actions": preventive_actions,
            "status": "completed",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        assessments.append(new_assessment)
        self.save_assessments(assessments)
        return new_assessment
    
    def update_assessment(self, assessment_id, **kwargs):
        """Atualiza uma avaliação"""
        assessments = self.load_assessments()
        
        for i, assessment in enumerate(assessments):
            if assessment['id'] == assessment_id:
                allowed_fields = ['client_name', 'sector', 'employees_count', 
                                'factors', 'recommendations', 'preventive_actions', 'status']
                
                for field in allowed_fields:
                    if field in kwargs:
                        assessment[field] = kwargs[field]
                
                # Recalcular score se os fatores foram alterados
                if 'factors' in kwargs:
                    score, risk_level = self.calculate_risk_score(kwargs['factors'])
                    assessment['risk_score'] = score
                    assessment['risk_level'] = risk_level
                
                assessment['updated_at'] = datetime.now().isoformat()
                assessments[i] = assessment
                self.save_assessments(assessments)
                return assessment
        
        return None
    
    def delete_assessment(self, assessment_id):
        """Deleta uma avaliação"""
        assessments = self.load_assessments()
        assessments = [a for a in assessments if a['id'] != assessment_id]
        self.save_assessments(assessments)
        return True
    
    def get_assessments_by_client(self, client_name):
        """Retorna avaliações de um cliente"""
        assessments = self.load_assessments()
        return [a for a in assessments if a['client_name'].lower() == client_name.lower()]
    
    def get_assessments_by_risk_level(self, risk_level):
        """Retorna avaliações por nível de risco"""
        assessments = self.load_assessments()
        return [a for a in assessments if a['risk_level'] == risk_level]
    
    def get_assessments_by_sector(self, sector):
        """Retorna avaliações por setor"""
        assessments = self.load_assessments()
        return [a for a in assessments if a['sector'].lower() == sector.lower()]

# Instância global
risk_assessments_manager = RiskAssessmentsManager()

import json
import os
from datetime import datetime
from uuid import uuid4

class ProposalsManager:
    def __init__(self, db_file='proposals_db.json'):
        self.db_file = db_file
        self.ensure_db_exists()
    
    def ensure_db_exists(self):
        """Garante que o arquivo de banco existe"""
        if not os.path.exists(self.db_file):
            self.save_proposals([])
    
    def load_proposals(self):
        """Carrega todas as propostas do banco"""
        try:
            with open(self.db_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('proposals', [])
        except:
            return []
    
    def save_proposals(self, proposals):
        """Salva propostas no banco"""
        with open(self.db_file, 'w', encoding='utf-8') as f:
            json.dump({'proposals': proposals}, f, indent=2, ensure_ascii=False)
    
    def get_all_proposals(self):
        """Retorna todas as propostas"""
        return self.load_proposals()
    
    def get_proposal_by_id(self, proposal_id):
        """Busca uma proposta por ID"""
        proposals = self.load_proposals()
        for proposal in proposals:
            if proposal['id'] == proposal_id:
                return proposal
        return None
    
    def add_proposal(self, client_name, client_email, title, items, 
                     general_discount=0, displacement_fee=0, 
                     proposal_date=None, tax_regime="Simples Nacional"):
        """Adiciona uma nova proposta"""
        proposals = self.load_proposals()
        
        # Calcular total
        total = sum(item['total'] for item in items)
        final_total = total - general_discount + displacement_fee
        
        new_proposal = {
            "id": str(uuid4()),
            "client_name": client_name,
            "client_email": client_email,
            "title": title,
            "items": items,
            "total_value": total,
            "general_discount": general_discount,
            "displacement_fee": displacement_fee,
            "final_total": final_total,
            "tax_regime": tax_regime,
            "status": "draft",
            "proposal_date": proposal_date or datetime.now().strftime("%Y-%m-%d"),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        proposals.append(new_proposal)
        self.save_proposals(proposals)
        return new_proposal
    
    def update_proposal_status(self, proposal_id, status):
        """Atualiza o status de uma proposta"""
        proposals = self.load_proposals()
        
        for i, proposal in enumerate(proposals):
            if proposal['id'] == proposal_id:
                proposal['status'] = status
                proposal['updated_at'] = datetime.now().isoformat()
                proposals[i] = proposal
                self.save_proposals(proposals)
                return proposal
        
        return None
    
    def delete_proposal(self, proposal_id):
        """Deleta uma proposta"""
        proposals = self.load_proposals()
        proposals = [p for p in proposals if p['id'] != proposal_id]
        self.save_proposals(proposals)
        return True
    
    def get_proposals_by_status(self, status):
        """Retorna propostas com um status específico"""
        proposals = self.load_proposals()
        return [p for p in proposals if p['status'] == status]
    
    def get_proposals_by_client(self, client_name):
        """Retorna propostas de um cliente específico"""
        proposals = self.load_proposals()
        return [p for p in proposals if p['client_name'].lower() == client_name.lower()]

# Instância global
proposals_manager = ProposalsManager()

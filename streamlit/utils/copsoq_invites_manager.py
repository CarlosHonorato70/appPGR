import json
import os
from datetime import datetime
from uuid import uuid4

class COPSOQInvitesManager:
    def __init__(self, db_file='copsoq_invites_db.json'):
        self.db_file = db_file
        self.ensure_db_exists()
    
    def ensure_db_exists(self):
        if not os.path.exists(self.db_file):
            self.save_invites([])
    
    def load_invites(self):
        try:
            with open(self.db_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('invites', [])
        except:
            return []
    
    def save_invites(self, invites):
        with open(self.db_file, 'w', encoding='utf-8') as f:
            json.dump({'invites': invites}, f, indent=2, ensure_ascii=False)
    
    def create_invite(self, assessment_id: str, employee_name: str, employee_email: str, department: str = ""):
        invites = self.load_invites()
        token = str(uuid4())
        invite = {
            "id": str(uuid4()),
            "assessment_id": assessment_id,
            "employee_name": employee_name,
            "employee_email": employee_email,
            "department": department,
            "token": token,
            "sent": False,
            "sent_at": None,
            "opened": False,
            "opened_at": None,
            "completed": False,
            "completed_at": None,
            "created_at": datetime.now().isoformat()
        }
        invites.append(invite)
        self.save_invites(invites)
        return invite
    
    def mark_sent(self, invite_id: str):
        invites = self.load_invites()
        for i, inv in enumerate(invites):
            if inv['id'] == invite_id:
                inv['sent'] = True
                inv['sent_at'] = datetime.now().isoformat()
                invites[i] = inv
                self.save_invites(invites)
                return inv
        return None
    
    def mark_opened(self, token: str):
        invites = self.load_invites()
        for i, inv in enumerate(invites):
            if inv['token'] == token and not inv.get('opened'):
                inv['opened'] = True
                inv['opened_at'] = datetime.now().isoformat()
                invites[i] = inv
                self.save_invites(invites)
                return inv
        return None
    
    def mark_completed(self, token: str):
        invites = self.load_invites()
        for i, inv in enumerate(invites):
            if inv['token'] == token and not inv.get('completed'):
                inv['completed'] = True
                inv['completed_at'] = datetime.now().isoformat()
                invites[i] = inv
                self.save_invites(invites)
                return inv
        return None
    
    def get_invites_by_assessment(self, assessment_id: str):
        invites = self.load_invites()
        return [i for i in invites if i['assessment_id'] == assessment_id]
    
    def get_invite_by_token(self, token: str):
        invites = self.load_invites()
        for inv in invites:
            if inv['token'] == token:
                return inv
        return None
    
    def get_all_invites(self):
        return self.load_invites()

# Instância global
copsoq_invites_manager = COPSOQInvitesManager()

import json
import os
from datetime import datetime
import uuid

class ServicesManager:
    def __init__(self, db_file='services_db.json'):
        self.db_file = db_file
        self.ensure_db_exists()
    
    def ensure_db_exists(self):
        """Garante que o arquivo de banco existe"""
        if not os.path.exists(self.db_file):
            self.save_services([])
    
    def load_services(self):
        """Carrega todos os serviços do banco"""
        try:
            with open(self.db_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('services', [])
        except:
            return []
    
    def save_services(self, services):
        """Salva serviços no banco"""
        with open(self.db_file, 'w', encoding='utf-8') as f:
            json.dump({'services': services}, f, indent=2, ensure_ascii=False)
    
    def get_all_services(self):
        """Retorna todos os serviços"""
        return self.load_services()
    
    def get_service_by_id(self, service_id):
        """Busca um serviço por ID"""
        services = self.load_services()
        for service in services:
            if service['id'] == service_id:
                return service
        return None
    
    def get_service_by_name(self, name):
        """Busca um serviço por nome"""
        services = self.load_services()
        for service in services:
            if service['name'].lower() == name.lower():
                return service
        return None
    
    def add_service(self, name, price, hours, category, description=""):
        """Adiciona um novo serviço"""
        services = self.load_services()
        
        # Gerar ID único
        new_id = f"srv-{len(services) + 1:03d}"
        
        new_service = {
            "id": new_id,
            "name": name,
            "price": float(price),
            "hours": float(hours),
            "category": category,
            "description": description,
            "created_at": datetime.now().isoformat()
        }
        
        services.append(new_service)
        self.save_services(services)
        return new_service
    
    def update_service(self, service_id, **kwargs):
        """Atualiza um serviço existente"""
        services = self.load_services()
        
        for i, service in enumerate(services):
            if service['id'] == service_id:
                # Atualizar apenas campos permitidos
                allowed_fields = ['name', 'price', 'hours', 'category', 'description']
                for field in allowed_fields:
                    if field in kwargs:
                        service[field] = kwargs[field]
                
                service['updated_at'] = datetime.now().isoformat()
                services[i] = service
                self.save_services(services)
                return service
        
        return None
    
    def delete_service(self, service_id):
        """Deleta um serviço"""
        services = self.load_services()
        services = [s for s in services if s['id'] != service_id]
        self.save_services(services)
        return True
    
    def get_categories(self):
        """Retorna todas as categorias únicas"""
        services = self.load_services()
        categories = set()
        for service in services:
            categories.add(service.get('category', 'Sem categoria'))
        return sorted(list(categories))
    
    def get_services_by_category(self, category):
        """Retorna serviços de uma categoria específica"""
        services = self.load_services()
        return [s for s in services if s.get('category') == category]
    
    def export_csv(self):
        """Exporta serviços em formato CSV"""
        services = self.load_services()
        csv_content = "ID,Nome,Preço,Horas,Categoria\\n"
        for service in services:
            csv_content += f"{service['id']},{service['name']},R\$ {service['price']:.2f},{service['hours']},{service['category']}\\n"
        return csv_content
    
    def import_csv(self, csv_content):
        """Importa serviços de um CSV"""
        lines = csv_content.strip().split('\\n')[1:]  # Pula header
        services = []
        
        for i, line in enumerate(lines):
            parts = line.split(',')
            if len(parts) >= 5:
                service = {
                    "id": f"srv-{i+1:03d}",
                    "name": parts[1],
                    "price": float(parts[2].replace('R\$ ', '').replace(',', '.')),
                    "hours": float(parts[3]),
                    "category": parts[4]
                }
                services.append(service)
        
        self.save_services(services)
        return len(services)

# Instância global
manager = ServicesManager()

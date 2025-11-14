# streamlit/utils/api_client.py
"""
Cliente para comunicação com o backend tRPC
"""
import requests
from typing import Dict, Any, Optional
import os

class BackendClient:
    """Cliente para chamadas ao backend via tRPC"""
    
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or os.getenv("API_URL", "http://localhost:3000/trpc")
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def call_trpc(self, procedure: str, input_data: Optional[Dict[str, Any]] = None, method: str = 'query') -> Dict[str, Any]:
        """
        Chama um procedimento tRPC
        
        Args:
            procedure: Nome do procedimento (ex: 'pricing.calculateTechnicalHour')
            input_data: Dados de entrada
            method: 'query' ou 'mutation'
        
        Returns:
            Resposta do servidor
        """
        try:
            url = f"{self.base_url}/{procedure}"
            
            if method == 'query':
                # Para queries, enviar como GET com params
                response = self.session.get(url, params={'input': input_data} if input_data else None)
            else:
                # Para mutations, enviar como POST
                response = self.session.post(url, json=input_data or {})
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            return {
                'error': True,
                'message': f'Erro na comunicação com o backend: {str(e)}'
            }
    
    def calculate_technical_hour(self, fixed_costs: float, pro_labor: float, productive_hours: float) -> Dict[str, Any]:
        """Calcula a hora técnica"""
        return self.call_trpc('pricing.calculateTechnicalHour', {
            'fixedCosts': fixed_costs,
            'proLabor': pro_labor,
            'productiveHours': productive_hours
        })
    
    def calculate_proposal_item(self, base_price: float, estimated_hours: float, 
                                tax_rate: float, adjustment_personalization: float = 0,
                                adjustment_risk: float = 0, adjustment_seniority: float = 0,
                                volume_discount: float = 0) -> Dict[str, Any]:
        """Calcula um item de proposta"""
        return self.call_trpc('pricing.calculateProposalItem', {
            'basePrice': base_price,
            'estimatedHours': estimated_hours,
            'taxRate': tax_rate,
            'adjustmentPersonalization': adjustment_personalization,
            'adjustmentRisk': adjustment_risk,
            'adjustmentSeniority': adjustment_seniority,
            'volumeDiscount': volume_discount
        })
    
    def health_check(self) -> Dict[str, Any]:
        """Verifica o status do backend"""
        try:
            response = self.session.get(self.base_url.replace('/trpc', '/health'))
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                'status': 'error',
                'message': f'Backend indisponível: {str(e)}'
            }

# streamlit/utils/state.py
"""
Gerenciador de estado para Streamlit
"""
import streamlit as st
from typing import Any, Optional

class SessionState:
    """Classe helper para gerenciar estado da sessão Streamlit"""
    
    @staticmethod
    def get(key: str, default: Any = None) -> Any:
        """
        Obtém um valor do estado da sessão
        
        Args:
            key: Chave do estado
            default: Valor padrão se não existir
        
        Returns:
            Valor armazenado ou default
        """
        if key not in st.session_state:
            st.session_state[key] = default
        return st.session_state[key]
    
    @staticmethod
    def set(key: str, value: Any) -> None:
        """
        Define um valor no estado da sessão
        
        Args:
            key: Chave do estado
            value: Valor a armazenar
        """
        st.session_state[key] = value
    
    @staticmethod
    def delete(key: str) -> None:
        """Remove uma chave do estado"""
        if key in st.session_state:
            del st.session_state[key]
    
    @staticmethod
    def clear() -> None:
        """Limpa todo o estado da sessão"""
        for key in list(st.session_state.keys()):
            del st.session_state[key]
    
    @staticmethod
    def exists(key: str) -> bool:
        """Verifica se uma chave existe no estado"""
        return key in st.session_state
    
    @staticmethod
    def get_all() -> dict:
        """Retorna todo o estado como dicionário"""
        return dict(st.session_state)


class CacheManager:
    """Gerenciador de cache para otimizar requisições"""
    
    @staticmethod
    def get_cached(cache_key: str) -> Optional[Any]:
        """Obtém valor do cache"""
        cache = SessionState.get('_cache', {})
        return cache.get(cache_key)
    
    @staticmethod
    def set_cached(cache_key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Armazena valor no cache
        
        Args:
            cache_key: Chave do cache
            value: Valor a cachear
            ttl: Time to live em segundos (não implementado ainda)
        """
        cache = SessionState.get('_cache', {})
        cache[cache_key] = value
        SessionState.set('_cache', cache)
    
    @staticmethod
    def clear_cache() -> None:
        """Limpa todo o cache"""
        SessionState.set('_cache', {})
    
    @staticmethod
    def invalidate(cache_key: str) -> None:
        """Invalida uma entrada específica do cache"""
        cache = SessionState.get('_cache', {})
        if cache_key in cache:
            del cache[cache_key]
            SessionState.set('_cache', cache)

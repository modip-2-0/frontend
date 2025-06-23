import os
import requests
import streamlit as st
import time

# Configuración de la URL del servicio backend
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://data_service:8000")

# Título de la aplicación
st.title("My Compounds")
st.write("---")

def get_user_compounds():
    """Obtener compuestos del usuario actual"""
    try:
            
        # Obtenemos los documentos completos de los compuestos
        response = requests.get(
            f"{DATA_SERVICE_URL}/compound/user/{st.session_state.username}",
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"Error fetching compounds: {response.status_code}")
            return []
            
    except Exception as e:
        st.error(f"Connection error: {str(e)}")
        return []

def delete_all_compounds():
    """Eliminar todos los compuestos del usuario"""
    try:           

        response = requests.delete(f"{DATA_SERVICE_URL}/compound/drop")
        return response.status_code == 200
    except Exception as e:
        st.error(f"Deletion error: {str(e)}")
        return False

# Inicializar o actualizar el estado de la sesión
# if 'compounds' not in st.session_state:
st.session_state.compounds = get_user_compounds()

def display_compounds(compounds):
    """Mostrar compuestos con formato adecuado"""
    if not compounds:
        st.info("No compounds found")
        return
        
    for compound in compounds:
        with st.container():
            st.write(f"**Compound ID:** {compound.get('cid', 'N/A')}")
            st.write(f"**Name:** {compound.get('name', 'N/A')}")
            
            st.write("---")

# Mostrar compuestos
display_compounds(st.session_state.compounds)

# Botón para eliminar con confirmación
if st.button("🗑️ Delete All Compounds"):

    if delete_all_compounds():
        st.success("All compounds deleted successfully!") 
        st.session_state.compounds = []
        time.sleep(1)
        st.rerun()
    else:
        st.error("Failed to delete compounds")

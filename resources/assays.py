import os
import requests
import streamlit as st
import time

# Configuración de la URL del servicio backend
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://data_service:8000")

# Título de la aplicación
st.title("My BioAssays")
st.write("---")

def get_user_assays():
    """Obtener ensayos del usuario actual"""
    try:
        response = requests.get(f"{DATA_SERVICE_URL}/bioassay/user/{st.session_state.username}")
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"Error fetching assays: {response.status_code}")
            return []
    except Exception as e:
        st.error(f"Connection error: {str(e)}")
        return []

def delete_all_assays():
    """Eliminar todos los ensayos del usuario"""
    try:
        response = requests.delete(f"{DATA_SERVICE_URL}/bioassay/drop")
        return response.status_code == 200
    except Exception as e:
        st.error(f"Deletion error: {str(e)}")
        return False

# # Inicializar o actualizar el estado de la sesión
# if 'assays' not in st.session_state:
st.session_state.assays = get_user_assays()

def display_assays(assays):
    """Mostrar ensayos con formato adecuado"""
    if not assays:
        st.info("No assays found")
        return
        
    for assay in assays:
        with st.container():
            st.caption(f"Assay ID: {assay.get('aid', 'N/A')}")
            st.write(f"**Name:** {assay.get('name', 'N/A')}")
            
            # Formatear descripción (lista de strings)
            description = assay.get('description', [])
            if description:
                st.write("**Description:**")
                for desc_line in description:
                    st.write(f"- {desc_line}")
            else:
                st.write("**Description:** No description available")
            
            # Formatear compuestos
            compounds = assay.get('compounds', [])
            compounds_str = ', '.join(map(str, compounds)) if compounds else 'None'
            st.write(f"**Compounds:** {compounds_str}")
            
            st.write("---")

# Mostrar ensayos
display_assays(st.session_state.assays)

# Botón para eliminar con confirmación
if st.button("🗑️ Delete All Assays"):
    if delete_all_assays():
        st.success("All assays deleted successfully!") 
        st.session_state.assays = []
        time.sleep(1)
        st.rerun()
    else:
        st.error("Failed to delete assays")

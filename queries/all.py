import os
import requests
import streamlit as st
import time

# Configuración de la URL del servicio backend
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://data_service:8000")

# Título de la aplicación
st.title("All Queries")
st.write("---")

def get_queries():
    """Retrieve user queries from backend"""
    try:
        response = requests.get(f"{DATA_SERVICE_URL}/queries/user/{st.session_state.username}")
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"Error fetching queries: {response.status_code}")
            return []
    except Exception as e:
        st.error(f"Connection error: {str(e)}")
        return []

def delete_queries():
    """Delete all user queries"""
    try:
        response = requests.delete(f"{DATA_SERVICE_URL}/queries/user/{st.session_state.username}")
        return response.status_code == 200
    except Exception as e:
        st.error(f"Deletion error: {str(e)}")
        return False

# Initialize or update session state
#if 'queries' not in st.session_state:
st.session_state.queries = get_queries()

def display_queries(queries):
    """Display queries with proper English labels"""
    if not queries:
        st.info("No queries found")
        return
        
    for doc in queries:
        with st.container():
            # Display document fields with English labels
            st.caption(f"ID: {doc.get('_id', '')}")
            st.write(f"**Content:** {doc.get('content', 'N/A')}")
            
            # Format assays list
            assays = doc.get('assays', [])
            assays_str = ', '.join(map(str, assays)) if assays else 'None'
            st.write(f"**Assays:** {assays_str}")
            st.write("---")

# Main content display
display_queries(st.session_state.queries)

# Delete button with confirmation
if st.button("🗑️ Delete All Queries"):
    
    if delete_queries():
        st.success("All queries deleted successfully!") 
        st.session_state.queries = []
        time.sleep(1)
        st.rerun()



# import os
# import requests
# import streamlit as st
# import time

# # Configuración de la URL del servicio backend
# DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://data_service:8000")

# # Título de la aplicación
# st.title("All Queries")
# st.write("---")

# def obtener_documentos():
#     try:
#         response = requests.get(f"{DATA_SERVICE_URL}/queries/user/{st.session_state.username}")
#         if response.status_code == 200:
#             return response.json()
#         else:
#             st.error(f"Error al obtener documentos: {response.status_code}")
#             return []
#     except Exception as e:
#         st.error(f"Error de conexión: {str(e)}")
#         return []

# def eliminar_documentos():
#     try:
#         response = requests.delete(f"{DATA_SERVICE_URL}/queries/user/{st.session_state.username}")
#         return response.status_code == 200
#     except Exception as e:
#         st.error(f"Error al eliminar: {str(e)}")
#         return False


# st.session_state.documentos = obtener_documentos()


# # Contenedor principal
# main_container = st.container()

# # Función para mostrar documentos
# def mostrar_documentos(documentos):
#     for i, doc in enumerate(documentos):

#         with st.container():
#             # Mostrar campos del documento (ajusta según tu estructura)              
#             st.caption(f"ID: {doc.get('_id', '')}")
#             st.write(f"**Usuario:** {doc.get('user', 'N/A')}")
#             st.write("---")

# mostrar_documentos(st.session_state.documentos)

# # Botón para recargar documentos
# if st.button("🗑️ Delete All"):
#     if eliminar_documentos():
#         st.success("Deleted!") 
#         st.session_state.documentos = []   
#         time.sleep(1)
#         st.rerun()
#     else:
#         st.error("Error al eliminar documento")


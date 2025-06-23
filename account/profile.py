import os
import requests
import streamlit as st

# API Configuration
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://data_service:8000")


# Endpoint del backend
endpoint = f"{DATA_SERVICE_URL}/user/{st.session_state.username}"

# Configuración de la página
st.set_page_config(page_title="Perfil de Usuario", layout="centered")

# Estilos CSS personalizados
st.markdown("""
    <style>
        .profile-container {
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
        }
        .profile-title {
            color: #1E90FF;
            text-align: center;
            margin-bottom: 2rem;
        }
        .logout-button {
            display: flex;
            justify-content: flex-end;
            margin-top: 1rem;
        }
    </style>
""", unsafe_allow_html=True)

# Contenedor principal
with st.container():
    st.markdown('<div class="profile-container">', unsafe_allow_html=True)
    
    try:
        # Obtener datos del usuario
        response = requests.get(endpoint)
        
        if response.status_code == 200:
            try:
                user_data = response.json()
                
                # Título de la página
                st.markdown('<h1 class="profile-title">My Profile</h1>', unsafe_allow_html=True)
                
                # Mostrar información del usuario
                col1, col2 = st.columns([1, 2])
                
                with col1:
                    st.markdown("Name:")
                    st.markdown("Username:")
                    st.markdown("Email:")
                
                with col2:
                    st.markdown(f"**{user_data.get('name','N/A')}**")
                    st.markdown(f"**{user_data.get('username','N/A')}**")
                    st.markdown(f"**{user_data.get('email','N/A')}**")
                
                # # Botón de cierre de sesión
                # st.markdown('<div class="logout-button">', unsafe_allow_html=True)
                # if st.button("Cerrar Sesión"):
                #     del st.session_state['username']
                #     st.rerun()
                st.markdown('</div>', unsafe_allow_html=True)
                
            except Exception as e:
                st.error(f"Error al procesar los datos: {str(e)}")
                st.stop()
        else:
            st.error(f"Error al obtener datos del usuario (Código {response.status_code})")
            st.stop()
            
    except requests.exceptions.RequestException as e:
        st.error(f"No se pudo conectar con el servicio: {str(e)}")
        st.stop()
    
    st.markdown('</div>', unsafe_allow_html=True)
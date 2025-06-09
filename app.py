import streamlit as st
import os

# Configuración de la API
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://data_service:8000")
AUTHENTICATE_ENDPOINT = "/authenticate"
LOGIN_ENDPOINT = "/login"

# Inicializar estado de sesión
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False
if "token" not in st.session_state:
    st.session_state.token = None
if "username" not in st.session_state:
    st.session_state.username = None


# Definición de páginas
login_page = st.Page("account/login.py", title="Log in", icon=":material/login:")
logout_page = st.Page("account/logout.py", title="Log out", icon=":material/logout:")
profile = st.Page("account/profile.py", title="Profile", icon=":material/person:")

all_queries = st.Page("queries/all.py", title="All", icon=":material/history:")
new_query = st.Page("queries/new.py", title="New", icon=":material/manage_search:", default=True)

assays = st.Page("resources/assays.py", title="Assays", icon=":material/biotech:")
compounds = st.Page("resources/compounds.py", title="Compounds", icon=":material/grain:")



# Navegación basada en el estado de inicio de sesión
if st.session_state.logged_in:
    pg = st.navigation(
        {
            "Account": [profile, logout_page],
            "Resources": [assays, compounds],
            "Queries": [all_queries, new_query],
        }
    )
else:
    pg = st.navigation([login_page])

pg.run()







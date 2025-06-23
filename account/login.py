import os
import requests
import streamlit as st

# API Configuration
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://data_service:8000")
REGISTER_ENDPOINT = "/register"
LOGIN_ENDPOINT = "/login"

# Page setup
st.set_page_config(page_title="MODIP", layout="centered")

# Main header and description
st.title("MODIP: Molecular Docking Integrated Platform")
st.markdown("""
*Accelerate your drug discovery research with our integrated computational tools.*
""")
st.divider()

# Función para crear formularios centrados con ancho reducido
def centered_form(form_content, form_key):
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        with st.form(form_key):
            form_content()
            return st.form_submit_button()

# Login/Register Section
st.subheader("Access the Platform")
login_tab, register_tab = st.tabs(["Login", "Create Account"])

with login_tab:
    def login_form():
        st.text_input("Username", key="login_username")
        st.text_input("Password", type="password", key="login_password")
    
    submit_login = centered_form(login_form, "login_form")
    
    if submit_login:
        username = st.session_state.login_username
        password = st.session_state.login_password
        
        if not username or not password:
            st.error("Please enter both username and password.")
        else:
            try:
                response = requests.post(
                    f"{DATA_SERVICE_URL}{LOGIN_ENDPOINT}",
                    json=[username, password]
                )
                if response.status_code == 200:
                    token_data = response.json()
                    st.session_state.token = token_data["access_token"]
                    st.session_state.username = username
                    st.session_state.logged_in = True
                    st.success("Login successful!")
                    st.rerun()
                else:
                    error_msg = response.json().get("message", "Unknown error")
                    st.error(f"Login failed: {error_msg}")
            except Exception as e:
                st.error(f"Connection error: {str(e)}")

with register_tab:
    def register_form():
        st.text_input("Full Name", key="reg_name")
        st.text_input("Username", key="reg_username")
        st.text_input("Email", key="reg_email")
        st.text_input("Password", type="password", key="reg_password")
        st.text_input("Confirm Password", type="password", key="reg_confirm_password")
    
    submit_register = centered_form(register_form, "register_form")
    
    if submit_register:
        name = st.session_state.reg_name
        username = st.session_state.reg_username
        email = st.session_state.reg_email
        password = st.session_state.reg_password
        confirm_password = st.session_state.reg_confirm_password
        
        if not all([name, username, email, password, confirm_password]):
            st.error("All fields are required.")
        elif password != confirm_password:
            st.error("Passwords do not match.")
        else:
            try:
                user_data = {
                    "name": name,
                    "username": username,
                    "email": email,
                    "password": password
                }
                
                response = requests.post(
                    f"{DATA_SERVICE_URL}{REGISTER_ENDPOINT}",
                    json=user_data
                )
                
                if response.status_code == 200:
                    token_data = response.json()
                    st.session_state.token = token_data["access_token"]
                    st.session_state.username = username
                    st.session_state.logged_in = True
                    st.success("Registration successful! You are now logged in.")
                    st.rerun()
                else:
                    error_msg = response.json().get("message", "Unknown error")
                    st.error(f"Registration failed: {error_msg}")
            except Exception as e:
                st.error(f"Connection error: {str(e)}")
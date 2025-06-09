import os
import requests
import streamlit as st


if st.button("Cerrar sesión", key="logout_btn"):
    st.session_state.logged_in = False
    st.session_state.token = None
    st.session_state.username = None
    st.success("Sesión cerrada exitosamente")
    st.rerun()

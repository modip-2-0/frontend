import streamlit as st



st.session_state.logged_in = False
st.session_state.token = None
st.session_state.username = None
st.rerun()

import os
import requests
import streamlit as st
from datetime import datetime

# Configuración de la URL del servicio backend
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://data_service:8000")

# Título de la aplicación
st.title("🔍 New Query")


# Important note section
with st.container():
    st.warning("""
    **Important Recommendation:** Before submitting your query, we strongly recommend testing it on the NCBI BioAssay website to verify the results. 
    This will help ensure you're retrieving the compounds and assays you need. Visit: [https://www.ncbi.nlm.nih.gov/pcassay/](https://www.ncbi.nlm.nih.gov/pcassay/)
    """)

# Query input section

with st.form("query_form", clear_on_submit=True):
    query = st.text_area("Query:", 
                         value="cathepsin B AND active AND inhibitor NOT Experimentally measured binding affinity data NOT cathepsin E NOT cathepsin D NOT HCV NOT cathepsin K NOT cathepsin H NOT calpain NOT papain NOT MCF10A NOT trypsin NOT cathepsin G NOT plasmin NOT thrombin NOT urease NOT MT3 NOT APPSwInd NOT water-immersion NOT aid=368053 NOT aid=410195 NOT aid=723768 NOT aid=723765 NOT aid=723764 NOT aid=723762 NOT aid=723760 NOT aid=723759 NOT aid=723751 NOT aid=723754 NOT aid=723752 NOT aid=723748 NOT aid=723769 NOT aid=723749 NOT aid=723742 NOT aid=723758 NOT aid=723756 NOT aid=723757 NOT aid=240746 NOT aid=673910 NOT aid=316530 NOT aid=750035 NOT aid=750030 NOT aid=340380 NOT aid=1063737 NOT aid=1063738 NOT aid=240614 NOT aid=233894  ",
                         height=100,
                         help="Use PubChem's advanced query syntax for precise results")
    
    submit_button = st.form_submit_button("Execute Query")

# Section for showing results
result_container = st.empty()

# Function to send query to backend
def execute_query(query_text):
    try:
        # Register start time
        start_time = datetime.now()
        
        # Send query to FastAPI service
        response = requests.post(
            f"{DATA_SERVICE_URL}/download/{query_text}"
        )
        
        # Calculate response time
        elapsed_time = (datetime.now() - start_time).total_seconds()
        
        if response.status_code == 200:
            return {
                "success": True,
                "data": response.json(),
                "response_time": elapsed_time
            }
        else:
            return {
                "success": False,
                "error": f"Error {response.status_code}: {response.text}",
                "response_time": elapsed_time
            }
    
    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "error": "Could not connect to backend service",
            "response_time": elapsed_time
        }

# Process when form is submitted
if submit_button and query:
    with st.spinner("Processing query..."):
        result = execute_query(query)
        
        # Clear previous results
        result_container.empty()
        
        if result["success"]:
            with result_container.container():
                st.success(f"✅ Query completed in {result['response_time']:.2f} seconds")
                
                # Show summary instead of full table
                if result["data"]:
                    st.write(f"📋 **Query results:** {len(result['data'])} assays were found.")                    
                else:
                    st.info("ℹ️ No results found for your query")
                    
                # Notification information
                st.markdown("---")
                st.info("""
                **Processing Note:** 
                - Your compounds and assays are now being downloaded and prepared for docking
                - This process may take several minutes to complete depending on the size of your query
                - You will receive an email notification at your registered address when all downloads are complete
                - You can check the status of your queries in the 'All Queries' section
                """)
        else:
            st.error(f"❌ {result['error']}")
            st.markdown("**Troubleshooting:**")
            st.markdown("1. Verify that the backend service is running")
            st.markdown("2. Check network connection between containers")
            st.markdown(f"3. Confirm service URL: `{DATA_SERVICE_URL}`")
                
elif submit_button and not query:
    st.warning("⚠️ Please enter a query before submitting")
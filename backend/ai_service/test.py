from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFDirectoryLoader, PyPDFLoader
import os

CHOSEN_LITE_LLM_EMBEDDING_MODEL = 'Amazon Titan - Bedrock Text Embedding v2 (Internal)'

litellm_proxy_endpoint = os.environ.get(
    "litellm_proxy_endpoint",
    "https://gq8rdw5man.us-east-1.awsapprunner.com")

bearer_token = 'sk-mbmkDl1ILRJB6d6PIwmHKQ'

embeddings: OpenAIEmbeddings = OpenAIEmbeddings(
    model= CHOSEN_LITE_LLM_EMBEDDING_MODEL,
    openai_api_base=litellm_proxy_endpoint,
    openai_api_key=bearer_token,
    user=bearer_token
)
save = False
if save:
    loader = PyPDFDirectoryLoader('./ai_service/Files')
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap = 10)
    split_documents = text_splitter.split_documents(documents)

    db = FAISS.from_documents(split_documents, embeddings)

    db.save_local("faiss_index")

db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)

similar_response = db.similarity_search("What are Apple's Inititatives", k=5)
page_contents_array = [doc.page_content for doc in similar_response]

print(len(page_contents_array))
print(page_contents_array)


from pathlib import Path

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


BASE_DIR = Path(__file__).resolve().parent.parent

CHROMA_DIR = BASE_DIR / "chroma_db"

COLLECTION_NAME = "placement_data"


embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


def create_vector_store(documents):

    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embedding_model,
        persist_directory=str(CHROMA_DIR),
        collection_name=COLLECTION_NAME
    )

    return vector_store


def load_vector_store():

    vector_store = Chroma(
        persist_directory=str(CHROMA_DIR),
        embedding_function=embedding_model,
        collection_name=COLLECTION_NAME
    )

    return vector_store
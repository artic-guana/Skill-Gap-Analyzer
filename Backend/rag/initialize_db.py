from pathlib import Path
import shutil

from rag.ingestion import csv_to_documents
from rag.vector_store import create_vector_store, CHROMA_DIR


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def initialize_placement_db(force_rebuild=False):

    db_file = CHROMA_DIR / "chroma.sqlite3"

    if db_file.exists() and not force_rebuild:
        print("Existing ChromaDB found.")
        print("Skipping embedding generation.")
        return

    if force_rebuild and CHROMA_DIR.exists():
        print("Deleting existing ChromaDB...")
        shutil.rmtree(CHROMA_DIR)

    branch_file = DATA_DIR / "branch_job_roles_ctc.csv"

    print("Reading placement dataset...")

    documents = csv_to_documents(
        str(branch_file)
    )

    print(f"Documents created: {len(documents)}")

    if not documents:
        print("No documents found.")
        return

    print("Creating embeddings and storing in ChromaDB...")

    create_vector_store(documents)

    print("Placement vector database created successfully.")


if __name__ == "__main__":
    initialize_placement_db()
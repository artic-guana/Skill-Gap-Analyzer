from pathlib import Path

from rag.ingestion import (csv_to_documents)

from rag.vector_store import create_vector_store


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def initialize_placement_db():
    branch_file = DATA_DIR / "branch_job_roles_ctc.csv"

    print("Reading placement datasets...")

    branch_docs = csv_to_documents(
        str(branch_file)
    )

    all_docs = branch_docs

    print(f"Documents created: {len(all_docs)}")

    if not all_docs:
        print("No documents found.")
        return None

    print("Creating embeddings and storing in ChromaDB...")

    vector_store = create_vector_store(all_docs)

    print("Placement vector database created successfully.")

    return vector_store


if __name__ == "__main__":
    initialize_placement_db()
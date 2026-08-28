from rag.vector_store import load_vector_store


vector_store = load_vector_store()


def retrieve_placement_context(
    query: str,
    branch: str | None = None,
    k: int = 5
):
    search_filter = None

    if branch:
        search_filter = {
            "branch": branch
        }

    documents = vector_store.similarity_search(
        query,
        k=k,
        filter=search_filter
    )

    return documents


def get_context_text(
    query: str,
    branch: str | None = None,
    k: int = 5
):
    documents = retrieve_placement_context(
        query=query,
        branch=branch,
        k=k
    )

    context = "\n\n".join(
        doc.page_content
        for doc in documents
    )

    return context


if __name__ == "__main__":

    query = "What job roles are popular among CSE students?"

    documents = retrieve_placement_context(
        query=query,
        branch="Computer Science Engineering",
        k=5
    )

    for i, doc in enumerate(documents, start=1):
        print(f"\nResult {i}:")
        print(doc.page_content)
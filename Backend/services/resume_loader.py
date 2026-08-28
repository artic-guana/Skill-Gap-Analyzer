import tempfile
import os

from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader


async def load_resume(file: UploadFile):
    """
    Takes a PDF uploaded through FastAPI
    and returns LangChain Documents.
    """

    if file.content_type != "application/pdf":
        raise ValueError("Only PDF files are supported.")

    content = await file.read()

    # PyPDFLoader expects a file path,
    # so temporarily save the uploaded PDF.
    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    ) as temp_file:

        temp_file.write(content)
        temp_path = temp_file.name

    try:
        loader = PyPDFLoader(temp_path)

        documents = loader.load()

        return documents

    finally:
        # Remove temporary resume after processing
        os.remove(temp_path)


async def resume_to_text(file: UploadFile):
    """
    Converts uploaded resume PDF into plain text.
    """

    documents = await load_resume(file)

    return "\n\n".join(
        document.page_content
        for document in documents
        if document.page_content
    )
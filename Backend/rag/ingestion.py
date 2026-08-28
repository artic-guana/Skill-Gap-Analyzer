import pandas as pd
from langchain_core.documents import Document


def csv_to_documents(file_path: str):
    df = pd.read_csv(file_path)

    documents = []

    for _, row in df.iterrows():

        content = " | ".join(
            f"{column}: {row[column]}"
            for column in df.columns
            if pd.notna(row[column])
        )

        document = Document(
            page_content=content,
            metadata={
                "source": file_path,
                "branch": str(row["B.Tech Branch"]),
                "job_role": str(row["Job Role Category"])
            }
        )

        documents.append(document)

    return documents
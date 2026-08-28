from langchain.chat_models import init_chat_model


model = init_chat_model(
    model="mistral-small-2603",
    model_provider="mistralai",
    temperature=0
)
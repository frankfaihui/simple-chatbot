import os

# Import from langchain
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage

# Import from langgraph
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.checkpoint.memory import MemorySaver

from app.config import OPENAI_API_KEY

class ChatbotService:
    def __init__(self):
        # 1) Create your chat model
        # Make sure OPENAI_API_KEY is in your environment, or set it here for demo:
        # os.environ["OPENAI_API_KEY"] = "sk-..."
        self.model = ChatOpenAI(
            model="gpt-4o-mini",
            openai_api_key=OPENAI_API_KEY,
        )

        # 2) Define a function (node) that calls the model with the entire conversation
        def call_model(state: MessagesState):
            # state["messages"] is the conversation so far
            response = self.model.invoke(state["messages"])
            # Return the updated conversation (including the AI reply)
            return {"messages": response}

        # 3) Build a simple graph with one node
        self.workflow = StateGraph(state_schema=MessagesState)
        self.workflow.add_edge(START, "model")
        self.workflow.add_node("model", call_model)

        # 4) Memory store to persist conversation across calls
        self.memory = MemorySaver()

        # 5) Compile the graph with a memory checkpointer
        self.app = self.workflow.compile(checkpointer=self.memory)

    async def generate_response(self, user_id: str, user_message: str) -> str:
        """
        Generate a response to `user_message`, using `user_id` as a thread key
        so the conversation is remembered across multiple calls.
        """
        # 1) Create a HumanMessage to represent the user's new message
        new_message = [HumanMessage(content=user_message)]

        # 2) Use app.invoke(...) to pass the new message + existing conversation
        # The "config" argument includes the thread_id -> "user_id"
        output = await self.app.ainvoke(
            {"messages": new_message},
            config={"configurable": {"thread_id": user_id}},
        )

        # 3) The output is the entire updated conversation. The last message is the AI’s reply.
        # output["messages"] is a list of message objects (including system/human/AI).
        # So we just return the content of the final (AI) message.
        ai_message = output["messages"][-1].content
        return ai_message

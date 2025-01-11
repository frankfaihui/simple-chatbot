from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.checkpoint.memory import MemorySaver
from app.config import OPENAI_API_KEY

class ChatbotService:
    def __init__(self):
        # Create chat model
        self.model = ChatOpenAI(
            model="gpt-4o-mini",
            openai_api_key=OPENAI_API_KEY,
        )

        # System message to guide the assistant's behavior
        system_msg = SystemMessage(content="You are a helpful assistant. Under all circumstances, keep your response under 100 words.")

        # Function to handle invoking the chat model
        def call_model(state: MessagesState):
            # Combine the system message with the user's conversation
            all_messages = [system_msg] + state["messages"]
            response = self.model.invoke(all_messages)
            return {"messages": response}

        # Build a simple graph with a single node to handle model calls
        self.workflow = StateGraph(state_schema=MessagesState)
        self.workflow.add_edge(START, "model")
        self.workflow.add_node("model", call_model)

        # Memory store to persist conversation context
        self.memory = MemorySaver()

        # Compile the graph with a memory checkpointer to maintain conversation state
        self.app = self.workflow.compile(checkpointer=self.memory)

    async def generate_response(self, user_id: str, user_message: str) -> str:
        """
        Generate a response to the user's message while maintaining conversation context
        using the provided user ID as a thread identifier.
        
        Args:
            user_id (str): A unique identifier for the user to maintain conversation state.
            user_message (str): The user's input message.

        Returns:
            str: The AI's response to the user's message.
        """
        # Wrap the user's message in a HumanMessage object
        new_message = [HumanMessage(content=user_message)]

        # Invoke the workflow, providing the new message and user-specific thread ID
        output = await self.app.ainvoke(
            {"messages": new_message},
            config={"configurable": {"thread_id": user_id}},
        )

        # Extract the last message from the conversation as the AI's reply
        ai_message = output["messages"][-1].content
        return ai_message

import React, { useState, useEffect } from "react";
import {
  Container,
  TextInput,
  Button,
  ScrollArea,
  Text,
  Paper,
  Flex,
  Loader,
} from "@mantine/core";

const ChatBotUI = () => {
  const [messages, setMessages] = useState<{ user: boolean; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket("ws://localhost:8000/ws/chat");

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, { user: false, text: event.data }]);
      setLoading(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && input.trim()) {
      setMessages((prev) => [...prev, { user: true, text: input }]);
      setLoading(true);
      socket.send(input);
      setInput("");
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <ScrollArea style={{ height: "400px", marginBottom: "1rem" }}>
          <div>
            {messages.map((message, index) => (
              <Text
                key={index}
                mt="sm"
                sx={{
                  color: message.user ? "blue" : "black",
                  textAlign: message.user ? "right" : "left",
                }}
              >
                {message.user ? "You: " : "Bot: "} {message.text}
              </Text>
            ))}
          </div>
        </ScrollArea>

        {loading && (
          <Flex justify="center" mt="sm">
            <Loader size="sm" />
          </Flex>
        )}

        <Flex mt="sm" gap="sm">
          <TextInput
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Type your message..."
            style={{ flex: 1 }}
          />
          <Button onClick={sendMessage} disabled={!input.trim()}>
            Send
          </Button>
        </Flex>
      </Paper>
    </Container>
  );
};

export default ChatBotUI;

import ChatBotUI from '@/components/ChatBotUI';
import { useEffect } from 'react';

export function HomePage() {
  useEffect(() => {
    const checkHealth = async () => {

      try {
        const response = await fetch("http://localhost:8000", {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Health:', data);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    checkHealth();
  }, [])

  return (
    <>
      <ChatBotUI />
    </>
  );
}

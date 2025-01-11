import ChatBotUI from '@/components/ChatBotUI';
import { API_URL } from '@/config';
import { useEffect } from 'react';

export function HomePage() {
  useEffect(() => {
    const checkHealth = async () => {

      try {
        const response = await fetch(API_URL, {
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

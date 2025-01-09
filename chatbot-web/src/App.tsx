import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import {
  emotionTransform,
  MantineEmotionProvider,
} from '@mantine/emotion';
import { Router } from './Router';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider theme={theme} stylesTransform={emotionTransform}>
      <MantineEmotionProvider>
        <Router />
      </MantineEmotionProvider>
    </MantineProvider>
  );
}

<script lang="ts">
import type { InjectionKey, Ref } from 'vue';
import { inject, onUnmounted, provide, ref, watch } from 'vue';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderState {
  theme: Ref<Theme>;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderKey: InjectionKey<ThemeProviderState> = Symbol('theme');

export function useTheme() {
  const context = inject(ThemeProviderKey);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    defaultTheme?: Theme;
    storageKey?: string;
  }>(),
  {
    defaultTheme: 'system',
    storageKey: 'vite-ui-theme',
  }
);

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const theme = ref<Theme>((localStorage.getItem(props.storageKey) as Theme) || props.defaultTheme);

const setTheme = (t: Theme) => {
  localStorage.setItem(props.storageKey, t);
  theme.value = t;
};

provide(ThemeProviderKey, { theme, setTheme });

function applyTheme() {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(
    theme.value === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme.value
  );
}

const onSystemThemeChange = () => {
  if (theme.value === 'system') {
    applyTheme();
  }
};

applyTheme();
watch(theme, applyTheme);
mediaQuery.addEventListener('change', onSystemThemeChange);
onUnmounted(() => {
  mediaQuery.removeEventListener('change', onSystemThemeChange);
});
</script>

<template>
  <slot></slot>
</template>

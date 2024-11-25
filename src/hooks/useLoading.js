import { ref } from 'vue';

const isLoading = ref(false);
const loadingText = ref('');

export function useLoading() {
  const showLoading = (text) => {
    isLoading.value = true;
    loadingText.value = text;
  };

  const hideLoading = () => {
    isLoading.value = false;
  };

  return {
    isLoading,
    loadingText,
    showLoading,
    hideLoading
  };
}
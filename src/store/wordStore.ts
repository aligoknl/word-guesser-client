import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const useWordStore = defineStore("wordStore", () => {
  const words = ref<string[]>([]);
  const randomWord = ref<string>("");
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const validationError = ref<string | null>(null);

  const fetchWords = async () => {
    loading.value = true;
    try {
      const response = await axios.get(`${apiBaseUrl}/words/all-words`);
      words.value = response.data.map(
        (wordObj: { word: string }) => wordObj.word
      );
    } catch (err) {
      error.value = "Error fetching words";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchRandomWord = async () => {
    loading.value = true;
    try {
      const response = await axios.get(`${apiBaseUrl}/words/random-word`);
      randomWord.value = response.data.word;
    } catch (err) {
      error.value = "Error fetching random word";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const validateWord = async (word: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${apiBaseUrl}/words/validate`, {
        word,
      });
      return response.data.valid;
    } catch (err) {
      console.error("Error validating word:", err);
      return true;
    }
  };

  return {
    words,
    randomWord,
    loading,
    error,
    validationError,
    fetchWords,
    fetchRandomWord,
    validateWord,
  };
});

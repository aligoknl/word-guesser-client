import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useWordStore = defineStore("wordStore", () => {
  const words = ref<string[]>([]);
  const randomWord = ref<string>("");
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const validationError = ref<string | null>(null);

  const fetchWords = async () => {
    loading.value = true;
    try {
      const response = await axios.get("http://localhost:8085/api/words");
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
      const response = await axios.get("http://localhost:8085/api/random-word");
      randomWord.value = response.data.word;
    } catch (err) {
      error.value = "Error fetching random word";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const validateWord = async (word: string) => {
    try {
      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        validationError.value = null;
        return true;
      }
    } catch (err) {
      validationError.value;
    }
    return false;
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

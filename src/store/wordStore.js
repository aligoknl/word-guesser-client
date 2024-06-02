import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useWordStore = defineStore("wordStore", () => {
  const words = ref([]);
  const randomWord = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchWords = async () => {
    loading.value = true;
    try {
      const response = await axios.get("http://localhost:8085/api/words");
      words.value = response.data.map((wordObj) => wordObj.word);
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

  return { words, randomWord, loading, error, fetchWords, fetchRandomWord };
});

import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useWordStore = defineStore("wordStore", () => {
  const words = ref([]);
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

  return { words, loading, error, fetchWords };
});

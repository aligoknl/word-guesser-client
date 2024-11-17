import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const useScoreStore = defineStore("scoreStore", () => {
  const leaderboard = ref<
    Array<{ username: string; score: number; _id: string }>
  >([]);

  const isLoading = ref<boolean>(false);

  const error = ref<string | null>(null);

  const submitScore = async (username: string, score: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      await axios.post(`${apiBaseUrl}/scores/save-score`, {
        username,
        score,
      });
    } catch (err) {
      error.value = "Error submitting score";
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchLeaderboard = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await axios.get(`${apiBaseUrl}/scores/top-scores`);
      leaderboard.value = response.data;
    } catch (err) {
      error.value = "Error fetching leaderboard";
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  return { leaderboard, isLoading, error, submitScore, fetchLeaderboard };
});

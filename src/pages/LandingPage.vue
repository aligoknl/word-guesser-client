<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../store/gameStore";
import { useScoreStore } from "../store/scoreStore";

const username = ref<string>("");
const usernameError = ref<string | null>(null);
const isUsernameValid = ref<boolean>(false);
const showLeaderboard = ref<boolean>(false);

const router = useRouter();
const storeGame = useGameStore();
const scoreStore = useScoreStore();

const { leaderboard } = storeToRefs(scoreStore);

const validateUsername = () => {
  if (username.value.length < 3) {
    usernameError.value = "Username must be at least 3 characters";
    isUsernameValid.value = false;
  } else {
    usernameError.value = null;
    isUsernameValid.value = true;
  }
};

const startGame = async () => {
  if (isUsernameValid.value) {
    storeGame.setUsername(username.value);
    router.push({ name: "GamePage" });
  }
};
const toggleLeaderboard = () => {
  showLeaderboard.value = !showLeaderboard.value;
};

onMounted(() => {
  scoreStore.fetchLeaderboard();
});
</script>

<template>
  <div class="username-form">
    <label for="username">Enter your username:</label>
    <input
      type="text"
      id="username"
      v-model="username"
      @blur="validateUsername"
      @focus="usernameError = null"
      maxlength="12"
      required
    />
    <p v-if="usernameError" class="error">{{ usernameError }}</p>
    <button @click="startGame">Start Game</button>
    <button @click="toggleLeaderboard">
      {{ showLeaderboard ? "Close Leaderboard" : "See the Leaderboard" }}
    </button>
    <div v-if="showLeaderboard" class="leaderboard">
      <h2>Top 10 Leaders</h2>
      <ul>
        <li v-for="user in leaderboard" :key="user._id">
          <span>{{ user.username }}</span>
          <span>{{ user.score }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.username-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 5rem auto;
  font-family: "Poppins", sans-serif;
}

.username-form label {
  font-size: 1.2rem;
  font-weight: bold;
  color: #784444;
}

.username-form input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.username-form input:focus {
  border-color: #007bff;
  outline: none;
}

.username-form .error {
  color: red;
  font-size: 0.9rem;
}

.username-form button {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 5px;
  background-color: #083c24;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.username-form button:hover {
  background-color: #08771e;
}

.username-form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.leaderboard {
  margin-top: 2rem;
  width: 100%;
  text-align: left;
}

.leaderboard h2 {
  font-size: 1.5rem;
  color: #083c24;
  text-align: center;
  margin-bottom: 1rem;
}

.leaderboard ul {
  list-style-type: none;
  padding: 0;
}

.leaderboard li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #ccc;
}

.leaderboard li span {
  font-size: 1rem;
}

.leaderboard li:nth-child(odd) {
  background-color: #f1f1f1;
}
</style>

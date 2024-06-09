<script setup lang="ts">
import { ref, defineEmits } from "vue";

const emit = defineEmits(["set-username"]);

const username = ref<string>("");
const usernameError = ref<string | null>(null);
const isUsernameValid = ref<boolean>(false);

const validateUsername = () => {
  if (username.value.length < 3) {
    usernameError.value = "Username must be at least 3 characters";
    isUsernameValid.value = false;
  } else {
    usernameError.value = null;
    isUsernameValid.value = true;
  }
};

const startGame = () => {
  if (isUsernameValid.value) {
    emit("set-username", username.value);
  }
};
</script>

<template>
  <div class="username-form">
    <label for="username">Enter your username:</label>
    <input
      type="text"
      id="username"
      v-model="username"
      @input="validateUsername"
      maxlength="12"
      required
    />
    <p v-if="usernameError" class="error">{{ usernameError }}</p>
    <button @click="startGame" :disabled="!isUsernameValid">Start Game</button>
  </div>
</template>

<style scoped>
.username-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error {
  color: red;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>

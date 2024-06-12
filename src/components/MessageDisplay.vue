<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useGameStore } from "../store/gameStore";

const gameStore = useGameStore();

const { username } = storeToRefs(gameStore);

const props = defineProps<{
  isGameInProgress: boolean;
  guesses: string[][];
  targetWord: string;
  timer: number;
  isSuccess: boolean;
  maxAttempts: number;
  maxTime: number;
  score: number;
  isGameEnded: boolean;
}>();

const message = computed(() => {
  if (props.isGameInProgress) return "";

  if (props.isGameEnded)
    return "You ended the game, click on 'Play New Game' to play.";

  const attempts = props.guesses.length;
  const minutes = Math.floor((props.maxTime - props.timer) / 60);
  const seconds = (props.maxTime - props.timer) % 60;
  let msg = "";

  if (props.timer <= 0) {
    msg = `Sorry, ${username.value}. You failed to guess the word "${props.targetWord}" within the time limit.`;
  } else if (props.isSuccess) {
    if (attempts < 5) {
      msg = `Wow, ${username.value}! You guessed the word "${props.targetWord}" in ${attempts} attempts in ${minutes} minutes and ${seconds} seconds. Impressive! Your score: ${props.score}`;
    } else if (attempts >= 5 && attempts < props.maxAttempts) {
      msg = `Great job, ${username.value}! It took you only ${attempts} tries to guess the word "${props.targetWord}" in ${minutes} minutes and ${seconds} seconds. Your score: ${props.score}`;
    } else if (attempts === props.maxAttempts) {
      msg = `Phew, ${username.value}! You found the word "${props.targetWord}" on your last attempt. Good job! Your score: ${props.score}`;
    }
  } else {
    msg = `Sorry, ${username.value}. You failed to guess the word "${props.targetWord}" within ${attempts} attempts. Your score: ${props.score}`;
  }
  return msg;
});
</script>

<template>
  <p v-if="!isGameInProgress" class="message">{{ message }}</p>
</template>

<style scoped>
.message {
  font-size: 20px;
  margin: 10px 0;
}
</style>

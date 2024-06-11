<script setup lang="ts">
const props = defineProps<{
  label: string;
}>();

const emit = defineEmits(["click"]);

const handleClick = () => {
  emit("click");
};
</script>

<template>
  <button class="buttonClass" @click="handleClick">
    {{ label }}
  </button>
</template>

<style scoped>
.buttonClass {
  margin: 0 1rem;
  padding: 0.7rem 1.5rem;
  cursor: pointer;
  background-color: rgb(78, 144, 78);
  color: white;
  border-radius: 0.5rem;
}
</style>

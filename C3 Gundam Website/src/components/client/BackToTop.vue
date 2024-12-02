<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const isBackToTopVisible = ref(false);

const handleScroll = () => {
  if (window.scrollY > 550) {
    isBackToTopVisible.value = true;
  } else {
    isBackToTopVisible.value = false;
  }
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>


<template>
    <a @click.prevent="scrollToTop" v-if="isBackToTopVisible" id="backtotop" href="#"
        class="fixed bottom-16 scroll-smooth right-10 flex justify-center items-center [box-shadow:0px_0px_10px_rgba(255,255,255,0.8)] bg-[#DB3F4C] border-2 rounded-full w-[50px] h-[50px]">
        <i class="fa-solid fa-arrow-up text-white text-[18px]"></i>
    </a>
</template>

<style></style>
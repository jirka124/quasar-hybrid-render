<template>
  <div class="m-ssr-now">NOW IS: {{ nowStr }}</div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "TimeNow",
  props: {
    timeNow: {
      type: [Date, null],
      required: true,
    },
  },
  computed: {
    nowStr() {
      if (this.timeNow === null) return "JS REQUIRED";
      return this.timeNow.toLocaleTimeString();
    },
  },
});
</script>

<style scoped>
.m-ssr-now {
  padding: 8px 16px;
  border-radius: 8px;
  background-color: #bbdefb;
  box-shadow: 0px 2px 4px 0px rgba(100, 100, 100, 0.5);
}
</style>

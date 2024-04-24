<template>
  <div class="reload-notify" v-show="shouldDisplay">
    <p>Always make sure to enter using navigation or reload page!</p>
    <button class="btn-1" @click="reloadPage">RELOAD</button>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapStores } from "pinia";
import { useAppStore } from "@/stores/app";

export default defineComponent({
  name: "ReloadNotify",
  computed: {
    ...mapStores(useAppStore),
    shouldDisplay() {
      return !this.appStore.isUniversalRendered;
    },
  },
  methods: {
    reloadPage() {
      window.location.reload();
    },
  },
});
</script>

<style scoped>
.reload-notify {
  padding: 12px 24px;
  border-radius: 16px;
  background-color: #ffb3a8;
}

.reload-notify > p {
  font-size: 20px;
  padding-bottom: 8px;
}
</style>

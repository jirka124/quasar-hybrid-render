<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
import { mapStores } from "pinia";
import { useAppStore } from "@/stores/app";

export default defineComponent({
  name: "App",
  computed: {
    ...mapStores(useAppStore),
  },
  watch: {
    $route(newRoute, oldRoute) {
      if (oldRoute.matched.length > 0)
        this.appStore.isUniversalRendered = false;
    },
  },
});
</script>

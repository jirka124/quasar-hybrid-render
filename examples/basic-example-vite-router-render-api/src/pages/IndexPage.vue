<template>
  <div id="index">
    <ModeItem
      v-for="mode in modes"
      :key="mode.modeId"
      :modeId="mode.modeId"
      :modeName="mode.modeName"
      :modeShort="mode.modeShort"
      :modeDetail="mode.modeDetail"
      :active="mode.active"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ModeItem from "@/components/index/ModeItem.vue";

export default defineComponent({
  name: "IndexPage",
  components: { ModeItem },
  data() {
    return {
      modes: [
        {
          modeId: "ssr",
          modeName: "SSR",
          modeShort: "Technique is accomplished by built-in SSR mode of Quasar",
          modeDetail: "More about the technique...",
          active: true,
        },
        {
          modeId: "csr",
          modeName: "CSR",
          modeShort:
            "Technique is using Quasar internals to render the SPA entry file",
          modeDetail: "More about the technique...",
          active: true,
        },
        {
          modeId: "ssg",
          modeName: "SSG",
          modeShort: "Technique works as a SSR with caching on server build",
          modeDetail: "More about the technique...",
          active: true,
        },
        {
          modeId: "isr",
          modeName: "ISR",
          modeShort:
            "Technique works as SSG but doesn't prerender, may expire to get new contents",
          modeDetail: "More about the technique...",
          active: true,
        },
        {
          modeId: "swr",
          modeName: "SWR",
          modeShort: "Is being prepared...",
          modeDetail: "More about the technique...",
          active: false,
        },
      ],
    };
  },
});
</script>

<style scoped>
#index {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}
</style>

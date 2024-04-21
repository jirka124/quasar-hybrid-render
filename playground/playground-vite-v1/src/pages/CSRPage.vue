<template>
  <div id="m-csr">
    <ReloadNotify />
    <h2 id="m-csr-head">This page was rendered with CSR</h2>
    <img id="m-csr-file" src="@/assets/file.svg" alt="file icon" width="256" height="256" loading="lazy">
    <TimeNow :timeNow="nowTime" />
    <TimeCompare subject="This page was rendered at" :time="renderTime" :timeNow="nowTime" />
    <TimeCompare subject="This page was mounted at" :time="mountTime" :timeNow="nowTime" />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { mapStores } from "pinia"
import { useAppStore } from "@/stores/app"
import ReloadNotify from "@/components/ReloadNotify.vue"
import TimeNow from "@/components/TimeNow.vue"
import TimeCompare from "@/components/TimeCompare.vue"

export default defineComponent({
  name: 'CSRPage',
  components: { ReloadNotify, TimeCompare, TimeNow },
  setup() {
    // CSR never runs on server, so always set render time (at client side)
    useAppStore().renderTime = new Date();
  },
  data() {
    return {
      nowTime: null,
      mountTime: null,
      nowTimeInterv: null
    }
  },
  computed: {
    ...mapStores(useAppStore),
    renderTime() {
      // reuse server provided renderTime
      return new Date(this.appStore.renderTime)
    },
  },
  methods: {
    incTimeNow() {
      this.nowTime = new Date();
    }
  },
  mounted() {
    this.mountTime = new Date();

    this.nowTimeInterv = setInterval(this.incTimeNow, 1000);
  },
  beforeUnmount() {
    clearInterval(this.nowTimeInterv);
  }
})
</script>

<style scoped>
#m-csr {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

#m-csr-head {
  font-size: 32px;
}

#m-csr-file {
  width: 256px;
}
</style>

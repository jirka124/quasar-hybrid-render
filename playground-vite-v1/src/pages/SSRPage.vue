<template>
  <div id="m-ssr">
    <ReloadNotify />
    <h2 id="m-ssr-head">This page was rendered with SSR</h2>
    <img id="m-ssr-file" src="@/assets/file.svg" alt="file icon" width="256" height="256" loading="lazy">
    <TimeNow :timeNow="nowTime" />
    <TimeCompare subject="This page was rendered at" :time="renderTime" :timeNow="nowTime" />
    <TimeCompare subject="This page was mounted at" :time="mountTime" :timeNow="nowTime" />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import ReloadNotify from "@/components/ReloadNotify.vue"
import TimeNow from "@/components/TimeNow.vue"
import TimeCompare from "@/components/TimeCompare.vue"

export default defineComponent({
  name: 'SSRPage',
  components: { ReloadNotify, TimeCompare, TimeNow },
  data() {
    return {
      nowTime: null,
      renderTime: new Date(),
      mountTime: null,
      nowTimeInterv: null
    }
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
#m-ssr {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

#m-ssr-head {
  font-size: 32px;
}

#m-ssr-file {
  width: 256px;
}
</style>

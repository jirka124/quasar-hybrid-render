<template>
  <div id="m-swr">
    <ReloadNotify />
    <h2 id="m-swr-head">This page was rendered with SWR (20 sec. expire)</h2>
    <b>current api state: {{ appStore.pageSpecific.apiState ? "TRUE" : "FALSE" }}</b>
    <img id="m-swr-file" src="@/assets/file.svg" alt="file icon" width="256" height="256" loading="lazy">
    <TimeNow :timeNow="nowTime" />
    <TimeCompare subject="This page was rendered at" :time="renderTime" :timeNow="nowTime" />
    <TimeCompare subject="This page was mounted at" :time="mountTime" :timeNow="nowTime" />
    <TimeCompare subject="This means it will auto expire at" :time="expireTime" :timeNow="nowTime" />
    <button class="btn-1" @click="reinvPage">Manual Expire API & reload</button>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { mapStores } from "pinia"
import { useAppStore } from "@/stores/app"
import { useSWRHint } from "/src-hr/useSWRHint.js"
import { useSSRContext } from 'vue'
import { api } from "@/boot/axios.js";
import ReloadNotify from "@/components/ReloadNotify.vue"
import TimeNow from "@/components/TimeNow.vue"
import TimeCompare from "@/components/TimeCompare.vue"

export default defineComponent({
  name: 'SWRPage',
  components: { ReloadNotify, TimeCompare, TimeNow },
  async preFetch({ store, currentRoute, previousRoute, redirect, ssrContext, urlPath, publicPath }) {
    const houby = 45;
    const result = await useSWRHint("hint1", ssrContext, () => {
      return new Promise((res, rej) => {
        setTimeout(() => { res("RESULT_DATA " + houby) }, 10000);
      })
    });

    let result2 = null;
    try {
      result2 = await useSWRHint("hint4", ssrContext, async () => {
        return (await api.post("/get-api-1-state")).data;
      })
    } catch (e) {
      console.error(e);
    }
    console.log("RESULT 2: ", result2);

    useAppStore(store).pageSpecific = { apiState: result2.result };
  },
  setup() {
    if (process.env.SERVER) {
      // TODO: this would only work with script setup not setup function
      const houby = 55;

      useSWRHint("hint2", useSSRContext(), () => {
        return "RESULT_DATA " + houby;
      })
      const result = useSWRHint("hint3", null, () => {
        return "RESULT_DATA " + (houby + 40)
      })
    }

    // SSR is server side renderd (set render time only in server side)
    if (process.env.SERVER) useAppStore().renderTime = new Date();
  },
  data() {
    return {
      EXPIRE_TIME: 20 * 1000, // 20 sec
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
    expireTime() {
      return new Date(+this.renderTime + this.EXPIRE_TIME);
    }
  },
  methods: {
    incTimeNow() {
      this.nowTime = new Date();
    },
    async reinvPage() {
      let r;
      try {
        r = (
          await this.$api.post("/toggle-api-1-state")
        ).data;
        if (r.reqState !== null) alert(`ERR: ${r.reqState}`);
        else location.reload();
      } catch (error) {
        console.error(error);
      }
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
#m-swr {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

#m-swr-head {
  font-size: 32px;
}

#m-swr-file {
  width: 256px;
}
</style>

<template>
  <div id="index">
    <ModeItem v-for="mode in modes" :key="mode.modeId" :modeId="mode.modeId" :modeName="mode.modeName"
      :modeShort="mode.modeShort" :modeDetail="mode.modeDetail" :active="mode.active" />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import ModeItem from "@/components/index/ModeItem.vue";

export default defineComponent({
  name: 'IndexPage',
  components: { ModeItem },
  data() {
    return {
      modes: [
        {
          modeId: "ssr",
          modeName: "SSR",
          modeShort: "Technique is accomplished by built-in SSR mode of Quasar",
          modeDetail: `Every request to a web page will be proccesed distinct on server, there is no caching implemented.
          <br/><br/>
          WORKFLOW:<br/>
          <ol style="margin-left: 16px; list-style-position: inside;">
            <li>Client requests page</li>
            <li>Server renders page</li>
            <li>Server responds with page</li>
            <li>Client views the new page</li>
          </ol>
          `,
          active: true
        },
        {
          modeId: "csr",
          modeName: "CSR",
          modeShort: "Technique is using Quasar internals to render the SPA entry file",
          modeDetail: `Every request to a web page will be returned just SPA entry generated at build time.
          <br/><br/>
          WORKFLOW:<br/>
          <ol style="margin-left: 16px; list-style-position: inside;">
            <li>Client requests page</li>
            <li>Server reads a SPA entry file</li>
            <li>Server responds with SPA entry</li>
            <li>Client renders page</li>
            <li>Client views the new page</li>
          </ol>
          `,
          active: true
        },
        {
          modeId: "ssg",
          modeName: "SSG",
          modeShort: "Technique works as a SSR with caching on server build",
          modeDetail: `Every request to a web page will be returned page generated at build time.
          <br/><br/>
          WORKFLOW:<br/>
          <ol style="margin-left: 16px; list-style-position: inside;">
            <li>Client requests page</li>
            <li>Server reads a page file</li>
            <li>Server responds with page</li>
            <li>Client views the new page</li>
          </ol>
          `,
          active: true
        },
        {
          modeId: "isr",
          modeName: "ISR",
          modeShort: "Technique works as SSG but doesn't prerender, may expire to get new contents",
          modeDetail: `Every request to a web page will check if render is needed, if not cached version is reused (if any).
          <br/><br/>
          WORKFLOW:<br/>
          <ol style="margin-left: 16px; list-style-position: inside;">
            <li>Client requests page</li>
            <li>Server renders or reads page</li>
            <li>
              <ol style="margin-left: 16px; list-style-position: inside;">
                <li>IF renders</li>
                <li>Server renders page</li>
                <li>Server responds with page</li>
                <li>Server saves page</li>
              </ol>
              <ol style="margin-left: 16px; list-style-position: inside;">
                <li>IF reads</li>
                <li>Server reads page</li>
                <li>Server responds with page</li>
              </ol>
            </li>
            <li>Client views the new page</li>
          </ol>
          `,
          active: true
        },
        {
          modeId: "swr",
          modeName: "SWR",
          modeShort: "Technique works as ISR, but returns cached content and revalidates after user is served, allows validation by API",
          modeDetail: `Every request to a web page will get cached version and check if render is needed, if is then silently re-renders.
          <br/><br/>
          WORKFLOW:<br/>
          <ol style="margin-left: 16px; list-style-position: inside;">
            <li>Client requests page</li>
            <li>Server reads cached page file</li>
            <li>Server responds with cached page</li>
            <li>Client views the new page</li>
            <li>Server checks if re-render required</li>
            <li>
              <ol style="margin-left: 16px; list-style-position: inside;">
                <li>IF TTL expired & API changed</li>
                <li>Server renders page</li>
                <li>Server saves page</li>
              </ol>
              <ol style="margin-left: 16px; list-style-position: inside;">
                <li>ELSE</li>
                <li>Server renew the TTL of cached file</li>
              </ol>
            </li>
          </ol>
          `,
          active: true
        }
      ]
    }
  }
})
</script>

<style scoped>
#index {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}
</style>

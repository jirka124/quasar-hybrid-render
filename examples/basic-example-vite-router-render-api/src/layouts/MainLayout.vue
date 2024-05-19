<template>
  <div id="main-lay">
    <MainLayoutHeader />
    <RouterView />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import MainLayoutHeader from '@/components/MainLayoutHeader.vue';

export default defineComponent({
  name: 'MainLayout',
  components: { MainLayoutHeader }
})
</script>

<style scoped>
#main-lay {}
</style>

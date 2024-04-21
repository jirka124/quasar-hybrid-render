<template>
  <div id="error">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div style="font-size: 24px; opacity:.4">
        Oops. Nothing here...
      </div>

      <RouterLink :to="{ name: 'index' }">Go Back Home</RouterLink>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorNotFound'
})
</script>

<style scoped>
#error {}
</style>

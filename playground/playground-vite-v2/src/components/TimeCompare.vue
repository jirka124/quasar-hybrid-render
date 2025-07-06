<template>
  <div class="time-comp">
    <p>{{ subject }} {{ timeStr }}</p>
    <i>{{ timestampStr }}</i>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TimeCompare',
  props: {
    subject: {
      type: String,
      default: 'No Subject',
    },
    time: {
      type: [Date, null],
      required: true,
    },
    timeNow: {
      type: [Date, null],
      required: true,
    },
  },
  computed: {
    timeStr() {
      if (this.time === null) return 'NULL'
      return this.time.toLocaleTimeString()
    },
    timestampStr() {
      if (this.time === null || this.timeNow === null) return 0
      const timeElapse = (this.timeNow - this.time) / 1000

      if (timeElapse < 0) return `That is in ${Math.abs(timeElapse.toFixed(0))}s`
      return `That is ${timeElapse.toFixed(0)}s ago...`
    },
  },
})
</script>

<style scoped>
.time-comp > p {
  font-weight: 800;
}
</style>

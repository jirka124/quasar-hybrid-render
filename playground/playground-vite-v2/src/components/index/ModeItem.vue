<template>
  <div class="mode-item">
    <div class="mode-item-head">
      <h2>{{ modeName }} -</h2>
      <i>{{ modeShort }}</i>
    </div>
    <div class="mode-item-detail" v-html="modeDetail"></div>
    <div class="mode-item-act" v-if="active">
      <RouterLink :to="{ name: modeId }">
        <button class="btn-1">GoTo</button>
      </RouterLink>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ModeItem',
  props: {
    modeId: {
      type: String,
      default: (+new Date()).toString(),
    },
    modeName: {
      type: String,
      default: 'NONE',
    },
    modeShort: {
      type: String,
      default: '',
    },
    modeDetail: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<style scoped>
.mode-item {
  border: 3px solid #2f5767;
  border-radius: 16px;
  overflow: hidden;
}

.mode-item-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  color: white;
  background-color: #2f5767;
}

.mode-item-head > h2 {
  font-size: 28px;
}

.mode-item-head > i {
}

.mode-item-detail {
  padding: 8px;
}

.mode-item-act {
  padding: 8px;
}

.mode-item-act > button {
}

@media only screen and (max-width: 512px) {
  .mode-item-head {
    flex-wrap: wrap;
  }
}
</style>

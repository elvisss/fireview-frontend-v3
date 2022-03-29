<template>
  <component :is="resolveLayout">
    <router-view></router-view>
  </component>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import { useRouter } from '@/utils'
import LayoutBlank from '@/layouts/Blank.vue'
import LayoutContent from '@/layouts/Content.vue'
import websocketService from '@/services/websocketService'

export default {
  components: {
    LayoutBlank,
    LayoutContent,
  },
  setup() {
    const { route } = useRouter()
    const name = ref('')
    const wsService = websocketService.instance

    wsService.listen('name', serverName => {
      name.value = serverName
    })

    wsService.listen('test', db => {
      console.log(db)
    })

    const resolveLayout = computed(() => {
      // Handles initial route
      if (route.value.name === null) return null

      if (route.value.meta.layout === 'blank') return 'layout-blank'

      return 'layout-content'
    })

    return {
      name,
      resolveLayout,
    }
  },
}
</script>

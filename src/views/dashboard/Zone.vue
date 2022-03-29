<template>
    <circle
        style="opacity:1;fill-opacity:1;fill-rule:nonzero;stroke:#07d0ea;stroke-width:1.88976383;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:1.88976376, 1.88976376;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal"
        :fill="fillColor"
        :cx="zone.axisX"
        :cy="zone.axisY"
        r="10.393701"
    />
</template>

<script lang="ts">
import { computed } from '@vue/composition-api';

export default ({
    name: 'Zone',
    props: {
        zone: Object
    },
    setup(props) {
        const fillColor = computed(() => props.value ? '#ff0000' : '#008000');
        return {
            fillColor
        }
    },
})
</script>

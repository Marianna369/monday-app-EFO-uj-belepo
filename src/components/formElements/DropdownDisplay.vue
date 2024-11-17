<script setup lang="ts">
import { ColumnValue, DropdownOption } from '@/plugins/types';

defineProps<{
    label: string,
    value: ColumnValue<DropdownOption>,
    dense?: boolean
}>();
</script>

<template>
    <v-text-field :label="label" variant="outlined" readonly model-value=" " hide-details :density="dense ? 'compact' : 'comfortable'">
        <v-chip large v-if="value.ColumnValue"
            :size="dense ? 'small': 'default'"
            :style="{ 
                'background-color': value.ColumnValue.color ? value.ColumnValue.color : 'auto',
                'color': value.ColumnValue.color ? 'white' : 'auto'
            }"
            style="width: calc(100% - 2px); border-radius: 4px;">
            {{ value.ColumnValue.caption }}
        </v-chip>
    </v-text-field>
</template>
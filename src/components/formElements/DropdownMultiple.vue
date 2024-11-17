<script setup lang="ts">
import { ColumnValue, DropdownOption } from '@/plugins/types';
import { reactive, watch } from 'vue';

    const props = defineProps<{
        label: string, 
        value: ColumnValue<DropdownOption[]> | null,
        options: DropdownOption[]
    }>();
    
    const emit = defineEmits<{
        change: [columnId: string, newValue: string[]]
    }>();

    const state = reactive({
        value: props.value.ColumnValue,
        isSaving: false,
    });

    const onSave = (item: DropdownOption) => {
        const newValue = props.value.ColumnValue.some(x => x.value == item.value)
            ? props.value.ColumnValue.filter(x => x.value != item.value).map(x => x.value)
            : [...props.value.ColumnValue.map(x => x.value), item.value];

            emit('change', props.value.ColumnId, newValue);
            state.value = props.options.filter(x => newValue.includes(x.value));
            state.isSaving = true;
    }

    watch(() => props.value.ColumnValue, () => {
        state.value = props.value.ColumnValue;
        state.isSaving = false;
    });
</script>

<template>
    <div>
        <v-menu>
        <template v-slot:activator="{ props: on }">
            <v-select
                :label="props.label" 
                :model-value="state.value"
                :items="state.value"
                :loading="state.isSaving"
                variant="outlined" 
                v-bind="on" 
                readonly 
                hide-details
                multiple
                density="compact"
                item-title="caption">
            <template v-slot:selection="item">
                <v-tooltip :text="item.item.title">
                    <template v-slot:activator="{props: on}">
                        <v-avatar v-bind="on" size="small">
                            <v-img :src="item.item.raw.thumb"></v-img>
                        </v-avatar>
                    </template>
                </v-tooltip>
            </template>
        </v-select>
        </template>
        <v-list class="pa-0">
            <v-list-item
            v-for="(item, index) in options"
            :key="index"
            :value="index"
            @click="onSave(item)"
            :style="{ 
                    'background-color': item.color ? item.color : 'auto',
                    'color': item.color ? 'white' : 'auto'
                }"
            >
            <template v-slot:prepend v-if="item.thumb">
                <v-avatar>
                    <v-img :src="item.thumb"></v-img>
                </v-avatar>
            </template>
            <v-list-item-title>{{ item.caption }}</v-list-item-title>
            </v-list-item>
        </v-list>
        </v-menu>
    </div>
</template>

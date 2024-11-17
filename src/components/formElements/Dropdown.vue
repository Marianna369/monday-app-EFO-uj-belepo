<script setup lang="ts">
import { ColumnValue, DropdownOption } from '@/plugins/types';
import { computed, nextTick, reactive, ref, watch } from 'vue';

    const props = defineProps<{
        label: string, 
        value: ColumnValue<DropdownOption> | null,
        options: DropdownOption[],
        searchable?: boolean
    }>();
    
    const emit = defineEmits<{
        change: [columnId: string, newValue: string]
    }>();

    const state = reactive({
        value: props.value.ColumnValue,
        isSaving: false,
        isOpen: false,
        searchText: ""
    });

    const visibleOptions = computed(() => props.options.filter(x => x.caption.toLowerCase().includes(state.searchText.trim().toLowerCase())));

    const onSave = (item: DropdownOption) => {
        state.isOpen = false;
        state.searchText = "";
        if(item.value != props.value.ColumnValue?.value) {
            emit('change', props.value.ColumnId, item.value);
            state.value = item;
            state.isSaving = true;
        }
    }

    watch(() => props.value.ColumnValue, () => {
        state.value = props.value.ColumnValue;
        state.isSaving = false;
    });

    watch(() => state.isOpen, async (isOpen) => {
        await nextTick();
        if(isOpen && searchInput.value) {
            setTimeout(() => searchInput.value.focus(), 100);
        }
    })

    const searchInput = ref(null);
</script>

<template>
    <div>
        <v-menu v-model="state.isOpen" :close-on-content-click="false">
        <template v-slot:activator="{ props: on }">
            <v-select
                :label="props.label" 
                :model-value="state.value"
                :items="[state.value]"
                :loading="state.isSaving"
                class="dropdown-activator"
                variant="outlined" 
                v-bind="on" 
                readonly 
                hide-details
                density="comfortable"
                item-title="caption">
            <template v-slot:selection="{ item }">
                <v-chip label v-if="state.value" :class="{'pl-1': item.raw.thumb}" class="flex-grow-1"
                    :style="{ 
                        'background-color': state.value.color ? state.value.color : 'auto',
                        'color': state.value.color ? 'white' : 'auto'
                    }">
                    <v-avatar v-if="item.raw.thumb" class="mr-2">
                        <v-img :src="item.raw.thumb"></v-img>
                    </v-avatar>
                    {{ item.title }}
                </v-chip>
            </template>
        </v-select>
        </template>
        <v-list class="pa-0">
            <v-list-item v-if="state.isOpen && props.searchable" class="pa-0">
                <v-text-field label="Filter" v-model="state.searchText" density="compact" hide-details ref="searchInput" />
            </v-list-item>
            <v-list-item
            v-for="(item, index) in visibleOptions"
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

<style scoped>
.dropdown-activator :deep(.v-select__selection) {
    flex-grow: 1;
}
</style>
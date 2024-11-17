<script setup lang="ts">
import { ColumnValue } from '@/plugins/types';
import moment from 'moment';
import { computed, reactive, watch } from 'vue';

    const props = defineProps<{
        label: string, 
        value: ColumnValue<Date>
    }>();

    const emit = defineEmits(["change"]);

    const displayDate = computed(() => state.value ? moment(state.value).format("YYYY-MM-DD") : null);

    const state = reactive({
        value: props.value.ColumnValue,
        isPickerVisible: false,
        isSaving: false
    });

    watch(() => props.value.ColumnValue, () => {
        state.value = props.value.ColumnValue;
        state.isPickerVisible = false;
        state.isSaving = false;
    });

    const onChange = (newValue: Date) => {
        if(props.value.ColumnValue != newValue) {
            emit('change', props.value.ColumnId, newValue ? moment(newValue).format("YYYY-MM-DD") : null);
            state.value = newValue;
            state.isPickerVisible = false;
            state.isSaving = true;
        }
    }
</script>

<template>
    <v-menu v-model="state.isPickerVisible" :close-on-content-click="false">
        <template v-slot:activator="{props: on}">
            <v-text-field 
                :label="props.label" 
                v-bind="on" 
                :model-value="displayDate" 
                :loading="state.isSaving"
                variant="outlined" 
                density="comfortable"
                hide-details
                readonly></v-text-field>
        </template>
        <v-date-picker :model-value="state.value" @update:model-value="onChange" elevation="4"></v-date-picker>
    </v-menu>
</template>
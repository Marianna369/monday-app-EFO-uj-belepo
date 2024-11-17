<script setup lang="ts">
import { ColumnValue } from '@/plugins/types';
import { reactive, watch } from 'vue';

    const props = defineProps<{
        label: string, 
        value: ColumnValue<string>,
        email?: boolean,
        onBeforeSave?: (str: string) => string
    }>();

    const emit = defineEmits(["change"]);

    const state = reactive({
        value: props.value?.ColumnValue,
        isSaving: false
    });

    const validationRules = [
        (val: string) => !props.email || isEmail(val) || "Invalid email"
    ]

    const isEmail = (str: string) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(str);
    }

    watch(() => props.value.ColumnValue, () => {
        state.value = props.value.ColumnValue;
        state.isSaving = false;
    });

    const onSave = () => {
        if(state.value.trim() != props.value.ColumnValue && (!props.email || isEmail(state.value.trim()))) {
            const value = props.onBeforeSave ? props.onBeforeSave(state.value.trim()) : state.value.trim();
            emit('change', props.value.ColumnId, value);
            state.isSaving = true;
        }
    }

    const onCancel = () => {
        state.value = props.value?.ColumnValue;
    }
</script>

<template>
    <v-text-field 
        :label="`${props.label}`" 
        v-model="state.value" 
        :loading="state.isSaving" 
        :rules="validationRules" 
        variant="outlined" 
        density="comfortable"
        hide-details 
        @blur="onSave" 
        @keydown.enter.prevent="onSave" 
        @keydown.esc.prevent="onCancel"></v-text-field>
</template>
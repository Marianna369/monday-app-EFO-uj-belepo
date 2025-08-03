<script setup lang="ts">
import { ColumnValue } from '@/plugins/types';
import { reactive, watch } from 'vue';

    type ValidationResult = string | boolean;
    type ValidationRule$1 = ValidationResult | PromiseLike<ValidationResult> | ((value: any) => ValidationResult) | ((value: any) => PromiseLike<ValidationResult>);

    const props = defineProps<{
        label: string, 
        value: ColumnValue<string>,
        rules?: ValidationRule$1[] ,
        email?: boolean,
        onBeforeSave?: (str: string) => string
    }>();

    const emit = defineEmits(["change"]);

    const state = reactive({
        value: props.value?.ColumnValue,
        isSaving: false
    });

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
        :rules="rules" 
        variant="outlined" 
        density="comfortable"
        hide-details 
        @blur="onSave" 
        @keydown.enter.prevent="onSave" 
        @keydown.esc.prevent="onCancel"></v-text-field>
</template>
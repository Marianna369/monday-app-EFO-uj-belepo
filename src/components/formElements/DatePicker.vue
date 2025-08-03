<script setup lang="ts">
import { ColumnValue } from '@/plugins/types';
import moment from 'moment';
import { computed, reactive, ref, watch } from 'vue';

    const props = defineProps<{
        label: string, 
        value: ColumnValue<Date>
    }>();

    const emit = defineEmits(["change"]);

    const state = reactive<{
        value: Date | null,
        isPickerVisible: boolean,
        isSaving: boolean
    }>({
        value: props.value.ColumnValue,
        isPickerVisible: false,
        isSaving: false
    });

    //const displayDate = computed(() => state.value ? moment(state.value).format("YYYY-MM-DD") : null);
    const textInput = ref(state.value ? moment(state.value).format("YYYY.MM.DD") : '');
    const isValidDate = computed(() => {
        return textInput.value === '' || moment(textInput.value, 'YYYY.MM.DD', true).isValid();
    });

    watch(() => props.value.ColumnValue, () => {
        state.value = props.value.ColumnValue;
        state.isPickerVisible = false;
        state.isSaving = false;
    });

    watch(() => state.value, (newVal) => {
        textInput.value = newVal ? moment(newVal).format("YYYY.MM.DD") : '';
    });

    watch(textInput, (newVal) => {
        const parsed = moment(newVal, 'YYYY.MM.DD', true);
        if (parsed.isValid()) {
            const date = parsed.toDate();
            if (!moment(state.value).isSame(date)) {
                state.value = date;
                onChange(date); 
            }
        }
    });

    const onCalendarSelect = (newDate: Date) => {
        if (!moment(state.value).isSame(newDate)) {
            state.value = newDate;
            textInput.value = moment(newDate).format('YYYY.MM.DD');
            onChange(newDate);
        }
    };

    const onChange = (newValue: Date) => {
        if(props.value.ColumnValue != newValue) {
            emit('change', props.value.ColumnId, newValue ? moment(newValue).format("YYYY.MM.DD") : null);
            state.isPickerVisible = false;
            state.isSaving = true;
        }
    }
</script>

<template>
    <v-menu v-model="state.isPickerVisible" :close-on-content-click="false">
        <template v-slot:activator>
            <v-text-field 
                :label="props.label" 
                v-model="textInput" 
                :loading="state.isSaving"
                variant="outlined" 
                density="comfortable"
                :error="!isValidDate"
                :error-messages="!isValidDate ? ['Hibás dátumformátum (YYYY.MM.DD)'] : []"
                hide-details="auto"
                @click="state.isPickerVisible = true"
            ></v-text-field>
        </template>
        <v-date-picker :model-value="state.value" @update:model-value="onCalendarSelect" elevation="4"></v-date-picker>
    </v-menu>
</template>
<script setup lang="ts">
import { MainBoardItem, MainBoardStructure } from '@/plugins/types';
import moment from 'moment';
import DropdownDisplay from './formElements/DropdownDisplay.vue';
import DatePicker from './formElements/DatePicker.vue';
import { computed, reactive, Ref, watch } from 'vue';
import Dropdown from './formElements/Dropdown.vue';
import Attachments from './formElements/Attachments.vue';


const props = defineProps<{
    item: MainBoardItem
}>();
</script>

const emit = defineEmits<{
    columnValueChange: [itemId: number, columnId: string, newValue: string],
    attachmentAdded: [itemId: number, columnId: string, file: File],
    fileDocument: [itemId: number],
    deleteDocument: [itemId: number]
}>();

const onColumnValueChange = (columnId: string, newValue: string) => {
    emit('columnValueChange', props.item.Id, columnId, newValue);
}

<template>
    <v-row>
        <v-col cols="4">
            <v-text-field label="Név" :model-value="item.Name.ColumnValue" variant="outlined" readonly density="compact" hide-details />
        </v-col>
        <v-col cols="4">
            <v-text-field label="Születési hely" :model-value="item.Szuletesi_hely.ColumnValue" variant="outlined" readonly density="compact" hide-details />
        </v-col>
        <v-col cols="4">
            <v-text-field label="Születési idő" :model-value="item.Szuletesi_ido.ColumnValue" variant="outlined" readonly density="compact" hide-details />
        </v-col>
    </v-row>
</template>
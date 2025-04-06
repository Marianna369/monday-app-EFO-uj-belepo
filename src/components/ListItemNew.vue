<script setup lang="ts">
import { MainBoardItem, MainBoardStructure } from '@/plugins/types';
import TextField from './formElements/TextField.vue';
import { VTextField } from 'vuetify/components/VTextField';
import DatePicker from './formElements/DatePicker.vue';
import Dropdown from './formElements/Dropdown.vue';
import Attachments from './formElements/Attachments.vue';
import { computed, reactive, Ref, watch } from 'vue';
import moment from 'moment';
import DropdownMultiple from './formElements/DropdownMultiple.vue';

const props = defineProps<{
    structure: MainBoardStructure
}>();

const emit = defineEmits<{
    columnValueChange: [columnId: string, newValue: string],
    attachmentAdded: [columnId: string, file: File]
}>();

const state = reactive({
    isLoading: false,
    isDeleting: false
});

const canFileDocument = computed(() => {
    let isValid=true;
    return isValid;
})

const onColumnValueChange = (columnId: string, newValue: string) => {
    emit('columnValueChange', columnId, newValue);
}

const onFelvitelClick = () => {

}

</script>

<template>
    <div class="pb-4">
        <v-row>
            <v-col cols="1">
                <v-text_field label="Név" type="input" />
            </v-col>
            <v-col cols="1">
                <v-text_field label="Születési hely" type="input" />
            </v-col>
            <v-col cols="2">
                <v-date-picker label="Születési idő" type="input" />
            </v-col>
            <v-col cols="5">
                <v-text_field label="EFO_igénylő" type="input" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="4" align="right" align-self="end">
                <v-dialog max-width="500">
                    <template v-slot:activator="{ props: activatorProps }">
                        <v-btn v-bind="activatorProps" :disabled="state.isLoading || state.isDeleting" :loading="state.isDeleting" class="mr-2" color="red" prepend-icon="mdi-file-document-remove" size="large">Törlés</v-btn>
                    </template>

                    </v-dialog>
                <v-btn :disabled="!canFileDocument || state.isDeleting" :loading="state.isLoading" @click="onFelvitelClick" color="green" prepend-icon="mdi-file-document-check" size="large">Felvitel</v-btn>
            </v-col>   
        </v-row>

    </div>
</template>
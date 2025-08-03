<script setup lang="ts">
import { MainBoardItem, MainBoardStructure } from '@/plugins/types';
import TextField from './formElements/TextField.vue';
import DatePicker from './formElements/DatePicker.vue';
import { computed, reactive, Ref } from 'vue';

const props = defineProps<{
    item: MainBoardItem, 
    structure: MainBoardStructure
}>();

const emit = defineEmits<{
    columnValueChange: [itemId: number, columnId: string, newValue: string],
    attachmentAdded: [itemId: number, columnId: string, file: File],
    fileDocument: [itemId: number],
    deleteDocument: [itemId: number]
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
    emit('columnValueChange', props.item.Id, columnId, newValue);
}

const onFelvitelClick = () => {
    if(canFileDocument.value) {
        state.isLoading = true;
        emit('fileDocument', props.item.Id);
    }
}

const onDeleteConfirm = (dialogActive: Ref<boolean, boolean>) => {
    dialogActive.value = false;
    state.isDeleting = true;
    emit('deleteDocument', props.item.Id);
}

</script>

<template>
    <div class="pb-4">
        <v-row>
            <v-col cols="4">
                <TextField label="Név" :value="props.item.Name" @change="onColumnValueChange" />
            </v-col>
            <v-col cols="4">
                <TextField label="Születési hely" :value="props.item.Szuletesi_hely" @change="onColumnValueChange" />
            </v-col>
            <v-col cols="2">
                <DatePicker label="Születési idő" :value="props.item.Szuletesi_ido" @change="onColumnValueChange" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="4" align="right" align-self="end">
                <v-dialog max-width="500">
                    <template v-slot:activator="{ props: activatorProps }">
                        <v-btn v-bind="activatorProps" :disabled="state.isLoading || state.isDeleting" :loading="state.isDeleting" class="mr-2" color="red" prepend-icon="mdi-file-document-remove" size="large">Törlés</v-btn>
                    </template>

                    <template v-slot:default="{ isActive }">
                        <v-card title="Biztosan törölni akarja a tételt?">
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="isActive.value = false" class="mr-2" color="secondary" prepend-icon="mdi-cancel" size="large">Nem</v-btn>
                            <v-btn @click="() => onDeleteConfirm(isActive)" class="mr-2" color="primary" prepend-icon="mdi-check" size="large">Igen</v-btn>
                        </v-card-actions>
                        </v-card>
                    </template>
                    </v-dialog>
                <v-btn :disabled="!canFileDocument || state.isDeleting" :loading="state.isLoading" @click="onFelvitelClick" color="green" prepend-icon="mdi-file-document-check" size="large">Felvitel</v-btn>
            </v-col>   
        </v-row>

    </div>
</template>
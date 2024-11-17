<script setup lang="ts">
import { reactive } from 'vue';

defineProps<{
    isSaving: boolean
}>();

const emit = defineEmits<{
    fileSelected: [file: File]
}>();

const state = reactive({
    selectedFile: null as File
});

const onSelect = async (file: File | File[]) => {
    emit('fileSelected', file instanceof Array ? file[0] : file);
    state.selectedFile = null;
}
</script>

<template>
    <div class="position-relative d-flex cursor-pointer">
        <v-file-input class="position-absolute ma-0" :disabled="isSaving" :style="{'z-index': 1, 'width': '100%', 'opacity': '0'}" :model-value="state.selectedFile" @update:model-value="onSelect" prepend-icon="" density="compact" hide-details></v-file-input>
        <v-btn prepend-icon="mdi-plus-circle" class="flex-grow-1 my-0" color="green" :loading="isSaving" :disabled="isSaving">Upload</v-btn>
    </div>
</template>
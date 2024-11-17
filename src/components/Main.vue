<script lang="ts" setup>
import MondayApi from '@/plugins/MondayApi';
import { MainBoardStructure } from '@/plugins/types';
import { onMounted, reactive } from 'vue';
import ListPage from './ListPage.vue';

const state = reactive({
    structure: null as MainBoardStructure
});

MondayApi.init.setIktatvaStatus(import.meta.env.VITE_COLUMN_ID_IKTATVA, parseInt(import.meta.env.VITE_IKTATVA_STATUS_ID), parseInt(import.meta.env.VITE_TOROLVE_STATUS_ID));
MondayApi.init.setFilesColumnId(import.meta.env.VITE_COLUMN_ID_FILES)
MondayApi.init.setSearchColumn(import.meta.env.VITE_COLUMN_ID_NAME);

onMounted(async () => {
    state.structure = await MondayApi.getMainBoardStructure(import.meta.env.VITE_TABLE_ID);
});


</script>

<template>
    <div class="fill-height">
        <div v-if="state.structure == null" class="fill-height d-flex align-center justify-center">
            <v-progress-circular
                color="purple"
                indeterminate
                :size="100"
                :width="7"
                />
        </div>
        <div v-else>
            <ListPage :structure="state.structure" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { MainBoardItem, MainBoardStructure } from '@/plugins/types';
import { computed, onMounted, reactive } from 'vue';
import ListItemEditor from './ListItemEditor.vue';
import MondayApi from '@/plugins/MondayApi';
import ListItemDisplay from './ListItemDisplay.vue';

const props = defineProps<{structure: MainBoardStructure}>();

const state = reactive({
    currentPage: 0,
    items: [] as MainBoardItem[],
    cursors: [] as string[],
    isLoading: false,
    isSearching: false,
    activeItemIndex: null as number,
    searchTextTemp: "",
    searchText: ""
});

const hasNextCursor = computed(() => state.cursors[state.currentPage + 1] != undefined && state.cursors[state.currentPage + 1] != null);

onMounted(async () => {   
    await resetList();
})

const resetList = async () => {
    state.isLoading = true; 
    state.activeItemIndex = null;
    state.currentPage = 0;
    const page = await MondayApi.getMainBoardItems(import.meta.env.VITE_TABLE_ID, state.searchText, props.structure);
    state.items = page.Items;
    state.cursors = [];
    state.cursors[state.currentPage + 1] = page.Cursor;
    state.isLoading = false;
    state.isSearching = false;
}

const resetSearch = async () => {
    state.searchText = "";
    state.searchTextTemp = "";
    await resetList();
}

const onColumnValueChange = async (itemId: number, columnId: string, newValue: string) => {
    await MondayApi.changeMainBoardItem(props.structure, import.meta.env.VITE_TABLE_ID, itemId, columnId, newValue);
}

const onSearch = async () => {
    state.isSearching = true;
    if(state.searchTextTemp == "") {
        await resetSearch()
    }
    else {
        state.searchText = state.searchTextTemp;
        await resetList()
    }
    state.isSearching = false;
}

const back = async () => {
    if(state.currentPage > 0) {
        state.currentPage--;
        if(state.currentPage == 0) {
            await resetList()
        }
        else {
            state.isLoading = true;
            state.activeItemIndex = null;
            const page = await MondayApi.getNextPageItems(state.cursors[state.currentPage], import.meta.env.VITE_COLUMN_ID_FILES, props.structure);
            state.items = page.Items;
            state.isLoading = false;
        }
    }
}
const forward = async () => {
    if(hasNextCursor.value) {
        state.currentPage++;
        state.isLoading = true;
        state.activeItemIndex = null;
        const page = await MondayApi.getNextPageItems(state.cursors[state.currentPage], import.meta.env.VITE_COLUMN_ID_FILES, props.structure);
        state.items = page.Items;
        state.cursors[state.currentPage + 1] = page.Cursor;
        state.isLoading = false;
    }
}

;

</script>

<template>
    <div>
        <div class="mt-4 mb-8 mx-8">
            <v-row>
                <v-col cols="4" class="d-flex align-center">
                    <h2>EFO <span v-if="state.searchText"> - keresés</span></h2>
                </v-col>

                <v-col cols="4" class="d-flex align-center">
                    <v-text-field 
                        label="Keresés" 
                        v-model.trim="state.searchTextTemp"
                        placeholder="Press Enter to search" 
                        variant="outlined" 
                        hideDetails 
                        density="compact" 
                        append-inner-icon="mdi-magnify"
                        clearable
                        @keydown.enter.prevent="onSearch"
                        @blur="state.searchTextTemp = state.searchText"
                        @click:clear="onSearch" />
                </v-col>

                <v-col cols="4">
                    <div class="d-flex align-center">
                         
                        <v-spacer />

                        <v-btn icon size="small" :disabled="state.currentPage == 0 || state.isLoading" @click="back" title="Előző">
                            <v-icon size="x-large" icon="mdi-menu-left"></v-icon>
                        </v-btn>
                        <v-chip v-if="!state.isLoading" variant="outlined" class="mx-2">
                            <span>{{ state.currentPage + 1 }}</span>
                        </v-chip>
                        <v-progress-circular class="mx-2" v-else indeterminate></v-progress-circular>
                        <v-btn icon size="small" :disabled="!hasNextCursor || state.isLoading" @click="forward" title="Következő">
                            <v-icon size="x-large" icon="mdi-menu-right"></v-icon>
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
        </div>
        <div class="my-4 mx-8">
            <v-expansion-panels v-model="state.activeItemIndex" variant="popout">
                <v-expansion-panel
                    v-for="(item, i) in state.items"
                    :key="i"
                    :elevation="i == state.activeItemIndex ? 8 : 3"
                    :style="{'border': i == state.activeItemIndex ? '2px solid mediumorchid' : 'none'}">
                    <v-expansion-panel-title class="d-flex" :height="i == state.activeItemIndex ? 32 : 'auto'" :min-height="i == state.activeItemIndex ? 32 : 'auto'" :class="{'py-0': i == state.activeItemIndex}">
                        <ListItemDisplay v-if="i != state.activeItemIndex" :item="item" class="flex-grow-1" />
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <ListItemEditor 
                            :item="item" 
                            :structure="props.structure" 
                            @columnValueChange="onColumnValueChange" 
                            class="flex-grow-1" />                        
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </div>
    </div>
</template>
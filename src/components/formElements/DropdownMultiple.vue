<script setup lang="ts">
import { ColumnValue, DropdownOption } from '@/plugins/types';
import { computed, nextTick, reactive, ref, watch } from 'vue';

    const props = defineProps<{
        label: string, 
        value: ColumnValue<DropdownOption[]> | null,
        options: DropdownOption[]
        searchable?: boolean
   }>();
    
    const emit = defineEmits<{
        change: [columnId: string, newValue: string[]]
    }>();

    const state = reactive({
        value: props.value.ColumnValue,
        isSaving: false,
        isOpen: false,
        searchText: ""
    });

    const visibleOptions = computed(() => props.options.filter(x => x.caption.toLowerCase().includes(state.searchText.trim().toLowerCase())));

    const onSave = (item: DropdownOption) => {
        state.searchText = "";
        const newValue = props.value.ColumnValue.some(x => x.value == item.value)
            ? props.value.ColumnValue.filter(x => x.value != item.value).map(x => x.value)
            : [...props.value.ColumnValue.map(x => x.value), item.value];

            emit('change', props.value.ColumnId, newValue);
            state.value = props.options.filter(x => newValue.includes(x.value));
            state.isSaving = true;
    }

    watch(() => props.value.ColumnValue, () => {
        state.value = props.value.ColumnValue;
        state.isSaving = false;
    });

    watch(() => state.isOpen, async (isOpen) => {
        await nextTick();
        if(isOpen && searchInput.value) {
            setTimeout(() => searchInput.value.focus(), 100);
        }
    })

    const searchInput = ref(null);

</script>

<template>
  <div>
    <v-menu v-model="state.isOpen" :close-on-content-click="false">
      <template v-slot:activator="{ props: on }">
        <v-select
          :label="props.label" 
          :model-value="state.value"
          :items="state.value"
          :loading="state.isSaving"
          variant="outlined" 
          v-bind="on" 
          readonly 
          hide-details
          multiple
          density="comfortable"
          item-title="caption"
        >
          <template v-slot:selection="{ item }">
            <v-tooltip :text="item.title">
              <template v-slot:activator="{ props: tooltip }">
                <v-avatar v-bind="tooltip" size="small" class="mr-1">
                  <v-img v-if="item.raw.thumb" :src="item.raw.thumb" />
                  <span v-else>{{ item.title[0] }}</span>
                </v-avatar>
              </template>
            </v-tooltip>
          </template>
        </v-select>
      </template>

      <v-list class="pa-0">
        <v-list-item v-if="state.isOpen && props.searchable" class="pa-0">
          <v-text-field
            label="Szűrés"
            v-model="state.searchText"
            density="compact"
            hide-details
            ref="searchInput"
          />
        </v-list-item>

        <v-list-item
          v-for="(item, index) in visibleOptions"
          :key="index"
          @click="onSave(item)"
          :style="{ 
            'background-color': item.color || 'transparent',
            'color': item.color ? 'white' : 'inherit'
          }"
        >
          <template v-slot:prepend v-if="item.thumb">
            <v-avatar>
              <v-img :src="item.thumb" />
            </v-avatar>
          </template>
          <v-list-item-title>{{ item.caption }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
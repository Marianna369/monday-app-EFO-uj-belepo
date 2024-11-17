<script setup lang="ts">
import { Attachment } from '@/plugins/types';
import FileUploadButton from './FileUploadButton.vue';
import { reactive, watch } from 'vue';

    const props = defineProps<{
        label: string,
        attachments: Attachment[]
    }>();

    const emit = defineEmits<{
        attachmentAdded: [file: File]
    }>();

    const state = reactive({
        isSaving: false
    });

    const open = (attachment: Attachment) => {
        window.open(attachment.Url, "_blank");
    }

    const onFileSelected = (file: File) => {
        emit('attachmentAdded', file);
        state.isSaving = true;
    }

    watch(() => props.attachments.length, () => {
        state.isSaving = false;
    })
</script>

<template>
    <div>
        <v-text-field v-if="attachments.length < 2" :label="label" variant="outlined" readonly model-value=" " hide-details density="compact">
            <FileUploadButton v-if="attachments.length == 0" :is-saving="state.isSaving" @file-selected="onFileSelected" />
            <v-chip v-else @click="open(attachments[0])" class="singleAttachmentChip" style="width: calc(100% - 2px); padding: 14px 0;">
                <v-avatar class="mr-2">
                    <v-img v-if="attachments[0].ThumbnailUrl" :src="attachments[0].ThumbnailUrl"></v-img>
                    <v-icon v-else-if="attachments[0].Extension == '.pdf'" size="x-large" color="red" icon="mdi-file-pdf-box"></v-icon>
                    <v-icon v-else icon="mdi-file-download-outline" size="x-large"></v-icon>
                </v-avatar>
                <span class="text-truncate">{{ attachments[0].Name }}</span>
            </v-chip>
        </v-text-field>
        <v-menu v-else :close-on-content-click="false">
            <template v-slot:activator="{ props: on }">
                <v-select
                :label="props.label" 
                :model-value="`${props.attachments.length} attachments`"
                :items="[]"
                variant="outlined" 
                v-bind="on" 
                readonly 
                hide-details>            
            </v-select>
            </template>
        <v-list class="pa-0">
            <v-list-item
                v-for="(item, index) in props.attachments"
                :key="index"
                :value="index"
                @click="open(item)"            
                >
                <template v-slot:prepend>
                    <v-avatar>
                        <v-img v-if="item.ThumbnailUrl" :src="item.ThumbnailUrl"></v-img>
                        <v-icon v-else-if="item.Extension == '.pdf'" size="x-large" color="red" icon="mdi-file-pdf-box"></v-icon>
                        <v-icon v-else icon="mdi-file-download-outline" size="x-large"></v-icon>
                    </v-avatar>
                </template>

                <v-list-item-title>{{ item.Name }}</v-list-item-title>
                </v-list-item>
        </v-list>
        </v-menu>
    </div>
</template>

<style scoped>
    .singleAttachmentChip :deep(.v-chip__content) {
        min-width: 0;
    }
</style>
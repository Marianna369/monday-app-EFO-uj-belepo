<script setup lang="ts">
import { MainBoardItem, MainBoardStructure } from '@/plugins/types';
import TextField from './formElements/TextField.vue';
import DatePicker from './formElements/DatePicker.vue';
import Dropdown from './formElements/Dropdown.vue';
import Attachments from './formElements/Attachments.vue';
import { computed, reactive, Ref, watch } from 'vue';
import moment from 'moment';
import DropdownMultiple from './formElements/DropdownMultiple.vue';

const props = defineProps<{
    item: MainBoardItem, 
    structure: MainBoardStructure,
    isKimeno: boolean
}>();

const emit = defineEmits<{
    columnValueChange: [itemId: number, columnId: string, newValue: string],
    kiszignalasCimzettjeChange: [itemId: number, columnId: string, newValue: string[]],
    attachmentAdded: [itemId: number, columnId: string, file: File],
    fileDocument: [itemId: number],
    deleteDocument: [itemId: number],
    kiszignalas: [itemId: number]
}>();

const state = reactive({
    isLoading: false,
    isDeleting: false,
    isKiszignalasLoading: false
});

const canFileDocument = computed(() => {
    let isValid = 
        props.item.DokumentumTipus.ColumnValue != null &&
        props.item.PartnerTipus.ColumnValue != null &&
        props.item.DokumentumAltipus.ColumnValue != null &&
        props.item.Sajatceg.ColumnValue != null &&
        !!props.item.DokumentumNeve.ColumnValue?.trim();

    if(!props.isKimeno) {
        isValid = isValid &&
            props.item.ApolloUzletag != null &&
            props.item.ApolloProjektnev != null &&
            props.item.ApolloMunkahely != null &&
            props.item.BoraVisszajott.ColumnValue != null &&
            props.item.KiszignalasCimzettje.ColumnValue != null;
    }
        
    return isValid;
})

const onColumnValueChange = (columnId: string, newValue: string) => {
    emit('columnValueChange', props.item.Id, columnId, newValue);
}

const onKiszignalasCimzettjeChange = (columnId: string, newValue: string[]) => {
    emit('kiszignalasCimzettjeChange', props.item.Id, columnId, newValue);
}

const onAttachmentAdded = (file: File) => {
    emit('attachmentAdded', props.item.Id, import.meta.env.VITE_COLUMN_ID_FILES, file);
}

const onIktatasClick = () => {
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

const onKiszignalasClick = () => {
    state.isKiszignalasLoading = true;
    emit('kiszignalas', props.item.Id);
}

watch(() => props.item.KiszignalasDatuma.ColumnValue, () => {
    state.isKiszignalasLoading = false;
})

</script>

<template>
    <div class="pb-4">
        <v-row>
            <v-col cols="4">
                <TextField label="Név" :value="props.item.Name" @change="onColumnValueChange" />
            </v-col>
            <v-col cols="2" class="d-flex">
                <v-text-field label="Iktatószám" :model-value="props.item.IktatoSzam.ColumnValue" variant="outlined" hide-details density="comfortable" readonly/>
            </v-col>
            <v-col cols="2">
                <v-text-field label="Rögzítve" :model-value="item.Rogzitve.ColumnValue ? moment(item.Rogzitve.ColumnValue).format('YYYY-MM-DD') : null" variant="outlined" hide-details density="comfortable" readonly/>
            </v-col>
            <v-col cols="2">
                <DropdownDisplay label="Formátum" :value="item.Formatum" />
            </v-col>
            <v-col v-if="!isKimeno" cols="2">
                <Dropdown label="BO-ra visszajött" class="flex-grow-1" :value="props.item.BoraVisszajott" :options="props.structure.BoraVisszajott.options" @change="onColumnValueChange" />
            </v-col> 
        </v-row>

        <v-row>
            <v-col cols="2">
                <Attachments label="Csatolt fájl" :attachments="item.Files" @attachment-added="onAttachmentAdded" />
            </v-col>
            <v-col cols="2">
                <v-text-field label="Eredeti név" :model-value="props.item.EredetiNev.ColumnValue" variant="outlined" hide-details density="comfortable" readonly/>
            </v-col>    
            <v-col cols="2">
                <DatePicker label="Dokumentum kelte" :value="props.item.DokumentumKelte" @change="onColumnValueChange" />
            </v-col>
            <v-col cols="2">
                <DatePicker label="Feladás dátuma" :value="props.item.FeladasDatuma" @change="onColumnValueChange" />
            </v-col>
            <v-col cols="2">
                <TextField label="Feladási bizonylat" :value="props.item.FeladasiBizonylat" @change="onColumnValueChange" />
            </v-col>   
            <v-col cols="2">
                <Dropdown label="Feladás/érkezés" :value="props.item.FeladasErkezes" :options="structure.FeladasErkezes.options" @change="onColumnValueChange" />
            </v-col>     
        </v-row>

        <v-row>
            <v-col cols="2">
                <TextField label="Dokumentum neve" :value="props.item.DokumentumNeve" @change="onColumnValueChange" />
            </v-col>
            <v-col cols="4">
                <TextField label="Dokumentum tárgya" :value="props.item.DokumentumTargya" @change="onColumnValueChange" />
            </v-col>
            <v-col cols="2" class="d-flex">
                <TextField label="Dokumentum sorszám" :value="props.item.DokumentumSorszam" @change="onColumnValueChange" />
            </v-col>
            <v-col cols="2">
                <Dropdown label="Dokumentum típus" class="flex-grow-1" :value="props.item.DokumentumTipus" :options="props.structure.DokumentumTipus.options" @change="onColumnValueChange"  />
            </v-col>
            <v-col cols="2">
                <Dropdown label="Dokumentum altípus" class="flex-grow-1" :value="props.item.DokumentumAltipus" :options="props.structure.DokumentumAltipus.options" @change="onColumnValueChange" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="2">
                <Dropdown label="Apollo partner" :value="props.item.ApolloPartner" :options="structure.ApolloPartner.options" @change="onColumnValueChange" searchable />
            </v-col>
            <v-col cols="4">
                <v-text-field label="Postázási cím" :model-value="props.item.ApolloPartner.ColumnValue?.additionalInfo" variant="outlined" hide-details density="comfortable" readonly/>
            </v-col>
            <v-col cols="2" class="d-flex">
                <TextField label="Email" :value="props.item.Email" email :onBeforeSave="x => `${x} ${x}`" @change="onColumnValueChange" />
            </v-col>  
            <v-col cols="2">
                <Dropdown label="Partner típus" class="flex-grow-1" :value="props.item.PartnerTipus" :options="props.structure.PartnerTipus.options" @change="onColumnValueChange" />
            </v-col>          
        </v-row>

        <v-row>
            <v-col cols="2">
                <Dropdown label="Saját cég" class="flex-grow-1" :value="props.item.Sajatceg" :options="props.structure.Sajatceg.options" @change="onColumnValueChange" />
            </v-col>
            <v-col cols="2">
                <Dropdown label="Ktg kategória" class="flex-grow-1" :value="props.item.KtgKategoria" :options="props.structure.KtgKategoria.options" @change="onColumnValueChange" />
            </v-col>
            <v-col v-if="!isKimeno" cols="2">
                <DropdownMultiple label="Kiszignálás címzettje" :value="props.item.KiszignalasCimzettje" :options="structure.KiszignalasCimzettje.options" @change="onKiszignalasCimzettjeChange" />
            </v-col>
            <v-col v-if="!isKimeno" cols="2">
                <v-text-field label="Kiszignálás dátuma" :model-value="item.KiszignalasDatuma.ColumnValue ? moment(item.KiszignalasDatuma.ColumnValue).format('YYYY-MM-DD') : null" variant="outlined" hide-details density="comfortable" readonly/>
            </v-col>
            <v-col v-if="!isKimeno" cols="2" class="d-flex align-center">
                <v-btn text="Kiszignálás" @click="onKiszignalasClick" :loading="state.isKiszignalasLoading" color="light-blue-darken-1" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="2">
                <Dropdown label="Monday projektszám" :value="props.item.MondayProjektszam" :options="structure.MondayProjektszam.options" @change="onColumnValueChange" searchable />
            </v-col>
            <v-col cols="2">
                <Dropdown label="Apollo üzletág (munkaszám)" :value="props.item.ApolloUzletag" :options="structure.ApolloUzletag.options" @change="onColumnValueChange" searchable />
            </v-col>
            <v-col cols="2">
                <Dropdown label="Apollo projektnév (analitika 1)" :value="props.item.ApolloProjektnev" :options="structure.ApolloProjektnev.options" @change="onColumnValueChange" searchable />
            </v-col>
            <v-col cols="2">
                <Dropdown label="Apollo munkahely (analitika 3)" :value="props.item.ApolloMunkahely" :options="structure.ApolloMunkahely.options" @change="onColumnValueChange" searchable />
            </v-col>
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
                <v-btn :disabled="!canFileDocument || state.isDeleting" :loading="state.isLoading" @click="onIktatasClick" color="green" prepend-icon="mdi-file-document-check" size="large">Iktatás</v-btn>
            </v-col>   
        </v-row>

    </div>
</template>
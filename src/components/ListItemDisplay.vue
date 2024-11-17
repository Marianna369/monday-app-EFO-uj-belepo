<script setup lang="ts">
import { MainBoardItem } from '@/plugins/types';
import moment from 'moment';
import DropdownDisplay from './formElements/DropdownDisplay.vue';

defineProps<{
    item: MainBoardItem,
    isKimeno: boolean
}>();

</script>

<template>
    <v-row>
        <v-col cols="4">
            <v-text-field label="Név" :model-value="item.Name.ColumnValue" variant="outlined" readonly density="compact" hide-details />
        </v-col>
        <v-col cols="2">
            <v-text-field label="Iktatószám" :model-value="item.IktatoSzam.ColumnValue" variant="outlined" readonly density="compact" hide-details />
        </v-col>
        <v-col cols="2">
            <v-text-field label="Rögzítve" :model-value="item.Rogzitve.ColumnValue ? moment(item.Rogzitve.ColumnValue).format('YYYY-MM-DD') : null" variant="outlined" readonly density="compact" hide-details />
        </v-col>
        <v-col cols="2">
            <DropdownDisplay label="Formátum" :value="item.Formatum" dense />
        </v-col>
        <v-col v-if="!isKimeno" cols="2">
            <DropdownDisplay label="BO-ra visszajött" :value="item.BoraVisszajott" dense />
        </v-col>
    </v-row>
</template>
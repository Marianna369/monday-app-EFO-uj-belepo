<script setup lang="ts">
import { ColumnType, MainBoardItem, MainBoardStructure } from '@/plugins/types';
import TextField from './formElements/TextField.vue';
import DatePicker from './formElements/DatePicker.vue';
import Dropdown from './formElements/Dropdown.vue';
import { computed, reactive, onMounted } from 'vue';
import MondayApi from '@/plugins/MondayApi';

const props = defineProps<{
    item: MainBoardItem, 
    structure: MainBoardStructure 
}>();

onMounted(async () => {
    const me = await MondayApi.getMe();
    state.adoazonositok = await MondayApi.getAdoazonositok(import.meta.env.VITE_TABLE_ID, import.meta.env.VITE_COLUMN_ID_ADOAZONOSITO);
    props.item.EFO_igenylo.ColumnValue = props.structure.EFO_igenylo.options.find(x => x.value == me.email);
    props.item.Munkakor.ColumnValue = props.structure.Munkakor.options.find(x => x.caption.toLowerCase() == "Takarító".toLowerCase());
    props.item.Allampolgarsag.ColumnValue = "magyar";
});

const state = reactive({
    isLoading: false,
    isDeleting: false,
    dialogAfterSave : false,
    dialogTitle: '',
    dialogText: '',
    adoazonositok: [],
    koltseghelyOptions: []
});

const canFileDocument = computed(() => {
    let isValid=true;
    return isValid;
})

const onFelvitelClick = async () => {
    if(props.item.Name.ColumnValue != "" && props.item.Adoazonosito.ColumnValue != "" && AdoazonositoEll(props.item.Adoazonosito.ColumnValue) 
        //&& props.item.Szuletesi_ido.ColumnValue != null as Date && Array.isArray(props.item.EFO_jovahagyo.ColumnValue) && props.item.EFO_jovahagyo.ColumnValue.length > 0
        && props.item.Szuletesi_ido.ColumnValue != null as Date
        && props.item.Szuletesi_hely.ColumnValue != "" && props.item.Szuletesi_nev.ColumnValue != "" && props.item.Anyja_neve.ColumnValue != ""
        && props.item.Lakcim.ColumnValue != "" && props.item.Allampolgarsag.ColumnValue != "" && props.item.Tajszam.ColumnValue != "" && TajszamEll(props.item.Tajszam.ColumnValue)
        && props.item.Bankszamlaszam.ColumnValue != "" && BankszamlaszamEll(props.item.Bankszamlaszam.ColumnValue)
        ) {
        try{
            await MondayApi.insMainBoardItem(props.structure, import.meta.env.VITE_TABLE_ID, props.item);

            state.dialogAfterSave = true;
            state.dialogTitle= 'Sikeres mentés';
            state.dialogText='A tétel sikeresen el lett mentve.';
        } catch(error: unknown){
            if (error instanceof Error){
                state.dialogAfterSave = true;
                state.dialogTitle= 'Sikertelen mentés';
                state.dialogText=error.message;
            }
        }
    }
    else {
        state.dialogAfterSave = true;
        state.dialogTitle= 'Sikertelen mentés';
        state.dialogText='Kérem ellenőrizze a beírt adatokat!';
    }
}

const onColumnValueChange = (columnId: string, columnValue: string, newValue: string) => {
    const column = Object.values(props.item).find(x => x && x.ColumnId == columnId);
    
    switch (column.ColumnType) {
        case ColumnType.Date: 
            column.ColumnValue=new Date(columnValue);    
            break;
        default:
            column.ColumnValue=columnValue;    
            break;
    }
    column.ColumnValid = true;
}

const AdoazonositoEll = (columnValue: string) => {
    let isValid = true;
    if (columnValue.length !=10){
        return false;
    }
    if (isNaN(Number(columnValue))){
        return false;
    }
    if(columnValue[0] != '8'){
        return false;
    }
    let nCDV = 0;
    for (let i=0; i<9; i++){
        nCDV = nCDV + (i+1)*Number(columnValue[i]);
    }
    if(nCDV%11 != Number(columnValue[9])){
        return false;
    }
    const extractedStr = columnValue.substring(1, 6); 
    const extractedInt = parseInt(extractedStr, 10);
    const today = new Date();
    const referenceDate = new Date("1867-01-01");
    const diffInMs = Math.abs(today.getTime() - referenceDate.getTime());
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const szuldat = new Date(extractedInt * 1000 * 60 * 60 * 24 + referenceDate.getTime());
    const szuldatmegad = new Date(props.item.Szuletesi_ido.ColumnValue);
    
    function toUTCDateOnly(date: Date): Date {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }

    const szuldatUTC = toUTCDateOnly(szuldat);
    const szuldatmegadUTC = toUTCDateOnly(szuldatmegad);

    if (szuldatUTC.getTime() !== szuldatmegadUTC.getTime()) {
        return false;
    }
    if (extractedInt > diffInDays){
        return false;
    }
    if (columnValue.length ==10 && isValid){
        if (state.adoazonositok.find(x => x.column_values[0].text == columnValue)){
            isValid = false;
        }
    }

    return isValid;
}

const TajszamEll = (columnValue: string) => {
    let isValid = true;
    if (columnValue.length !=9){
        isValid = false;
    }
    if (isNaN(Number(columnValue))){
        isValid = false;
    }
    let nCDV = 0;
    for (let i=1; i<9; i++){
        nCDV = nCDV + Number(columnValue[i-1])*(3+4*((i-1)%2));
    }
    if(nCDV%10 != Number(columnValue[8])){
        isValid = false;
    }

    return isValid;
}

const BankszamlaszamEll = (columnValue: string) => {
    let isValid = true;
    let cSzla="";
    if (!((columnValue.length == 17) || (columnValue.length == 26))){
        isValid = false;
    }
    if (columnValue.length == 17){
        cSzla=columnValue.substring(0,8)+columnValue.substring(9,17);
    }
    if (columnValue.length == 26){
        cSzla=columnValue.substring(0,8)+columnValue.substring(9,17)+columnValue.substring(18,26);
    }
    if (isNaN(Number(cSzla))){
        isValid = false;
    }
    let aCDV = [9,7,3,1];
    let nCDV = 0;
    for (let i=1; i<8; i++){
        nCDV = nCDV + Number(cSzla[i-1])*aCDV[((i-1)%4)];
    }
    if((10-nCDV%10)%10 != Number(columnValue[7])){
        isValid = false;
    }

    return isValid;
}

const onEFO_igenyloChange = (columnId: string, newValue: string) => {
    const column = Object.values(props.item).find(x => x && x.ColumnId == columnId);
    column.ColumnValue=props.structure.EFO_igenylo.options.filter(x => x.value == newValue)[0];
    let teams = props.structure.EFO_igenylo.options.filter(x => x.value == newValue)[0].teams;

    props.structure.Szurt_koltseghely.options = props.structure.Koltseghely.options.filter(x => teams.find(t => t.name == x.additionalInfo));
    props.item.Koltseghely = {ColumnId: 'VITE_COLUMN_ID_KOLTSEGHELY', ColumnValue:  {caption: "", value: "", color:"", teams:[], thumb:"", additionalInfo:""}, ColumnType: ColumnType.Dropdown, ColumnValid: false};
}

const onKoltseghelyChange = (columnId: string, newValue: string) => {
    const column = Object.values(props.item).find(x => x && x.ColumnId == columnId);
    column.ColumnValue=props.structure.Koltseghely.options.filter(x => x.value == newValue)[0];
}

/*
const onEFO_jovahagyoChange = (columnId: string, newValue: string[]) => {
    const column = Object.values(props.item).find(x => x && x.ColumnId == columnId);
    column.ColumnValue=props.structure.EFO_jovahagyo.options.filter(x => newValue.includes(x.value));
}
*/

const onMunkakorChange = (columnId: string, newValue: string) => {
    const column = Object.values(props.item).find(x => x && x.ColumnId == columnId);
    column.ColumnValue=props.structure.Munkakor.options.filter(x => x.value == newValue)[0];
}

const onKoltseghelySearch = async (searchText: string) => {
    console.log("Költséghely keresés indul...")
    console.log(searchText);
    if (!searchText || searchText.length < 2) {
        state.koltseghelyOptions = [];
        return;
    }

    state.isLoading = true;
    try {
        console.log("Itt kéne vmi response...")

        // Feltételezve, hogy a data egy tömb, ezt igazítsd az API-d szerint
        state.koltseghelyOptions = await MondayApi.getFilteredKoltseghelyek(import.meta.env.VITE_KTGHELY_TABLE_ID, import.meta.env.VITE_COLUMN_ID_KOLTSEGHELY,searchText);
    } catch (error) {
        console.error("Költséghely keresési hiba:", error);
        state.koltseghelyOptions = [];
    } finally {
        state.isLoading = false;
    }
};

</script>

<template>
    <div class="pb-4">
        <v-row>
            <v-col cols="6">
                <TextField label="Név *" :value="props.item.Name" @change="onColumnValueChange" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <TextField label="Születési hely *" :value="props.item.Szuletesi_hely" @change="onColumnValueChange" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <DatePicker label="Születési idő *" :value="props.item.Szuletesi_ido" @change="onColumnValueChange" :rules = "[ AdoazonositoEll]"/>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <Dropdown label="EFO igénylő *" :value="props.item.EFO_igenylo" :options="structure.EFO_igenylo.options" :searchable="true" @change="onEFO_igenyloChange" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <Dropdown label="Munkakör *" :value="props.item.Munkakor" :options="structure.Munkakor.options" :searchable="true" @change="onMunkakorChange" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <Dropdown label="Költséghely *" :value="props.item.Koltseghely" :options="state.koltseghelyOptions" :searchable="true" @change="onKoltseghelyChange" @search="onKoltseghelySearch" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <TextField label="Adóazonosító (egyben adja meg a 10 számjegyet)*" :value="props.item.Adoazonosito" @change="onColumnValueChange" :rules = "[ AdoazonositoEll]"/>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <TextField label="Születési név *" :value="props.item.Szuletesi_nev" @change="onColumnValueChange" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <TextField label="Anyja neve *" :value="props.item.Anyja_neve" @change="onColumnValueChange" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <TextField label="Lakcím *" :value="props.item.Lakcim" @change="onColumnValueChange" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <TextField label="Állampolgárság *" :value="props.item.Allampolgarsag" @change="onColumnValueChange" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <TextField label="Tajszám (egyben adja meg a 9 számjegyet) *" :value="props.item.Tajszam" @change="onColumnValueChange" :rules = "[ TajszamEll]"/>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <TextField label="Bankszámlaszám (8 számjegyenként - jellel elválasztva adja meg)*" :value="props.item.Bankszamlaszam" @change="onColumnValueChange" :rules = "[ BankszamlaszamEll]"/>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <v-btn :disabled="!canFileDocument || state.isDeleting" :loading="state.isLoading" @click="onFelvitelClick" color="green" prepend-icon="mdi-file-document-check" size="large">Felvitel</v-btn>

                <v-dialog v-model="state.dialogAfterSave" max-width="500">
                <v-card>
                    <v-card-title>{{ state.dialogTitle }}</v-card-title> 
                    <v-card-text> {{ state.dialogText }} </v-card-text>
                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="state.dialogAfterSave = false">OK</v-btn>
                    </v-card-actions>
                </v-card>
                </v-dialog>

            </v-col>   
        </v-row>

    </div>

</template>
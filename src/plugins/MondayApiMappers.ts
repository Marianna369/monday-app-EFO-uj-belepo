import MondayApi from "./MondayApi";
import { MainBoardStructure, ColumnValue, DropdownColumn, DropdownOption, MainBoardItem, MainBoardItemRaw, ColumnType, Attachment } from "./types";

export const mapBoardStructure = async (cols: { id: string; settings_str: string; }[], users: { id: string; name: string; email:string, teams: { id: string; name: string;}[], photo_thumb_small: string}[], teams: { id: string; name: string; picture_url: string;}[]): Promise<MainBoardStructure> => {
    return {
        EFO_igenylo: mapPeopleColumn(cols.find(x => x.id == import.meta.env.VITE_COLUMN_ID_EFO_IGENYLO), users, []),
        //EFO_jovahagyo: mapPeopleColumn(cols.find(x => x.id == import.meta.env.VITE_COLUMN_ID_EFO_JOVAHAGYO), users, teams),
        Munkakor: await mapDropdownColumn(cols.find(x => x.id == import.meta.env.VITE_COLUMN_ID_MUNKAKOR)!),
        Koltseghely: await mapBoardRelationColumn(cols.find(x => x.id == import.meta.env.VITE_COLUMN_ID_KOLTSEGHELY)!),
        Szurt_koltseghely: await mapBoardRelationColumn(cols.find(x => x.id == import.meta.env.VITE_COLUMN_ID_KOLTSEGHELY)!)
    }
}

const mapDropdownColumn = (source:{id:string,settings_str:string}) : DropdownColumn => {
    const settings = JSON.parse(source.settings_str);
    const column = {
        id: source.id,
        isConnectedBoard: false,
        isPersonOrTeam: false,
        options: [] as DropdownOption[]
    };
    Object.entries(settings.labels).map(([k,v]) => {
        column.options[<any>k] = {
            value: k,
            caption: (<any>v).name,
        } as DropdownOption;
    });

    return column;
}

const mapBoardRelationColumn = async (source:{id:string,settings_str:string}) : Promise<DropdownColumn> => {  
    const settings = JSON.parse(source.settings_str);
    const values = await MondayApi.getFullBoardItems(settings.boardIds);
    return {
        id: source.id,
        isConnectedBoard: true,
        isPersonOrTeam: false,
        options: values.map(x => {
            return {
                value: x.id,
                caption: x.name,
                additionalInfo: x.column_values.filter(v => v.id == import.meta.env.VITE_COLUMN_ID_EFO_IGENYLO_KTG)[0].text,
                thumb: x.column_values.filter(v => v.id == import.meta.env.VITE_COLUMN_ID_EFO_JOVAHAGYO_KTG)[0].text
            } as DropdownOption
        })
    }
}

const mapPeopleColumn = (source:{id:string,settings_str:string}, users: {id:string, name:string, email:string, teams: { id: string; name: string;}[], photo_thumb_small: string}[], teams: { id: string; name: string; picture_url: string;}[]): DropdownColumn => {

    const userOptions = users.map(x => {
        return {
            value: x.email,
            caption: x.name,
            thumb: x.photo_thumb_small,
            teams: x.teams
        } as DropdownOption
    });
    const teamOptions = teams.map(x => {
        return {
            value: "T" + x.id,
            caption: x.name,
            thumb: x.picture_url
        } as DropdownOption
    });

    return {
        id: source.id,
        isConnectedBoard: false,
        isPersonOrTeam: true,
        options: [...userOptions, ...teamOptions]
    }
}

export const mapMainBoardItem = (item: MainBoardItemRaw, structure: MainBoardStructure): MainBoardItem => {
    return {
        Id: item.id,
        
        Name: { ColumnId: import.meta.env.VITE_COLUMN_ID_NAME, ColumnValue: item.name, ColumnType: ColumnType.String, ColumnValid: true},
        Adoazonosito: mapStringBoardItemValue(import.meta.env.VITE_COLUMN_ID_ADOAZONOSITO, item),
        Szuletesi_ido: mapDateBoardItemValue(import.meta.env.VITE_COLUMN_ID_SZULETESI_IDO, item),
        Szuletesi_hely: mapStringBoardItemValue(import.meta.env.VITE_COLUMN_ID_SZULETESI_HELY, item),
        EFO_igenylo: mapUserBoardItemValue(structure.EFO_igenylo, item),
        //EFO_jovahagyo: mapUserBoardItemValueMultiple(structure.EFO_jovahagyo, item),
        Munkakor: mapDropdownBoardItemValue(structure.Munkakor, item),
        Koltseghely: mapConnectedBoardItemValue(structure.Koltseghely, item),
        Szuletesi_nev: mapStringBoardItemValue(import.meta.env.VITE_COLUMN_ID_SZULETESI_NEV, item),
        Anyja_neve: mapStringBoardItemValue(import.meta.env.VITE_COLUMN_ID_ANYJA_NEVE, item),
        Lakcim: mapStringBoardItemValue(import.meta.env.VITE_COLUMN_ID_LAKCIM, item),
        Allampolgarsag: mapStringBoardItemValue(import.meta.env.VITE_COLUMN_ID_ALLAMPOLGARSAG, item),
        Tajszam: mapStringBoardItemValue(import.meta.env.VITE_COLUMN_ID_TAJSZAM, item),
        Bankszamlaszam: mapStringBoardItemValue(import.meta.env.VITE_COLUMN_ID_BANKSZAMLASZAM, item),
    }
}

const mapStringBoardItemValue = (columnId: string, item: MainBoardItemRaw, isEmail = false): ColumnValue<string> => {
    let value = item.column_values.find(x => x.id == columnId).text;
    if(isEmail) {
        value = value.substring(0, value.indexOf(" "));
    }

    return {
        ColumnId: columnId,
        ColumnValue: value,
        ColumnType: ColumnType.String,
        ColumnValid: true
    }
}

const mapDateBoardItemValue = (columnId: string, item: MainBoardItemRaw): ColumnValue<Date> => {
    const dateStr = item.column_values.find(x => x.id == columnId).text;
    const date = dateStr != null && dateStr.trim() != "" ?  new Date(dateStr) : null;
    return {
        ColumnId: columnId,
        ColumnValue: date,
        ColumnType: ColumnType.Date,
        ColumnValid: true
    }
}

const mapDropdownBoardItemValue = (column: DropdownColumn, item: MainBoardItemRaw): ColumnValue<DropdownOption> => {
    // index based
    let option: DropdownOption = null;
    const valStr = item.column_values.find(x => x.id == column.id).value;
    if(valStr != null) {
        const val: {index: number, post_id: string, changed_at: string} = JSON.parse(valStr);
        if(val.index !== undefined) {
            option = column.options[val.index];
        }
    }

    return {
        ColumnId: column.id,
        ColumnValue: option,
        ColumnType: ColumnType.Dropdown,
        ColumnValid: true
    };
}

const mapConnectedBoardItemValue = (column: DropdownColumn, item: MainBoardItemRaw): ColumnValue<DropdownOption> => {
    // id based
    
    let option: DropdownOption = null;
    const valStr = item.column_values.find(x => x.id == column.id).value;
    if(valStr != null) {
        const val: {changed_at: string, linkedPulseIds: {linkedPulseId: number}[]} = JSON.parse(valStr);
        if(val.linkedPulseIds !== undefined && val.linkedPulseIds.length > 0) {
            option = column.options.find(x => x.value == val.linkedPulseIds[0].linkedPulseId.toString());
        }
    }

    return {
        ColumnId: column.id,
        ColumnValue: option,
        ColumnType: ColumnType.ConnectedBoard,
        ColumnValid: true
    };
}

const mapUserBoardItemValue = (column: DropdownColumn, item: MainBoardItemRaw): ColumnValue<DropdownOption> => {
    let option: DropdownOption = null;
    const valStr = item.column_values.find(x => x.id == column.id).value;
    if(valStr != null) {
        const val: {index: number, post_id: string, changed_at: string} = JSON.parse(valStr);
        if(val.index !== undefined) {
            option = column.options[val.index];
        }    }

    return {
        ColumnId: column.id,
        ColumnValue: option,
        ColumnType: ColumnType.User,
        ColumnValid: true
    };
}

/*
const mapUserBoardItemValueMultiple = (column: DropdownColumn, item: MainBoardItemRaw): ColumnValue<DropdownOption[]> => {
    let option: DropdownOption[] = [];
    const valStr = item.column_values.find(x => x.id == column.id).value;
    if(valStr != null) {
        const val: {personsAndTeams: {id: number, kind: string}[], changed_at: string} = JSON.parse(valStr);
        option = column.options.filter(x => val.personsAndTeams.map(p => p.id.toString()).includes(x.value.substring(1)));
    }

    return {
        ColumnId: column.id,
        ColumnValue: option,
        ColumnType: ColumnType.User,
        ColumnValid: true
    };
}
*/

export const mapAttachment = (attachment: {id: string, name: string, file_extension: string, url: string, url_thumbnail: string}) : Attachment => {
    return {
        Id: attachment.id,
        Name: attachment.name,
        Extension: attachment.file_extension,
        Url: attachment.url,
        ThumbnailUrl: attachment.url_thumbnail
    }
}
import MondayApi from "./MondayApi";
import { MainBoardStructure, ColumnValue, DropdownColumn, DropdownOption, MainBoardItem, MainBoardItemRaw, ColumnType, Attachment } from "./types";

export const mapBoardStructure = async (cols: { id: string; settings_str: string; }[], users: { id: string; name: string; photo_thumb_small: string}[], teams: { id: string; name: string; picture_url: string;}[]): Promise<MainBoardStructure> => {
    return {
        EFO_igenylo: mapPeopleColumn(cols.find(x => x.id == import.meta.env.VITE_COLUMN_ID_EFO_IGENYLO), users, teams),
    }
}

const mapStatusColumn = (source:{id:string,settings_str:string}) : DropdownColumn => {
    const settings = JSON.parse(source.settings_str);
    const column = {
        id: source.id,
        isConnectedBoard: false,
        isPersonOrTeam: false,
        options: [] as DropdownOption[]
    };
    Object.entries(settings.labels).map(([k,v]) => {
        column.options[<any>k] = {
            value: v, //k,
            caption: v,
            color: settings.labels_colors[k].color
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
            } as DropdownOption
        })
    }
}
const mapApolloPartnerColumn = async (source:{id:string,settings_str:string}) : Promise<DropdownColumn> => {
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
                additionalInfo: (
                    x.column_values.find(c => c.id == import.meta.env.VITE_APOLLO_PARTNER_COLUMN_ID_CIM1)?.text + " " +
                    x.column_values.find(c => c.id == import.meta.env.VITE_APOLLO_PARTNER_COLUMN_ID_CIM2)?.text + " " +
                    x.column_values.find(c => c.id == import.meta.env.VITE_APOLLO_PARTNER_COLUMN_ID_CIM3)?.text).trim()
            } as DropdownOption
        })
    }
}

const mapPeopleColumn = (source:{id:string,settings_str:string}, users: {id:string, name:string, photo_thumb_small: string}[], teams: { id: string; name: string; picture_url: string;}[]): DropdownColumn => {
    const userOptions = users.map(x => {
        return {
            value: "U" + x.id,
            caption: x.name,
            thumb: x.photo_thumb_small
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
        
        Name: { ColumnId: import.meta.env.VITE_COLUMN_ID_NAME, ColumnValue: item.name, ColumnType: ColumnType.String },
        Szuletesi_ido: mapDateBoardItemValue(import.meta.env.VITE_COLUMN_ID_SZULETESI_IDO, item),
        Szuletesi_hely: mapStringBoardItemValue(import.meta.env.VITE_COLUMN_ID_SZULETESI_HELY, item),
        EFO_igenylo: mapUserBoardItemValue(structure.EFO_igenylo, item),
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
        ColumnType: ColumnType.String
    }
}

const mapDateBoardItemValue = (columnId: string, item: MainBoardItemRaw): ColumnValue<Date> => {
    const dateStr = item.column_values.find(x => x.id == columnId).text;
    const date = dateStr != null && dateStr.trim() != "" ?  new Date(dateStr) : null;
    return {
        ColumnId: columnId,
        ColumnValue: date,
        ColumnType: ColumnType.Date
    }
}

const mapStatusBoardItemValue = (column: DropdownColumn, item: MainBoardItemRaw): ColumnValue<DropdownOption> => {
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
        ColumnType: ColumnType.Status
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
        ColumnType: ColumnType.ConnectedBoard
    };
}

const mapUserBoardItemValue = (column: DropdownColumn, item: MainBoardItemRaw): ColumnValue<DropdownOption[]> => {
    let option: DropdownOption[] = [];
    const valStr = item.column_values.find(x => x.id == column.id).value;
    if(valStr != null) {
        const val: {personsAndTeams: {id: number, kind: string}[], changed_at: string} = JSON.parse(valStr);
        option = column.options.filter(x => val.personsAndTeams.map(p => p.id.toString()).includes(x.value.substring(1)));
    }

    return {
        ColumnId: column.id,
        ColumnValue: option,
        ColumnType: ColumnType.User
    };
}

const mapAttachments = (item: MainBoardItemRaw) : Attachment[] => {
    return item.assets.map(x => mapAttachment(x));
}

export const mapAttachment = (attachment: {id: string, name: string, file_extension: string, url: string, url_thumbnail: string}) : Attachment => {
    return {
        Id: attachment.id,
        Name: attachment.name,
        Extension: attachment.file_extension,
        Url: attachment.url,
        ThumbnailUrl: attachment.url_thumbnail
    }
}
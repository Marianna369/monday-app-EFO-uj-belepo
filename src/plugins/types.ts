export type MainBoardItemRaw = {
    id: number, 
    name: string, 
    column_values: {
        id: string, 
        value: string, 
        text: string
    }[]
};

export interface DropdownColumn {
    id: string;
    isConnectedBoard: boolean;
    isPersonOrTeam: boolean;
    options: DropdownOption[];
}

export interface DropdownOption {
    value: string;
    caption: string;
    color: string | null;
    thumb: string | null;
    additionalInfo: string | null;
    teams: { id: string; name: string;}[] | null;
}

export interface MainBoardStructure {
    EFO_igenylo: DropdownColumn;
    //EFO_jovahagyo: DropdownColumn;
    Munkakor: DropdownColumn;
    Koltseghely: DropdownColumn;
    //Szurt_koltseghely: DropdownColumn;
}

export interface SimpleBoardItem {
    id: string;
    name: string;
}

export interface UserItem {
    id: string;
    name: string;
    email: string;
}

export interface FullBoardItem {
    id: string;
    name: string;
    column_values: {
        id: string,
        value: string,
        text: string
    }[];
}

export interface MainBoardItem {
    Id: number;

    Name: ColumnValue<string>;
    Adoazonosito: ColumnValue<string>;
    Szuletesi_ido: ColumnValue<Date>;
    Szuletesi_hely: ColumnValue<string>;
    EFO_igenylo: ColumnValue<DropdownOption>;
    //EFO_jovahagyo: ColumnValue<DropdownOption[]>;
    Munkakor: ColumnValue<DropdownOption>;
    Koltseghely: ColumnValue<DropdownOption>;
    Szuletesi_nev: ColumnValue<string>;
    Anyja_neve: ColumnValue<string>;
    Lakcim: ColumnValue<string>;
    Allampolgarsag: ColumnValue<string>;
    Tajszam: ColumnValue<string>;
    Bankszamlaszam: ColumnValue<string>;
}

export interface MainBoardItemPage {
    Cursor: string;
    Items: MainBoardItem[]
}

export type ColumnValueCommon = {ColumnId: string, ColumnType: ColumnType, ColumnValue: string|Date|DropdownOption}

export interface ColumnValue<T> {
    ColumnId: string;
    ColumnValue: T;
    ColumnType: ColumnType;
    ColumnValid: boolean
}

export interface Attachment {
    Id: string;
    Name: string;
    Extension: string;
    Url: string;
    ThumbnailUrl: string;
}

export enum ColumnType {
    String = 1,
    Date = 2,
    Status = 3,
    ConnectedBoard = 4,
    User = 5,
    Dropdown=6
}



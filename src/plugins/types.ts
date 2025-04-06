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
}

export interface MainBoardStructure {
    EFO_igenylo: DropdownColumn;
}

export interface SimpleBoardItem {
    id: string;
    name: string;
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
    Szuletesi_ido: ColumnValue<Date>;
    Szuletesi_hely: ColumnValue<string>
    EFO_igenylo: ColumnValue<string>
}

export interface MainBoardItemPage {
    Cursor: string;
    Items: MainBoardItem[]
}

export type ColumnValueCommon = {ColumnId: string, ColumnType: ColumnType, ColumnValue: string|Date|DropdownOption}

export interface ColumnValue<T> {
    ColumnId: string;
    ColumnValue: T;
    ColumnType: ColumnType
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
    User = 5
}

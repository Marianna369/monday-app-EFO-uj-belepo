export type MainBoardItemRaw = {
    id: number, 
    name: string, 
    column_values: {
        id: string, 
        value: string, 
        text: string
    }[],
    assets: {
        id: string,
        url: string,
        name: string,
        file_extension: string,
        url_thumbnail: string,
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
    DokumentumTipus: DropdownColumn;
    PartnerTipus: DropdownColumn;
    DokumentumAltipus: DropdownColumn;
    Formatum: DropdownColumn;
    Irany: DropdownColumn;
    Sajatceg: DropdownColumn;
    ApolloPartner: DropdownColumn;
    FeladasErkezes: DropdownColumn;
    KtgKategoria: DropdownColumn;
    ApolloUzletag: DropdownColumn;
    ApolloProjektnev: DropdownColumn;
    ApolloMunkahely: DropdownColumn;
    BoraVisszajott: DropdownColumn;
    KiszignalasCimzettje: DropdownColumn;
    MondayProjektszam: DropdownColumn;
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
    IsIktatva: boolean;

    Name: ColumnValue<string>;
    IktatoSzam: ColumnValue<string>;
    Formatum: ColumnValue<DropdownOption>
    Irany: ColumnValue<DropdownOption>;
    
    Files: Attachment[];
    EredetiNev: ColumnValue<string>;
    FeladasDatuma: ColumnValue<Date>;
    FeladasiBizonylat: ColumnValue<string>;
    FeladasErkezes: ColumnValue<DropdownOption>;

    DokumentumNeve: ColumnValue<string>;
    DokumentumTargya: ColumnValue<string>;
    DokumentumSorszam: ColumnValue<string>;
    DokumentumTipus: ColumnValue<DropdownOption>;
    DokumentumAltipus: ColumnValue<DropdownOption>;
    
    ApolloPartner: ColumnValue<DropdownOption>;
    Email: ColumnValue<string>;
    
    Sajatceg: ColumnValue<DropdownOption>;
    KtgKategoria: ColumnValue<DropdownOption>;
    KiszignalasCimzettje: ColumnValue<DropdownOption[]>; 
    KiszignalasDatuma: ColumnValue<Date>;
    
    MondayProjektszam: ColumnValue<DropdownOption>;
    ApolloUzletag: ColumnValue<DropdownOption>;
    ApolloProjektnev: ColumnValue<DropdownOption>;
    ApolloMunkahely: ColumnValue<DropdownOption>;

    Rogzitve: ColumnValue<Date>;
    DokumentumKelte: ColumnValue<Date>;
    PartnerTipus: ColumnValue<DropdownOption>;
    BoraVisszajott: ColumnValue<DropdownOption>;
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

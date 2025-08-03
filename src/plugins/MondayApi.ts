import mondaySdk from "monday-sdk-js";
import { mapAttachment, mapBoardStructure, mapMainBoardItem } from "./MondayApiMappers";
import { MainBoardStructure,  MainBoardItemRaw, SimpleBoardItem, MainBoardItemPage, FullBoardItem, MainBoardItem, UserItem } from "./types";
import { listItemsQuery, searchItemsQuery } from "./queries";

// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/
const monday = mondaySdk();
const pageSize = 25;

let searchColumnId = null as string;

const MondayApi = {
    init: {
        setSearchColumn: (columnId: string) => {
            searchColumnId = columnId;
        }
    },

    getAllSimpleBoardItems: async (boardIds: number[]): Promise<SimpleBoardItem[]> => {
        const query = `query {
            boards(ids: ${JSON.stringify(boardIds)}) {
                items_page(limit: 100) {
                    items {
                        id
                        name
                    }
                }
            }
        }`;

        const queryRes = await monday.api(query);
        return queryRes.data.boards.flatMap((x: any) => x.items_page.items);
    },

//    getFullBoardItems: async (boardIds: number[]): Promise<FullBoardItem[]> => {
//        const query = `query {
//            boards(ids: ${JSON.stringify(boardIds)}) {
//                items_page {
//                    items {
//                        id
//                        name
//                        column_values {
//                            id,
//                            value,
//                            text
//                        }
//                    }
//                }
//            }
//        }`;
//        const queryRes = await monday.api(query);
//        return queryRes.data.boards.flatMap((x: any) => x.items_page.items);
//    },

    getFullBoardItems: async (boardIds: number[]): Promise<FullBoardItem[]> => {
        const boardId = boardIds[0]; // Ha több board is lehet, akkor ezt bővíteni kell
        const allItems: FullBoardItem[] = [];

        // Első oldal
        let query = `query {
            boards(ids: [${boardId}]) {
                items_page(limit: 500) {
                    cursor
                    items {
                        id
                        name
                        column_values {
                            id
                            value
                            text
                        }
                    }
                }
            }
        }`;

        let response = await monday.api(query);
        let data = response.data.boards[0].items_page;

        allItems.push(...data.items);
        let cursor = data.cursor;

        // Lapozunk, amíg van cursor
        while (cursor) {
            query = `query {
                next_items_page(cursor: "${cursor}", limit: 500) {
                    cursor
                    items {
                        id
                        name
                        column_values {
                            id
                            value
                            text
                        }
                    }
                }
            }`;

            response = await monday.api(query);
            data = response.data.next_items_page;
            allItems.push(...data.items);
            cursor = data.cursor;
        }

        return allItems;
    },

    getMainBoardItems: async(mainBoardId: number, searchTerm: string, structure: MainBoardStructure) : Promise<MainBoardItemPage> => {
        const query = searchTerm?.trim()
            ? searchItemsQuery
            : listItemsQuery;

        const variables = {
            boardIds: [mainBoardId],
            pageSize: pageSize,
            searchColumnId: searchColumnId,
            searchTerm: searchTerm
        }

        const queryRes = await monday.api(query, {variables: variables});
        const items: MainBoardItemRaw[] = queryRes.data.boards[0].items_page.items;
        return {
            Cursor: queryRes.data.boards[0].items_page.cursor,
            Items: items.map(x => mapMainBoardItem(x, structure))
        };
    },

    getNextPageItems: async(cursor: string, filesColumnId: string, structure: MainBoardStructure) : Promise<MainBoardItemPage> => {
        const query = `query {
            next_items_page (limit: ${pageSize}, cursor: "${cursor}") {
                cursor
                items {
                    id
                    name
                    column_values {
                        id,
                        value,
                        text
                    },
                    assets(assets_source: columns, column_ids: ["${filesColumnId}"]) {
                        id,
                        url,
                        name,
                        file_extension,
                        url_thumbnail
                    }
                }
            }
        }`;

        const queryRes = await monday.api(query);
        const items: MainBoardItemRaw[] = queryRes.data.next_items_page.items;
        return {
            Cursor: queryRes.data.next_items_page.cursor,
            Items: items.map(x => mapMainBoardItem(x, structure))
        };
    },

    getAdoazonositok: async (mainBoardId: number, column: string): Promise<FullBoardItem[]> => {
        const query = `query {
            boards(ids: ${JSON.stringify(mainBoardId)}) {
                items_page {
                    items {
                        column_values (ids: ["${column}"]){
                            text
                        }
                    }
                }
            }
        }`;
        const queryRes = await monday.api(query);
        return queryRes.data.boards.flatMap((x: any) => x.items_page.items);
    },
    
    getMainBoardStructure: async (boardId: number): Promise<MainBoardStructure> => {
        const query = `query {
            boards(ids: ${boardId}) {
                columns {
                    id
                    type
                    settings_str
                }
            },
            users {
                id,
                name,
                email,
                photo_thumb_small,
                teams{id, name}
            },
            teams {
                id,
                name,
                picture_url
            }
        }`;
        const queryRes = await monday.api(query);
        const cols: {id:string,settings_str:string}[] = queryRes.data.boards[0].columns;        
        const users: {id:string, name:string, email:string, photo_thumb_small: string, teams:{id:string, name:string}[], picture_url: string}[] = queryRes.data.users;
        const teams: { id: string; name: string; picture_url: string;}[] = queryRes.data.teams;
        return mapBoardStructure(cols, users, teams);
    },

    getMe: async (): Promise<UserItem> => {
        const query = `query {
            me {
                id,
                name,
                email
            }
        }`;
        
        const queryRes = await monday.api(query);
        return queryRes.data.me;
    },
    
    changeMainBoardItem: async (structure: MainBoardStructure, mainBoardId: number, itemId: number , columnId: string, newValue: string) => {
        const column = Object.values(structure).find(x => x.id == columnId);
        
        let query = null;
        if(!column || !column.isConnectedBoard && !column.isPersonOrTeam) {
            query = `mutation {
                change_simple_column_value(item_id: ${itemId}, board_id: ${mainBoardId}, column_id: "${columnId}", value: "${newValue??''}") {
                    id
                }
            }`;
        }
        else {
            let value = null;
            if(column.isPersonOrTeam) {
                const kind = newValue.startsWith("T") ? "team" : "person";
                const id  =newValue.substring(1);
                value = `{\\"personsAndTeams\\":[{\\"id\\":\\"${id}\\",\\"kind\\":\\"${kind}\\"}]}`;
            }
            else {
                value = `{\\"item_ids\\" : [\\"${newValue}\\"]}`;
            }
            query = `mutation {
                change_multiple_column_values(item_id:${itemId}, board_id:${mainBoardId}, column_values: "{\\"${columnId}\\" : ${value}}") {
                    id
                }
            }`;
        }

        try {
            await monday.api(query);
        }
        catch(error: any) {
            console.error(error.data.errorMessage);
        }
    },

    insMainBoardItem: async (
        structure: MainBoardStructure,
        mainBoardId: number,
        item: MainBoardItem
    ) => {
        function formatDateOnlyForMonday(date: Date): string {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        const persons = item.EFO_jovahagyo.ColumnValue.map(x => x.value).join(",");
        const column_value_obj: Record<string, any> = {
            [import.meta.env.VITE_COLUMN_ID_SZULETESI_IDO]: {
                date: formatDateOnlyForMonday(new Date(item.Szuletesi_ido.ColumnValue))
            },
            [import.meta.env.VITE_COLUMN_ID_ADOAZONOSITO]: item.Adoazonosito.ColumnValue,
            [import.meta.env.VITE_COLUMN_ID_EFO_IGENYLO]: item.EFO_igenylo.ColumnValue.value,
            [import.meta.env.VITE_COLUMN_ID_EFO_JOVAHAGYO]: persons,
            [import.meta.env.VITE_COLUMN_ID_SZULETESI_HELY]: item.Szuletesi_hely.ColumnValue,
            [import.meta.env.VITE_COLUMN_ID_MUNKAKOR]: item.Munkakor.ColumnValue.caption,
            [import.meta.env.VITE_COLUMN_ID_SZULETESI_NEV]: item.Szuletesi_nev.ColumnValue,
            [import.meta.env.VITE_COLUMN_ID_ANYJA_NEVE]: item.Anyja_neve.ColumnValue,
            [import.meta.env.VITE_COLUMN_ID_LAKCIM]: item.Lakcim.ColumnValue,
            [import.meta.env.VITE_COLUMN_ID_ALLAMPOLGARSAG]: item.Allampolgarsag.ColumnValue,
            [import.meta.env.VITE_COLUMN_ID_TAJSZAM]: item.Tajszam.ColumnValue,
            [import.meta.env.VITE_COLUMN_ID_BANKSZAMLASZAM]: item.Bankszamlaszam.ColumnValue,
            [import.meta.env.VITE_COLUMN_ID_KOLTSEGHELY]: {
                item_ids: [item.Koltseghely.ColumnValue.value]
            }
        };

        const query = `mutation {
            create_item(
                board_id: ${mainBoardId},
                item_name: "${item.Name.ColumnValue}",
                column_values: "${JSON.stringify(column_value_obj).replace(/"/g, '\\"')}"
            ) {
                id
            }
        }`;
        console.log(query);
        try {
            const response = await fetch('https://monday-app-efo-uj-belepo.vercel.app/api/create-monday-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            const result = await response.json();

            if (result.errors) {
                console.error("Monday API hiba:", result.errors);
                throw new Error(JSON.stringify(result.errors));
            }

            return result.data.create_item.id;
        } catch (error: any) {
            console.error("API hívás hiba:", error.message);
            throw new Error(`Item beszúrás sikertelen: ${error.message}`);
        }
    },

    uploadFileToBoardItem: async (itemId: number, columnId: string, file: File) => {
        const query = `
        mutation add_file($itemId: ID!, $columnId: String!, $file: File!) {
            add_file_to_column (item_id: $itemId, column_id: $columnId, file: $file) {
                id,
                url,
                name,
                file_extension,
                url_thumbnail
            }
        }`;

        const variables = {
            itemId: itemId,
            columnId: columnId,
            file: file
        };

        const res = await monday.api(query, {variables: variables});
        return mapAttachment(res.data.add_file_to_column);
    },
    changeMainBoardItemKiszignalasCimzettje: async (mainBoardId: number, itemId: number , columnId: string, newValue: string[]) => {
        const value = newValue.map(x => `{\\"id\\":\\"${x.substring(1)}\\",\\"kind\\":\\"${x.startsWith("T") ? "team" : "person"}\\"}`).join(",");
        const query = `mutation {
            change_multiple_column_values(item_id:${itemId}, board_id:${mainBoardId}, column_values: "{\\"${columnId}\\" : {\\"personsAndTeams\\":[${value}]}}") {
                id
            }
        }`;

        try {
            await monday.api(query);
        }
        catch(error: any) {
            console.error(error.data.errorMessage);
        }
    },

}

export default MondayApi;

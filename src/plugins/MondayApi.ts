import mondaySdk from "monday-sdk-js";
import { mapAttachment, mapBoardStructure, mapMainBoardItem } from "./MondayApiMappers";
import { MainBoardStructure,  MainBoardItemRaw, SimpleBoardItem, MainBoardItemPage, FullBoardItem } from "./types";
import { listItemsQuery, searchItemsQuery } from "./queries";

// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/
const monday = mondaySdk();
const pageSize = 25;

let iktatvaColumnId = null as string;
let iktatvaStatusId = null as number;
let torolveStatusId = null as number;
let searchColumnId = null as string;
let filesColumnId = null as string;

const MondayApi = {
    init: {
        setIktatvaStatus: (columnId: string, iktatvaId: number, torolveId: number) => {
            iktatvaColumnId = columnId;
            iktatvaStatusId = iktatvaId;
            torolveStatusId = torolveId;
        },
        setSearchColumn: (columnId: string) => {
            searchColumnId = columnId;
        },
        setFilesColumnId: (columnId: string) => {
            filesColumnId = columnId;
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

    getFullBoardItems: async (boardIds: number[]): Promise<FullBoardItem[]> => {
        const query = `query {
            boards(ids: ${JSON.stringify(boardIds)}) {
                items_page(limit: 100) {
                    items {
                        id
                        name
                        column_values {
                            id,
                            value,
                            text
                        }
                    }
                }
            }
        }`;

        const queryRes = await monday.api(query);
        return queryRes.data.boards.flatMap((x: any) => x.items_page.items);
    },

    getMainBoardItems: async(mainBoardId: number, searchTerm: string, groupId: string, structure: MainBoardStructure) : Promise<MainBoardItemPage> => {
        const query = searchTerm?.trim()
            ? searchItemsQuery
            : listItemsQuery;

        const variables = {
            boardIds: [mainBoardId],
            groupIds: [groupId],
            pageSize: pageSize,
            iktatvaColumnId: iktatvaColumnId,
            iktatvaStatusId: iktatvaStatusId,
            torolveStatusId: torolveStatusId,
            filesColumnIdAsArray: [filesColumnId],
            searchColumnId: searchColumnId,
            searchTerm: searchTerm
        }

        const queryRes = await monday.api(query, {variables: variables});
        const items: MainBoardItemRaw[] = queryRes.data.boards[0].groups[0].items_page.items;
        return {
            Cursor: queryRes.data.boards[0].groups[0].items_page.cursor,
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
                photo_thumb_small
            },
            teams {
                id,
                name,
                picture_url
            }
        }`;
        
        const queryRes = await monday.api(query);
        const cols: {id:string,settings_str:string}[] = queryRes.data.boards[0].columns;
        const users: {id:string, name:string, photo_thumb_small: string, picture_url: string}[] = queryRes.data.users;
        const teams: { id: string; name: string; picture_url: string;}[] = queryRes.data.teams;
        return mapBoardStructure(cols, users, teams);
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
}

export default MondayApi;


export const listItemsQuery = `
query($boardIds: [ID!], $groupIds: [String]!, $pageSize: Int!, $iktatvaColumnId: ID!, $iktatvaStatusId: CompareValue!, $torolveStatusId: CompareValue!, $filesColumnIdAsArray: [String]!) {
    boards(ids: $boardIds) {
        groups(ids: $groupIds) {
            items_page(
              limit: $pageSize, 
              query_params: {
                rules: [{
                  column_id: $iktatvaColumnId, 
                  compare_value: $iktatvaStatusId, 
                  operator: not_any_of
                },
                {
                  column_id: $iktatvaColumnId, 
                  compare_value: $torolveStatusId, 
                  operator: not_any_of
                }],
              order_by:[{column_id: "__creation_log__", direction: desc}]}) {
                cursor
                items {
                    id
                    name
                  	created_at
                    column_values {
                        id,
                        value,
                        text
                    },
                    assets(assets_source: columns, column_ids: $filesColumnIdAsArray) {
                        id,
                        url,
                        name,
                        file_extension,
                        url_thumbnail
                    }
                } 
            }
        }
    }
}`;

export const searchItemsQuery = `
query(
  $boardIds: [ID!], 
  $groupIds: [String]!, 
  $pageSize: Int!, 
  $iktatvaColumnId: ID!, 
  $iktatvaStatusId: CompareValue!, 
  $torolveStatusId: CompareValue!, 
  $filesColumnIdAsArray: [String]!, 
  $searchColumnId: ID!,
  $searchTerm: CompareValue!) {
    
  boards(ids: $boardIds) {
      groups(ids: $groupIds) {
          items_page(
            limit: $pageSize, 
            query_params: {
              rules: [
                {
                  column_id: $iktatvaColumnId, 
                  compare_value: $iktatvaStatusId, 
                  operator: not_any_of
                },
                {
                  column_id: $iktatvaColumnId, 
                  compare_value: $torolveStatusId, 
                  operator: not_any_of
                },
                {
                  column_id: $searchColumnId,
                  compare_value: $searchTerm,
                  operator: contains_text
                }
              ]}) {
              cursor
              items {
                  id
                  name
                  column_values {
                      id,
                      value,
                      text
                  },
                  assets(assets_source: columns, column_ids: $filesColumnIdAsArray) {
                      id,
                      url,
                      name,
                      file_extension,
                      url_thumbnail
                  }
              } 
          }
      }
  }
}`;
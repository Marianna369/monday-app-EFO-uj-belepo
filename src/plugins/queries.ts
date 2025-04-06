
export const listItemsQuery = `
query($boardIds: [ID!]) {
    boards(ids: $boardIds) {
    items_page {
      cursor
      items {
        id 
        name 
        column_values {
            id,
            value,
            text
        },
      }
    }
    }
}`;

export const searchItemsQuery = `
query(
  $boardIds: [ID!], 
  $pageSize: Int!, 
  $searchColumnId: ID!,
  $searchTerm: CompareValue!) {
    
  boards(ids: $boardIds) {
          items_page(
            limit: $pageSize, 
            query_params: {
              rules: [
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
              } 
          }
  }
}`;
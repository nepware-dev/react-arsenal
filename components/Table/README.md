## Table sorting

Sorting is opt-in per column. Mark a column `sortable` and its header becomes a
button that cycles ascending → descending → unsorted, with `aria-sort` kept in
sync on the `th`. Everything else about the table is unchanged.

```jsx
const columns = [
    { Header: 'Name', accessor: 'name', sortable: true },
    { Header: 'Score', accessor: 'score' },
];

<Table data={data} columns={columns} keyExtractor={(item) => item.id} />;
```

By default the table sorts `data` itself, before pagination is applied, so the
whole dataset is ordered rather than just the visible page.

`accessor` values that are not plain keys of the data item (nested or indexed
paths) cannot be read by the default comparator. Provide `sortAccessor` to
return the value to compare, or `sortComparator` for full control:

```jsx
const columns = [
    {
        Header: 'Department',
        accessor: 'department.title',
        sortable: true,
        sortAccessor: (item) => item.department.title,
    },
    {
        Header: 'Priority',
        accessor: 'priority',
        sortable: true,
        sortComparator: (firstItem, secondItem) => firstItem.rank - secondItem.rank,
    },
];
```

### Server-side sorting

Pass `manualSort` when the backend orders the rows. The table then renders the
indicators and reports changes through `onSortChange` without reordering `data`.
Combine it with `sort` to control the state yourself:

```jsx
<Table
    data={data}
    columns={columns}
    keyExtractor={(item) => item.id}
    manualSort
    sort={sort}
    onSortChange={setSort}
/>
```

Providing `sort` makes sorting controlled; omit it and pass `defaultSort` to
choose the initial order while letting the table own the state.

### Hierarchical tables

`Table/Hierarchical` takes the same props. Sorting there is hierarchy-aware: the
sort state is applied to siblings at every depth, so each node's children are
ordered among themselves and the parent-child structure never changes.

```jsx
<HierarchicalTable
    data={data}
    columns={columns}
    keyExtractor={(item) => item.id}
    hierarchyOptions={{ initialExpandedLevel: 2 }}
/>
```

`sort`, `defaultSort`, `onSortChange` and `manualSort` behave as they do on the
flat table. With `manualSort` the tree is rendered exactly as provided, so the
backend is responsible for ordering each level.



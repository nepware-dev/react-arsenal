import BaseList from "./BaseList";
import VirtualizedList from "./VirtualizedList";
import type {
    ListRenderItemProps,
    KeyExtractor,
    ListRenderItem,
    VirtualizedListProps,
    ListProps,
} from "./types";

const List = <T,>({ virtual, ...restProps }: ListProps<T>) => {
    if (virtual) {
        return <VirtualizedList {...restProps} />;
    }

    return <BaseList {...restProps} />;
};

export default List;
export type {
    ListRenderItemProps,
    KeyExtractor,
    ListRenderItem,
    VirtualizedListProps,
    ListProps,
};

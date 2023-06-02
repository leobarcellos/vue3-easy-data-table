import { ref, Ref, ComputedRef, watchEffect } from 'vue';
import type { Item } from '../types/main';
import type { EmitsEventName } from '../types/internal';

export default function useExpandableRow(
  items: Ref<Item[]>,
  prevPageEndIndex: ComputedRef<number>,
  itemsExpanded: Ref<Item[]>,
  emits: (event: EmitsEventName, ...args: any[]) => void,
) {
  const expandingItemIndexList = ref<number[]>([]);

  const getItemIndex = (expandingItem: Item) => {
    return items.value.findIndex((item) => {
      let rawItem = <Item>{}
      Object.keys(expandingItem).map(key => {
          rawItem[key] = item[key]
      });
      return JSON.stringify(rawItem) === JSON.stringify(expandingItem)
    });
  }

  const updateExpandingItemIndexList = (expandingItemIndex: number, expandingItem: Item, event: Event) => {
    event.stopPropagation();
    const index = expandingItemIndexList.value.indexOf(expandingItemIndex);
    if (index !== -1) {
      expandingItemIndexList.value.splice(index, 1);
      emitItemsExpanded();
    } else {
      const currentPageExpandIndex = getItemIndex(expandingItem);
      emits('expandRow', prevPageEndIndex.value + currentPageExpandIndex, expandingItem);
      expandingItemIndexList.value.push(prevPageEndIndex.value + currentPageExpandIndex);
      emitItemsExpanded();
    }
  };

  const clearExpandingItemIndexList = () => {
    expandingItemIndexList.value = [];
  };

  function emitItemsExpanded() {
    emits('update:itemsExpanded', expandingItemIndexList.value.map(index => items.value[index]))
  }

  watchEffect(() => {
    itemsExpanded.value.forEach(item => {
      const currentPageExpandIndex = getItemIndex(item)
      emits('expandRow', prevPageEndIndex.value + currentPageExpandIndex, item)
      expandingItemIndexList.value.push(prevPageEndIndex.value + currentPageExpandIndex)
    })
  });

  return {
    expandingItemIndexList,
    updateExpandingItemIndexList,
    clearExpandingItemIndexList,
  };
}

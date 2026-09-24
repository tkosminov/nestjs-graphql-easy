import { createUnionType } from '@nestjs/graphql';

import { ItemImage } from '../item-image/item-image.entity.js';
import { ItemText } from '../item-text/item-text.entity.js';

export const ItemableType = createUnionType({
  name: 'ItemableType',
  types: () => [ItemText, ItemImage] as const,
  resolveType(value) {
    if (value instanceof ItemText) {
      return ItemText;
    } else if (value instanceof ItemImage) {
      return ItemImage;
    }

    return null;
  },
});

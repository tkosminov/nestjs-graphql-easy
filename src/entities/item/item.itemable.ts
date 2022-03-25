import { createUnionType } from '@nestjs/graphql';

import { ItemImage } from '../item-image/item-image.entity';
import { ItemText } from '../item-text/item-text.entity';

export const ItemableType = createUnionType({
  name: 'ItemableType',
  types: () => [ItemText, ItemImage],
  resolveType(value) {
    if (value instanceof ItemText) {
      return ItemText;
    } else if (value instanceof ItemImage) {
      return ItemImage;
    }
  },
});

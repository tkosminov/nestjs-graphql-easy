import { EntitySchema, MixedList } from 'typeorm';

import { Author } from '../models/author/author.entity.js';
import { Book } from '../models/book/book.entity.js';
import { Section } from '../models/section/section.entity.js';
import { Item } from '../models/item/item.entity.js';
import { ItemImage } from '../models/item-image/item-image.entity.js';
import { ItemText } from '../models/item-text/item-text.entity.js';

const entities: MixedList<string | Function | EntitySchema<any>> = [Author, Book, Section, Item, ItemImage, ItemText];

export { entities };

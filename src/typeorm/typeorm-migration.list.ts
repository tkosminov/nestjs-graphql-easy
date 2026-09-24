import { MixedList } from 'typeorm';

import { Author1790079553185 } from './migrations/1790079553185-author.js';
import { Book1790079913557 } from './migrations/1790079913557-book.js';
import { Section1790080799498 } from './migrations/1790080799498-section.js';
import { Item1790081107048 } from './migrations/1790081107048-item.js';
import { ItemImage1790081576330 } from './migrations/1790081576330-item-image.js';
import { ItemText1790081733008 } from './migrations/1790081733008-item-text.js';
import { Seed1790164611481 } from './migrations/1790164611481-seed.js';

const migrations: MixedList<string | Function> = [
  Author1790079553185,
  Book1790079913557,
  Section1790080799498,
  Item1790081107048,
  ItemImage1790081576330,
  ItemText1790081733008,
  Seed1790164611481,
];

export { migrations };

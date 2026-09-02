import foodcoop from '../stores/foodcoop.mjs';
import mercadona from '../stores/mercadona.mjs';
import bonpreu from '../stores/bonpreu.mjs';
import ametller from '../stores/ametller.mjs';
import condis from '../stores/condis.mjs';

export const ADAPTERS = Object.fromEntries([foodcoop, mercadona, bonpreu, ametller, condis].map((a) => [a.id, a]));

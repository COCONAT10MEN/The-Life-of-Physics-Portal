import axios from 'axios';

/** Browser requests use the same-origin API adapters; credentials stay server-side. */
export const api = axios.create();

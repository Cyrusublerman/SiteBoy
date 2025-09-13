// Local adapter mapping for app/models dither algorithms (indexes & webgl translator hooks are omitted)
import { getBwAlgorithms, getColorAlgorithms, getBwDitherModel, getColorDitherModel } from '../shared/dither-algorithms.js';

// In our system we don't use WebGL translators here; export minimal equivalents
export const getBwGroups = () => getBwDitherModel();
export const getColorGroups = () => getColorDitherModel();
export const getBwDitherAlgorithms = () => getBwAlgorithms().map((item, index) => ({ ...item, index }));
export const getColorDitherAlgorithms = () => getColorAlgorithms().map((item, index) => ({ ...item, index }));




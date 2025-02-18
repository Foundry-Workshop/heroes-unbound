import {constants} from '../constants.mjs';
import Utility from './Utility.mjs';

export default class WorkshopError extends Error {
  constructor(error) {
    error = `${constants.systemLabel} | ${error}`;
    Utility.error(error)
    super(error);
  }
}
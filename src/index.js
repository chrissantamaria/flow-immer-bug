// @flow
import produce from 'immer';

import { type SomeTypeImported } from './types';

type SomeType = {
  someKey: number
}

const handler = (draft, action) => draft;
const initialState = {
  someKey: 1
};

// works
const reducer = produce<SomeType, *>(handler, initialState);
// gives prop-missing error
const reducerImported = produce<SomeTypeImported, *>(handler, initialState);

import DataProvider from './dataprovider';
import mockProvider from './mockprovider';
import {isFromDb, isDirty, getDbIndex, TRANSIENT_PROPERTY_IS_DIRTY, TRANSIENT_PROPERTY_DB_INDEX} from './common';

export default (process.env.REACT_APP_USE_MOCK === 'true') ? mockProvider : DataProvider;
export {isFromDb, isDirty, getDbIndex, TRANSIENT_PROPERTY_IS_DIRTY, TRANSIENT_PROPERTY_DB_INDEX};

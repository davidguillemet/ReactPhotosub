import dataProvider from './dataprovider';
import mockProvider from './mockprovider';
import {isFromDb, isDirty, getDbIndex, TRANSIENT_PROPERTY_IS_DIRTY, TRANSIENT_PROPERTY_DB_INDEX} from './common';

export default (window.env.USE_MOCK === 'true') ? mockProvider : dataProvider;
export {isFromDb, isDirty, getDbIndex, TRANSIENT_PROPERTY_IS_DIRTY, TRANSIENT_PROPERTY_DB_INDEX};

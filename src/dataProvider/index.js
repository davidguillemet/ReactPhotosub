import dataProvider from './dataprovider';
import mockProvider from './mockprovider';
export default (window.env.USE_MOCK === 'true') ? mockProvider : dataProvider;

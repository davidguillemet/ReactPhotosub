import React from 'react'

const ChainedProviders = ({providers, children }) => {
  return (
    <React.Fragment>
    {
        providers.reduceRight((childComponent, Provider) => {
            return <Provider>{childComponent}</Provider>
        }, children)
    }
    </React.Fragment>
  )
};

export default ChainedProviders;
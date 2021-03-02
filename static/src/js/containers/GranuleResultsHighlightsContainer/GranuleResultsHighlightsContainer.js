import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { isEmpty, min } from 'lodash'

import {
  getFocusedCollectionGranuleMetadata,
  getFocusedCollectionGranuleResults
} from '../../selectors/collectionResults'
import { getFocusedCollectionId } from '../../selectors/focusedCollection'
import { getFocusedCollectionMetadata } from '../../selectors/collectionMetadata'
import { getGranuleIds } from '../../util/getGranuleIds'
import { locationPropType } from '../../util/propTypes/location'

import GranuleResultsHighlights from '../../components/GranuleResultsHighlights/GranuleResultsHighlights'

export const mapStateToProps = state => ({
  collectionsQuery: state.query.collection,
  collectionsSearch: state.searchResults.collections,
  focusedCollectionGranuleMetadata: getFocusedCollectionGranuleMetadata(state),
  focusedCollectionId: getFocusedCollectionId(state),
  focusedCollectionMetadata: getFocusedCollectionMetadata(state),
  granuleSearchResults: getFocusedCollectionGranuleResults(state)

})

export const GranuleResultsHighlightsContainer = ({
  collectionsQuery,
  focusedCollectionGranuleMetadata,
  focusedCollectionId,
  focusedCollectionMetadata,
  granuleSearchResults,
  location
}) => {
  const {
    isCwic
  } = focusedCollectionMetadata

  const { [focusedCollectionId]: collectionQueryResults = {} } = collectionsQuery
  const { granules: collectionGranuleQuery = {} } = collectionQueryResults
  const { excludedGranuleIds = [] } = collectionGranuleQuery

  const {
    allIds,
    hits,
    isLoading,
    isLoaded
  } = granuleSearchResults

  if (isEmpty(allIds) || allIds == null) return null

  // Limit the number of granules shown
  const limit = min([5, hits])

  const granuleIds = getGranuleIds({
    allIds,
    excludedGranuleIds,
    isCwic,
    limit
  })

  const granuleList = granuleIds.map(granuleId => (
    focusedCollectionGranuleMetadata[granuleId]
  ))

  const visibleGranules = granuleIds.length ? granuleIds.length : 0
  const granuleCount = hits - excludedGranuleIds.length

  return (
    <GranuleResultsHighlights
      granuleCount={granuleCount}
      granules={granuleList}
      isLoaded={isLoaded}
      isLoading={isLoading}
      location={location}
      visibleGranules={visibleGranules}
    />
  )
}

GranuleResultsHighlightsContainer.propTypes = {
  collectionsQuery: PropTypes.shape({}).isRequired,
  collectionsSearch: PropTypes.shape({}).isRequired,
  focusedCollectionGranuleMetadata: PropTypes.shape({}).isRequired,
  focusedCollectionId: PropTypes.string.isRequired,
  focusedCollectionMetadata: PropTypes.shape({}).isRequired,
  granuleSearchResults: PropTypes.shape({}).isRequired,
  location: locationPropType.isRequired
}

export default withRouter(
  connect(mapStateToProps)(GranuleResultsHighlightsContainer)
)

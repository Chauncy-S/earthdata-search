import { isCancel } from 'axios'

import {
  buildCollectionSearchParams,
  prepareCollectionParams
} from '../util/collections'
import { handleError } from './errors'

import {
  ADD_MORE_COLLECTION_RESULTS,
  ERRORED_COLLECTIONS,
  ERRORED_FACETS,
  FINISHED_COLLECTIONS_TIMER,
  LOADED_COLLECTIONS,
  LOADED_FACETS,
  LOADING_COLLECTIONS,
  LOADING_FACETS,
  STARTED_COLLECTIONS_TIMER,
  UPDATE_COLLECTION_METADATA,
  UPDATE_COLLECTION_RESULTS,
  UPDATE_FACETS,
  UPDATE_GRANULE_FILTERS
} from '../constants/actionTypes'

import { getEarthdataEnvironment } from '../selectors/earthdataEnvironment'
import { getFocusedCollectionId } from '../selectors/focusedCollection'
import { getUsername } from '../selectors/user'
import { pruneFilters } from '../util/pruneFilters'

import CollectionGraphQlRequest from '../util/request/collectionGraphQlRequest'

export const addMoreCollectionResults = payload => ({
  type: ADD_MORE_COLLECTION_RESULTS,
  payload
})

export const updateCollectionResults = payload => ({
  type: UPDATE_COLLECTION_RESULTS,
  payload
})

export const updateCollectionMetadata = payload => ({
  type: UPDATE_COLLECTION_METADATA,
  payload
})

export const onCollectionsLoading = () => ({
  type: LOADING_COLLECTIONS
})

export const onCollectionsLoaded = payload => ({
  type: LOADED_COLLECTIONS,
  payload
})

export const onCollectionsErrored = () => ({
  type: ERRORED_COLLECTIONS
})

export const updateFacets = payload => ({
  type: UPDATE_FACETS,
  payload
})

export const onFacetsLoading = () => ({
  type: LOADING_FACETS
})

export const onFacetsLoaded = payload => ({
  type: LOADED_FACETS,
  payload
})

export const onFacetsErrored = () => ({
  type: ERRORED_FACETS
})

export const startCollectionsTimer = () => ({
  type: STARTED_COLLECTIONS_TIMER
})

export const finishCollectionsTimer = () => ({
  type: FINISHED_COLLECTIONS_TIMER
})

/**
 * Update the granule filters for the collection. Here we prune off any values that are not truthy,
 * as well as any objects that contain only falsy values.
 * @param {String} id - The id for the collection to update.
 * @param {Object} granuleFilters - An object containing the flags to apply as granuleFilters.
 */
export const updateFocusedCollectionGranuleFilters = granuleFilters => (dispatch, getState) => {
  const state = getState()

  const focusedCollectionId = getFocusedCollectionId(state)

  const { query = {} } = state
  const { collection = {} } = query
  const { byId = {} } = collection
  const { [focusedCollectionId]: focusedCollectionQuery = {} } = byId
  const { granules: existingGranuleFilters = {} } = focusedCollectionQuery

  const allGranuleFilters = {
    ...existingGranuleFilters,
    ...granuleFilters
  }

  const prunedFilters = pruneFilters(allGranuleFilters)

  // Updates the granule search query, throwing out all existing values
  dispatch({
    type: UPDATE_GRANULE_FILTERS,
    payload: {
      collectionId: focusedCollectionId,
      ...prunedFilters
    }
  })
}

/**
 * Clears out the granule filters for the focused collection.
 */
export const clearFocusedCollectionGranuleFilters = () => (dispatch, getState) => {
  const state = getState()

  const focusedCollectionId = getFocusedCollectionId(state)

  dispatch({
    type: UPDATE_GRANULE_FILTERS,
    payload: {
      collectionId: focusedCollectionId,
      pageNum: 1
    }
  })
}

// Cancel token to cancel pending requests
let cancelToken

/**
 * Perform a collections request based on the current redux state.
 * @param {Function} dispatch - A dispatch function provided by redux.
 * @param {Function} getState - A function that returns the current state provided by redux.
 */
export const getCollections = () => (dispatch, getState) => {
  const state = getState()

  // Retrieve data from Redux using selectors
  const earthdataEnvironment = getEarthdataEnvironment(state)
  const username = getUsername(state)

  // If cancel token is set, cancel the previous request(s)
  if (cancelToken) {
    cancelToken.cancel()
  }

  const collectionParams = prepareCollectionParams(state)

  const {
    authToken,
    keyword,
    pageNum
  } = collectionParams

  if (pageNum === 1) {
    const emptyPayload = {
      results: []
    }
    dispatch(updateCollectionResults(emptyPayload))
  }

  dispatch(onCollectionsLoading())
  dispatch(onFacetsLoading())
  dispatch(startCollectionsTimer())

  const requestObject = new CollectionGraphQlRequest(authToken, earthdataEnvironment)

  cancelToken = requestObject.getCancelToken()

  const graphQuery = `
    query GetCollection(
      $boundingBox: String
      $circle: String
      $collectionDataType: [String]
      $dataCenter: String
      $dataCenterH: [String]
      $facetsSize: Int
      $granuleDataFormat: String
      $granuleDataFormatH: [String]
      $hasGranulesOrCwic: Boolean
      $horizontalDataResolutionRange: String
      $includeFacets: String
      $includeHasGranules: Boolean
      $includeTags: String
      $instrument: String
      $instrumentH: [String]
      $keyword: String
      $line: String
      $options: JSON
      $platform: String
      $platformH: [String]
      $point: String
      $polygon: String
      $processingLevelIdH: [String]
      $project: String
      $projectH: [String]
      $provider: String
      $scienceKeywordsH: [String]
      $serviceType: [String]
      $sortKey: [String]
      $spatialKeyword: String
      $subscriberId: String
      $tagKey: [String]
      $temporal: String
      $twoDCoordinateSystemName: [String]
    ) {
      collections (
        boundingBox: $boundingBox
        circle: $circle
        collectionDataType: $collectionDataType
        dataCenter: $dataCenter
        dataCenterH: $dataCenterH
        facetsSize: $facetsSize
        granuleDataFormat: $granuleDataFormat
        granuleDataFormatH: $granuleDataFormatH
        hasGranulesOrCwic: $hasGranulesOrCwic
        horizontalDataResolutionRange: $horizontalDataResolutionRange
        includeFacets: $includeFacets
        includeHasGranules: $includeHasGranules
        includeTags: $includeTags
        instrument: $instrument
        instrumentH: $instrumentH
        keyword: $keyword
        line: $line
        options: $options
        platform: $platform
        platformH: $platformH
        point: $point
        polygon: $polygon
        processingLevelIdH: $processingLevelIdH
        project: $project
        projectH: $projectH
        provider: $provider
        scienceKeywordsH: $scienceKeywordsH
        serviceType: $serviceType
        sortKey: $sortKey
        spatialKeyword: $spatialKeyword
        tagKey: $tagKey
        temporal: $temporal
        twoDCoordinateSystemName: $twoDCoordinateSystemName
      ) {
        count
        facets
        items {
          abstract
          archiveAndDistributionInformation
          boxes
          collectionDataType
          conceptId
          coordinateSystem
          dataCenter
          dataCenters
          doi
          hasGranules
          lines
          organizations
          points
          polygons
          relatedUrls
          scienceKeywords
          shortName
          spatialExtent
          tags
          temporalExtents
          tilingIdentificationSystems
          timeEnd
          timeStart
          title
          versionId
          services {
            count
            items {
              conceptId
              longName
              name
              type
              url
              serviceOptions
              supportedOutputProjections
              supportedReformattings
            }
          }
          granules {
            count
            items {
              conceptId
              onlineAccessFlag
            }
          }
          subscriptions (
            subscriberId: $subscriberId
          ) {
            count
            items {
              collectionConceptId
              conceptId
              name
              nativeId
              query
            }
          }
          variables {
            count
            items {
              conceptId
              definition
              longName
              name
              nativeId
              scienceKeywords
            }
          }
        }
      }
    }`

  const response = requestObject.search(graphQuery, {
    subscriberId: username,
    ...buildCollectionSearchParams(collectionParams)
  })
    .then((response) => {
      const { data } = response
      const { collections } = data
      const { count, facets, items } = collections

      const cmrHits = count

      const { children = [] } = facets

      const payload = {
        facets: children,
        hits: cmrHits,
        keyword,
        results: items
      }

      dispatch(finishCollectionsTimer())

      dispatch(updateCollectionMetadata(items))

      if (pageNum === 1) {
        dispatch(updateCollectionResults(payload))
      } else {
        dispatch(addMoreCollectionResults(payload))
      }

      dispatch(onCollectionsLoaded({
        loaded: true
      }))

      dispatch(onFacetsLoaded({
        loaded: true
      }))

      dispatch(updateFacets(payload))
    })
    .catch((error) => {
      if (isCancel(error)) return

      dispatch(finishCollectionsTimer())
      dispatch(onCollectionsErrored())
      dispatch(onFacetsErrored())
      dispatch(onCollectionsLoaded({
        loaded: false
      }))
      dispatch(onFacetsLoaded({
        loaded: false
      }))
      dispatch(handleError({
        error,
        action: 'getCollections',
        resource: 'collections',
        requestObject
      }))
    })

  return response
}

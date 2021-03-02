import GraphQlRequest from './graphQlRequest'

import {
  getApplicationConfig,
  getEarthdataConfig
} from '../../../../../sharedUtils/config'

import { createFocusedCollectionMetadata } from '../focusedCollection'
import { hasTag } from '../../../../../sharedUtils/tags'

import unavailableImg from '../../../assets/images/image-unavailable.svg'

/**
 * Base Request object for collection specific requests
 */
export default class CollectionGraphQlRequest extends GraphQlRequest {
  /**
   * Transform the response before completing the Promise.
   * @param {Object} data - Response object from the object.
   * @return {Object} The object provided
   */
  transformResponse(data) {
    super.transformResponse(data)

    // If the response status code is not 200, return unaltered data
    // If the status code is 200, it doesn't exist in the response
    const { errors = [] } = data
    if (errors.length > 0) return data

    if (!data || Object.keys(data).length === 0) return data

    const { data: responseData } = data
    const { collections, collection } = responseData

    if (collections) {
      const { items } = collections

      return {
        collections: {
          ...collections,
          items: items.map(collection => this.transformMetadata(collection))
        }
      }
    }

    if (collection) {
      return this.transformMetadata(collection)
    }

    return data
  }

  transformMetadata(collection) {
    const transformedCollection = collection

    const { granules, count } = collection

    if (granules) {
      transformedCollection.hasGranules = count > 0
    }

    if (collection && collection.tags) {
      transformedCollection.isCwic = Object.keys(collection.tags).includes('org.ceos.wgiss.cwic.granules.prod')
        && collection.hasGranules === false
      transformedCollection.hasMapImagery = hasTag(collection, 'gibs')
    }

    if (collection && collection.collectionDataType) {
      transformedCollection.isNrt = !!(collection.collectionDataType === 'NEAR_REAL_TIME')
    }

    const h = getApplicationConfig().thumbnailSize.height
    const w = getApplicationConfig().thumbnailSize.width

    if (collection.conceptId) {
      transformedCollection.thumbnail = collection.browseFlag
        ? `${getEarthdataConfig(this.earthdataEnvironment).cmrHost}/browse-scaler/browse_images/datasets/${collection.conceptId}?h=${h}&w=${w}`
        : unavailableImg
    }

    return {
      ...transformedCollection,
      ...createFocusedCollectionMetadata(
        transformedCollection,
        this.authToken,
        this.earthdataEnvironment
      ),
      hasAllMetadata: true
    }
  }
}

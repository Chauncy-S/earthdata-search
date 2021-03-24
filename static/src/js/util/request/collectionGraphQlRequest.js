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

    const {
      browseFlag,
      collectionDataType,
      conceptId,
      granules,
      tags
    } = collection

    let granuleCount = 0

    if (granules) {
      ({ count: granuleCount } = granules)

      transformedCollection.hasGranules = granuleCount > 0
    }

    if (collection && tags) {
      transformedCollection.isCwic = hasTag({ tags }, 'org.ceos.wgiss.cwic.granules.prod', '')
        && granuleCount === 0
      transformedCollection.hasMapImagery = hasTag(collection, 'gibs')
    }

    if (collection && collectionDataType) {
      transformedCollection.isNrt = !!(collectionDataType === 'NEAR_REAL_TIME')
    }

    const h = getApplicationConfig().thumbnailSize.height
    const w = getApplicationConfig().thumbnailSize.width

    if (conceptId) {
      transformedCollection.thumbnail = browseFlag
        ? `${getEarthdataConfig(this.earthdataEnvironment).cmrHost}/browse-scaler/browse_images/datasets/${conceptId}?h=${h}&w=${w}`
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

import CmrRequest from './cmrRequest'
import {
  getEarthdataConfig,
  getEnvironmentConfig
} from '../../../../../sharedUtils/config'

import { formatGranuleResult } from '../granules'

/**
 * Request object for granule specific requests
 */
export default class GranuleRequest extends CmrRequest {
  constructor(authToken, earthdataEnvironment) {
    if (authToken && authToken !== '') {
      super(getEnvironmentConfig().apiHost, earthdataEnvironment)

      this.authenticated = true
      this.authToken = authToken
      this.searchPath = 'granules'
    } else {
      super(getEarthdataConfig(earthdataEnvironment).cmrHost, earthdataEnvironment)

      this.searchPath = 'search/granules.json'
    }
  }

  permittedCmrKeys() {
    return [
      'bounding_box',
      'circle',
      'browse_only',
      'concept_id',
      'cloud_cover',
      'day_night_flag',
      'echo_collection_id',
      'equator_crossing_date',
      'equator_crossing_longitude',
      'exclude',
      'line',
      'online_only',
      'options',
      'orbit_number',
      'page_num',
      'page_size',
      'point',
      'polygon',
      'readable_granule_name',
      'sort_key',
      'temporal',
      'two_d_coordinate_system'
    ]
  }

  nonIndexedKeys() {
    return [
      'bounding_box',
      'circle',
      'concept_id',
      'exclude',
      'line',
      'point',
      'polygon',
      'readable_granule_name',
      'sort_key'
    ]
  }

  transformResponse(data) {
    super.transformResponse(data)

    // If the response status code is not 200, return unaltered data
    // If the status code is 200, it doesn't exist in the response
    const { statusCode = 200 } = data
    if (statusCode !== 200) return data

    const { feed = {} } = data
    const { entry = [] } = feed

    entry.map(granule => formatGranuleResult(granule, this.earthdataEnvironment))

    return {
      feed: {
        entry
      }
    }
  }
}

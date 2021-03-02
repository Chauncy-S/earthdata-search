import { parseError } from '../../../../sharedUtils/parseError'

/**
 * Formats the metadata shown in the collection results
 * @param {Object} collections collections object from searchResults in the store
 * @param {Array} projectIds Array of collection ids that are added to the project
 * @param {Object} browser browser object from the store
 */
export const formatCollectionList = (collections, metadata, projectIds = [], browser = {}) => {
  const { allIds: collectionIds } = collections

  return collectionIds.map((collectionId, index) => {
    const { [collectionId]: collectionMetadata = {} } = metadata

    const {
      abstract = '',
      granules,
      hasFormats = false,
      hasMapImagery = false,
      hasSpatialSubsetting = false,
      hasTemporalSubsetting = false,
      hasTransforms = false,
      hasVariables = false,
      isCwic = false,
      isNrt = false,
      organizations = [],
      services,
      shortName,
      thumbnail = null,
      timeEnd = null,
      timeStart = null,
      title = null,
      variables,
      versionId
    } = collectionMetadata

    let granuleCount = 0
    if (granules != null) {
      ({ count: granuleCount } = granules)
    }

    const {
      name: browserName
    } = browser

    let displayOrganization = ''

    if (organizations && organizations.length) {
      [displayOrganization] = organizations
    }

    let temporalRange = ''
    let temporalStart = ''
    let temporalEnd = ''

    if (timeStart || timeEnd) {
      if (timeStart) {
        try {
          const dateStart = new Date(timeStart).toISOString().split('T')[0]

          temporalRange = `${dateStart} ongoing`
          temporalStart = dateStart
          temporalEnd = 'ongoing'
        } catch (e) {
          parseError(e)
        }
      }

      if (timeEnd) {
        try {
          const dateEnd = new Date(timeEnd).toISOString().split('T')[0]

          temporalRange = `Up to ${dateEnd}`
          temporalEnd = dateEnd
        } catch (e) {
          parseError(e)
        }
      }

      if (timeStart && timeEnd) {
        try {
          const dateStart = new Date(timeStart).toISOString().split('T')[0]
          const dateEnd = new Date(timeEnd).toISOString().split('T')[0]

          temporalRange = `${dateStart} to ${dateEnd}`
        } catch (e) {
          parseError(e)
        }
      }
    }

    let truncatedAbstract = abstract
    if (browserName === 'ie') truncatedAbstract = `${abstract.substring(0, 280)}...`

    const isCollectionInProject = projectIds.indexOf(collectionId) !== -1

    const isLast = index === collectionIds.length - 1

    return {
      abstract: truncatedAbstract,
      collectionId,
      title,
      displayOrganization,
      granuleCount,
      hasFormats,
      hasSpatialSubsetting,
      hasTemporalSubsetting,
      hasTransforms,
      hasVariables,
      hasMapImagery,
      isCwic,
      isNrt,
      services,
      shortName,
      temporalEnd,
      temporalRange,
      temporalStart,
      thumbnail,
      variables,
      versionId,
      isCollectionInProject,
      isLast
    }
  })
}

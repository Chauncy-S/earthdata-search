import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap'
import {
  FaGlobe,
  FaTags,
  FaSlidersH,
  FaFileAlt,
  FaClock,
  FaMinus,
  FaPlus,
  FaInfoCircle
} from 'react-icons/fa'
import { isEmpty } from 'lodash'

import { commafy } from '../../util/commafy'
import { getApplicationConfig } from '../../../../../sharedUtils/config'
import { pluralize } from '../../util/pluralize'

import Button from '../Button/Button'
import SplitBadge from '../SplitBadge/SplitBadge'
import PortalFeatureContainer from '../../containers/PortalFeatureContainer/PortalFeatureContainer'
import EDSCIcon from '../EDSCIcon/EDSCIcon'

import './CollectionResultsItem.scss'

/**
 * Renders CollectionResultsItem.
 * @param {Object} props - The props passed into the component.
 * @param {Object} props.collection - The collection metadata.
 * @param {Function} props.onAddProjectCollection - Callback to add a collection to a project.
 * @param {Function} props.onRemoveCollectionFromProject - Callback to remove a collection to a project.
 * @param {Function} props.onViewCollectionGranules - Callback to show collection granules route.
 * @param {Function} props.onViewCollectionDetails - Callback to show collection details route.
 */
export const CollectionResultsItem = forwardRef(({
  collectionMetadata,
  onAddProjectCollection,
  onRemoveCollectionFromProject,
  onViewCollectionDetails,
  onViewCollectionGranules
}, ref) => {
  const {
    collectionId,
    title,
    abstract,
    displayOrganization,
    granuleCount,
    // hasFormats,
    // hasSpatialSubsetting,
    // hasTemporalSubsetting,
    // hasTransforms,
    // hasVariables,
    hasMapImagery,
    isCwic,
    isCollectionInProject,
    isNrt,
    services,
    shortName,
    temporalRange,
    thumbnail,
    variables,
    versionId
  } = collectionMetadata

  const { thumbnailSize } = getApplicationConfig()
  const {
    height: thumbnailHeight,
    width: thumbnailWidth
  } = thumbnailSize

  const customizeBadges = []

  const popperOffset = {
    modifiers: [{
      name: 'offset',
      options: {
        offset: [0, 6]
      }
    }]
  }

  let hasFormats = false
  let hasSpatialSubsetting = false
  let hasTemporalSubsetting = false
  let hasTransforms = false
  let hasVariables = false

  const { count: servicesCount, items } = services

  if (servicesCount > 0) {
    items.forEach((service) => {
      const { type, serviceOptions = {} } = service

      if (['ESI', 'Harmony', 'OPeNDAP'].includes(type)) {
        let variableSubset = {}

        if (serviceOptions != null) {
          const { subset = {} } = serviceOptions

          const {
            interpolationTypes = [],
            spatialSubset = {},
            supportedOutputProjections = [],
            supportedReformattings = [],
            temporalSubset = {}
          } = subset;

          (variableSubset = {}) = subset

          // Set hasFormats
          hasFormats = supportedReformattings.length > 0

          // Set hasSpatialSubsetting
          hasSpatialSubsetting = !isEmpty(spatialSubset)

          // Set hasTemporalSubsetting
          hasTemporalSubsetting = !isEmpty(temporalSubset)

          // Set hasTransforms
          hasTransforms = !isEmpty(spatialSubset)
            || interpolationTypes.length > 0
            || supportedOutputProjections.length > 1
        }

        // Set hasVariables
        const { count: variablesCount } = variables
        if (variablesCount > 0 || !isEmpty(variableSubset)) {
          hasVariables = true
        }
      }
    })
  }

  if (hasSpatialSubsetting) {
    customizeBadges.push((
      <OverlayTrigger
        key="badge-icon__spatial-subsetting"
        placement="top"
        popperConfig={popperOffset}
        overlay={(
          <Tooltip
            id="tooltip_customize-spatial-subsetting"
            className="collection-results-item__badge-tooltip collection-results-item__badge-tooltip--icon"
          >
            Spatial customizable options available
          </Tooltip>
        )}
      >
        <EDSCIcon
          className="collection-results-item__badge-icon svg fa-globe-svg"
          icon={FaGlobe}
          size="0.625rem"
        />
      </OverlayTrigger>
    ))
  }

  if (hasVariables) {
    customizeBadges.push((
      <OverlayTrigger
        key="badge-icon__variables"
        placement="top"
        popperConfig={popperOffset}
        overlay={(
          <Tooltip
            id="tooltip_customize-variables"
            className="collection-results-item__badge-tooltip collection-results-item__badge-tooltip--icon"
          >
            Variable customizable options available
          </Tooltip>
        )}
      >
        <EDSCIcon
          className="collection-results-item__badge-icon svg fa-tags-svg"
          icon={FaTags}
          size="0.625rem"
        />
      </OverlayTrigger>
    ))
  }

  if (hasTransforms) {
    customizeBadges.push((
      <OverlayTrigger
        key="badge-icon__transforms"
        placement="top"
        popperConfig={popperOffset}
        overlay={(
          <Tooltip
            id="tooltip_customize-transforms"
            className="collection-results-item__badge-tooltip collection-results-item__badge-tooltip--icon"
          >
            Data transformation options available
          </Tooltip>
        )}
      >
        <EDSCIcon
          className="collection-results-item__badge-icon svg fa-sliders-svg"
          icon={FaSlidersH}
          size="0.625rem"
        />
      </OverlayTrigger>
    ))
  }

  if (hasFormats) {
    customizeBadges.push((
      <OverlayTrigger
        key="badge-icon__formats"
        placement="top"
        popperConfig={popperOffset}
        overlay={(
          <Tooltip
            id="tooltip_customize-formats"
            className="collection-results-item__badge-tooltip collection-results-item__badge-tooltip--icon"
          >
            Reformatting options available
          </Tooltip>
        )}
      >
        <EDSCIcon
          className="collection-results-item__badge-icon svg fa-file-svg"
          icon={FaFileAlt}
          size="0.625rem"
        />
      </OverlayTrigger>
    ))
  }

  if (hasTemporalSubsetting) {
    customizeBadges.push((
      <OverlayTrigger
        key="badge-icon__temporal-subsetting"
        placement="top"
        popperConfig={popperOffset}
        overlay={(
          <Tooltip
            id="tooltip_customize-temporal-subsetting"
            className="collection-results-item__badge-tooltip collection-results-item__badge-tooltip--icon"
          >
            Temporal subsetting options available
          </Tooltip>
        )}
      >
        <EDSCIcon
          className="collection-results-item__badge-icon svg fa-clock-svg"
          icon={FaClock}
          size="0.625rem"
        />
      </OverlayTrigger>
    ))
  }

  const addToProjectButton = (
    <Button
      className="collection-results-item__action collection-results-item__action--add"
      onClick={(e) => {
        onAddProjectCollection(collectionId)
        e.stopPropagation()
      }}
      variant="light"
      bootstrapVariant="light"
      icon={FaPlus}
      label="Add collection to the current project"
      title="Add collection to the current project"
    />
  )

  const removeFromProjectButton = (
    <Button
      className="collection-results-item__action collection-results-item__action--remove"
      onClick={(e) => {
        onRemoveCollectionFromProject(collectionId)
        e.stopPropagation()
      }}
      variant="light"
      bootstrapVariant="light"
      icon={FaMinus}
      label="Remove collection from the current project"
      title="Remove collection from the current project"
    />
  )

  return (
    <div
      className="collection-results-item"
      data-test-id="collection-results-item"
      key={collectionId}
      ref={ref}
    >
      <div
        role="button"
        tabIndex="0"
        className="collection-results-item__link"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            onViewCollectionGranules(collectionId)
          }
          e.stopPropagation()
        }}
        onClick={(e) => {
          onViewCollectionGranules(collectionId)
          e.stopPropagation()
        }}
        data-test-id="collection-result-item"
      >
        <div className="collection-results-item__thumb">
          {
            thumbnail && (
              <img
                className="collection-results-item__thumb-image"
                src={thumbnail}
                alt={`Thumbnail for ${title}`}
                height={thumbnailHeight}
                width={thumbnailWidth}
              />
            )
          }
        </div>
        <div className="collection-results-item__body">
          <div className="collection-results-item__body-primary">
            <div className="collection-results-item__info">
              <h3 className="collection-results-item__title">
                {title}
              </h3>
              <p className="collection-results-item__desc">
                {
                  isCwic && (
                    <strong>Int&apos;l / Interagency</strong>
                  )
                }
                {
                  !isCwic && (
                    <strong>{`${commafy(granuleCount)} ${pluralize('Granule', granuleCount)}`}</strong>
                  )
                }
                <strong> &bull; </strong>
                {
                  temporalRange && (
                    <>
                      <strong>{temporalRange}</strong>
                      <strong> &bull; </strong>
                    </>
                  )
                }
                {abstract}
              </p>
            </div>
            <div className="collection-results-item__actions">
              <Button
                className="collection-results-item__action collection-results-item__action--collection-details"
                onClick={(e) => {
                  onViewCollectionDetails(collectionId)
                  e.stopPropagation()
                }}
                label="View collection details"
                title="View collection details"
                bootstrapVariant="light"
                icon={FaInfoCircle}
              />
              <PortalFeatureContainer authentication>
                <>
                  {
                    isCollectionInProject && removeFromProjectButton
                  }
                  {
                    !isCollectionInProject && addToProjectButton
                  }
                </>
              </PortalFeatureContainer>
            </div>
          </div>
          <div className="collection-results-item__body-secondary">
            {
              isCwic && (
                <OverlayTrigger
                  placement="top"
                  overlay={(
                    <Tooltip
                      id="tooltip__quic-badge"
                      className="collection-results-item__badge-tooltip"
                    >
                      Int&apos;l / Interagency Data
                    </Tooltip>
                  )}
                >
                  <Badge
                    className="collection-results-item__badge collection-results-item__badge--cwic"
                  >
                    CWIC
                  </Badge>
                </OverlayTrigger>
              )
            }
            {
              hasMapImagery && (
                <OverlayTrigger
                  placement="top"
                  overlay={(
                    <Tooltip
                      id="tooltip__map-imagery-badge"
                      className="collection-results-item__badge-tooltip"
                    >
                      Supports advanced map visualizations using the GIBS tile service
                    </Tooltip>
                  )}
                >
                  <Badge
                    className="collection-results-item__badge collection-results-item__badge--map-imagery"
                  >
                    Map Imagery
                  </Badge>
                </OverlayTrigger>
              )
            }
            {
              customizeBadges.length > 0 && (
                <SplitBadge
                  className="collection-results-item__badge  collection-results-item__badge--customizable"
                  primary="Customizable"
                  secondary={customizeBadges}
                />
              )
            }
            {
              isNrt && (
                <OverlayTrigger
                  placement="top"
                  overlay={(
                    <Tooltip
                      id="tooltip__near-real-time-badge"
                      className="collection-results-item__badge-tooltip"
                    >
                      Near Real Time (NRT) Data
                    </Tooltip>
                  )}
                >
                  <Badge
                    className="collection-results-item__badge collection-results-item__badge--near-real-time"
                  >
                    NRT
                  </Badge>
                </OverlayTrigger>
              )
            }
            {
              (
                shortName
                && versionId
                && displayOrganization
              ) && (
                <Badge
                  className="badge collection-results-item__badge collection-results-item__badge--attribution"
                >
                  {
                    `${shortName} v${versionId} - ${displayOrganization}`
                  }
                </Badge>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
})

CollectionResultsItem.displayName = 'CollectionResultsItem'

CollectionResultsItem.propTypes = {
  collectionMetadata: PropTypes.shape({}).isRequired,
  onAddProjectCollection: PropTypes.func.isRequired,
  onRemoveCollectionFromProject: PropTypes.func.isRequired,
  onViewCollectionDetails: PropTypes.func.isRequired,
  onViewCollectionGranules: PropTypes.func.isRequired
}

export default CollectionResultsItem

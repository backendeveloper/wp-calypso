/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { some, omit, partial, map, get } from 'lodash';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaModal from 'post-editor/media-modal';
import PostActions from 'lib/posts/actions';
import { generateGalleryShortcode } from 'lib/media/utils';
import markup from 'post-editor/media-modal/markup';
import { bumpStat } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';

class EditorMediaModal extends Component {
	static propTypes = {
		site: PropTypes.object,
		onInsertMedia: PropTypes.func,
		onClose: PropTypes.func
	};

	static defaultProps = {
		onInsertMedia: () => {},
		onClose: () => {}
	};

	insertMedia = ( selectedItems, { gallerySettings } = {} ) => {
		const { site } = this.props;
		let media, stat;

		const getItemMarkup = partial( markup.get, site );

		if ( gallerySettings ) {
			if ( 'individual' === gallerySettings.type ) {
				media = map( gallerySettings.items, getItemMarkup ).join( '' );
			} else {
				media = generateGalleryShortcode( gallerySettings );
			}

			stat = 'insert_gallery';
		} else {
			media = map( selectedItems, getItemMarkup ).join( '' );
			stat = 'insert_item';
		}

		if ( some( selectedItems, 'transient' ) ) {
			PostActions.blockSave( 'MEDIA_MODAL_TRANSIENT_INSERT' );
		}

		if ( media ) {
			this.props.onInsertMedia( media );

			if ( stat ) {
				this.props.bumpStat( 'editor_media_actions', stat );
			}
		}

		this.props.onClose();
	};

	render() {
		const { site } = this.props;

		return (
			<MediaLibrarySelectedData siteId={ get( site, 'ID' ) }>
				<MediaModal
					{ ...omit( this.props, [ 'onInsertMedia', 'onClose' ] ) }
					onClose={ this.insertMedia } />
			</MediaLibrarySelectedData>
		);
	}
}

export default connect(
	( state ) => ( {
		site: getSelectedSite( state )
	} ),
	{ bumpStat }
)( EditorMediaModal );

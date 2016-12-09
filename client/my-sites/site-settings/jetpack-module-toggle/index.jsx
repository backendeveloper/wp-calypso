/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import notices from 'notices';
import { localize } from 'i18n-calypso';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

import {
	activateModule,
	deactivateModule
} from 'state/jetpack-settings/modules/actions';
import {
	isModuleActive,
	isActivatingModule,
	isDeactivatingModule,
	getModule
} from 'state/jetpack-settings/modules/selectors';
import { isJetpackSite } from 'state/sites/selectors';

class JetpackModuleToggle extends Component {
	static defaultProps = {
		disabled: false,
		checked: false,
		isJetpackSite: false
	};

	static propTypes = {
		siteId: PropTypes.number.isRequired,
		moduleSlug: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		checked: PropTypes.bool,
		disabled: PropTypes.bool,
		isJetpackSite: PropTypes.bool,
		activateModule: PropTypes.func,
		deactivateModule: PropTypes.func
	};

	handleChange = () => {
		if ( ! this.props.checked ) {
			this.props.activateModule( this.props.siteId, this.props.moduleSlug )
				.then( () => {
					notices.success( this.props.translate( '%s was activated!', { args: this.props.moduleDetails.name } ) );
				} )
				.catch( () => {
					notices.error( this.props.translate( '%s couldn\'t be activated!', { args: this.props.moduleDetails.name } ) );
				} );
		} else {
			this.props.deactivateModule( this.props.siteId, this.props.moduleSlug )
				.then( () => {
					notices.success( this.props.translate( '%s was deactivated!', { args: this.props.moduleDetails.name } ) );
				} )
				.catch( () => {
					notices.error( this.props.translate( '%s couldn\'t be deactivated!', { args: this.props.moduleDetails.name } ) );
				} );
		}
	}

	render() {
		if ( ! this.props.isJetpackSite ) {
			return null;
		}
		return (
			<span className="jetpack-module-toggle">
				<CompactFormToggle
					id={ `${ this.props.siteId }-${ this.props.moduleSlug }-toggle` }
					checked={ this.props.checked }
					toggling={ this.props.toggling }
					onChange={ this.handleChange }
					disabled={ this.props.disabled } >
					<span>{ this.props.label }</span>
					{
						this.props.description && (
							<FormSettingExplanation isIndented>
								{ this.props.description }
							</FormSettingExplanation>
						)
					}
				</CompactFormToggle>
			</span>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const active = isModuleActive( state, ownProps.siteId, ownProps.moduleSlug );
	const activating = isActivatingModule( state, ownProps.siteId, ownProps.moduleSlug );
	const moduleDetails = getModule( state, ownProps.siteId, ownProps.moduleSlug );
	const deactivating = isDeactivatingModule( state, ownProps.siteId, ownProps.moduleSlug );
	const moduleDetailsNotLoaded = moduleDetails === null;
	const toggling = activating || deactivating;
	return {
		moduleDetails,
		checked: ( active && ! deactivating ) || ( ! active && activating ),
		toggling,
		disabled: moduleDetailsNotLoaded || toggling,
		isJetpackSite: isJetpackSite( state, ownProps.siteId )
	};
}, {
	activateModule,
	deactivateModule
} )( localize( JetpackModuleToggle ) );

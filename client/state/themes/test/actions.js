/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';
import { Map } from 'immutable';

/**
 * Internal dependencies
 */
import {
	ACTIVE_THEME_REQUEST,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST_FAILURE,
	THEME_ACTIVATE_REQUEST,
	THEME_ACTIVATE_REQUEST_SUCCESS,
	THEME_ACTIVATE_REQUEST_FAILURE,
	THEME_CLEAR_ACTIVATED,
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEMES_RECEIVE,
	THEMES_REQUEST,
	THEMES_REQUEST_SUCCESS,
	THEMES_REQUEST_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
	THEME_TRANSFER_INITIATE_FAILURE,
} from 'state/action-types';
import {
	themeActivated,
	clearActivated,
	activateTheme,
	requestActiveTheme,
	receiveTheme,
	receiveThemes,
	requestThemes,
	requestTheme,
	pollThemeTransferStatus,
	initiateThemeTransfer,
} from '../actions';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receiveTheme()', () => {
		it( 'should return an action object', () => {
			const theme = { id: 'twentysixteen', name: 'Twenty Sixteen' };
			const action = receiveTheme( theme, 77203074 );

			expect( action ).to.eql( {
				type: THEMES_RECEIVE,
				themes: [ theme ],
				siteId: 77203074
			} );
		} );
	} );

	describe( '#receiveThemes()', () => {
		it( 'should return an action object', () => {
			const themes = [ { id: 'twentysixteen', name: 'Twenty Sixteen' } ];
			const action = receiveThemes( themes, 77203074 );

			expect( action ).to.eql( {
				type: THEMES_RECEIVE,
				themes,
				siteId: 77203074
			} );
		} );
	} );

	describe( '#requestThemes()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.2/themes' )
				.reply( 200, {
					found: 2,
					themes: [
						{ ID: 'twentysixteen', name: 'Twenty Sixteen' },
						{ ID: 'mood', name: 'Mood' }
					]
				} )
				.get( '/rest/v1.2/themes' )
				.query( { search: 'Sixteen' } )
				.reply( 200, {
					found: 1,
					themes: [ { ID: 'twentysixteen', name: 'Twenty Sixteen' } ]
				} )
				.get( '/rest/v1/sites/77203074/themes' )
				.reply( 200, {
					found: 2,
					themes: [
						{ ID: 'twentyfifteen', name: 'Twenty Fifteen' },
						{ ID: 'twentysixteen', name: 'Twenty Sixteen' }
					]
				} )
				.get( '/rest/v1/sites/77203074/themes' )
				.query( { search: 'Sixteen' } )
				.reply( 200, {
					found: 1,
					themes: [ { ID: 'twentysixteen', name: 'Twenty Sixteen' } ]
				} )
				.get( '/rest/v1/sites/1916284/themes' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		context( 'with a wpcom site', () => {
			it( 'should dispatch fetch action when thunk triggered', () => {
				requestThemes( 'wpcom' )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: THEMES_REQUEST,
					siteId: 'wpcom',
					query: {}
				} );
			} );

			it( 'should dispatch themes receive action when request completes', () => {
				return requestThemes( 'wpcom' )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEMES_RECEIVE,
						themes: [
							{ ID: 'twentysixteen', name: 'Twenty Sixteen' },
							{ ID: 'mood', name: 'Mood' }
						],
						siteId: 'wpcom'
					} );
				} );
			} );

			it( 'should dispatch themes request success action when request completes', () => {
				return requestThemes( 'wpcom' )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEMES_REQUEST_SUCCESS,
						siteId: 'wpcom',
						query: {},
						found: 2,
						themes: [
							{ ID: 'twentysixteen', name: 'Twenty Sixteen' },
							{ ID: 'mood', name: 'Mood' }
						]
					} );
				} );
			} );

			it( 'should dispatch themes request success action with query results', () => {
				return requestThemes( 'wpcom', { search: 'Sixteen' } )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEMES_REQUEST_SUCCESS,
						siteId: 'wpcom',
						query: { search: 'Sixteen' },
						found: 1,
						themes: [
							{ ID: 'twentysixteen', name: 'Twenty Sixteen' },
						]
					} );
				} );
			} );
		} );

		context( 'with a Jetpack site', () => {
			it( 'should dispatch fetch action when thunk triggered', () => {
				requestThemes( 77203074 )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: THEMES_REQUEST,
					siteId: 77203074,
					query: {}
				} );
			} );

			it( 'should dispatch themes receive action when request completes', () => {
				return requestThemes( 77203074 )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEMES_RECEIVE,
						themes: [
							{ ID: 'twentyfifteen', name: 'Twenty Fifteen' },
							{ ID: 'twentysixteen', name: 'Twenty Sixteen' },
						],
						siteId: 77203074
					} );
				} );
			} );

			it( 'should dispatch themes request success action when request completes', () => {
				return requestThemes( 77203074 )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEMES_REQUEST_SUCCESS,
						siteId: 77203074,
						query: {},
						found: 2,
						themes: [
							{ ID: 'twentyfifteen', name: 'Twenty Fifteen' },
							{ ID: 'twentysixteen', name: 'Twenty Sixteen' },
						]
					} );
				} );
			} );

			it( 'should dispatch themes request success action with query results', () => {
				return requestThemes( 77203074, { search: 'Sixteen' } )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEMES_REQUEST_SUCCESS,
						siteId: 77203074,
						query: { search: 'Sixteen' },
						found: 1,
						themes: [
							{ ID: 'twentysixteen', name: 'Twenty Sixteen' },
						]
					} );
				} );
			} );

			it( 'should dispatch fail action when request fails', () => {
				return requestThemes( 1916284 )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEMES_REQUEST_FAILURE,
						siteId: 1916284,
						query: {},
						error: sinon.match( { message: 'User cannot access this private blog.' } )
					} );
				} );
			} );
		} );
	} );

	describe( '#requestTheme()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.2/themes/twentysixteen' )
				.reply( 200, { id: 'twentysixteen', title: 'Twenty Sixteen' } )
				.get( '/rest/v1.2/themes/twentyumpteen' )
				.reply( 404, {
					error: 'unknown_theme',
					message: 'Unknown theme'
				} );
		} );

		context( 'with a wpcom site', () => {
			it( 'should dispatch request action when thunk triggered', () => {
				requestTheme( 'twentysixteen', 'wpcom' )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: THEME_REQUEST,
					siteId: 'wpcom',
					themeId: 'twentysixteen'
				} );
			} );

			it( 'should dispatch themes receive action when request completes', () => {
				return requestTheme( 'twentysixteen', 'wpcom' )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEMES_RECEIVE,
						themes: [
							sinon.match( { id: 'twentysixteen', title: 'Twenty Sixteen' } )
						],
						siteId: 'wpcom'
					} );
				} );
			} );

			it( 'should dispatch themes request success action when request completes', () => {
				return requestTheme( 'twentysixteen', 'wpcom' )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEME_REQUEST_SUCCESS,
						siteId: 'wpcom',
						themeId: 'twentysixteen'
					} );
				} );
			} );

			it( 'should dispatch fail action when request fails', () => {
				return requestTheme( 'twentyumpteen', 'wpcom' )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: THEME_REQUEST_FAILURE,
						siteId: 'wpcom',
						themeId: 'twentyumpteen',
						error: sinon.match( { message: 'Unknown theme' } )
					} );
				} );
			} );
		} );
		context( 'with a Jetpack site', () => {
			// TODO!
			// But do we have a theme details endpoint on Jetpack sites at all?
		} );
	} );

	describe( '#themeActivated()', () => {
		it( 'should return an action object', () => {
			const expectedActivationSuccess = {
				meta: {
					analytics: [
						{
							payload: {
								name: 'calypso_themeshowcase_theme_activate',
								properties: {
									previous_theme: 'twentyfifteen',
									purchased: false,
									search_term: 'simple, white',
									source: 'unknown',
									theme: 'twentysixteen',
								},
								service: 'tracks',
							},
							type: 'ANALYTICS_EVENT_RECORD'
						},
					],
				},
				type: THEME_ACTIVATE_REQUEST_SUCCESS,
				themeStylesheet: 'pub/twentysixteen',
				siteId: 2211667,
			};

			const fakeGetState = () => ( {
				themes: {
					activeThemes: {
						2211667: 'twentyfifteen'
					},
					themesList: Map( {
						query: Map( {
							search: 'simple, white'
						} )
					} )
				}
			} );

			themeActivated( 'pub/twentysixteen', 2211667 )( spy, fakeGetState );
			expect( spy ).to.have.been.calledWith( expectedActivationSuccess );
		} );
	} );

	describe( '#clearActivated()', () => {
		it( 'should return an action object', () => {
			const action = clearActivated( 22116677 );
			expect( action ).to.eql( {
				type: THEME_CLEAR_ACTIVATED,
				siteId: 22116677
			} );
		} );
	} );

	describe( '#activateTheme()', () => {
		const trackingData = {
			theme: 'twentysixteen',
			previous_theme: 'twentyfifteen',
			source: 'unknown',
			purchased: false,
			search_term: 'simple, white'
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2211667/themes/mine', { theme: 'twentysixteen' } )
				.reply( 200, { id: 'karuna', version: '1.0.3' } )
				.post( '/rest/v1.1/sites/2211667/themes/mine', { theme: 'badTheme' } )
				.reply( 404, {
					error: 'theme_not_found',
					message: 'The specified theme was not found'
				} );
		} );

		it( 'should dispatch request action when thunk is triggered', () => {
			activateTheme( 'twentysixteen', 2211667 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: THEME_ACTIVATE_REQUEST,
				siteId: 2211667,
				themeId: 'twentysixteen',
			} );
		} );

		it( 'should dispatch theme activation success thunk when request completes', () => {
			return activateTheme( 'twentysixteen', 2211667, trackingData )( spy ).then( () => {
				expect( spy.secondCall.args[ 0 ].name ).to.equal( 'themeActivatedThunk' );
			} );
		} );

		it( 'should dispatch theme activation failure action when request completes', () => {
			const themeActivationFailure = {
				error: sinon.match( { message: 'The specified theme was not found' } ),
				siteId: 2211667,
				themeId: 'badTheme',
				type: THEME_ACTIVATE_REQUEST_FAILURE
			};

			return activateTheme( 'badTheme', 2211667, trackingData )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( themeActivationFailure );
			} );
		} );
	} );

	describe( '#requestActiveTheme', () => {
		const successResponse = {
			id: 'rebalance',
			screenshot: 'https://i0.wp.com/s0.wp.com/wp-content/themes/pub/rebalance/screenshot.png?ssl=1',
			cost: {
				currency: 'USD',
				number: 0,
				display: ''
			},
			version: '1.1.1',
			download_url: 'https://public-api.wordpress.com/rest/v1/themes/download/rebalance.zip',
			trending_rank: 17,
			popularity_rank: 183,
			launch_date: '2016-05-13',
			name: 'Rebalance',
			description: 'Rebalance is a new spin on the classic ' +
				'Imbalance 2 portfolio theme. It is a simple, modern' +
				'theme for photographers, artists, and graphic designers' +
				'looking to showcase their work.',
			tags: [
				'responsive-layout',
				'one-column',
				'two-columns',
				'three-columns',
				'custom-background',
				'custom-colors',
				'custom-menu',
				'featured-images',
				'featured-content-with-pages',
				'theme-options',
				'threaded-comments',
				'translation-ready'
			],
			preview_url: 'https://unittest.wordpress.com/?theme=pub/rebalance&hide_banners=true'
		};

		const failureResponse = {
			status: 404,
			code: 'unknown_blog',
			message: 'Unknown blog'
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2211667/themes/mine' )
				.reply( 200, successResponse )
				.get( '/rest/v1.1/sites/666/themes/mine' )
				.reply( 404, failureResponse );
		} );

		it( 'should dispatch active theme request action when triggered', () => {
			requestActiveTheme( 2211667 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: ACTIVE_THEME_REQUEST,
				siteId: 2211667,
			} );
		} );

		it( 'should dispatch active theme request success action when request completes', () => {
			return requestActiveTheme( 2211667 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: ACTIVE_THEME_REQUEST_SUCCESS,
					siteId: 2211667,
					themeId: 'rebalance',
					themeName: 'Rebalance',
					themeCost: {
						currency: 'USD',
						number: 0,
						display: ''
					}
				} );
			} );
		} );

		it( 'should dispatch active theme request failure action when request completes', () => {
			return requestActiveTheme( 666 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: ACTIVE_THEME_REQUEST_FAILURE,
					siteId: 666,
					error: sinon.match( { message: 'Unknown blog' } ),
				} );
			} );
		} );
	} );

	describe( '#pollThemeTransferStatus', () => {
		const siteId = '2211667';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/1` )
				.reply( 200, { status: 'complete', message: 'all done', themeId: 'mood' } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/2` ).thrice()
				.reply( 200, { status: 'stuck', message: 'jammed' } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/3` ).twice()
				.reply( 200, { status: 'progress', message: 'in progress' } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/3` )
				.reply( 200, { status: 'complete', message: 'all done', themeId: 'mood' } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/status/4` )
				.reply( 400, 'something wrong' );
		} );

		it( 'should dispatch success on status complete', () => {
			pollThemeTransferStatus( siteId, 1 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_TRANSFER_STATUS_RECEIVE,
					siteId,
					transferId: 1,
					status: 'complete',
					message: 'all done',
					themeId: 'mood',
				} );
			} );
		} );

		it( 'should time-out if status never complete', ( done ) => {
			pollThemeTransferStatus( siteId, 2, 10, 25 )( spy ).then( () => {
				done();
				expect( spy ).to.have.been.calledWith( {
					type: THEME_TRANSFER_STATUS_FAILURE,
					siteId,
					transferId: 2,
					error: 'client timeout',
				} );
			} );
		} );

		it( 'should dispatch status update', ( done ) => {
			pollThemeTransferStatus( siteId, 3, 20 )( spy ).then( () => {
				done();
				// Two 'progress' then a 'complete'
				expect( spy ).to.have.been.calledThrice;
				expect( spy ).to.have.been.calledWith( {
					type: THEME_TRANSFER_STATUS_RECEIVE,
					siteId: siteId,
					transferId: 3,
					status: 'progress',
					message: 'in progress',
					themeId: undefined,
				} );
				expect( spy ).to.have.been.calledWith( {
					type: THEME_TRANSFER_STATUS_RECEIVE,
					siteId: siteId,
					transferId: 3,
					status: 'complete',
					message: 'all done',
					themeId: 'mood',
				} );
			} );
		} );

		it( 'should dispatch failure on receipt of error', () => {
			pollThemeTransferStatus( siteId, 4 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWithMatch( {
					type: THEME_TRANSFER_STATUS_FAILURE,
					siteId,
					transferId: 4,
				} );
				expect( spy ).to.have.been.calledWith( sinon.match.has( 'error', sinon.match.truthy ) );
			} );
		} );
	} );

	describe( '#initiateThemeTransfer', () => {
		const siteId = '2211667';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( `/rest/v1.1/sites/${ siteId }/automated-transfers/initiate` )
				.reply( 200, { success: true, status: 'progress', transfer_id: 1, } )
				.get( `/rest/v1.1/sites/${ siteId }/automated-transfers/initiate` )
				.reply( 400, 'some problem' );
		} );

		it( 'should dispatch success', () => {
			initiateThemeTransfer( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledThrice;

				expect( spy ).to.have.been.calledWith( {
					type: THEME_TRANSFER_INITIATE_REQUEST,
					siteId,
				} );

				expect( spy ).to.have.been.calledWith( {
					type: THEME_TRANSFER_INITIATE_SUCCESS,
					siteId,
					transferId: 1,
				} );

				expect( spy ).to.have.been.calledWith( sinon.match.func );
			} );
		} );

		it( 'should dispatch failure on error', () => {
			initiateThemeTransfer( siteId )( spy ).catch( () => {
				expect( spy ).to.have.been.calledOnce;

				expect( spy ).to.have.been.calledWithMatch( {
					type: THEME_TRANSFER_INITIATE_FAILURE,
					siteId,
				} );
				expect( spy ).to.have.been.calledWith( sinon.match.has( 'error', sinon.match.truthy ) );
			} );
		} );
	} );
} );

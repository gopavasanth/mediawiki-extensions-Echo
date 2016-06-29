( function ( $, mw ) {
	/**
	 * A widget that displays wikis and their pages to choose a filter
	 *
	 * @class
	 * @extends OO.ui.SelectWidget
	 *
	 * @constructor
	 * @param {mw.echo.dm.FiltersModel} filterModel Filters model
	 * @param {string} source Symbolic name for the source
	 * @param {Object} [config] Configuration object
	 * @cfg {string} [title] The title of this page group, usually
	 *  the name of the wiki that the pages belong to
	 * @cfg {number} [unreadCount] Number of unread notifications
	 * @cfg {number} [initialSelection] The page title of the option to select initially
	 */
	mw.echo.ui.PageFilterWidget = function MwEchoUiPageFilterWidget( filterModel, source, config ) {
		config = config || {};

		// Parent
		mw.echo.ui.PageFilterWidget.parent.call( this, config );

		this.model = filterModel;
		this.source = source;
		// This is to be able to fetch and recognize this widget
		// according to its source. The source is, in this case,
		// unique per filter widget.
		this.data = this.source;
		this.totalCount = config.unreadCount || this.model.getSourceTotalCount( this.source );

		this.initialSelection = config.initialSelection;

		// Title option
		this.title = new mw.echo.ui.PageNotificationsOptionWidget( {
			label: config.title,
			unreadCount: this.totalCount,
			data: null,
			classes: [ 'mw-echo-ui-pageFilterWidget-title' ]
		} );

		// Initialization
		this.populateDataFromModel();
		this.$element
			.addClass( 'mw-echo-ui-pageFilterWidget' );
	};

	/* Initialization */

	OO.inheritClass( mw.echo.ui.PageFilterWidget, OO.ui.SelectWidget );

	/**
	 * Set the total count of this group
	 *
	 * @param {number} count Total count
	 */
	mw.echo.ui.PageFilterWidget.prototype.setTotalCount = function ( count ) {
		this.totalCount = count;
		this.title.setCount( this.totalCount );
	};

	/**
	 * Set the total count of this group
	 *
	 * @return {number} Total count
	 */
	mw.echo.ui.PageFilterWidget.prototype.getTotalCount = function () {
		return this.totalCount;
	};

	/**
	 * Populate the widget from the model
	 */
	mw.echo.ui.PageFilterWidget.prototype.populateDataFromModel = function () {
		var i, title, widget,
			optionWidgets = [],
			sourcePages = this.model.getSourcePages( this.source );

		for ( i = 0; i < sourcePages.length; i++ ) {
			widget = new mw.echo.ui.PageNotificationsOptionWidget( {
				label: sourcePages[ i ].title,
				// TODO: Pages that are a user page should
				// have a user icon
				icon: 'article',
				unreadCount: sourcePages[ i ].count,
				// TODO: When we group pages, this should be
				// an array of titles
				data: sourcePages[ i ].title,
				classes: [ 'mw-echo-ui-pageFilterWidget-page' ]
			} );
			optionWidgets.push( widget );

			if ( this.initialSelection === title ) {
				widget.setSelected( true );
			}
		}

		this.setItems( optionWidgets );
	};

	/**
	 * Get the source associated with this filter
	 *
	 * @return {string} Source symbolic name
	 */
	mw.echo.ui.PageFilterWidget.prototype.getSource = function () {
		return this.source;
	};

	/**
	 * Get the title item
	 *
	 * @return {mw.echo.ui.PageNotificationsOptionWidget} Page title item
	 */
	mw.echo.ui.PageFilterWidget.prototype.getTitleItem = function () {
		return this.title;
	};

	/**
	 * Set the page items in this widget, in order
	 *
	 * @param {mw.echo.ui.PageNotificationsOptionWidget[]} items Item widgets to order and insert
	 */
	mw.echo.ui.PageFilterWidget.prototype.setItems = function ( items ) {
		var i, index;

		this.clearItems();
		for ( i = 0; i < items.length; i++ ) {
			index = this.findInsertionIndex( items[ i ] );
			this.addItems( [ items[ i ] ], index );
		}

		// Add the title on top
		this.addItems( [ this.title ], 0 );
	};

	/**
	 * Find the proper insertion index for ordering when inserting items
	 *
	 * @private
	 * @param {mw.echo.ui.PageNotificationsOptionWidget} item Item widget
	 * @return {number} Insertion index
	 */
	mw.echo.ui.PageFilterWidget.prototype.findInsertionIndex = function ( item ) {
		var widget = this;

		return OO.binarySearch(
			this.items,
			function ( otherItem ) {
				return widget.sortingFunction( item, otherItem );
			},
			true
		);
	};

	/**
	 * Sorting function for item insertion
	 *
	 * @private
	 * @param {mw.echo.ui.PageNotificationsOptionWidget} item Item widget
	 * @param {mw.echo.ui.PageNotificationsOptionWidget} otherItem Another item widget
	 * @return {number} Ordering value
	 */
	mw.echo.ui.PageFilterWidget.prototype.sortingFunction = function ( item, otherItem ) {
		return Number( otherItem.getCount() ) - Number( item.getCount() );
	};
} )( jQuery, mediaWiki );
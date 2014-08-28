/**
 * jquery.calendario.js v2.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2012, Codrops
 * http://www.codrops.com
 * Updated by : Bozi Dabel
 */
;( function( $, window, undefined ) {

	'use strict';

	$.Calendario = function( options, element ) {

		this.$el = $( element );
		this._init( options );

	};

	// the options
	$.Calendario.defaults = {
		/*
		you can also pass:
		month : initialize calendar with this month (1-12). Default is today.
		year : initialize calendar with this year. Default is today.
		caldata : initial data/content for the calendar.
		caldata format:
		{
			'MM-DD-YYYY' : 'HTML Content',
			'MM-DD-YYYY' : 'HTML Content',
			'MM-DD-YYYY' : 'HTML Content'
			...
		}
		*/
		weeks : [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
		weekabbrs : [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
		months : [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
		monthabbrs : [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
		// choose between values in options.weeks or options.weekabbrs
		displayWeekAbbr : false,
		// choose between values in options.months or options.monthabbrs
		displayMonthAbbr : false,
		// left most day in the calendar
		// 0 - Sunday, 1 - Monday, ... , 6 - Saturday
		startIn : 1,
		onDayClick : function( $el, $content, dateProperties ) { return false; },
		onDayHover : function( $el, $content, dateProperties ) { return false; }
	};

	$.Calendario.prototype = {
		_init : function( options ) {

			// options
			this.options = $.extend( true, {}, $.Calendario.defaults, options );

			this.today = new Date();
			this.month = ( isNaN( this.options.month ) || this.options.month == null) ? this.today.getMonth() : this.options.month - 1;
			this.year = ( isNaN( this.options.year ) || this.options.year == null) ? this.today.getFullYear() : this.options.year;
			this.caldata = this.options.caldata || {};
			this._generateTemplate();
			this._initEvents();

		},
		_initEvents : function() {

			var self = this;

			this.$el.on( 'click.calgrid', 'tr > td', function() {

				var $cell = $( this ),
					idx = $cell.index(),
					$content = $cell.children( 'div' ),
					dateProp = {
						day : $cell.children( '.calgrid-date' ).text(),
						month : self.month + 1,
						monthname : self.options.displayMonthAbbr ? self.options.monthabbrs[ self.month ] : self.options.months[ self.month ],
						year : self.year,
						weekday : idx + self.options.startIn,
						weekdayname : self.options.weeks[ (idx==6?0:idx + self.options.startIn) ]
					};

				if( dateProp.day ) {
					self.options.onDayClick( $cell, $content, dateProp );
				}

			} );

			this.$el.on( 'mouseenter.calendario', 'tr > td', function() {

				var $cell = $( this ),
					idx = $cell.index(),
					$content = $cell.children( 'div' ),
					dateProp = {
						day : $cell.children( '.calgrid-date' ).text(),
						month : self.month + 1,
						monthname : self.options.displayMonthAbbr ? self.options.monthabbrs[ self.month ] : self.options.months[ self.month ],
						year : self.year,
						weekday : idx + self.options.startIn,
						weekdayname : self.options.weeks[ (idx==6?0:idx + self.options.startIn) ]
					};

				if( dateProp.day ) {
					self.options.onDayHover( $cell, $content, dateProp );
				}

			} );

		},
		// Calendar logic based on http://jszen.blogspot.pt/2007/03/how-to-build-simple-calendar-with.html
		_generateTemplate : function( callback ) {

			var head = this._getHead(),
				body = this._getBody();

			this.$cal = $( '<table class="table table-bordered calgrid">' ).append( head, body );

			this.$el.find( '.calgrid' ).remove().end().append( this.$cal );

			if( callback ) { callback.call(); }

		},
		_getHead : function() {

			var html = '<thead>';

			for ( var i = 0; i <= 6; i++ ) {

				var pos = i + this.options.startIn,
					j = pos > 6 ? pos - 6 - 1 : pos;

				html += '<th>';
				html += this.options.displayWeekAbbr ? this.options.weekabbrs[ j ] : this.options.weeks[ j ];
				html += '</th>';

			}

			html += '</thead>';

			return html;

		},
		_getBody : function() {

			var d = new Date( this.year, this.month + 1, 0 ),
				// number of days in the month
				monthLength = d.getDate(),
				firstDay = new Date( this.year, this.month, 1 );

			// day of the week
			this.startingDay = firstDay.getDay();

			var html = '<tbody><tr>',
				// fill in the days
				day = 1;

			// this loop is for weeks (rows)
			for ( var i = 0; i < 7; i++ ) {

				// this loop is for weekdays (cells)
				for ( var j = 0; j <= 6; j++ ) {

					var pos = this.startingDay - this.options.startIn,
						p = pos < 0 ? 6 + pos + 1 : pos,
						inner = '',
						today = this.month === this.today.getMonth() && this.year === this.today.getFullYear() && day === this.today.getDate(),
						past = this.year < this.today.getFullYear() || this.month < this.today.getMonth() && this.year === this.today.getFullYear() || this.month === this.today.getMonth() && this.year === this.today.getFullYear() && day < this.today.getDate(),
						content = '';

					if ( day <= monthLength && ( i > 0 || j >= p ) ) {
						inner += '<span class="calgrid-date">' + day + '</span>';
						inner += '<div class="calgrid-date-events"></div>';
						++day;
					}
					else {
						today = false;
					}

					var cellClasses = today ? 'calgrid-today ' : '';
					if ( past ) {
						cellClasses += 'calgrid-past ';
					}
					if( content !== '' ) {
						cellClasses += 'calgrid-cell';
					}

					html += cellClasses !== '' ? '<td class="' + cellClasses + '">' : '<td>';
					html += inner;
					html += '</td>';
				}

				// stop making rows if we've run out of days
				if (day > monthLength) {
					this.rowTotal = i + 1;
					break;
				}
				else {
					html += '</tr><tr>';
				}

			}
			html += '</tr></tbody>';

			return html;

		},

		/*************************
		******PUBLIC METHODS *****
		**************************/
		getYear : function() {
			return this.year;
		},
		getMonth : function() {
			return this.month + 1;
		},
		getMonthName : function() {
			return this.options.displayMonthAbbr ?
				this.options.monthabbrs[ this.month ] :
				this.options.months[ this.month ];
		},
		// gets the cell's content div associated to a day of the current displayed month
		// day : 1 - [28||29||30||31]
		getCell : function( day ) {
			var startingDayOffset = this.startingDay - this.options.startIn,
				offset = startingDayOffset < 0 ? 6 + startingDayOffset + 1 :
					startingDayOffset;

			var row = Math.floor( ( day + offset ) / 7 ),
				pos = day + this.startingDay - this.options.startIn - ( row * 7 ) - 1;

			return this.$cal.find( 'tbody' )
				.children( 'tr' ).eq( row )
				.children( 'td' ).eq( pos );

		}
	};

	var logError = function( message ) {

		if ( window.console ) {

			window.console.error( message );

		}

	};

	$.fn.calendario = function( options ) {

		var instance = $.data( this, 'calendario' );

		if ( typeof options === 'string' ) {

			var args = Array.prototype.slice.call( arguments, 1 );

			this.each(function() {

				if ( !instance ) {

					logError( "cannot call methods on calendario prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;

				}

				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {

					logError( "no such method '" + options + "' for calendario instance" );
					return;

				}

				instance[ options ].apply( instance, args );

			});

		}
		else {

			this.each(function() {

				if ( instance ) {

					instance._init();

				}
				else {

					instance = $.data( this, 'calendario', new $.Calendario( options, this ) );

				}

			});

		}

		return instance;

	};

} )( jQuery, window );

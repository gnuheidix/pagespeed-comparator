/*
 * PageSpeedComparator - fetches and renders PageSpeed results using Charts
 * 
 * PageSpeed and Charts is Google stuff
 *
 * Requirements: ECMAScript 5th Edition
 *
 * AUTHOR
 * 
 * Copyright (C) 2013 Thomas Heidrich
 * 
 * LICENSE
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; version 2 dated June,
 * 1991.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 */

/*
 * @param string apiKey Google API key to be used in PageSpeed JSONP requests
 * @param string callbackInstanceName the instance variable name of PageSpeedComparator all callbacks should be using
 */
function PageSpeedComparator(apiKey, callbackInstanceName){
	this.apiKey = apiKey;
	this.callbackInstanceName = callbackInstanceName;
	this.openCallbacks = 0;
	this.siteList = [];
	this.results = [["", "Score"]];
	this.pagespeedURL = 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed?';
}

// does the magic for one or multiple sites
// list structure: {url1: identifier1, url2: idientifier2,...}
PageSpeedComparator.prototype.compare = function(siteList, resultElement){
	if(typeof google === 'undefined'){
		alert('Google jsapi fehlt');
	}else{
		google.load('visualization', '1', {packages: ['corechart']});
		for(var siteURL in siteList){
			this.fetchPageSpeedResults(siteList[siteURL], siteURL);
		}
		this.siteList = siteList;
		this.resultElement = resultElement;
	}
}

// does an JSONP-request
PageSpeedComparator.prototype.fetchPageSpeedResults = function(siteName, siteURL){
	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.async = true;
	var query = [
		'url=' + siteURL,
		'callback=' + this.callbackInstanceName + '.pageSpeedCallback',
		'prettyprint=false',
		'key=' + this.apiKey,
	].join('&');

	this.openCallbacks++;	
	s.src = this.pagespeedURL + query;
	document.head.insertBefore(s, null);
}

// gets called by the PageSpeed JSONP
PageSpeedComparator.prototype.pageSpeedCallback = function(result){
	--this.openCallbacks;
	if(result.error){
		var errors = result.error.errors;
		for (var i = 0, len = errors.length; i < len; ++i) {
			this.resultElement.innerHTML = '<p>' + (errors[i].message) + '</p>';
		}
	}else{
		this.processResult(result);
	}	
}

// updates the progress bar and triggers graph rendering
PageSpeedComparator.prototype.processResult = function(result){
	this.results.push([
		this.siteList[result.request.url],
		result.score
	]);
	
	this.resultElement.innerHTML = '<progress value="' + (Object.keys(this.siteList).length - this.openCallbacks) + '" max="' + Object.keys(this.siteList).length + '"></progress>';
	
	if(this.openCallbacks <= 0){
		this.renderResult();
	}
}

// output graph using Google Charts
PageSpeedComparator.prototype.renderResult = function(){

	var dataTable = google.visualization.arrayToDataTable(this.results);
	
	new google.visualization.ColumnChart(
		this.resultElement
	).draw(
		dataTable,
		{
			//width: this.siteList.length * 100,
			height:500,
			vAxis: {title: "Score"},
			legend: {position: 'none'}
		}
	);
}



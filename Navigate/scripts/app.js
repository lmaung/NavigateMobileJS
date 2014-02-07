// (c) 2014 Lwin Maung http://lwin.maungs.com
// GPS Naviagtion software for mobile platform using phoneGap / HTML5 / Mobile web
//nokia.Settings.set("appId", "YOURAPPID"); 
//nokia.Settings.set("authenticationToken", "YOURTOKENKEY");
// Use staging environment (remove the line for production environment)
nokia.Settings.set("serviceMode", "cit");
//navigator.notification.alert("",function () { }, "SAFETY WARNING", 'OK');

var storage, map, tLat, tLon, tHeading, tSpeed, tTimeStamp, myLocationMarker,
    toggleCenterFollow, toggleTraffic, toggleRestaurant, resultSetRestaurant,
    toggleCoffee, resultSetCoffee, toggleMarket, resultSetEMS, toggleEMS, searchResultSet,
    toggleHealth, resultSetHealth, togglePharmacy, resultSetPharmacy, showPopup,
    tempName,tempPhone,tempAddress,tempCity,tempState,tempZip,tempCountry,tempLon, tempLat,
    searchCounter, searchLimit ,searchManager, router, mapRoute;
 
var TOUCH = nokia.maps.dom.Page.browser.touch,
	CLICK = TOUCH ? "tap" : "click";

// Starts a new app with mapPageView as initial page and kick things off with onDeviceReady
var app = new kendo.mobile.Application(document.body, { initial: "mapPageView"});
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    initializeItems();
    initializeMap();
} 

// Initial Safety Warning
function safetyWarning (){
    navigator.notification.alert("\nPlease be safe and always pay attention to the road. \n\nRoad conditions and directions may change or be inaccurate. Always observe posted road sign and current road conditions. \n\nAlways obey the local governing laws regarding usage of this device while driving.",
        function () { }, "SAFETY WARNING", 'OK');
}

// Resets the bottom tabstrip (Cosmatic)
function clearTabStrip() {
  var tabstrip = app.view().footer.find(".km-tabstrip").data("kendoMobileTabStrip");
  tabstrip.clear();
}

// BASIC INITIALIZATION
function initializeItems() {
    navigator.splashscreen.hide();
    app.showLoading();
    storage = window.localStorage;
    $(document.body).height(window.innerHeight);
    clearTabStrip();                                 // Clears bottom tabstrip (cosmatic)
    
    //SHOW OR HIDE SAFETY WARNING
    if ((storage["showSafetyWarning"] == null)||(storage["showSafetyWarning"] == "true"))
    {
        safetyWarning();
    }
    //additional items
    map = null;
    mapRoute = null;
    toggleCenterFollow = true;             // This will enable to recenter map if set to true
    myLocationMarker  = null;
    searchManager = null;
    searchResultSet = null;
    toggleRestaurant = false;              // Flip switch to see if in the layer is enabled or disabled
    resultSetRestaurant = null;            // Data set to hold search results for (restaurants)
    toggleCoffee = false;
    resultSetCoffee = null;
    toggleMarket = false;
    resultSetMarket = null;
    toggleEMS = false;
    resultSetEMS = null;
    togglePharmacy= false;
    resultSetPharmacy = null;
    toggleHealth = false;
    resultSetHealth = null;
    searchCounter = 0;
    searchLimit = 5;
    
    if ((storage["showHUD"] == null)||(storage["showHUD"] == "false"))
    {
        document.getElementById('hudLocation').style.display="none";
    }
    else
    {
        document.getElementById('hudLocation').style.display="block";
    }
    
}

// Gets a new map and place it. If the GPS is not found in [followMe] the map will result back to Chicago
function initializeMap(){
    
    tLat = -87.632408;
    tLon = 41.884151;
    mapContainer = document.getElementById("mapContainer");
    screenHeight = $(window).height();
    $("#mapContainer").css("height",screenHeight - 89);
    map = new nokia.maps.map.Display(mapContainer, {
    	center: [tLon,tLat], 
    	zoomLevel: 14,
    	components:[new nokia.maps.map.component.Behavior(), ]//new nokia.maps.map.component.Traffic()] //,new nokia.maps.map.component.ZoomBar()]
    });
    
    //map.components.add(infoBubbles);
    map.set("baseMapType", nokia.maps.map.Display.SMARTMAP);
    //map.set("baseMapType", nokia.maps.map.Display.SATELLITE);
    //map.set("baseMapType", nokia.maps.map.Display.NORMAL);
    
    app.hideLoading();
    locatePosition();
    
    //THIS WILL LOAD TRAFFIC SETTINGS FROM STORAGE
    if ((storage["showTraffic"] == null)||(storage["showTraffic"] == "true"))
    {
        $("#traffic-switch").data("kendoMobileSwitch").check(true);
        storage["showTraffic"] = true;
        map.overlays.add(map.TRAFFIC);
    }
    else
    {
        $("#traffic-switch").data("kendoMobileSwitch").check(false);
        storage["showTraffic"] = false;
        map.overlays.remove(map.TRAFFIC);
    }
    
    //THIS WILL LOAD TRAFFIC SETTINGS FROM STORAGE
    if ((storage["showHUD"] == null)||(storage["showHUD"] == "false"))
    {
        document.getElementById('hudLocation').style.display="none";
    }
    else
    {
       document.getElementById('hudLocation').style.display="block";
    }
    
}

// Launch GPS and gets your position
function locatePosition(){
    gpsWatcher = navigator.geolocation.watchPosition(onGPSSuccess, onGPSError); 
}

// Gets the current position and updates the map (which will recenter to the newly updated position)
function onGPSSuccess(position) {
    tLat = position.coords.latitude;
    tLon = position.coords.longitude;
    tHeading = position.coords.heading;
    tSpeed = position.coords.speed;
    tTimeStamp = position.timestamp;
    showHUD();
    
    currentCoords = new nokia.maps.geo.Coordinate(tLat,tLon);
    displayLocationOnMap();//FIGURE OUT AND ONLY RUN THIS ONCE
}

function showHUD(){
    //1mps = 2.2369362920544025 mph
    //1mps = 3.6 kph
    
    document.getElementById('speedUnit').innerHTML="MPH";
    if (((tSpeed*2.2369362920544025).toFixed(2)) <0 )
    {
        document.getElementById('currentSpeed').innerHTML="0.00";
    }
    else
    {
        document.getElementById('currentSpeed').innerHTML=(tSpeed*2.2369362920544025).toFixed(2);
    }
    
    var nanHeading = isNaN(tHeading);
    if (nanHeading == true)
    {
        document.getElementById('currentHeading').innerHTML="";
    }
    else
    {
        if ((parseFloat(tHeading) > 0) && (parseFloat(tHeading) <22.5))
        {
            document.getElementById('currentHeading').innerHTML="N";
        }
        else if ((parseFloat(tHeading) > 22.5) && (parseFloat(tHeading) <67.5))
        {
            document.getElementById('currentHeading').innerHTML="NE";
        }
        else if ((parseFloat(tHeading) > 67.5) && (parseFloat(tHeading) <112.5))
        {
             document.getElementById('currentHeading').innerHTML="E";
        }
        else if ((parseFloat(tHeading) > 112.7) && (parseFloat(tHeading) <157.5))
        {
             document.getElementById('currentHeading').innerHTML="SE";
        }
        else if ((parseFloat(tHeading) > 157.5) && (parseFloat(tHeading) <202.5))
        {
             document.getElementById('currentHeading').innerHTML="S";
        }
        else if ((parseFloat(tHeading) > 202.5) && (parseFloat(tHeading) <247.5))
        {
             document.getElementById('currentHeading').innerHTML="SW";
        }
        else if ((parseFloat(tHeading) > 247.5) && (parseFloat(tHeading) <292.5))
        {
             document.getElementById('currentHeading').innerHTML="W";
        }
        else if ((parseFloat(tHeading) > 292.5) && (parseFloat(tHeading) <337.5))
        {
             document.getElementById('currentHeading').innerHTML="NW";
        }
        else if ((parseFloat(tHeading) > 337.5) && (parseFloat(tHeading) <360))
        {
             document.getElementById('currentHeading').innerHTML="N";
        }
        else
        {
             document.getElementById('currentHeading').innerHTML="";
        }
    }
}

// NO GPS!!!! 
function onGPSError(error){
    tLat = -87.632408;
    tLon = 41.884151;
    navigator.notification.alert("Can not get a fix on the location.\n Please make sure that GPS is enabled.",
        function () { }, "ALERT", 'OK');
}

// DISPLAY CURRENT LOCATION ON THE MAP AND PLOPS THE MARKER
function displayLocationOnMap(){
    if (toggleCenterFollow == true)
    {
        map.set("center", currentCoords);
    }
    if (myLocationMarker) map.objects.remove(myLocationMarker);
    myLocationMarker = new nokia.maps.map.Marker(new nokia.maps.geo.Coordinate(tLat,tLon),{icon: "images/here.png",anchor: new nokia.maps.util.Point(20,45)});
    map.objects.add(myLocationMarker);
}

// RE-CENTERS CURRENT LOCATION ON CENTER OF MAP
function recenterMapOnCurrentLoc(){
    toggleCenterFollow = true;
    displayLocationOnMap();
}

// If map is moved manually, the map will no longer recenter on current location. current location tracker will still move.
function displayTouchedAreaOnMap(){
    toggleCenterFollow = false;
    hideSearch(); 
    clearTabStrip();
}

// Closes the Layers View
function closeModalViewLayer() {
    $("#modalview-Layer").kendoMobileModalView("close");
}

// Closes the Layers View
function closeModalViewSearch() {
    $("#modalview-SearchResult").kendoMobileModalView("close");
}

// Show / Hide Search Bar
function showSearch(){
    document.getElementById('MenuArea').style.display="none";
    document.getElementById('SearchArea').style.display="block";
}

// Hide / Show Search Bar
function hideSearch(){
    document.getElementById('MenuArea').style.display="block";
    document.getElementById('SearchArea').style.display="none";
    document.getElementById('txtSearchField').value=null;         // Reset the search field to blank
}

// This will bring up the search bar and will search for address location
function searchForLocation(){
    searchManager = nokia.places.search.manager,searchResultSet;
    searchManager.geoCode({
		searchTerm: document.getElementById('txtSearchField').value,
		onComplete: processSearchResults
	});
    hideSearch();
}

// Pointer to crap that I have not done yet
function nonFunctional (){
    navigator.notification.alert("This feature is done yet.",
        function () { }, "DEV NOTICE", 'OK');
}

// Removes the search results from screen
function removeSearchResult(){
    if (searchResultSet) map.objects.remove(searchResultSet);
    $("#modalview-SearchResult").kendoMobileModalView("close");
}

// SETAddresses to popup
function setPopupResults(){
    document.getElementById('popupHeader').innerHTML=tempName;
    document.getElementById('popupPhoneNumber').innerHTML=tempPhone;
    document.getElementById('popupAddress').innerHTML=tempAddress;
    if (showPopup == 1)
    {
        document.getElementById('tsFooterSearch').style.display="block";
        document.getElementById('tsFooterLayers').style.display="none";
        $("#searchPopupTabstrip1").data("kendoMobileTabStrip").clear();
    }
    else
    {
        document.getElementById('tsFooterSearch').style.display="none";
        document.getElementById('tsFooterLayers').style.display="block";
        $("#searchPopupTabstrip2").data("kendoMobileTabStrip").clear();
    }
    
}

function calculateRoute(){
    router = new nokia.maps.routing.Manager(); // create a route manager;
        var modes = [{
    	type: "shortest", 
    	transportModes: ["car"],
    	options: "avoidTollroad",
    	trafficMode: "default"
    }];
    var waypoints = new nokia.maps.routing.WaypointParameterList();
    navigator.notification.alert(tLat+','+tLon+'\n'+tempLat+','+tempLon,function () { }, "TEST", 'OK');
    waypoints.addCoordinate(new nokia.maps.geo.Coordinate(tLat,tLon));
    waypoints.addCoordinate(new nokia.maps.geo.Coordinate(parseFloat(tempLat),parseFloat(tempLon)));

    router.calculateRoute(waypoints, modes);
    router.addObserver("state", onRouteCalculated);     
}

// The function onRouteCalculated  will be called when a route was calculated
function onRouteCalculated (observedRouter, key, value) {
		if (value == "finished") {
			var routes = observedRouter.getRoutes();
			
			//create the default map representation of a route
			var mapRoute = new nokia.maps.routing.component.RouteResultSet(routes[0]).container;
			map.objects.add(mapRoute);
			displayLocationOnMap();
			//Zoom to the bounding box of the route
			map.zoomTo(mapRoute.getBoundingBox(), false, "default");
		} else if (value == "failed") {
			alert("The routing request failed.");
		}
	};
	
/////////SETTINGS///////////////////

// PRELOAD DATA
function onMapMenuView (){
    
    if ((storage["showSafetyWarning"] == null)||(storage["showSafetyWarning"] == "true"))
    {
       $("#warning-switch").data("kendoMobileSwitch").check(true);
    }
    else
    {
        $("#warning-switch").data("kendoMobileSwitch").check(false);
    }
    
    if ((storage["showHUD"] == null)||(storage["showHUD"] == "false"))
    {
        $("#hud-switch").data("kendoMobileSwitch").check(false);
    }
    else
    {
        $("#hud-switch").data("kendoMobileSwitch").check(true);
    }
    
}

// CHANGE THE WARNING POPUP
function onChangeWarning(e) {
  if (e.checked)
    {
        storage["showSafetyWarning"] = true;
    }
  else
    {
        storage["showSafetyWarning"] = false;
    }
}

// CHANGE THE Traffic POPUP
function onChangeTraffic(e) {
  if (e.checked)
    {
        storage["showTraffic"] = true;
        map.overlays.add(map.TRAFFIC);
    }
  else
    {
        storage["showTraffic"] = false;
        map.overlays.remove(map.TRAFFIC);
    }
}


// Toggles HUD from showing
function onChangeHUD(e){
    if (e.checked)
    {
        storage["showHUD"] = "true";
        document.getElementById('hudLocation').style.display="block";
    }
    else
    {
        storage["showHUD"] = "false";
        document.getElementById('hudLocation').style.display="none";
    }
}


// ENABLE/DISABLE THE RESTAURANT SEARCH
function onChangeRestaurant(e) {
  if (e.checked)
    {
        searchCounter = searchCounter +1;
        if (searchCounter == searchLimit)    // SEE IF I CAN STILL SEARCH (LIMIT LAYERS TO 4 FOR NOW)
        {                                    // ROLLING BACK
            navigator.notification.alert("In order to conserve battery life and increase performance of this app designed to display 4 different types of item layers at a time.\n\n Please unselect an item layer before selecting this layer.",function () { }, "NAVIGATE", 'OK');
            $("#restaurant-switch").data("kendoMobileSwitch").check(false);
            searchCounter = searchCounter - 1;
        }
        else
        {                                    // SHOW ON THE MAP
            toggleRestaurant = true;
            searchManager = nokia.places.search.manager,resultSetRestaurant;
            searchManager.findPlacesByCategory({
        		category: "restaurant",
        		onComplete: processCategoryResultsRestaurant,
        		searchCenter: currentCoords
    	        });
        }
    }
  else
    {
        toggleRestaurant = false;
        map.objects.remove(resultSetRestaurant);
        resultSetRestaurant = null;
        searchCounter = searchCounter - 1;
    }
}

// ENABLE/DISABLE THE COFFEE SHOP SEARCH
function onChangeCoffee(e) {
  if (e.checked)
    {
        searchCounter = searchCounter +1;
        if (searchCounter == searchLimit)    // SEE IF I CAN STILL SEARCH (LIMIT LAYERS TO 4 FOR NOW)
        {                                    // ROLLING BACK
            navigator.notification.alert("In order to conserve battery life and increase performance of this app designed to display 4 different types of item layers at a time.\n\n Please unselect an item layer before selecting this layer.",function () { }, "NAVIGATE", 'OK');
            $("#coffee-switch").data("kendoMobileSwitch").check(false);
            searchCounter = searchCounter - 1;
        }
        else
        {                                    // SHOW ON THE MAP
            toggleCoffee = true;
            searchManager = nokia.places.search.manager,resultSetCoffee;
            searchManager.findPlacesByCategory({
        		category: "coffee-tea",
        		onComplete: processCategoryResultsCoffee,
        		searchCenter: currentCoords
    	        });
        }
    }
  else
    {
        toggleCoffee = false;
        map.objects.remove(resultSetCoffee);
        resultSetCoffee = null;
        searchCounter = searchCounter - 1;
    }
}
 
// ENABLE/DISABLE MARKETS SHOP SEARCH
function onChangeMarket(e) {
  if (e.checked)
    {
        searchCounter = searchCounter +1;
        if (searchCounter == searchLimit)    // SEE IF I CAN STILL SEARCH (LIMIT LAYERS TO 4 FOR NOW)
        {                                    // ROLLING BACK
            navigator.notification.alert("In order to conserve battery life and increase performance of this app designed to display 4 different types of item layers at a time.\n\n Please unselect an item layer before selecting this layer.",function () { }, "NAVIGATE", 'OK');
            $("#market-switch").data("kendoMobileSwitch").check(false);
            searchCounter = searchCounter - 1;
        }
        else
        {                                    // SHOW ON THE MAP
            toggleMarket = true;
            searchManager = nokia.places.search.manager,resultSetMarket;
            searchManager.findPlacesByCategory({
        		category: "kiosk-convenience-store",
        		onComplete: processCategoryResultsMarket,
        		searchCenter: currentCoords
    	        });
        }
    }
  else
    {
        toggleMarket = false;
        map.objects.remove(resultSetMarket);
        resultSetMarket = null;
        searchCounter = searchCounter - 1;
    }
} 
 
// ENABLE/DISABLE EMS SEARCH
function onChangeEMS(e) {
  if (e.checked)
    {
        searchCounter = searchCounter +1;
        if (searchCounter == searchLimit)    // SEE IF I CAN STILL SEARCH (LIMIT LAYERS TO 4 FOR NOW)
        {                                    // ROLLING BACK
            navigator.notification.alert("In order to conserve battery life and increase performance of this app designed to display 4 different types of item layers at a time.\n\n Please unselect an item layer before selecting this layer.",function () { }, "NAVIGATE", 'OK');
            $("#ems-switch").data("kendoMobileSwitch").check(false);
            searchCounter = searchCounter - 1;
        }
        else
        {                                    // SHOW ON THE MAP
            toggleEMS = true;
            searchManager = nokia.places.search.manager,resultSetEMS;
            searchManager.findPlacesByCategory({
        		category: "police-emergency",
        		onComplete: processCategoryResultsEMS,
        		searchCenter: currentCoords
    	        });
        }
    }
  else
    {
        toggleEMS = false;
        map.objects.remove(resultSetEMS);
        resultSetEMS = null;
        searchCounter = searchCounter - 1;
    }
} 

// ENABLE/DISABLE PHARMACY SEARCH
function onChangePharmacy(e) {
  if (e.checked)
    {
        searchCounter = searchCounter +1;
        if (searchCounter == searchLimit)    // SEE IF I CAN STILL SEARCH (LIMIT LAYERS TO 4 FOR NOW)
        {                                    // ROLLING BACK
            navigator.notification.alert("In order to conserve battery life and increase performance of this app designed to display 4 different types of item layers at a time.\n\n Please unselect an item layer before selecting this layer.",function () { }, "NAVIGATE", 'OK');
            $("#pharmacy-switch").data("kendoMobileSwitch").check(false);
            searchCounter = searchCounter - 1;
        }
        else
        {                                    // SHOW ON THE MAP
            togglePharmacy = true;
            searchManager = nokia.places.search.manager,resultSetPharmacy;
            searchManager.findPlacesByCategory({
        		category: "pharmacy",
        		onComplete: processCategoryResultsPharmacy,
        		searchCenter: currentCoords
    	        });
        }
    }
  else
    {
        togglePharmacy = false;
        map.objects.remove(resultSetPharmacy);
        resultSetPharmacy = null;
        searchCounter = searchCounter - 1;
    }
}

// ENABLE/DISABLE HEALTHCARE SEARCH
function onChangeHealth(e) {
  if (e.checked)
    {
        searchCounter = searchCounter +1;
        if (searchCounter == searchLimit)    // SEE IF I CAN STILL SEARCH (LIMIT LAYERS TO 4 FOR NOW)
        {                                    // ROLLING BACK
            navigator.notification.alert("In order to conserve battery life and increase performance of this app designed to display 4 different types of item layers at a time.\n\n Please unselect an item layer before selecting this layer.",function () { }, "NAVIGATE", 'OK');
            $("#health-switch").data("kendoMobileSwitch").check(false);
            searchCounter = searchCounter - 1;
        }
        else
        {                                    // SHOW ON THE MAP
            toggleHealth = true;
            searchManager = nokia.places.search.manager,resultSetHealth;
            searchManager.findPlacesByCategory({
        		category: "hospital-health-care-facility",
        		onComplete: processCategoryResultsHealth,
        		searchCenter: currentCoords
    	        });
        }
    }
  else
    {
        toggleHealth = false;
        map.objects.remove(resultSetHealth);
        resultSetHealth = null;
        searchCounter = searchCounter - 1;
    }
}

      
/////////SETTINGS///////////////////



///////// PROCESSED SEARCH RESULTS ///////////////////
function processSearchResults (data, requestStatus, requestId) {
	var i, len, locations;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
			if (searchResultSet) map.objects.remove(searchResultSet);
			searchResultSet = new nokia.maps.map.Container();
            searchResultSet.addListener(CLICK ,  function(evt) {
                tempName = "Search Location";
                tempPhone = "";
                tempAddress = evt.target.address;
                tempLon = evt.target.lon;
                tempLat = evt.target.lat;
                showPopup = 1;
                setPopupResults();
                $("#modalview-SearchResult").data("kendoMobileModalView").open();
               this.objects.remove(evt.target);
               this.objects.add(evt.target);

            }, false);
            
			for (i = 0, len = locations.length; i < len; i++) {
				searchMarker = new nokia.maps.map.Marker(locations[i].position,{text:tempName, address:(locations[i].address.text), lon:(locations[i].position.longitude), lat:(locations[i].position.latitude), icon:"images/here_destination.png",anchor: new nokia.maps.util.Point(10,50)});
				searchResultSet.objects.add(searchMarker);
			}
			map.objects.add(searchResultSet);
		} else { 
			navigator.notification.alert("Your serarch did not produce any result.",
            function () { }, "ALERT", 'OK');
		}
	} else {
		navigator.notification.alert("Server are not reachable at the moment.",
        function () { }, "ALERT", 'OK');
	}
};

function processCategoryResultsRestaurant (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            if (resultSetRestaurant) map.objects.remove(resultSetRestaurant);
			resultSetRestaurant = new nokia.maps.map.Container();
            resultSetRestaurant.addListener(CLICK ,  function(evt) {
                tempName = evt.target.text;
                tempPhone = evt.target.phone;
                tempAddress = evt.target.address;
                tempLon = evt.target.lon;
                tempLat = evt.target.lat;
                showPopup = 2;
                setPopupResults();
                $("#modalview-SearchResult").data("kendoMobileModalView").open();
               this.objects.remove(evt.target);
               this.objects.add(evt.target);

            }, false);
            
			for (i = 0, len = locations.length; i < len; i++) {
                // phone:(locations[i].contacts.phone[0].value),
				marker = new nokia.maps.map.Marker(locations[i].position,{text:locations[i].title, address:(locations[i].address.text), lon:(locations[i].position.longitude), lat:(locations[i].position.latitude), icon:"images/here_restaurant.png",anchor: new nokia.maps.util.Point(20,50)});
				resultSetRestaurant.objects.add(marker);
			}
			map.objects.add(resultSetRestaurant);
		} 
	}
    
};

function processCategoryResultsCoffee (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            if (resultSetCoffee) map.objects.remove(resultSetCoffee);
			resultSetCoffee = new nokia.maps.map.Container();
            resultSetCoffee.addListener(CLICK ,  function(evt) {
                tempName = evt.target.text;
                tempPhone = evt.target.phone;
                tempAddress = evt.target.address;
                tempLon = evt.target.lon;
                tempLat = evt.target.lat;
                showPopup = 2;
                setPopupResults();
                $("#modalview-SearchResult").data("kendoMobileModalView").open();
               this.objects.remove(evt.target);
               this.objects.add(evt.target);

            }, false);
            
			for (i = 0, len = locations.length; i < len; i++) {
                // phone:(locations[i].contacts.phone[0].value),
				marker = new nokia.maps.map.Marker(locations[i].position,{text:locations[i].title, address:(locations[i].address.text), lon:(locations[i].position.longitude), lat:(locations[i].position.latitude), icon:"images/here_coffee.png",anchor: new nokia.maps.util.Point(20,50)});
				resultSetCoffee.objects.add(marker);
			}
			map.objects.add(resultSetCoffee);
		} 
	}
    
};

function processCategoryResultsMarket (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            if (resultSetMarket) map.objects.remove(resultSetMarket);
			resultSetMarket = new nokia.maps.map.Container();
            resultSetMarket.addListener(CLICK ,  function(evt) {
                tempName = evt.target.text;
                tempPhone = evt.target.phone;
                tempAddress = evt.target.address;
                tempLon = evt.target.lon;
                tempLat = evt.target.lat;
                showPopup = 2;
                setPopupResults();
                $("#modalview-SearchResult").data("kendoMobileModalView").open();
               this.objects.remove(evt.target);
               this.objects.add(evt.target);

            }, false);
            
			for (i = 0, len = locations.length; i < len; i++) {
                // phone:(locations[i].contacts.phone[0].value),
				marker = new nokia.maps.map.Marker(locations[i].position,{text:locations[i].title, address:(locations[i].address.text), lon:(locations[i].position.longitude), lat:(locations[i].position.latitude), icon:"images/here_store.png",anchor: new nokia.maps.util.Point(20,50)});
				resultSetMarket.objects.add(marker);
			}
			map.objects.add(resultSetMarket);
		} 
	}
    
};

function processCategoryResultsEMS (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            if (resultSetEMS) map.objects.remove(resultSetEMS);
			resultSetEMS = new nokia.maps.map.Container();
            resultSetEMS.addListener(CLICK ,  function(evt) {
                tempName = evt.target.text;
                tempPhone = evt.target.phone;
                tempAddress = evt.target.address;
                tempLon = evt.target.lon;
                tempLat = evt.target.lat;
                showPopup = 2;
                setPopupResults();
                $("#modalview-SearchResult").data("kendoMobileModalView").open();
               this.objects.remove(evt.target);
               this.objects.add(evt.target);

            }, false);
            
			for (i = 0, len = locations.length; i < len; i++) {
                // phone:(locations[i].contacts.phone[0].value),
				marker = new nokia.maps.map.Marker(locations[i].position,{text:locations[i].title, address:(locations[i].address.text), lon:(locations[i].position.longitude), lat:(locations[i].position.latitude), icon:"images/here_police.png",anchor: new nokia.maps.util.Point(20,50)});
				resultSetEMS.objects.add(marker);
			}
			map.objects.add(resultSetEMS);
		} 
	}
    
};

function processCategoryResultsPharmacy (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            if (resultSetPharmacy) map.objects.remove(resultSetPharmacy);
			resultSetPharmacy = new nokia.maps.map.Container();
            resultSetPharmacy.addListener(CLICK ,  function(evt) {
                tempName = evt.target.text;
                tempPhone = evt.target.phone;
                tempAddress = evt.target.address;
                tempLon = evt.target.lon;
                tempLat = evt.target.lat;
                showPopup = 2;
                setPopupResults();
                $("#modalview-SearchResult").data("kendoMobileModalView").open();
               this.objects.remove(evt.target);
               this.objects.add(evt.target);

            }, false);
            
			for (i = 0, len = locations.length; i < len; i++) {
                // phone:(locations[i].contacts.phone[0].value),
				marker = new nokia.maps.map.Marker(locations[i].position,{text:locations[i].title, address:(locations[i].address.text), lon:(locations[i].position.longitude), lat:(locations[i].position.latitude), icon:"images/here_pharmacy.png",anchor: new nokia.maps.util.Point(20,50)});
				resultSetPharmacy.objects.add(marker);
			}
			map.objects.add(resultSetPharmacy);
		} 
	}
    
};

function processCategoryResultsHealth (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            if (resultSetHealth) map.objects.remove(resultSetHealth);
			resultSetHealth = new nokia.maps.map.Container();
            resultSetHealth.addListener(CLICK ,  function(evt) {
                tempName = evt.target.text;
                tempPhone = evt.target.phone;
                tempAddress = evt.target.address;
                tempLon = evt.target.lon;
                tempLat = evt.target.lat;
                showPopup = 2;
                setPopupResults();
                $("#modalview-SearchResult").data("kendoMobileModalView").open();
               this.objects.remove(evt.target);
               this.objects.add(evt.target);

            }, false);
            
			for (i = 0, len = locations.length; i < len; i++) {
                // phone:(locations[i].contacts.phone[0].value),
				marker = new nokia.maps.map.Marker(locations[i].position,{text:locations[i].title, address:(locations[i].address.text), lon:(locations[i].position.longitude), lat:(locations[i].position.latitude), icon:"images/here_hospital.png",anchor: new nokia.maps.util.Point(20,50)});
				resultSetHealth.objects.add(marker);
			}
			map.objects.add(resultSetHealth);
		} 
	}
    
};
///////// PROCESSED SEARCH RESULTS ///////////////////
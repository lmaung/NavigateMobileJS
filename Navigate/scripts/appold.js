// (c) 2014 Lwin Maung http://lwin.maungs.com
// GPS Naviagtion software for mobile platform using phoneGap / HTML5 / Mobile web
nokia.Settings.set("appId", "_peU-uCkp-j8ovkzFGNU"); 
nokia.Settings.set("authenticationToken", "gBoUkAMoxoqIWfxWA5DuMQ");
// Variables
var map, tLon, tLat, tHeading, tSpeed, tTimeStamp, myDotRadius, searchManager,
    locCircle, gpsWatcher, toggleZoom, toggleTraffic, toggleGPS, toggleFollow,
    processResults, currentCoords, searchTerm, myLocationMarker ,zoomLevel, category,
    toggleCoffee, coffeeList, toggleRestaurant, restraurantList, searchResultSet;

// Starts a new app with mapPageView as initial page and kick things off with onDeviceReady
var app = new kendo.mobile.Application(document.body, { initial: "mapPageView"});
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    initializeItems();
    initializeMap();
} 

// BASIC INITIALIZATION
function initializeItems() {
    navigator.splashscreen.hide();
    $(document.body).height(window.innerHeight);
    tLat = -87.632408;
    tLon = 41.884151;
    tHeading = null;
    tSpeed = null;
    tTimeStamp = null;
    restraurantList = new nokia.maps.map.Container();
    toggleRestaurant = false;
    coffeeList = new nokia.maps.map.Container()
    toggleCoffee = false;
    map = null;
    gpsWatcher = null;
    currentCoords = null;
    searchResultSet = null; 
    myLocationMarker = null;
    searchTerm = "Chicago, Illinois"
    var category1 = "eat-drink";
    category = "coffee-tea"
    searchManager = nokia.places.search.manager,searchResultSet;
    searchVisible = false; // Search area is hidden
    toggleFollow = true;
    toggleZoom = true; // bring back from system
    toggleTraffic = false; 
    toggleGPS = true;
    app.showLoading();
    locatePosition();
    
}

// Gets a new map and place it. If the GPS is not found in [followMe] the map will result back to Chicago
function initializeMap(){
    mapContainer = document.getElementById("mapContainer");
    screenHeight = $(window).height();
    $("#mapContainer").css("height",screenHeight - 89);
    map = new nokia.maps.map.Display(mapContainer, {
    	center: [tLon,tLat], 
    	zoomLevel: 14,
    	components:[new nokia.maps.map.component.Behavior(), ]//new nokia.maps.map.component.Traffic()] //,new nokia.maps.map.component.ZoomBar()]
    });
    map.set("baseMapType", nokia.maps.map.Display.NORMAL);
    app.hideLoading();
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
    
    currentCoords = new nokia.maps.geo.Coordinate(tLat,tLon);
    displayLocationOnMap();
}

// NO GPS!!!!
function onGPSError(error){
    tLat = -87.632408;
    tLon = 41.884151;
    navigator.notification.alert("Can not get a fix on the location.\n Please make sure that GPS is enabled.",
        function () { }, "ALERT", 'OK');
}

// If map is moved manually, the map will no longer recenter on current location. current location tracker will still move.
function displayTouchedAreaOnMap(){
    toggleFollow = false;
    hideSearch(); 
    displayLocationOnMap();
}

// Recenter on current location. 
function recenterMapOnCurrentLoc(){
    toggleFollow = true;
    displayLocationOnMap();
}

// This function creates red dot and place on map. Where the red dot goes depends on toggleFollow boolean.
function displayLocationOnMap(){
    map.objects.remove(myLocationMarker);
    
    if (toggleZoom == true)
    {
        setAutoZoomLevel();
    }
    
    if (toggleFollow == true)
    {
        map.set("center", currentCoords);
    }
    if (toggleRestaurant == true)
    {
        searchManager.findPlacesByCategory({
    		category: "restaurant",
    		onComplete: processRestaurantResults,
    		searchCenter: currentCoords
	        });
    }
    else
    {
        restraurantList = null;
    }
    
    if (toggleCoffee == true)
    {
        searchManager.findPlacesByCategory({
    		category: "coffee-tea",
    		onComplete: processCoffeeResults,
    		searchCenter: currentCoords
	        });
    }
    else
    {
        coffeeList = null;
    }
    
    switch(map.zoomLevel)
        {
            case 1:
              myDotRadius = 524288;
              break;
            case 2:
              myDotRadius = 262144;
              break;
            case 3:
              myDotRadius = 131072;
              break;
            case 4:
              myDotRadius = 65536;
              break;
            case 5:
              myDotRadius = 32768;
              break;
            case 6:
              myDotRadius = 16384;
              break;
            case 7:
              myDotRadius = 8192;
              break;
            case 8:
              myDotRadius = 4096;
              break;
            case 9:
              myDotRadius = 2048;
              break;
            case 10:
              myDotRadius = 1024;
              break;
            case 11:
              myDotRadius = 512;
              break;
            case 12:
              myDotRadius = 256;
              break;
            case 13:
              myDotRadius = 128;
              break;
            case 14:
              myDotRadius = 64;
              break;
            case 15:
              myDotRadius = 32;
              break;
            case 16:
              myDotRadius = 16;
              break;
            case 17:
              myDotRadius = 8;
              break;
            case 18:
              myDotRadius = 4;
              break;
            case 19:
              myDotRadius = 2;
              break;
            case 20:
              myDotRadius = 1;
              break;
        }
    //map.objects.clear();
    //var standardMarker = new nokia.maps.map.StandardMarker(new nokia.maps.geo.Coordinate(tLat,tLon));
    //map.objects.add(standardMarker);
    myLocationMarker = map.objects.add(new nokia.maps.map.Circle(
    	currentCoords,
    	myDotRadius,{
    		pen: {strokeColor: "#FFFFFF", lineWidth: 4},
    		brush: {color: "#FF000073"},
            draggable: true,
            anchor: new nokia.maps.util.Point(currentCoords)}
        ));
    map.objects.add(myLocationMarker);
}

// Toggles traffic overlay on map from the Settings page
function toggleTrafficMap(){
    if (toggleTraffic == true)
    {
        document.getElementById('menuTrafficIco').style.color="#909090";
        document.getElementById('menuTraffic').innerHTML="SHOW TRAFFIC";
        toggleTraffic = false;
        map.overlays.remove(map.TRAFFIC);
    }
    else
    {
        document.getElementById('menuTrafficIco').style.color="#4cd964";
        document.getElementById('menuTraffic').innerHTML="HIDE TRAFFIC";
        toggleTraffic = true;
        map.overlays.add(map.TRAFFIC);
    }
        document.getElementById('menuTraffic').style.fontSize="large"; 
}

// Toggles autoZoom functionality from the Settings page
function toggleZoomMap(){
    if (toggleZoom == true)
    {
        
        document.getElementById('menuZoomIco').style.color="#909090";
        document.getElementById('menuZoom').innerHTML="AUTO ZOOM OFF";
        document.getElementById('zoomBar').style.display="block";
        toggleZoom = false;
        map.zoomLevel = 16;
        map.set("zoomLevel",16); 
    }
    else
    {
        document.getElementById('menuZoomIco').style.color="#4cd964";
        document.getElementById('menuZoom').innerHTML="AUTO ZOOM ON";
        document.getElementById('zoomBar').style.display="none";
        toggleZoom = true;
        displayLocationOnMap();
    }
        document.getElementById('menuZoom').style.fontSize="large"; 
}

// Toggles restarurants functionality from the Settings page
function toggleRestaurantMap(){
    if (toggleRestaurant == true)
    {
        
        document.getElementById('menuFoodIco').style.color="#909090";
        document.getElementById('menuFood').innerHTML="SHOW EATERIES";
        toggleRestaurant = false;
    }
    else
    {
        document.getElementById('menuFoodIco').style.color="#CD0074";
        document.getElementById('menuFood').innerHTML="HIDE EATERIES";
        toggleRestaurant = true;
    }
        document.getElementById('menuFood').style.fontSize="large";
        displayLocationOnMap();
}

// Toggles restarurants functionality from the Settings page
function toggleCoffeeMap(){
    if (toggleCoffee == true)
    {
        
        document.getElementById('menuCoffeeIco').style.color="#909090";
        document.getElementById('menuCoffee').innerHTML="SHOW COFFEE SHOPS";
        toggleCoffee = false;
    }
    else
    {
        document.getElementById('menuCoffeeIco').style.color="#A64B00";
        document.getElementById('menuCoffee').innerHTML="HIDE COFFEE SHOPS";
        toggleCoffee = true;
    }
        document.getElementById('menuCoffee').style.fontSize="large";
        displayLocationOnMap();
}

// This will set zoom levels based on your speed
function setAutoZoomLevel(){
    if (tSpeed < 8.5)                            // Less then 20mph
    {
        map.zoomLevel = 16;
        map.set("zoomLevel",16);
    }
    else if ((tspeed >8.5) && (tspeed < 13.5))    // Less then 30mph
    {
        map.zoomLevel = 14;
        map.set("zoomLevel",14);
    }
    else if ((tspeed >13.5) && (tspeed < 20))    // Less then 45mph
    {
        map.zoomLevel = 13;
        map.set("zoomLevel",13);
    }
    else if ((tspeed >20) && (tspeed < 29))    // Less then 65mph
    {
        map.zoomLevel = 12;
        map.set("zoomLevel",12);
    }
    else
    {
        map.zoomLevel = 8;
        map.set("zoomLevel",8);
    }
}

// Sends in Zoom choice from the Settings page and sets the zoom levels of the map
function zoomChoice(sel) {
    switch(sel.options[sel.selectedIndex].value)
        {
        case '1':
          map.set("zoomLevel",16);
          map.zoomLevel = 16;
          break;
        case '2':
          map.set("zoomLevel",14);
          map.zoomLevel = 14;
          break;
        case '3':
          map.set("zoomLevel",12);
          map.zoomLevel = 12;
          break;
        case '4':
          map.set("zoomLevel",8);
          map.zoomLevel = 8;
          break;
        case '5': 
          map.set("zoomLevel",4);
          map.zoomLevel = 4;
          break;
        }
        toggleZoom = false;
        displayLocationOnMap();
}

// Clear personal data such as favorites
function clearData(){
    nonFunctional();
}

// This will bring up the search bar and will search for address location
function searchForLocation(){
    searchManager.geoCode({
		searchTerm: document.getElementById('txtSearchField').value,
		onComplete: processSearchResults
	});
    hideSearch();
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

function setHome(){
    //nonFunctional();
    searchManager.findPlacesByCategory({
		category: category,
		onComplete: processCategoryResults,
		searchCenter: currentCoords
	});
}

// Closes the Menu
function closeModalViewMenu() {
    $("#modalview-Menu").kendoMobileModalView("close");
}

// Closes the Layers View
function closeModalViewLayer() {
    $("#modalview-Layer").kendoMobileModalView("close");
}

// Pointer to crap that I have not done yet
function nonFunctional (){
    navigator.notification.alert("This feature is done yet.",
        function () { }, "DEV NOTICE", 'OK');
}

function processSearchResults (data, requestStatus, requestId) {
    //alert(JSON.stringify(data));
	var i, len, locations;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
			if (searchResultSet) map.objects.remove(searchResultSet);
			searchResultSet = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
				searchMarker = new nokia.maps.map.StandardMarker(locations[i].position,{
                        text: "", 
                        brush: {color: "#F80"},
                        textPen: {strokeColor: "#007aff"} 
                });
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

function processCategoryResults (data, requestStatus, requestId) {
	var i, len, locations, marker;
	//alert(JSON.stringify(data));
	if (requestStatus == "OK") {
		// The function findPlaces() and reverseGeoCode() of  return results in slightly different formats
		locations = data.results ? data.results.items : [data.location];
		// We check that at least one location has been found
		if (locations.length > 0) {
			// Remove results from previous search from the map
			if (resultSet) map.objects.remove(resultSet);
			// Convert all found locations into a set of markers
			resultSet = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
				marker = new nokia.maps.map.StandardMarker(locations[i].position, { text: locations[i].title, brush: {color: "#F80"},
                        textPen: {strokeColor: "#007aff"}  });
				resultSet.objects.add(marker);
			}
			// Next we add the marker(s) to the map's object collection so they will be rendered onto the map
			map.objects.add(resultSet);
			// We zoom the map to a view that encapsulates all the markers into map's viewport
			//map.zoomTo(resultSet.getBoundingBox(), false);
		} else { 
			alert("Your search produced no results!");
		}
	} else {
		alert("The search request failed");
	}
};

function processRestaurantResults (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
			if (restaurantList) map.objects.remove(restaurantList);
			restaurantList = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
				marker = new nokia.maps.map.StandardMarker(locations[i].position, { text: locations[i].title, brush: {color: "#CD0074"},
                        textPen: {strokeColor: "#007aff"}  });
				restaurantList.objects.add(marker);
			}
			map.objects.add(restaurantList);
		} 
	} 
};

function processCoffeeResults (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
			if (resultSet) map.objects.remove(resultSet);
			resultSet = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
				marker = new nokia.maps.map.StandardMarker(locations[i].position, { text: locations[i].title, brush: {color: "#A64B00"},
                        textPen: {strokeColor: "#007aff"}  });
				resultSet.objects.add(marker);
			}
			map.objects.add(resultSet);
		} 
	} 
};




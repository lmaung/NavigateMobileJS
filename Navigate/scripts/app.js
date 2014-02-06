// (c) 2014 Lwin Maung http://lwin.maungs.com
// GPS Naviagtion software for mobile platform using phoneGap / HTML5 / Mobile web
//nokia.Settings.set("appId", "YOURAPPID"); 
//nokia.Settings.set("authenticationToken", "YOURTOKENKEY");
// Use staging environment (remove the line for production environment)
nokia.Settings.set("serviceMode", "cit");
//navigator.notification.alert("",function () { }, "SAFETY WARNING", 'OK');

var storage, map, tLat, tLon, tHeading, tSpeed, tTimeStamp, myLocationMarker,
    toggleCenterFollow, toggleTraffic, toggleRestaurant, resultSetRestaurant,
    tempName,tempPhone,tempAddress,tempCity,tempState,tempZip,tempCountry,tempCoords,
    searchManager,infoBubbles;
 
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
    toggleCenterFollow = true;             // This will enable to recenter map if set to true
    myLocationMarker  = null;
    searchManager = null
    toggleRestaurant = false
    resultSetRestaurant = null;
    tempName=null
    
    
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
    infoBubbles = new nokia.maps.map.component.InfoBubbles();
    map.components.add(infoBubbles);
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
    displayLocationOnMap();//FIGURE OUT AND ONLY RUN THIS ONCE
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

// Toggles restarurants functionality from the Settings page
function toggleRestaurantMap(){
    if (toggleRestaurant == true)
    {
        
        document.getElementById('menuFoodIco').style.color="#CCCCCC";
        toggleRestaurant = false;
        map.objects.remove(resultSetRestaurant);
        resultSetRestaurant = null;
    }
    else
    {
        document.getElementById('menuFoodIco').style.color="#583c00";
        toggleRestaurant = true;
        searchManager = nokia.places.search.manager,resultSetRestaurant;
        searchManager.findPlacesByCategory({
    		category: "restaurant",
    		onComplete: processCategoryResultsRestaurant,
    		searchCenter: currentCoords
	        });
    }
        //displayLocationOnMap();
         
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

// Pointer to crap that I have not done yet
function nonFunctional (){
    navigator.notification.alert("This feature is done yet.",
        function () { }, "DEV NOTICE", 'OK');
}

function setPopupResults(){
    document.getElementById('popupHeader').innerHTML=tempName;
    document.getElementById('popupPhoneNumber').innerHTML=tempPhone;
    document.getElementById('popupAddress').innerHTML=tempAddress;
    $("#searchPopupTabstrip").data("kendoMobileTabStrip").clear();
}


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

// CHANGE THE WARNING POPUP
function onChangeRestaurant(e) {
  if (e.checked)
    {
        toggleRestaurant = true;
        searchManager = nokia.places.search.manager,resultSetRestaurant;
        searchManager.findPlacesByCategory({
    		category: "restaurant",
    		onComplete: processCategoryResultsRestaurant,
    		searchCenter: currentCoords
	        });
    }
  else
    {
        toggleRestaurant = false;
        map.objects.remove(resultSetRestaurant);
        resultSetRestaurant = null;
    }
    //displayLocationOnMap();
}
        
/////////SETTINGS///////////////////



///////// PROCESSED SEARCH RESULTS ///////////////////
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
                setPopupResults();
                $("#modalview-SearchResult").data("kendoMobileModalView").open();
               this.objects.remove(evt.target);
               this.objects.add(evt.target);

            }, false);
            
			for (i = 0, len = locations.length; i < len; i++) {
                // phone:(locations[i].contacts.phone[0].value),
				marker = new nokia.maps.map.Marker(locations[i].position,{text:locations[i].title, address:(locations[i].address.text), icon:"images/here_restaurant.png",anchor: new nokia.maps.util.Point(20,50)});
				resultSetRestaurant.objects.add(marker);
			}
			map.objects.add(resultSetRestaurant);
		} 
	}
    
};

///////// PROCESSED SEARCH RESULTS ///////////////////
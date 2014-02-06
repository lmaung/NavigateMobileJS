// (c) 2014 Lwin Maung http://lwin.maungs.com
// GPS Naviagtion software for mobile platform using phoneGap / HTML5 / Mobile web
nokia.Settings.set("appId", "_peU-uCkp-j8ovkzFGNU"); 
nokia.Settings.set("authenticationToken", "gBoUkAMoxoqIWfxWA5DuMQ");
// Variables

var storage;
var map, tLon, tLat, tHeading, tSpeed, tTimeStamp, myDotRadius, searchManager,
    locCircle, gpsWatcher, toggleZoom, toggleTraffic, toggleGPS, toggleCenterFollow,
    processResults, currentCoords, searchTerm, myLocationMarker ,zoomLevel, category,
    toggleCoffee, resultSetCoffee, toggleRestaurant, resultSetRestaurant, searchResultSet,
    toggleHospital, resultSetBank, toggleBank, Pharmacy, resultSetStore, screenHeight,
    resultSetGas, toggleGas, toggleStore, Museum, toggleHotel, resultSetHotel,
    toggleMovie, resultSetMovie, toggleMuseum, toggleParking, togglePost,
    resultSetMuseum, resultSetParking,resultSetPost;

// Starts a new app with mapPageView as initial page and kick things off with onDeviceReady
var app = new kendo.mobile.Application(document.body, { initial: "mapPageView"});
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    initializeItems();
    initializeMap();
    //safetyWarning(); 
    clearTabStrip();
} 

// BASIC INITIALIZATION
function initializeItems() {
    navigator.splashscreen.hide();
    storage = window.localStorage;
    $(document.body).height(window.innerHeight);
    screenHeight = $(window).height();
    myDotRadius = 50;
    tLat = -87.632408;
    tLon = 41.884151;
    tHeading = null;
    tSpeed = null;
    tTimeStamp = null;
    resultSetRestaurant = null;
    resultSetCoffee = null;
    resultSetHospital = null;
    resultSetBank = null;
    resultSetPolice = null;
    resultSetStore = null;
    resultSetPharmacy = null;
    resultSetHotel = null;
    resultSetGas = null;
    resultSetMovie = null;
    resultSetMuseum = null;
    resultSetParking = null;
    searchResultSet = null;
    resultSetPost = null;
    
    currentCoords = new nokia.maps.geo.Coordinate(tLat,tLon);
    
    toggleCenterFollow = true; 
    
    toggleTraffic = storage["toggleTraffic"]; // retreive from system.storage
    toggleCoffee = false;
    toggleRestaurant = false;
    toggleHospital = false;
    toggleBank = false;
    togglePolice = false;
    toggleStore = false;
    togglePharmacy = false;
    toggleGas = false;
    toggleHotel = false;
    toggleMovie = false;
    toggleMuseum = false;
    toggleParking = false;
    togglePost = false;
    toggleZoom = false;
    
    myLocationMarker = null;
    standardMarker = null;
    app.showLoading();
    locatePosition(); 
    
    $("#menuList").css("height","30px;");
    
    //loadfromStorage();
}


function loadfromStorage(){

    try{
        var test = storage["bootest"];
        navigator.notification.alert(storage["bootest"],
        function () { }, "DEV NOTICE", 'OK');
    }
    catch(err)
    {
        
    }
    //store
    storage["bootest"] = true;
    
    storage["bootest"] = false;
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
    locatePosition();
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

// Display the map with position
function displayLocationOnMap(){
    if (myLocationMarker) map.objects.remove(myLocationMarker);
    checkConditions();
    myLocationMarker = new nokia.maps.map.Marker(new nokia.maps.geo.Coordinate(tLat,tLon),{icon: "images/here.png",anchor: new nokia.maps.util.Point(20,45),
    		textPen: {
				strokeColor: "#007aff"
			},
    		brush: {color: "#007aff73"}});
    myLocationMarker.addListener(
            nokia.maps.dom.Page.browser.touch ? "tap" : "click",
            function (evt) {
               navigator.notification.alert('I Am Here',function () { }, "ALERT", 'OK');
               this.objects.remove(evt.target);
               this.objects.add(evt.target);
               
            });
    map.objects.add(myLocationMarker);
    if (toggleZoom == true)
    {
        setAutoZoomLevel();
    }
    
    if (toggleCenterFollow == true)
    {
        map.set("center", currentCoords);
    }
    
}

function checkConditions(){
    // This will recenter the your current position
    if (toggleRestaurant == true)
    {
        searchManager = nokia.places.search.manager,resultSetRestaurant;
        searchManager.findPlacesByCategory({
    		category: "restaurant",
    		onComplete: processCategoryResultsRestaurant,
    		searchCenter: currentCoords
	        });
    }
    else
    {
        map.objects.remove(resultSetRestaurant);
        resultSetRestaurant = null;
    }
    
    if (toggleCoffee == true)
    {
        searchManager = nokia.places.search.manager,resultSetCoffee;
        searchManager.findPlacesByCategory({
    		category: "coffee-tea",
    		onComplete: processCategoryResultsCoffee,
    		searchCenter: currentCoords
	        });
    }
    else
    {
        map.objects.remove(resultSetCoffee);
        resultSetCoffee = null;
    }
    
    if (toggleHospital == true)
    {
        searchManager = nokia.places.search.manager,resultSetHospital;
        searchManager.findPlacesByCategory({
    		category: "hospital-health-care-facility",
    		onComplete: processCategoryResultsHospital,
    		searchCenter: currentCoords
	        });
    }
    else
    {
        map.objects.remove(resultSetHospital);
        resultSetHospital = null;
    }
    
    if (toggleBank == true)
    {
        searchManager = nokia.places.search.manager,resultSetBank;
        searchManager.findPlacesByCategory({
    		category: "atm-bank-exchange",
    		onComplete: processCategoryResultsBank,
    		searchCenter: currentCoords
	        });
    }
    else
    {
        map.objects.remove(resultSetBank);
        resultSetBank = null;
    }
    
    if (togglePolice == true)
    {
        searchManager = nokia.places.search.manager,resultSetPolice;
        searchManager.findPlacesByCategory({
    		category: "police-emergency",
    		onComplete: processCategoryResultsPolice,
    		searchCenter: currentCoords
	        });
    }
    else
    {
        map.objects.remove(resultSetPolice);
        resultSetPolice = null;
    }
    
    if (toggleStore == true)
    {
        searchManager = nokia.places.search.manager,resultSetStore;
        searchManager.findPlacesByCategory({
    		category: "kiosk-convenience-store",
    		onComplete: processCategoryResultsStore,
    		searchCenter: currentCoords
	        });
    }
    else
    {
        map.objects.remove(resultSetStore);
        resultSetStore = null;
    }
      
    if (togglePharmacy == true)
    {
        searchManager = nokia.places.search.manager,resultSetPharmacy;
        searchManager.findPlacesByCategory({
    		category: "pharmacy",
    		onComplete: processCategoryResultsPharmacy,
    		searchCenter: currentCoords
	        });
    }
    else
    {
        map.objects.remove(resultSetPharmacy);
        resultSetPharmacy = null;
    }  
    
    if (toggleHotel == true)
    {
        searchManager = nokia.places.search.manager,resultSetHotel;
        searchManager.findPlacesByCategory({
    		category: "hotel",
    		onComplete: processCategoryResultsHotel,
    		searchCenter: currentCoords
	        });
    }
    else
    {
        map.objects.remove(resultSetHotel);
        resultSetHotel = null;
    }
    
    if (toggleGas == true)
    {
        searchManager = nokia.places.search.manager,resultSetGas;
        searchManager.findPlacesByCategory({
    		category: "petrol-station",
    		onComplete: processCategoryResultsGas,
    		searchCenter: currentCoords
	        });
    }
    else
    {
        map.objects.remove(resultSetGas);
        resultSetGas = null;
    }
    
    if (toggleMovie == true)
    {
        searchManager = nokia.places.search.manager,resultSetMovie;
        searchManager.findPlacesByCategory({
    		category: "cinema",
    		onComplete: processCategoryResultsMovie,
    		searchCenter: currentCoords
	        });
    } 
    else
    {
        map.objects.remove(resultSetMovie);
        resultSetMovie = null;
    }
    
    if (togglePost == true)
    {
        searchManager = nokia.places.search.manager,resultSetPost;
        searchManager.findPlacesByCategory({
    		category: "post-office",
    		onComplete: processCategoryResultsPost,
    		searchCenter: currentCoords
	        });
    } 
    else
    {
        map.objects.remove(resultSetPost);
        resultSetPost = null;
    }
    
    if (toggleParking == true)
    {
        searchManager = nokia.places.search.manager,resultSetParking;
        searchManager.findPlacesByCategory({
    		category: "parking-facility",
    		onComplete: processCategoryResultsParking,
    		searchCenter: currentCoords
	        });
    } 
    else
    {
        map.objects.remove(resultSetParking);
        resultSetParking = null;
    }
    
    if (toggleMuseum == true)
    {
        searchManager = nokia.places.search.manager,resultSetMuseum;
        searchManager.findPlacesByCategory({
    		category: "museum",
    		onComplete: processCategoryResultsMuseum,
    		searchCenter: currentCoords
	        });
    } 
    else
    {
        map.objects.remove(resultSetMuseum);
        resultSetMuseum = null;
    }    
}

// If map is moved manually, the map will no longer recenter on current location. current location tracker will still move.
function displayTouchedAreaOnMap(){
    toggleCenterFollow = false;
    hideSearch(); 
    clearTabStrip();
    displayLocationOnMap();
}

// Recenter on current location. 
function recenterMapOnCurrentLoc(){
    toggleCenterFollow = true;
    displayLocationOnMap();
}

// Clear personal data such as favorites
function clearData(){
    nonFunctional();
}

// Clear search marker
function clearSearch(){
    map.objects.remove(searchResultSet);
    searchResultSet = null;
    //displayLocationOnMap();
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

// Toggles traffic overlay on map from the Settings page
function toggleTrafficMap(){
    if (toggleTraffic == true)
    {
        document.getElementById('menuTrafficIco').style.color="#CCCCCC";
        document.getElementById('menuTraffic').innerHTML="Traffic Congestion";
        toggleTraffic = false;
        map.overlays.remove(map.TRAFFIC);
    }
    else
    {
        document.getElementById('menuTrafficIco').style.color="#007AFF";
        document.getElementById('menuTraffic').innerHTML="Traffic Congestion";
        toggleTraffic = true;
        map.overlays.add(map.TRAFFIC);
    }
        storage["toggleTraffic"] = toggleTraffic*-1;
        //navigator.notification.alert(storage["toggleTraffic"],
        //function () { }, "DEV NOTICE", 'OK');
        document.getElementById('menuTraffic').style.fontSize="large";
}

// Toggles restarurants functionality from the Settings page
function toggleRestaurantMap(){
    if (toggleRestaurant == true)
    {
        
        document.getElementById('menuFoodIco').style.color="#CCCCCC";
        toggleRestaurant = false;
    }
    else
    {
        document.getElementById('menuFoodIco').style.color="#583c00";
        toggleRestaurant = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles coffee shop functionality from the Settings page
function toggleCoffeeMap(){
    if (toggleCoffee == true)
    {
        
        document.getElementById('menuCoffeeIco').style.color="#CCCCCC";
        toggleCoffee = false;
    }
    else
    {
        document.getElementById('menuCoffeeIco').style.color="#583c00";
        toggleCoffee = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles hospital functionality from the Settings page
function toggleHospitalMap(){
    if (toggleHospital == true)
    {
        
        document.getElementById('menuHospitalIco').style.color="#CCCCCC";
        toggleHospital = false;
    }
    else
    {
        document.getElementById('menuHospitalIco').style.color="#F00";
        toggleHospital = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles bank functionality from the Settings page
function toggleBankMap(){
    if (toggleBank == true)
    {
        
        document.getElementById('menuBankIco').style.color="#CCCCCC";
        toggleBank = false;
    }
    else
    {
        document.getElementById('menuBankIco').style.color="#008500";
        toggleBank = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles store functionality from the Settings page
function toggleStoreMap(){
    if (toggleStore == true)
    {
        
        document.getElementById('menuShoppingIco').style.color="#CCCCCC";
        toggleStore = false;
    }
    else
    {
        document.getElementById('menuShoppingIco').style.color="#A65F00";
        toggleStore = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles police functionality from the Settings page
function togglePoliceMap(){
    if (togglePolice == true)
    {
        
        document.getElementById('menuPoliceIco').style.color="#CCCCCC";
        togglePolice = false;
    }
    else
    {
        document.getElementById('menuPoliceIco').style.color="#5b5b5b";
        togglePolice = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles pharmacy functionality from the Settings page
function togglePharmacyMap(){
    if (togglePharmacy == true)
    {
        
        document.getElementById('menuPharmacyIco').style.color="#CCCCCC";
        togglePharmacy = false;
    }
    else
    {
        document.getElementById('menuPharmacyIco').style.color="#F00";
        togglePharmacy = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles pharmacy functionality from the Settings page
function toggleGasMap(){
    if (toggleGas == true)
    {
        
        document.getElementById('menuGasIco').style.color="#CCCCCC";
        toggleGas = false;
    }
    else
    {
        document.getElementById('menuGasIco').style.color="#0037c4";
        toggleGas = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles pharmacy functionality from the Settings page
function toggleHotelMap(){
    if (toggleHotel == true)
    {
        
        document.getElementById('menuHotelIco').style.color="#CCCCCC";
        toggleHotel = false;
    }
    else
    {
        document.getElementById('menuHotelIco').style.color="#00a1c4";
        toggleHotel = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles cinema functionality from the Settings page
function toggleMovieMap(){
    if (toggleMovie == true)
    {
        
        document.getElementById('menuMovieIco').style.color="#CCCCCC";
        toggleMovie = false;
    }
    else
    {
        document.getElementById('menuMovieIco').style.color="#5800c4";
        toggleMovie = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles post office functionality from the Settings page
function togglePostMap(){
    if (togglePost == true)
    {
        
        document.getElementById('menuPostOfficeIco').style.color="#CCCCCC";
        togglePost = false;
    }
    else
    {
        document.getElementById('menuPostOfficeIco').style.color="#b800c4";
        togglePost = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles post office functionality from the Settings page
function toggleParkingMap(){
    if (toggleParking == true)
    {
        
        document.getElementById('menuParkingIco').style.color="#CCCCCC";
        toggleParking = false;
    }
    else
    {
        document.getElementById('menuParkingIco').style.color="#ffba00";
        toggleParking = true;
    }
        displayLocationOnMap();
        checkConditions();
}

// Toggles museum functionality from the Settings page
function toggleMuseumMap(){
    if (toggleMuseum == true)
    {
        
        document.getElementById('menuMuseumIco').style.color="#CCCCCC";
        toggleMuseum = false;
    }
    else
    {
        document.getElementById('menuMuseumIco').style.color="#00a2ff";
        toggleMuseum = true;
    }
        displayLocationOnMap();
        checkConditions();
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

// Closes the Layers View
function closeModalViewLayer() {
    $("#modalview-Layer").kendoMobileModalView("close");
}

function setHome(){
    nonFunctional();
}

// Pointer to crap that I have not done yet
function nonFunctional (){
    navigator.notification.alert("This feature is done yet.",
        function () { }, "DEV NOTICE", 'OK');
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


/////////////////// THIS SECTION IS FOR SEARCH CATEGORIES ////////////////////////////

function processSearchResults (data, requestStatus, requestId) {
    alert(JSON.stringify(data));
	var i, len, locations;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
			if (searchResultSet) map.objects.remove(searchResultSet);
			searchResultSet = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
				searchMarker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_destination.png",anchor: new nokia.maps.util.Point(10,50)});
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
			for (i = 0, len = locations.length; i < len; i++) {
				marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_restaurant.png",anchor: new nokia.maps.util.Point(10,50)});
				resultSetRestaurant.objects.add(marker);
			}
            resultSetRestaurant.addListener(
            nokia.maps.dom.Page.browser.touch ? "tap" : "click",
            function (evt) {
               navigator.notification.alert('shit',function () { }, "ALERT", 'OK');
               this.objects.remove(evt.target);
               this.objects.add(evt.target);
               
            });
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
			for (i = 0, len = locations.length; i < len; i++) {
				marker = new nokia.maps.map.Marker(locations[i].position,{text:"hello world",icon:"images/here_coffee.png",anchor: new nokia.maps.util.Point(10,50)});
				resultSetCoffee.objects.add(marker);
			}
            
            resultSetCoffee.addListener(
            nokia.maps.dom.Page.browser.touch ? "tap" : "click",
            function (evt) {
               navigator.notification.alert("",function () { }, "ALERT", 'OK');
               this.objects.remove(evt.target);
               this.objects.add(evt.target);
            });
			map.objects.add(resultSetCoffee);
		} 
	} 
};

function processCategoryResultsHospital (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            
            if (resultSetHospital) map.objects.remove(resultSetHospital);
			resultSetHospital = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
				marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_hospital.png",anchor: new nokia.maps.util.Point(10,50)});
				resultSetHospital.objects.add(marker);
			}
			map.objects.add(resultSetHospital);
		} 
	} 
}; 

function processCategoryResultsBank (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            
            if (resultSetBank) map.objects.remove(resultSetBank);
			resultSetBank = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
				marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_bank.png",anchor: new nokia.maps.util.Point(10,50)});
				resultSetBank.objects.add(marker);
			}
			map.objects.add(resultSetBank);
		} 
	} 
};

function processCategoryResultsPolice (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            
            if (resultSetPolice) map.objects.remove(resultSetPolice);
			resultSetPolice = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
				marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_police.png",anchor: new nokia.maps.util.Point(10,50)});
				resultSetPolice.objects.add(marker);
			}
			map.objects.add(resultSetPolice);
		} 
	} 
};

function processCategoryResultsStore (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            
            if (resultSetStore) map.objects.remove(resultSetStore);
			resultSetStore = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
                marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_store.png",anchor: new nokia.maps.util.Point(10,50)});
                resultSetStore.objects.add(marker);
			}
			map.objects.add(resultSetStore);
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
			for (i = 0, len = locations.length; i < len; i++) {
                marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_pharmacy.png",anchor: new nokia.maps.util.Point(10,50)});
                resultSetPharmacy.objects.add(marker);
			}
			map.objects.add(resultSetPharmacy);
		} 
	} 
};

function processCategoryResultsGas (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            
            if (resultSetGas) map.objects.remove(resultSetGas);
			resultSetGas = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
                marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_gas.png",anchor: new nokia.maps.util.Point(10,50)});
                resultSetGas.objects.add(marker);
			}
			map.objects.add(resultSetGas);
		} 
	} 
};

function processCategoryResultsHotel (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            
            if (resultSetHotel) map.objects.remove(resultSetHotel);
			resultSetHotel = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
                marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_hotel.png",anchor: new nokia.maps.util.Point(10,50)});
                resultSetHotel.objects.add(marker);
			}
			map.objects.add(resultSetHotel);
		} 
	} 
};

function processCategoryResultsMovie (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            
            if (resultSetMovie) map.objects.remove(resultSetMovie);
			resultSetMovie = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
                marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_cinema.png",anchor: new nokia.maps.util.Point(10,50)});
                resultSetMovie.objects.add(marker);
			}
			map.objects.add(resultSetMovie);
		} 
	} 
};

function processCategoryResultsPost (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            
            if (resultSetPost) map.objects.remove(resultSetPost);
			resultSetPost = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
                marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_mail.png",anchor: new nokia.maps.util.Point(10,50)});
                resultSetPost.objects.add(marker);
			}
			map.objects.add(resultSetPost);
		} 
	} 
};


function processCategoryResultsParking (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            
            if (resultSetParking) map.objects.remove(resultSetParking);
			resultSetParking = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
                marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_parking.png",anchor: new nokia.maps.util.Point(10,50)});
                resultSetParking.objects.add(marker);
			}
			map.objects.add(resultSetParking);
		} 
	} 
};


function processCategoryResultsMuseum (data, requestStatus, requestId) {
	var i, len, locations, marker;
	if (requestStatus == "OK") {
		locations = data.results ? data.results.items : [data.location];
		if (locations.length > 0) {
            
            if (resultSetMuseum) map.objects.remove(resultSetMuseum);
			resultSetMuseum = new nokia.maps.map.Container();
			for (i = 0, len = locations.length; i < len; i++) {
                marker = new nokia.maps.map.Marker(locations[i].position,{icon:"images/here_museum.png",anchor: new nokia.maps.util.Point(10,50)});
                resultSetMuseum.objects.add(marker);
			}
			map.objects.add(resultSetMuseum);
		} 
	} 
};


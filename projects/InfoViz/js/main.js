showLoadingScreen();
hideElements();

// set the graphics coloring to depend on majority voting results
var colorMode = "majority";

// All dataset and sub-dataset variables
var dataz;
var dataz2002 = [];
var dataz2006 = [];
var dataz2010 = [];

var clusters2002 = [];
var clusters2006 = [];
var clusters2010 = [];

var sweden2002 = {};
var sweden2006 = {};
var sweden2010 = {};

// Array of all clustered data
var clustersByYear = [clusters2002, clusters2006, clusters2010];

// Get the year from the drop-down list
var chosenYear = $("#selectYear option:selected").text();

// onChange function on color mode form that fetches the new value an updates the map and scatter plot.
$('#colorModeForm input').on('change', function() {
	colorMode = $('input[name=radioName]:checked', '#colorModeForm').val();
	map.selectYear(chosenYear);
	sp1.selectYear();
});

var globalColorScale = d3.scale.category20();

// Traverse the database
d3.csv("data/databaosen.csv", function(error, data) {
    dataz = data;
    extractData();
    calculateClusters();
    initializeObjects();
    getClusterByYear(chosenYear);
    hideLoadingScreen();
    showElements();
});

// Graphics variables
var sp1;
var pc1;
var map;
var donut;

// Loading screen variables
var spinner;
var target;

// Clustering variables
var dbscanRes;
var clusteringDims;
var headers;

function initializeObjects()
{  	
  	// initialize UI components
  	sp1 = new sp();
	pc1 = new pc();
	map = new map();
	donut = new donut();
	
	// populate Select lists
	populateSelect();
	populateSelect2();
}

function populateSelect2() {
	var selectOptionsForXAxis = document.getElementById("setXAxis");
	var selectOptionsForYAxis = document.getElementById("setYAxis");
	var options = [ headers[2],  headers[5], headers[6], headers[7], headers[8], headers[9],
				    headers[10], headers[11], headers[12], headers[13], headers[14] ];

	options.sort();
	options.unshift("Välj variabel");

	// For the scatter plot y-axis and x-axis
	for(var i = 0; i < options.length; i++)
	{
		// Set capital letters
	 	var opt = options[i];
	  	if(options[i] == "arbetslöshet")
	  		opt = "Arbetslöshet";
	  	if(options[i] == "inkomst")
	  		opt = "Inkomst";
	  	if(options[i] == "övriga partier")
	  		opt = "Övriga partier";
	  
	  	var elX = document.createElement("option");
	  	var elY = document.createElement("option");
	  
		elX.textContent = opt;
		elY.textContent = opt;

		elX.value = opt;
		elY.value = opt;

		selectOptionsForXAxis.appendChild(elX);
		selectOptionsForYAxis.appendChild(elY);
	}
}

function populateSelect() {
	var select = document.getElementById("selectRegion");
	
	// For the region dropdown list
	var var1 = "region";
	var options = [];
	var i = 0;
	// Extract the regions oncy once, e.g. for the year 2002
    while(dataz[i]["år"] == "2002"){
        options.push(dataz[i][var1]);
        ++i;
    }

    // Sort the regions alphabetically
    options.sort();
    // Add "Sverige" at the top of the sorted drop-down list
    options.unshift("Sverige"); // unshift pushes the argument in the beginning of the array

	for (var i = 0; i < options.length; i++) {
	  var opt = options[i];
	  var el = document.createElement("option");
	  el.textContent = opt;
	  el.value = opt;
	  select.appendChild(el);
	}
}

// Function that shows a loading screen spinner while loading all the data
function showLoadingScreen()
{
	// TODO: var opts = {...} should be defined and called in 'new Spinner(opts)...', but it doesn't seem to be working...
	// Instead, the default values in spin.js have been changed...
	target = document.getElementById('spinner-box');
	spinner = new Spinner().spin(target);
}

// Function that stops the loading screen spinner
function hideLoadingScreen()
{
	spinner.stop();
}

// Function that extracts and stores the relevant data propertiy names
function extractHeaders()
{
	// store the data propertiy headers...
	headers = d3.keys(dataz[0]);
	// ... and extract and store the ones that are relevant
	clusteringDims = [ headers[6], headers[7], headers[8], headers[9],
					   headers[10], headers[11], headers[12], headers[13], headers[14] ];
}

// Function to calculate clustering based on the data for a particular year. The data for each year is
// already stored in separate variables.
function selectYearAndCalculateClusters(year)
{
	chosenYear = year;
	// var newData = extractDataByYear(chosenYear);
	var newData;
	switch(chosenYear){
		case "2002":
			newData = dataz2002;
			dbscanRes = clusters2002;
			break;
		case "2006":
			newData = dataz2006;
			dbscanRes = clusters2006;
			break;
		case "2010":
			newData = dataz2010;
			dbscanRes = clusters2010;
			break;
		default:
			break;
	}
}

// Function that calculates data clusters for each year using the DBSCAN algorithm
function calculateClusters()
{
	clusters2002 = dbscan(dataz2002, 0.5, 3);
	clusters2006 = dbscan(dataz2006, 0.5, 3);
	clusters2010 = dbscan(dataz2010, 0.5, 3);

	clustersByYear = [clusters2002, clusters2006, clusters2010];

	selectYearAndCalculateClusters(chosenYear);
}

// Function that returns the cluster corresponding to the selected year.
function getClusterByYear(year)
{
	switch(year){
		case "2002":
			return clusters2002;
		case "2006":
			return clusters2006;
		case "2010":
			return clusters2010;
		default:
			console.log("getClusterByYear() Bad value!");
			return cluster2010;
	}
}

// Function that returns the cluster corresponding to the supplied region.
function findClusterByRegion(region)
{
	var clusters = (chosenYear == "2002") ? clusters2002 : (chosenYear == 2006) ? clusters2006 :  clusters2010;
	for(var i = 0; i < clusters.length; ++i)
	{
		for(var j = 0; j < clusters[i].length; ++j)
		{
			if(clusters[i][j]["region"] == region)
			{
				return i;
			}
		}
	}
	return -1;
}

function findMajorityByRegion(region)
{
	var tempData;
	// use the correct data set
	switch(chosenYear)
	{
		case "2002":
			tempData = dataz2002;
			break;
		case "2006":
			tempData = dataz2006;
			break;
		case "2010":
			tempData = dataz2010;
			break;
		default:
			break;
	}

	// find the correct data item
	var tempItem;
	// for each data item
	for(var i = 0; i < tempData.length; ++i)
	{
		if(tempData[i]["region"] == region)
		{
			tempItem = tempData[i];
			break;
		}
	}

	// find max value of party percentage and store the index
	var maxValue = 0;
	var maxIndex = 0;
	// for each party
	for(var i = 0; i < clusteringDims.length; ++i)
	{
		if(Number(tempItem[clusteringDims[i]]) >= maxValue)
		{
			maxValue = Number(tempItem[clusteringDims[i]]);
			maxIndex = i;
		}
	}

	return clusteringDims[maxIndex];
}

function extractDataByYear(chosenYear)
{
	var tempData = [];
	for(var i = 0; i < dataz.length; ++i)
	{
		if(dataz[i]["år"] == chosenYear)
		{
			tempData.push(dataz[i]);
		}
	}
	return tempData;
}

function extractData()
{
	// extract headers from the data and store them in the global variable 'headers'
	extractHeaders();

	// extract data for each year
	dataz2002 = extractDataByYear("2002");
	dataz2006 = extractDataByYear("2006");
	dataz2010 = extractDataByYear("2010");

	calculateCountryAverages();
}

function hideElements()
{
	$("#wrap").addClass("invisible");
}

function showElements()
{
	$("#wrap").removeClass("invisible");
}

function calculateCountryAverages()
{
	// 2002
	// for each property
	for(var i = 0; i < headers.length; ++i)
	{
		sweden2002[headers[i]] = 0;
		// for each data item
		for(var j = 0; j < dataz2002.length; ++j)
		{
			sweden2002[headers[i]] += Number(dataz2002[j][headers[i]]);
		}
		sweden2002[headers[i]] = (sweden2002[headers[i]] / dataz2002.length).toPrecision(3);
		sweden2002["region"] = "Sverige";
		sweden2002["år"] = "2002";
	}

	// 2006
	// for each property
	for(var i = 0; i < headers.length; ++i)
	{
		sweden2006[headers[i]] = 0;
		// for each data item
		for(var j = 0; j < dataz2006.length; ++j)
		{
			sweden2006[headers[i]] += Number(dataz2006[j][headers[i]]);
		}
		sweden2006[headers[i]] = (sweden2006[headers[i]] / dataz2006.length).toPrecision(3);
		sweden2006["region"] = "Sverige";
		sweden2006["år"] = "2006";
	}

	// 2010
	// for each property
	for(var i = 0; i < headers.length; ++i)
	{
		sweden2010[headers[i]] = 0;
		// for each data item
		for(var j = 0; j < dataz2010.length; ++j)
		{
			sweden2010[headers[i]] += Number(dataz2010[j][headers[i]]);
		}
		sweden2010[headers[i]] = (sweden2010[headers[i]] / dataz2010.length).toPrecision(3);
		sweden2010["region"] = "Sverige";
		sweden2010["år"] = "2010";
	}
}

// Function to normalize the data on each axis/dimension
function normalizeData(_data)
{
	var tempData = _data.slice();
	var maxValue = 0;
	var maxValues = [];		// Array to store the max values of each axis/dimension
	var maxValueIndex = 0;

	// for each axis/dimension
	for(var i = 0; i < clusteringDims.length; ++i)
	{
		maxValue = 0;
		maxValueIndex = 0;
		// for each data item
		for(var j = 0; j < _data.length; ++j)
		{
			// find the max value
			if(Number(_data[j][clusteringDims[i]]) > maxValue)
			{
				maxValue = Number(_data[j][clusteringDims[i]]);
				maxValueIndex = j;
			}
		}
		// Add the max value to the array of max values
		maxValues.push(maxValue);
		for(var j = 0; j < _data.length; ++j)
		{
			// Normalize the data of the current axis/dimension
			tempData[j][clusteringDims[i]] = Number(_data[j][clusteringDims[i]]) / Number(maxValues[i]);
		}
	}
	return tempData;
}

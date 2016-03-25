/*
* Scatter plot based on Lab 1 in TNM048 at Linköping University
*/

function sp(){

    var self = this;
    var spDiv = $("#sp");
    var margin = {top: 40, right: 40, bottom: 40, left: 40},
        width = spDiv.width() - margin.right - margin.left,
        height = spDiv.height() - margin.top - margin.bottom;

    var padding = 0;

    // initialize tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Initialize x,y which will be used to scale the dataset displayed in the scatterplot.
    // the domain for x and y is set in draw, after the dataset is set.
    var x = d3.scale.linear()
        .range([padding, width - padding]);

    var y = d3.scale.linear()
        .range([height  - padding, padding]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("#sp").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Initializing private variables which will be used in the draw function.
    // These variables are determined by the user, using dropdown lists.
    self.selectedObjectOnXAxis;
    self.selectedObjectOnYAxis;
    self.selectedYear = "2010";           // Default value. Changed if the user uses the dropdown year drop-down list.
    self.boolXAxis = false;
    self.boolYAxis = false;  

    // Initializing the variable that represents the dataset that will be displayed.
    self.data = dataz2010;                
    addClusterProperty();
    addMajorityProperty(self.data);

    var selectedObject;

    /* ======== Private functions ======== */
    /* =================================== */
    
    // Function to clear the scatterplot
    function clearScatterPlot(){
        svg.selectAll(".axis").remove();
        svg.selectAll('.dot').remove();
        svg.selectAll('.extraTextSP').remove();
    }

    // Function to draw the scatterplot
    function draw()
    {
        // Clear the svg
        clearScatterPlot();

        
        //  Check which dataset to use. 
        //  If the user has chosen to display year one or both the axes
        //      the dataset should be the one containing all information for all years, i.e. "dataz"
        //  Else, check which year has been chosen in the dropdown list, and choose the cooresponding
        //      dataset, i.e. "dataz2002", "dataz2006" or "dataz2010".
        if(self.selectedObjectOnYAxis == "år" || self.selectedObjectOnXAxis == "år"){
            self.data = dataz;
        }

        // set the domain for the axes
        x.domain(d3.extent(self.data, function(d) { return +d[self.selectedObjectOnXAxis]; })).range();
        y.domain(d3.extent(self.data, function(d) { return +d[self.selectedObjectOnYAxis]; })).range();

        // Add x axis and title.
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            //ny
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text(self.selectedObjectOnXAxis);      // plot the name of the current dataset

        // Add y axis and title.
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            // ny
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(self.selectedObjectOnYAxis);      // plot the name of the current dataset
         
        // Add the scatter dots.
        svg.selectAll(".dot")
            .data(self.data)
            .enter().append("circle")               // create circles
            .attr("class", "dot")
            // Define the x and y coordinate data values for the dots
            .attr("cx", function(d) {
                return x(d[self.selectedObjectOnXAxis]);            // plot scaled position for x-axis
            })
            .attr("cy", function(d) {
                return y(d[self.selectedObjectOnYAxis]);            // plot scaled position for y-axis
            })
            .attr("r", 5)
            .style("fill", function(d,i)
            { 
                if(colorMode == "clusters")
                {
                    if(d["cluster"] != -1)
                    {
                        return globalColorScale(d["cluster"]);
                    }
                    else
                    {
                        return "ff0000";
                    }
                }
                else if(colorMode == "majority")
                {
                    return colorByMajority(d["majority"]);
                } 
            })
            // tooltip
            .on("mousemove", function(d)
                {
                    tooltip.transition()
                    .duration(200)
                        .style("opacity", .9);
                    
                    tooltip.html(d["region"] + "<br/> (" + d[self.selectedObjectOnXAxis]
                        + ", " + d[self.selectedObjectOnYAxis] + "), kluster " + d["cluster"])
                        .style("left", (d3.event.pageX + 5) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");  
                })
            .on("mouseout", function(d)
                {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
            .on("click",  function(d)
                {

                    $("#selectRegion").val(d["region"]);
                        //console.log("click!");
                        if(d != selectedObject){ // if the clicked object is not the same as the one clicked previously -> select it
                            selectedObject = d;
                            selFeature(d);
                        }
                        else{                    // if it is -> deselect it
                            $("#selectRegion").val("Sverige");
                            selectedObject = null;
                            clearSelection();
                        }
                     //selFeature(d);
                });

        // Draw the chosen year
        var tempData = "a";
        var extraText = svg.selectAll(".extraTextSP")
            .data(tempData)
            .enter()
            .append("g")
            .attr("class","extraTextSP");

        extraText.append("text")
            .attr("x", width)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .style("font", "bold 12px Arial")
            .attr("class", "inside")
            .text(function(d) { return "År " + self.selectedYear; });
    }

    // Function for selecting features of other components
    function selFeature(value){
        sp1.selectDot(value["region"]);
        pc1.selectLine(value["region"]);
        map.selectCountry(value["region"]);
        donut.selectPie(value["region"]);
    }

    // Function for clearing selections of all components
    function clearSelection(){
        sp1.deselectDot();
        pc1.deselectLine();
        map.deselectCountry();
        donut.deselectPie();
    };

    /* ======== Public functions ======== */
    /* ================================== */

    // Method for selecting the dot from other components
    this.selectDot = function(value)
    {
        d3.select("#sp").selectAll(".dot").style("opacity", function(d){if(d["region"] != value) return 0.1;});
        d3.select("#sp").selectAll(".dot").style("stroke", function(d){if(d["region"] == value) return "black";});
        d3.select("#sp").selectAll(".dot").style("stroke-width", function(d){if(d["region"] == value) return "2px";});
        //d3.select("#sp").selectAll(".dot").style("fill", function(d){ if(d["region"] == value) return "#ff1111"; else return globalColorScale(d["region"]);});
    };

    // Method for deselecting a dot
    this.deselectDot = function(){
        if(self.boolYAxis && self.boolXAxis){
            draw();    
        }
    }

    // Function that returns the dataset currently used in the scatterplot
    this.getData = function(){
        return self.data;
    };
    
    // Method which is called when a change has been made on the dropdownlist.
    // It is used to determine what shall be displayed on the x-axis.
    // When the user has chosen a value for the x-axis, it checks whether a value has been set for the y-axis.
    // If a value exists, the draw function is called.
    this.selectYAxis = function()
    {
        var selY = $("#setYAxis option:selected").val();
        self.boolYAxis = true;
        if(selY == "Välj variabel"){
            self.boolYAxis = false;
            clearScatterPlot();
        }
        else{
            if(selY == "Arbetslöshet")
                selY = "arbetslöshet";
            if(selY == "Inkomst")
                selY = "inkomst";
            if(selY == "Övriga partier")
                selY = "övriga partier";
            if(selY == "År")
                selY = "år";
            self.selectedObjectOnYAxis = selY;
        }
            
        if(self.boolYAxis && self.boolXAxis){
            draw();
        }
    };

    // Method which is called when a change has been made on the dropdownlist.
    // It is used to determine what shall be displayed on the y-axis.
    // When the user has chosen a value for the y-axis, it checks wether a value has been set for the x-axis.
    // If a value exists, the draw function is called.
    this.selectXAxis = function()
    {
        var selX = $("#setXAxis option:selected").val();
        self.boolXAxis = true;

        if(selX == "Välj variabel"){
            self.boolXAxis = false;
            clearScatterPlot();
        }
        else{
            if(selX == "Arbetslöshet")
                selX = "arbetslöshet";
            if(selX == "Inkomst")
                selX = "inkomst";
            if(selX == "Övriga partier")
                selX = "övriga partier";
            if(selX == "År")
                selX = "år";
            self.selectedObjectOnXAxis = selX;
        }
        if(self.boolYAxis && self.boolXAxis){
            draw();
        }

    };

    // Function that adds cluster affinity to the scatter plot objects
    function addClusterProperty()
    {
        for(var i = 0; i < self.data.length; ++i)
        {
            self.data[i]["cluster"] = findClusterByRegion(self.data[i]["region"]);
        }
    }

    // Function that adds majority party to the scatter plot objects
    function addMajorityProperty()
    {
        for(var i = 0; i < self.data.length; ++i)
        {
            self.data[i]["majority"] = findMajorityByRegion(self.data[i]["region"]);
        }
    }

    // Function that sets the color by majority party
    function colorByMajority(region)
    {
        switch(region)
        {
            case "Moderaterna":
                return "#1B49DD";
            case "Centerpartiet":
                return "#009933";
            case "Folkpartiet":
                return "#6BB7EC";
            case "Kristdemokraterna":
                return "#231977";
            case "Miljöpartiet":
                return "#83CF39";
            case "Socialdemokraterna":
                return "#EE2020";
            case "Vänsterpartiet":
                return "#AF0000";
            case "Sverigedemokraterna":
                return "#DDDD00"
            case "övriga partier":
                return "gray"
            default:
                return "black";
        }
    }

    // Method which is called when a change has been made on the dropdownlist containing years.
    // It is used to in the draw function, to determine which dataset shall be used in the scatterplot.
    this.selectYear = function()
    {
        self.selectedYear = $("#selectYear option:selected").text();
        if(self.selectedYear == "2010"){
            self.data = dataz2010;
        }
        else if(self.selectedYear == "2006"){
            self.data = dataz2006;
        }
        else{ // if self.selectedYear == "2002"
            self.data = dataz2002;
        }

        addClusterProperty();
        addMajorityProperty(self.data);
        if(self.boolYAxis && self.boolXAxis){
            draw();
        }

    };
}


/*
* Parallel coordiantes with reorderable axes based on bl.ocks.org/jasondavies/13411281
*/

function pc(){

    var self = this; // for internal d3 functions

    var pcDiv = $("#pc");

    var margin = [30, 10, 10, 10],
        width = pcDiv.width() - margin[1] - margin[3],
        height = pcDiv.height() - margin[0] - margin[2];
    
    // Initialize color scale
    var countryColorScale = d3.scale.category20();
    
    // Initialize tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var x = d3.scale.ordinal().rangePoints([0, width], 1), // range between 0 and width, with padding 1
        y = {}
        dragging = {};

    var line = d3.svg.line(),
        axis = d3.svg.axis().orient("left").tickFormat(d3.format("d")),
        background,
        foreground;

    var svg = d3.select("#pc").append("svg:svg")
        .attr("width", width + margin[1] + margin[3])
        .attr("height", height + margin[0] + margin[2])
        .append("svg:g")
        .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

    self.data = createDataRepresentatives();

    // Extract the list of dimensions and create a scale for each.
    x.domain(dimensions = d3.keys(self.data[0]).filter(function(d) {
        return d != "region" && d!= "befolkning" && d!="arbetslösa" && d != "regions" && d != "cluster" && (y[d] = d3.scale.linear()
            .domain(d3.extent(self.data, function(p) {
                return +p[d];     
            }))
            .range([height, 0])
            );
    }));

    draw();

    var selectedObject;


    /* ======== Private functions ======== */
    /* =================================== */

    // Function to draw the parallel coordiantes graphics
    function draw(){

        svg.selectAll('path').remove();

        // Add grey background lines for context.
        background = svg.append("svg:g")
            .attr("class", "background")
            .selectAll("path")
            // add the data and append the path
            .data(self.data)
            .enter().append("path")
            .attr("d", path)
            .on("mousemove", function(d){})
            .on("mouseout", function(){})
            .on("click", function(d){
                selFeature(d);
            });

        // Add blue foreground lines for focus.
        foreground = svg.append("svg:g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(self.data)
            .enter().append("path")
            .attr("d", path)
            .style("opacity", 0.75)
            .style("stroke", function(d,i){
                return globalColorScale(d["cluster"]);
            })
            .on("mousemove", function(d,i){
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                // TODO: fixa fulhacket nedan...
                tooltip.html("<p style='font-size:1.2em; font-weight:bold'>Kluster " + d["cluster"] + ", år " + d["år"] + "</p>" +
                             "Ink: " + d["inkomst"].toPrecision(3) + " tkr" + 
                             ", Arb-lösh: " + d["arbetslöshet"].toPrecision(3) + " %" + "<br>" +
                             "M: " + (100 * d["Moderaterna"]).toPrecision(3) +" % (av max)" + "<br>" +
                             "C: " + (100 * d["Centerpartiet"]).toPrecision(3) +" % (av max)" + "<br>" +
                             "FP: " + (100 * d["Folkpartiet"]).toPrecision(3) +" % (av max)" + "<br>" +
                             "KD: " + (100 * d["Kristdemokraterna"]).toPrecision(3) +" % (av max)" + "<br>" +
                             "MP: " + (100 * d["Miljöpartiet"]).toPrecision(3) +" % (av max)" + "<br>" +
                             "S: " + (100 * d["Socialdemokraterna"]).toPrecision(3) +" % (av max)" + "<br>" +
                             "V: " + (100 * d["Vänsterpartiet"]).toPrecision(3) +" % (av max)" + "<br>" +
                             "SD: " + (100 * d["Sverigedemokraterna"]).toPrecision(3) +" % (av max)" + "<br>" +
                             "Övriga partier: " + (100 * d["övriga partier"]).toPrecision(3) + " % (av max)" + "<br>" +
                             "Kommuner: " + d["regions"])                           // plotta i tooltip namnet på regionerna
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px"); 
            })
            .on("mouseout", function(d){
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(d) {
                if(d != selectedObject){            // if the clicked object is not the same as the one clicked previously -> select it
                    selectedObject = d;
                    selFeature(d);
                }
                else{                               // if it is -> deselect it
                    selectedObject = null;
                    clearSelection();
                }
            });

        // Add a group element for each dimension.
        var g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter().append("svg:g")
            .attr("class", "dimension")
            .attr("transform", function(d) {
                return "translate(" + x(d) + ")"; 
            })
            .call(d3.behavior.drag()
                .origin(function(d) {
                    return {x: x(d)}; 
                })
                .on("dragstart", function(d) {
                    dragging[d] = x(d);
                    background.attr("visibility", "hidden");
                })
                .on("drag", function(d) {
                    dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                    foreground.attr("d", path);
                    dimensions.sort(function(a, b) { 
                        return position(a) - position(b); 
                    });
                    x.domain(dimensions);
                    g.attr("transform", function(d) { 
                        return "translate(" + position(d) + ")"; 
                    }) 
                })
                .on("dragend", function(d) {
                    delete dragging[d];
                    transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                    transition(foreground).attr("d", path);
                    background
                        .attr("d", path)
                        .transition()
                        .delay(500)
                        .duration(0)
                        .attr("visibility", null);
                })
            );

        // Add an axis and title.
        g.append("svg:g")
            .attr("class", "axis")
            .each(function(d) { 
                d3.select(this).call(axis.scale(y[d]));     // utritning av axeln
            })
            .append("svg:text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) {
                if(d == "inkomst")
                    return "Inkomst (tkr/år)";
                if(d == "år")
                    return "År";
                if(d == "arbetslöshet")
                    return "Arbetslöshet (%)";
                if(d == "övriga partier")
                    return "Övriga partier (%)";
                return d + " (%)";
            })
            .style("cursor", "pointer");

        // Add and store a brush for each axis.
        g.append("svg:g")
            .attr("class", "brush")
            .each(function(d) {
                d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    };

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { 
            return [position(p), y[p](d[p])]; 
        }));
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        var actives = dimensions.filter(function(p) {                       // de axlar som används
                return !y[p].brush.empty(); 
            }),
            extents = actives.map(function(p) {                             // de intervall som är markerade
                return y[p].brush.extent(); 
            });
        foreground.style("display", function(d) {                           // d = alla region-objekt
            return actives.every(function(p, i) {                           // p - namn på aktiv axel, i = index för aktiv axel
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];      // extents[i][0] = nedre gräns, extents[i][1] = övre gräns, d[p] = all data på aktuell axel
            }) ? null : "none";
        });
    }

    // Function to calculate mean value objects to simplify the rendering
    // TODO: Fundera på vad som bör göras med "region". Som det är nu blir den av förklarliga skäl "NaN"... =)
    function createDataRepresentatives()
    {
        var meanValues = [];
        var currentPropertySum = [];
        var tempMeanValue = {};
        var regions = "";

        // for each year
        for(var k = 0; k < clustersByYear.length; ++k)
        {
            var clustersForOneYear = clustersByYear[k];
            // for each cluster
            for(var i = 0; i < clustersForOneYear.length; ++i)
            {
                regions = "";
                tempMeanValue = {};
                currentCluster = clustersForOneYear[i];
                // for each property of the data
                for(var m = 0; m < headers.length; ++m)
                {
                    currentPropertySum[m] = 0;
                    // for each line within the cluster
                    for(var j = 0; j < currentCluster.length; ++j)
                    {
                        if(headers[m] == "region")
                        {
                            regions += ( currentCluster[j][headers[m]] + ", " );
                        }
                        currentPropertySum[m] += Number(currentCluster[j][headers[m]]);
                    }
                    tempMeanValue[headers[m]] = currentPropertySum[m] / (currentCluster.length);
                }
                tempMeanValue["cluster"] = i;
                regions = regions.substring(0, regions.length - 2);
                tempMeanValue["regions"] = regions;
                meanValues.push(tempMeanValue);
            }
        }
        return meanValues;
    }

    // Function for selecting features of other components
    function selFeature(value){
        pc1.selectLineYear(value.cluster, value["år"]);
        //sp1.selectDot(value.region);
        //map.selectCountry(value.region);
        map.selectCluster(value.cluster);
        //donut.selectPie(value.region);
    };

    // Function that clears the selection in all components
    function clearSelection(){
        pc1.deselectLine();
        sp1.deselectDot();
        donut.deselectPie();
        map.deselectCountry();
    };
    
    /* ======== Public functions ======== */
    /* ================================== */

    // function for selecting the polyline from other components    
    this.selectLine = function(cluster)
    {
        d3.select("#pc").selectAll("path").style("opacity", function(d)
            {
                if(d["cluster"] != cluster || d["år"] != chosenYear)
                {
                    return 0.05;
                }
            }
        );
    };

    this.selectLineYear = function(cluster, year)
    {
        console.log(year);
        d3.select("#pc").selectAll("path").style("opacity", function(d)
            {
                if(d["cluster"] != cluster || d["år"] != year)
                {
                    return 0.05;                    
                }
            }
        );
    };

    this.deselectLine = function(){
        d3.select("#pc").selectAll("path").style("opacity",function(d){ return 0.75;});
        d3.select("#pc").selectAll("path").style("stroke", function(d){ return globalColorScale(d["cluster"]);});
    }
}

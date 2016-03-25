/*
* Donut chart based on bl.ocks.org/mbostock/3887193
*/

function donut(){

  var self = this;

  var donutDiv = $("#donut");

  var width  = donutDiv.width(),
      height = donutDiv.height(),
      radius = Math.min(width, height) * 0.6;

  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // ["Moderaterna", "Centerpartiet", "Folkpartiet", "Kristdemokraterna", "Miljöpartiet", "Socialdemokraterna", "Vänsterpartiet", "Sverigedemokraterna", "övriga partier"];
  var color = d3.scale.ordinal()
      .range(["#1B49DD", "#009933", "#6BB7EC", "#231977", "#83CF39", "#EE2020", "#AF0000", "#DDDD00", "gray"]);

  var pie = d3.layout.pie()
      .value(function(d,i){return d;})
      .sort(null);

  var welcomeMessage = "a";

  var arc = d3.svg.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius - 50);

  var svg = d3.select("#donut").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
  self.headers = d3.keys(dataz[0]).filter(function(d){
    return d != "region" && d!= "befolkning" && d!="arbetslösa" && d!="år" && d!="arbetslöshet" && d!="inkomst";
  });

  self.data = dataz2010;                // default year 2010
  self.sweden = sweden2010;

  self.region = "Sverige";              // default region
  showDefaultInformation();



  /* ======== Private functions ======== */
  /* =================================== */

  function showDefaultInformation(){
      showInformation("Hela Sverige");
  }

  // Function that updates the donut chart with a selected region
  function showInformation(region)
  {
    var tempData = [];
    var parties = [];

    if(region == "Hela Sverige")
    {
      for(var i = 0; i < self.headers.length; ++i)
      {      
        parties.push(self.sweden[self.headers[i]]);       
      }
      tempData.push(self.sweden);
    }
    else
    {
      self.region = region;  
      for(var i = 0; i < self.data.length; i++){
        if(self.data[i]["region"] == region){
          tempData.push(self.data[i]);
          for(var j = 0; j<self.headers.length; j++)
          {
            parties.push(self.data[i][self.headers[j]]);
          }
        }
      }
    }

    svg.selectAll('.arc').remove();
    svg.selectAll(".extraText").remove();
    svg.selectAll(".legend").remove();

    var g = svg.selectAll(".arc")
      .data(pie(parties))
      .enter().append("g")
      .attr("class","arc");

    g.append("path") // circular region
      .attr("fill", function(d, i) { 
        return color(i); 
      })
      .attr("d", arc)
      .on("mousemove", function(d,i)
      {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);

        tooltip.html(self.headers[i] + " " + d.value + "%") // region name in tooltip
          .style("left", (d3.event.pageX + 5) + "px")
          .style("top", (d3.event.pageY - 28) + "px"); 
      })
      .on("mouseout", function(d)
      {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    g.append("text") // text in this circular region
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d,i) { 
        return d.value + "%";
      })
      .style("fill",function(d){return "#ffffff"}); // vit text i en paj-bit

    var legendRectSize = 18;
    var legendSpacing = 4;

    // Extra text i mitten av pajen
    var extraText = svg.selectAll(".extraText")
      .data(tempData)
      .enter()
      .append("g")
      .attr("class","extraText");

    extraText.append("text")
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .style("font", "bold 12px Arial")
      .attr("class", "inside")
      .text(function(d) { return "Valresultat i " + self.region; });

    extraText.append("text")
      .attr("dy", "2em")
      .style("text-anchor", "middle")
      .style("font", "bold 10px Arial")
      .attr("class", "data")
      .text(function(d) { return d["år"]; })
      .style("fill", function(d){return "gray"});

    extraText.append("text")
      //.attr("dy", "4em")
      .attr("transform", "translate(" + width / 3 + "," + height / 2.6 + ")")
      .style("text-anchor", "middle")
      .style("font", "bold 12px Arial")
      .attr("class", "donutInkomst")
      .text(function(d) {  return "Medelinkomst: " + d["inkomst"]; + "tkr/år" });

    extraText.append("text")
      //.attr("dy", "4em")
      .attr("transform", "translate(" + width / 3 + "," + height / 3.0 + ")")
      .style("text-anchor", "middle")
      .style("font", "bold 12px Arial")
      .attr("class", "donutInkomst")
      .text(function(d) {  return "Arbetslöshet: " + Math.round(d["arbetslöshet"] * 100)/100 + "%"; });

    // Adding a color legend for the parties
    var legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset =  height * color.domain().length / 2.0;
        var horz = - radius * 0.075 * legendRectSize;
        var vert = i * height - offset;
      return 'translate(' + horz + ',' + vert + ')';
    });

    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', color)
      .style('stroke', color);

    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d,i) { return self.headers[i]; });
  }

  /* ======== Public functions ======== */
  /* ================================== */
  
  this.selectPie = function(region)
  {
    showInformation(region); // calling the draw function with the selected region
  };

  // Function to deselect regions by removing the svg and showing the default information in the donut chart
  this.deselectPie = function(){
    svg.selectAll('.arc').remove();
    svg.selectAll(".extraText").remove();
    svg.selectAll(".legend").remove();

    this.region = "Sverige";
    showDefaultInformation();
  };

  // Function that updates all graphics when a user selects a year.
  this.selectYear = function(year)
  {
    // Change datasets depending on the selected year.
    switch(year){
      case "2002":
        self.data = dataz2002;
        self.sweden = sweden2002;
        break;
      case "2006":
        self.data = dataz2006;
        self.sweden = sweden2006;
        break;
      case "2010":
        self.data = dataz2010;
        self.sweden = sweden2010;
        break;
      default:
        self.data = dataz2002;
        self.sweden = sweden2002;
        console.log("donut.selectYear() bad value!");
        break;
    }
    
    if(self.region != "Sverige"){
      console.log("selectYear donut = " + self.region);
      showInformation(self.region);
      map.selectCountry(self.region);
      //pc1.selectLine(self.region);
    }
    else{
      self.region = "Sverige";
      map.deselectCountry();
      pc1.deselectLine();
      donut.deselectPie();
      showDefaultInformation(); 
    }
      
  };

  // Function to select a region using drop-down list
  this.selectPieFromSelect = function()
  {
    var selectedRegion = $("#selectRegion option:selected").text();
    if(selectedRegion != "Sverige"){
      self.region = selectedRegion;
      showInformation(selectedRegion);
      map.selectCountry(selectedRegion);
      sp1.selectDot(selectedRegion);
      //pc1.selectLine(selectedRegion);
    }
    else
    {
      self.region = "Sverige";
      map.deselectCountry();
      pc1.deselectLine();
      donut.deselectPie();
      sp1.deselectDot();
      showDefaultInformation();
    }
  }
}

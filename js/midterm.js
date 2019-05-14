'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  let yearUnit= 1960;

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 900)
      .attr('height', 900);

    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/data.csv")
      .then((data) => makeScatterPlot(data));

  
    
      
  }






  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable

    // get arrays of fertility rate data and life Expectancy data
    let avgView_data = data.map((row) => parseFloat(row["avgviewers"]));
    let year_data = data.map((row) => parseFloat(row["Year"]));

    // find data limits
    let axesLimits = findMinMax(year_data, avgView_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Year", "avgviewers");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions,yearUnit);

    // draw title and axes labels
    makeLabels();

    
    
  }

  // make title and axes labels
  function makeLabels() {

    svgContainer.append('text')
      .attr('x', 300)
      .attr('y', 40)
      .style('font-size', '20pt')
      .text(" Average Simpsons Viewership By Season ");

    svgContainer.append('text')
      .attr('x', 400)
      .attr('y', 640)
      .style('font-size', '15pt')
      .text('Years');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 350)rotate(-90)')
      .style('font-size', '15pt')
      .text('Avg Viewers(Mil)');
    
    svgContainer.append('text')
      .attr('x', 725)
      .attr('y', 95)
      .style('font-size', '12pt')
      .style("font-weight", "bold")
      .text("Viewership Data");
 
      svgContainer.append('text')
      .attr('x', 725)
      .attr('y', 115)
      .style('font-size', '12pt')
      .text("Actual");
    
    svgContainer.append('text')
      .attr('x', 725)
      .attr('y', 145)
      .style('font-size', '12pt')
      .text("Estimated");

     
    svgContainer.append("rect")
            .attr('x', 700)
            .attr('y', 100)
            .attr("width", 20)
            .attr("height", 20)
            .attr('fill', "#4286f4");      
    
    svgContainer.append("rect")
            .attr('x', 700)
            .attr('y', 130)
            .attr("width", 20)
            .attr("height", 20)
            .attr('fill', "#D3D3D3");     
        
  
 

  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map,yearUn) {

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


    var x = d3.scaleBand()
    .rangeRound([50, width])
    .padding(0.1);
  
    var y = d3.scaleLinear()
    .rangeRound([height, 50]);


    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    //////////////
    x.domain(data.map(function (d) {
			return d.Year;
		}));

    y.domain([0, d3.max(data, function (d) {
      return Number(d.avgviewers);
    })])

    
     svgContainer = svgContainer.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
     svgContainer.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x))
     
    

svgContainer.append("g")
     .call(d3.axisLeft(y))
     .attr('transform', 'translate(50, 0)')
     .append("text")
     .attr("fill", "#000")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", "0.71em")


     
    // append data to SVG and plot as bars
    svgContainer.selectAll('.bar')
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr('fill',function(d) {
        if(d.Year ==1999 || d.Year==2000 ) {
            return "#D3D3D3";
        } else {
            return "#4286f4";
        }
    })
      .attr("x", function (d) {
        return x(d.Year);
      })
      .attr("y", function (d) {
        return y(Number(d.avgviewers));
      })
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        return height - y(Number(d.avgviewers));
      })
      



        // add tooltip functionality to points
      .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html( "<br/>" +"Season #"+ (d["Year"])+"<br/>" +"Year: "+ (d["Year"])+"<br/>" +"Episodes: "+ (d["Episodes"])  +"<br/>" +"Avg Viewers(Mil): "+ (d["avgviewers"])+"<br/>"+
          "<br/>" +"Most watched episode: "+ (d["Most watched episode"])+"<br/>" +"Viewers(Mil): "+ (d["Viewers (mil)"]))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        }); 



//create labels for bars in chart, put on top
  svgContainer.selectAll(".label")        
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .style("display",  d => { return d.avgviewers === null ? "none" : null; })
        .attr("x", ( d => { return x(d.Year) + (x.bandwidth() / 2) -15 ; }))
        .attr("y",  d => { return height; })
            .attr("height", 0)
                .transition()
               .duration(750)
                .delay((d, i) => { return i * 150; })
        .text( d => { return (d.avgviewers); })
        .attr("y",  d => { return y(d.avgviewers) + .1; })
        .attr("dy", "-.25em"); 
       
       
 /////////// Calculate and make mean line

  var sum = d3.sum(data, function(d) { return d.avgviewers; });
  var average = (sum/data.length).toFixed(1);

  var line = d3.line()
        .x(function(d, i) { return x(d.Year) + i; })
        .y(function(d, i) { return y(average); }); 

    svgContainer.append("path")
        .datum(data)
        .style("stroke-dasharray", ("3, 3"))
        .attr("class", "mean")
        .attr("d", line);

    svgContainer.append("text")
        .attr("transform", "translate(" + (width-100) + "," + y(average) + ")")
        .attr("dy", "1em")
        .attr("text-anchor", "end")
        .style("fill", "black")
        .html("Avg viewers across all years = " + average);

      
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {

  

    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
      .range([0, 900]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([0, 600 ]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }


})();

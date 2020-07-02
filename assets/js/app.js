// @TODO: YOUR CODE HERE!
// Ch.3 Activity 9 
// Chart size
var svgWidth = 960;
var svgHeight = 500;

// Margins set
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 40
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
// div id is scatter
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(healthcareData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthcareData, d => d[chosenXAxis]) * 0.8,
    d3.max(healthcareData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);
  
    return xLinearScale;
  
  }

  // function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }
  
  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }
  
  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, circlesGroup) {
  
    var label;
  
    if (chosenXAxis === "poverty") {
      label = "Poverty %:";
    }
    else {
      label = "Age:";
    }
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -40])
      .html(function(d) {
        return (`${d.state}<br>Lacks Healthcare: ${d.healthcare}%<br>${label} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }

  // Ch.3 Activity 12
  // Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthcareData, error) {
    if (error) throw error;
  
    // parse data
    healthcareData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });

    // xLinearScale function above csv import
  var xLinearScale = xScale(healthcareData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([4, d3.max(healthcareData, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  //var circles = chartGroup.selectAll("g circles").data(healthcareData).enter()
  var circlesGroup = chartGroup.selectAll("g circles")
    .data(healthcareData)
    .enter()
    //.append("circle")
    circlesGroup.append("circle")
    .attr("cx", (d, i) => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 12)
    .attr("opacity", ".8")
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    .classed("stateCircle", true)
    .on("mouseover", function(d) {
      toolTip.show(d, this);
    })
    .on("mouseout", function(d) {
        toolTip.hide(d);
    }); 

    var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      // x key
      var theX;
      // Grab the state name.
      var theState = "<div>" + d.state + "</div>";
      // Snatch the y value's key and value.
      var theY = "<div>" + "healthcare" + ": " + d["healthcare"] + "%</div>";
      // If the x key is poverty
      if (chosenXAxis === "poverty") {
        // Grab the x key and a version of the value formatted to show percentage
        theX = "<div>" + chosenXAxis + ": " + d[chosenXAxis] + "%</div>";
      }
      else {
        // Otherwise
        // Grab the x key and a version of the value formatted to include commas after every third digit.
        theX = "<div>" +
        chosenXAxis +
          ": " +
          parseFloat(d[chosenXAxis]).toLocaleString("en") +
          "</div>";
      }
      // Display what we capture.
      return theState + theX + theY;
    });
  // Call the toolTip function.
  svg.call(toolTip);
   
    circlesGroup.append("text")
    //circles.append("text")
    .classed("stateText", "true")
    .text( function(d) {
      return d.abbr;
    })
    .attr("x", (d, i) => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.healthcare-0.22))
    .attr("font-size", 10);

    console.log(circlesGroup);

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 5})`);

  var povertyLabel = labelsGroup.append("text")
    .classed("active", true)
    .attr("x", 0)
    .attr("y", 30)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (median)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthcareData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});

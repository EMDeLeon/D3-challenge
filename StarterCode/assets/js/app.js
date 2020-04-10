// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter") //location in the HTML. 
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  //.attr("background-color", "green");
//console.log(svg);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
  //console.log(chartGroup);

// Initial Params
var labelArea= 110
var Data = [];
var chosenXAxis = "poverty";  // Default initial x-axis label
var chosenYAxis = "healthcare";  // Default initial y-axis label
var xAxisLabels = ["poverty"];  
var yAxisLabels = ["healthcare"];

var axisPadding = 20;

// function used for updating x-scale var upon click on axis label
function xScale(Data) {
  
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d.poverty)*.8,
      d3.max(Data, d => d.poverty)*1.2
    ])
    .range([0, width]);

  return xLinearScale;

}


// function used for updating xAxis var upon click on axis label
function renderAxs(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(Data, err) {
  if (err) throw err;
   // parse data
   Data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.heathcare = +data.healthcare;
    
  });

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  circlesGroup.selectAll("text")
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  
  return circlesGroup;
}

//declare variables 

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis,chosenYAxis,circlesGroup) {

  const tool_tips = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(d => `<div>${d.abbr}</div><div>${poverty}: ${d[poverty]} </div><div>${healthcare}: ${d[healthcare]}</div>`);

      
    svg.call(tool_tips);

     // Assign hover events
    circlesGroup.classed("active inactive", true)
     .on('mouseover', tool_tips.show)
     .on('mouseout', tool_tips.hide);
    
     return circlesGroup;
 }


  // xLinearScale function above csv import
  var xLinearScale = xScale(Data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0,d3.max(Data, d => d.healthcare)* 3])
    .range([height,0]);

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

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(Data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 20)
    .attr("fill", "#add3e6")
    .on("mouseover", function(d, index) {
      tool_tips.show(d, this); 
    d3.select(this).style("stroke", "#323232");
    });
    

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertXLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

    // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks HealthCare (%) ");

  // updateToolTip function above csv import
  //var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // updates x scale for new data
        xLinearScale = xScale(Data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

     }
      
    });
}).catch(function(error) {
  console.log(error);
});


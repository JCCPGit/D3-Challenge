// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold out chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append and SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial selected axes
var selectedXAxis = "poverty";
var selectedYAxis = "healthcare"; 

// FUNCTIONS
// Function to update x-scale and y-scale variables
function xScale(stateData, selectedXAxis) {
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[selectedXAxis])*.95,
        d3.max(stateData, d => d[selectedXAxis])*1.05])
    .range([0, width]);
    return xLinearScale;
}
function yScale(stateData, selectedYAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[selectedYAxis])*.80,
        d3.max(stateData, d => d[selectedYAxis])*1.05])
    .range([height, 0]);
    return yLinearScale;
}

// Function to update xAxis and yAxis variables
function xAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

function yAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis
}

// Function to update circles group
// Change of x axis
function circlesX(circlesGroup, statesGroup, newXScale, selectedXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[selectedXAxis]));

    statesGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[selectedXAxis]))

    return circlesGroup, statesGroup;
}

// Change of y axis
function circlesY(circlesGroup, statesGroup, newYScale, selectedYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[selectedYAxis]));

    statesGroup.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[selectedYAxis]));

    return circlesGroup, statesGroup;
}

// Function to update circles group tooltip
function updateToolTip(selectedXAxis, selectedYAxis, statesGroup) {
    // Determine xLabel
    var xLabel;
    if (selectedXAxis === "poverty") {
        xLabel = "In Poverty (%):";
    }
    else if (selectedXAxis === "age") {
        xLabel = "Age (Median):";
    }
    else {
        xLabel = "Household Income (Median):";
    }

    // Determine yLabel
    var yLabel;
    if (selectedYAxis === "healthcare") {
        yLabel = "Lacks Healthcare (%):";
    }
    else if (selectedYAxis === "smokes") {
        yLabel = "Smokes (%):";
    }
    else {
        yLabel = "Obese (%):";
    }

    // Insert toolTip into the HTML
    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`<h6>${d.state}</h6>${xLabel} ${d[selectedXAxis]}
      <br>${yLabel} ${d[selectedYAxis]}`);
    });

    statesGroup.call(toolTip);

    // Mouserover event
    statesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    .on("mouseout", function(data, index) {
        toolTip.hide(data);
    });
    return statesGroup;
}

// IMPORT DATA

d3.csv("assets/data/data.csv").then(function(stateData) {
    
    // Step 1: Parse Data/Cast as numbers
    // ==================================
    stateData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // Step 2: Create scale functions
    // ==================================
    var xLinearScale = xScale(stateData, selectedXAxis);
    var yLinearScale = yScale(stateData, selectedYAxis);

    // Step 3: Create axis functions
    // ==================================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==================================
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Step 5A: Create circles
    // ==================================
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[selectedXAxis]))
        .attr("cy", d => yLinearScale(d[selectedYAxis]))
        .attr("r", "12")
        .attr("fill", "lightblue")
        .attr("opacity", "1");

    // Step 5B: Create labels for the circles
    var statesGroup = chartGroup.append("g").selectAll("text")
        .data(stateData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[selectedXAxis]))
        .attr("y", d => yLinearScale(d[selectedYAxis]))
        .attr("dy", ".4em")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "10px")
        .style("font-weight", "bold");

    // Step 5C: Create lbael groups for x and y axis
    // X Axis label group
    var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width/2}, ${height + 20})`);

        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)");

    // Y Axis label group
    var yLabelsGroup = chartGroup.append("g")

        var healthcareLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokesLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");

        var obesityLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");

    // Step 6: Initialize tool tip
    // ==================================
    var statesGroup = updateToolTip(selectedXAxis, selectedYAxis, statesGroup);

    // X axis labels event listener
    xLabelsGroup.selectAll("text")
    .on("click", function() {
        // Get value of selection
        var value = d3.select(this).attr("value");
        if (value !== selectedXAxis) {
            // Replace selectedXAxis with value
            selectedXAxis = value;
            // Update LineScale & Axis
            xLinearScale = xScale(stateData, selectedXAxis);
            xAxis = xAxes(xLinearScale, xAxis);
            // Update circles and circle labels with new x values
            circlesGroup, statesGroup = circlesX(circlesGroup, statesGroup, xLinearScale, selectedXAxis);
            // Update tooltips with new info
            statesGroup = updateToolTip(selectedXAxis, selectedYAxis, statesGroup);
            // Update classes to change bold text
            if (selectedXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }

            else if (selectedXAxis === "age") {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }

            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });
    
    // Y axis labels event listener
    yLabelsGroup.selectAll("text")
    .on("click", function() {
        // Get value of selection
        var value = d3.select(this).attr("value");
        if (value !== selectedYAxis) {
            // Replace selectedXAxis with value
            selectedYAxis = value;
            // Update LineScale & Axis
            yLinearScale = yScale(stateData, selectedYAxis);
            yAxis = yAxes(yLinearScale, yAxis);
            // Update circles and circle labels with new x values
            circlesGroup, statesGroup = circlesY(circlesGroup, statesGroup, yLinearScale, selectedYAxis);
            // Update tooltips with new info
            statesGroup = updateToolTip(selectedXAxis, selectedYAxis, statesGroup);
            // Update classes to change bold text
            if (selectedYAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }

            else if (selectedYAxis === "smokes") {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }

            else {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });
}).catch(function(error) {
    console.log(error);
});


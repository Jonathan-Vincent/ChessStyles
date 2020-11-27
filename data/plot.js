// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 40, left: 50},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var Svg = d3.select('#plot_area')
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

//Read the data
d3.csv("https://raw.githubusercontent.com/Jonathan-Vincent/ChessStyles/main/data/white_xy.csv", function(data) {

  // Add X axis
  var x = d3.scaleLinear()
    .domain([-3, 3])
    .range([ 0, width ])
  Svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(10))
    .select(".domain").remove()

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([-3, 3])
    .range([ height, 0])
    .nice()
  Svg.append("g")
    .call(d3.axisLeft(y).tickSize(-width*1.3).ticks(7))
    .select(".domain").remove()

  // Customization
  Svg.selectAll(".tick line").attr("stroke", "#EBEBEB")

  // Add X axis label:
  Svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height + margin.top + 20)
      .text("X-Component");

  // Y axis label:
  Svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left+20)
      .attr("x", -margin.top)
      .text("Y-Component")

  // Color scale: give me a specie name, I return a color
  var color = d3.scaleOrdinal()
    .domain(['DrNykterstein','penguingim1','Zhigalko_Sergei','opperwezen',
           'Night-King96','Ogrilla','Alexander_Zubov','nihalsarin2004'])
    .range(["#E69F00","#56B4E9","#009E73","#F0E442","#0072B2","#D55E00","#CC79A7","#000000"])

  // Add dots
  Svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.X); } )
      .attr("cy", function (d) { return y(d.Y); } )
      .attr("r", 2)
      .style("fill", function (d) { return color(d.Player) } )

})

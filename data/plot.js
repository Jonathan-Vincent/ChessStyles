


// set the dimensions and margins of the graph
var margin = {top: 10, right: 100, bottom: 40, left: 50},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var Svg = d3.select('#plot_area')
  .append("svg")
  .  call(d3.zoom().on("zoom", function () {
       Svg.attr("transform", d3.event.transform)

    })
    .scaleExtent([1, 20]))
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

//Read the data
d3.csv("https://raw.githubusercontent.com/Jonathan-Vincent/ChessStyles/main/data/white_xy.csv", function(data) {

  // Add X axis
  var x = d3.scaleLinear()
    .domain([-2, 2.7])
    .range([ 0, width ])
  Svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(10))
    .select(".domain").remove()

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([-2.5, 3])
    .range([ height, 0])
    .nice()
  Svg.append("g")
    .call(d3.axisLeft(y).tickSize(-width*1.3).ticks(10))
    .select(".domain").remove()

  // Customization
  Svg.selectAll(".tick line").attr("stroke", "#EBEBEB")

  // Add X axis label:
  Svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height + margin.top + 20)
      .style('font-family', 'sans-serif')
      .text("X-Component");

  // Y axis label:
  Svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left+20)
      .attr("x", -margin.top)
      .style('font-family', 'sans-serif')
      .text("Y-Component")

      // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
      // Its opacity is set to 0: we don't see it by default.
      var tooltip = d3.select("#plot_area")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style('font-family', 'sans-serif')



      // A function that change this tooltip when the user hover a point.
      // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
      var mouseover = function(d) {
        tooltip
          .style("opacity", 1)
      }

      var mousemove = function(d) {
        tooltip
          .html("Player: " + d.Player + "<br>" + d.PGN)
          .style("left", width-40 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
          .style("top", 50 + "px")
      }

      // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again


  // Color scale: give me a specie name, I return a color
  var color = d3.scaleOrdinal()
    .domain(['DrNykterstein','penguingim1','Zhigalko_Sergei','opperwezen',
           'Night-King96','Ogrilla','Alexander_Zubov','nihalsarin2004'])
    .range(["#E69F00","#56B4E9","#009E73","#F0E442","#0072B2","#D55E00","#CC79A7","#e500ac"])

  // Add dots
  var circles = Svg.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("class",function(d){ return d.Player })
      .attr("cx", function (d) { return x(d.X); } )
      .attr("cy", function (d) { return y(d.Y); } )
      .attr("r", 1)
      .style("fill", function (d) { return color(d.Player) } )
      .on("mouseover", mouseover )
      .on("mousemove", mousemove );

    // This function is gonna change the opacity and size of selected and unselected circles
    function update(){

      // For each check box:
      d3.selectAll(".checkbox").each(function(d){
        cb = d3.select(this);
        grp = cb.property("value")

        // If the box is check, I show the group
        if(cb.property("checked")){
          Svg.selectAll("."+grp).style("opacity", 1)

        // Otherwise I hide it
        }else{
          Svg.selectAll("."+grp).style("opacity", 0)
        }

      })
    }


    // When a button change, I run the update function
    d3.selectAll(".checkbox").on("change",update);

    // And I initialize it at the beginning
    update()

})

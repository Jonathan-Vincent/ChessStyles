
// set the dimensions and margins of the graph
var margin = {top: 10, right: 0, bottom: 40, left: 30},

    width = d3.select('#plot_area').node().offsetWidth - margin.left - margin.right,
    height = d3.select('#plot_area').node().offsetWidth - margin.top - margin.bottom;

// append the svg object to the body of the page
var Svg = d3.select('#plot_area')
  .append("svg")
  .  call(d3.zoom().on("zoom", function () {
       Svg.attr("transform", d3.event.transform)

    })
    .scaleExtent([1, 20])
    .extent([[0, 0], [width, height]])
    .translateExtent([[-100,-100], [width+100, height+100]]))
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")



//Read the data
d3.csv("https://raw.githubusercontent.com/Jonathan-Vincent/ChessStyles/main/data/sum40_xy.csv", function(data) {

  // Add X axis
  var x = d3.scaleLinear()
    .domain([-1, 1])
    .range([ 0, width ])
  Svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(-height*1.03).ticks(10).tickFormat(""))
    .select(".domain").remove()

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([-1, 1])
    .range([ height, 0])
    .nice()
  Svg.append("g")
    .call(d3.axisLeft(y).tickSize(-width*1.03).ticks(10).tickFormat(""))
    .select(".domain").remove()

  // Customization
  Svg.selectAll(".tick line").attr("stroke", "#EBEBEB")

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

      var selected = d3.select("#plot_area")
          .append("div")
          .style("opacity", 1)
          .attr("class", "tooltip")
          .style('width', d3.select('#plot_area').node().offsetWidth + "px")
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "1px")
          .style("border-radius", "5px")
          .style("padding", "5px")
          .style('font-family', 'sans-serif')
          .style("left", d3.select('#plot_area').node().left + "px")
          .style("top", d3.select('#plot_area').node().bottom + "px")
          .html('No game selected')


      // A function that change this tooltip when the user hover a point.
      // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
      var mouseover = function(d) {
        tooltip
          .style("opacity", 1)
      }

      var mousemove = function(d) {
        tooltip
          .html("Player: " + d.Player)
          .style("left", (d3.event.pageX + 16) + "px")
          .style("top", (d3.event.pageY + 16) + "px")
      }

      var mouseleave = function(d) {
        tooltip
          .style("opacity", 0)
      }

      var mouseclick = function(d) {
        selected
          .html("Selected Game: " + d.Player + "<br>" + d.PGN)
        currentPGN = d.PGN
        mypgn = currentPGN.split(' ')
        pos = 0
        returnToStart ()
      }

      // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again


  // Color scale: give me a specie name, I return a color
  var color = d3.scaleOrdinal()
    .domain(['DrNykterstein','penguingim1','Zhigalko_Sergei','opperwezen',
           'Night-King96','Ogrilla','Alexander_Zubov','nihalsarin2004','user'])
    .range(["#E69F00","#56B4E9","#009E73","#F0E442","#0072B2","#D55E00","#CC79A7","#e500ac",'#000000'])

  // Add dots
  var circles = Svg.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("class",function(d) { return d.Player })
      .attr("cx", function (d) { return x(d.X); } )
      .attr("cy", function (d) { return y(d.Y); } )
      .style("fill", function (d) { return color(d.Player) } )
      .style("opacity", 1 )
      .on("mouseover", mouseover )
      .on("mousemove", mousemove )
      .on("mouseleave", mouseleave )
      .on("click", mouseclick )
      .attr("r", 1)


    // This function is gonna change the opacity and size of selected and unselected circles
    function update(){

      // For the check box:
        cb = d3.select(this);
        checked = cb.property("checked")
        grp = cb.property("value")

        // If the box is check, I show the group
        if(checked){
          Svg.selectAll("."+grp)
              .attr('r',1)


        // Otherwise I hide it
        }else{
          Svg.selectAll("."+grp)
              .attr('r',0)
        }
    }

    function importPGN(){
      inputPGN = document.getElementById("userInput").value;
      valchess = new Chess()

      if (valchess.load_pgn(inputPGN,{ sloppy: true })) {
        document.getElementById("result").innerHTML = 'PGN accepted';
      }else {
        document.getElementById("result").innerHTML = 'PGN not accepted';
        return
      }

      console.log(inputPGN)
      inputPGN = valchess.history().join(' ')

      data.push({X: Math.random().toString(), Y: Math.random().toString(), Player: "user", PGN: inputPGN})
      console.log(data[data.length - 1])
      circles
        .data(data)
        .enter()
        .merge(circles)
        .append("circle")
          .attr("class",function(d) { return d.Player })
          .attr("cx", function (d) { return x(d.X); } )
          .attr("cy", function (d) { return y(d.Y); } )
          .style("fill", function (d) { return color(d.Player) } )
          .on("mouseover", mouseover )
          .on("mousemove", mousemove )
          .on("mouseleave", mouseleave )
          .on("click", mouseclick )
          .attr("r", 5)
    }

    // When a button change, run the update function
    d3.selectAll(".checkbox").on("change",update);
    d3.select("#submitted").on("click",importPGN);

})

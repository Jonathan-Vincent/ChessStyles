
// set the dimensions and margins of the graph
var margin = {top: 10, right: 0, bottom: 40, left: 30},

    width = d3.select('#plot_area').node().offsetWidth - margin.left - margin.right,
    height = d3.select('#plot_area').node().offsetWidth - margin.top - margin.bottom;

// append the svg object to the body of the page
var Svg = d3.select('#plot_area')
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)

g = Svg.append("g")

Svg.call(d3.zoom()
.scaleExtent([1, 10])
.translateExtent([[-50,-50],[width+50,height+50]])
.on("zoom", zoom))

function zoom() {
  //console.log("zoom", d3.event.transform)
g.attr("transform", d3.event.transform);
}

var player = 'None'
var data = {}

//Read the data
d3.csv("https://raw.githubusercontent.com/Jonathan-Vincent/ChessStyles/main/data/unnormed_sum40_xy.csv", function(d) {
  data = d
  //initialise circles
  addcircs()})

  // Add X axis
  var x = d3.scaleLinear()
    .domain([-7, 6])
    .range([ 0, width ])
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(-height).ticks(10).tickFormat(""))
    .select(".domain").remove()

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([-7, 7])
    .range([ height, 0])
    .nice()
  g.append("g")
    .call(d3.axisLeft(y).tickSize(-width).ticks(10).tickFormat(""))
    .select(".domain").remove()

  // Customization
  g.selectAll(".tick line").attr("stroke", "#EBEBEB")

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
        inputPGN = d.PGN
        player = d.Player
        tooltip
          .html("Player: " + player)
          .style("left", (d3.event.pageX + 16) + "px")
          .style("top", (d3.event.pageY + 16) + "px")
      }

      var mouseleave = function(d) {
        tooltip
          .style("opacity", 0)
      }

      var mouseclick = function(d) {
        selected.html("Player: " + player + '<br>' + inputPGN)
        mypgn = inputPGN.split(' ')
        returnToStart ()
        predictPGN(mypgn)
      }

      // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again


  // Color scale: returns a color for each player
  var color = d3.scaleOrdinal()
    .domain(['DrNykterstein','penguingim1','Zhigalko_Sergei','opperwezen',
           'Night-King96','Ogrilla','Alexander_Zubov','nihalsarin2004','user'])
    .range(["#E69F00","#56B4E9","#009E73","#F0E442","#0072B2","#D55E00","#CC79A7","#e500ac",'#000000'])


    // change the size of selected and unselected circles
    function update(){

      // For the check box:
        cb = d3.select(this);
        checked = cb.property("checked")
        grp = cb.property("value")

        // If the box is check, I show the group
        if(checked){
          g.selectAll("."+grp)
              .attr('r',1)


        // Otherwise I hide it
        }else{
          g.selectAll("."+grp)
              .attr('r',0)
        }
    }

    function importPGN(){
      //add user's PGN
      inputPGN = document.getElementById("userInput").value;
      valchess = new Chess()
      state = valchess.load_pgn(inputPGN,{ sloppy: true })

      console.log(g.selectAll("circle").size())
      //check if PGN is valid
      if (state) {
        document.getElementById("result").innerHTML = 'PGN accepted';
      }else {
        document.getElementById("result").innerHTML = 'PGN not accepted';
        return
      }
      //retrieve PGN in standardised form
      inputPGN = valchess.history()
      newdata = addGame(inputPGN)
      data = data.concat(newdata)
      addcircs()
      predictPGN(inputPGN)

    }

    function importUserGames(userGamesList){
      //add Lichess games
      for(var i=0, n=userGamesList.length;i<n;i++) {
        inputPGN = userGamesList[i]
        valchess = new Chess()
        state = valchess.load_pgn(inputPGN,{ sloppy: true })
        if (state) {
          inputPGN = valchess.history()
          newdata = addGame(inputPGN)
          data = data.concat(newdata)
        }
      }
      addcircs()
    }

      function addGame(inputPGN) {
      //compute coords using PCA after moves 8,10,...,40
      var movefreq = new Array(1445).fill(0);
      var move = 0
      var xsum = 0
      var ysum = 0
      var n = 0
      var gamelength = inputPGN.length

      for(var i = 0; i < Math.min(41,gamelength); i++) {
        if (i % 2 === 0) {
          if (i>7) {
            n++
            normmovefreq = math.subtract(movefreq,meandict[i])
            xpca = math.dot(normmovefreq,compdict[i])
            ypca = math.dot(normmovefreq,compdict[i+1])

            xsum = xsum + xpca/n
            ysum = ysum + ypca/n
          }
          turn = 'white'
          move =  turn + inputPGN[i].toLowerCase().replace('x','').replace('+','');
          movefreq[move_index[move]] = movefreq[move_index[move]] + 1
        }
        else {
        turn = 'black'
        move =  turn + inputPGN[i].toLowerCase().replace('x','').replace('+','');
        movefreq[move_index[move]] = movefreq[move_index[move]] + 1
      }

      //if game is very short, compute PCA anyway
      if (gamelength < 8){
      normmovefreq = math.subtract(movefreq,meandict[8])
      xsum = math.dot(normmovefreq,compdict[8])
      ysum = math.dot(normmovefreq,compdict[9])
      }

      }
      newdata = {X: (xsum).toString(), Y: (ysum).toString(), Player: "user", PGN: inputPGN.join(' ')}
      return newdata
    }

    function addcircs(){
      circles = g
      .selectAll("circle")
      .data(data)

      circles.exit().remove()

      circles.enter()
      .append("circle")
      .attr("class",function(d) { return d.Player })
      .attr("cx", function (d) { return x(d.X); } )
      .attr("cy", function (d) { return y(d.Y); } )
      .attr("r", 1)
      .style("fill", function (d) { return color(d.Player) } )
      .on("mouseover", mouseover )
      .on("mousemove", mousemove )
      .on("mouseleave", mouseleave )

    console.log(g.selectAll("circle").size())
    }

    // When a button change, run the update function
    d3.selectAll(".checkbox").on("change",update);
    d3.select("#submitted").on("click",importPGN);

    Svg.on("click", mouseclick )

//---------------------------------------------------------------------------------------------------
// Intro theme inspiration:
// https://github.com/IronSummitMedia/startbootstrap-grayscale/blob/master/index.html
//---------------------------------------------------------------------------------------------------
var graph_m = { "nodes":[
    {"name":"R", "group":1},
    {"name":"Hadoop", "group":1},
    {"name":"python", "group":1},
    {"name":"regression", "group":1},
    {"name":"nosql", "group":1},
    {"name":"Titanic", "group":2},
    {"name":"p2p-loans", "group":2},
    {"name":"dash+", "group":2},
    {"name":"activity", "group":2},
    ],
    "links" : [
    {"source":0, "target":5, "value": 1},
    {"source":0, "target":6, "value": 1},
    {"source":0, "target":7, "value": 1},
    {"source":1, "target":5, "value": 1},
    {"source":1, "target":8, "value": 1},
    {"source":2, "target":6, "value": 1},
    {"source":3, "target":7, "value": 1},
    {"source":4, "target":8, "value": 1}
    ]
};

//---------------------------------------------------------------------------------------------------
// bootstrap popover
//---------------------------------------------------------------------------------------------------
function removePopovers () {
  $('.popover').each(function() {
    $(this).remove();
  }); 
}

function showPopover (d) {
  $(this).popover({
    placement: 'auto top',
    container: 'body',
    trigger: 'manual',
    html: true,
    content: function () { return d.text; }
  });
  $(this).popover('show');
}


//---------------------------------------------------------------------------------------------------
// d3 chart
// http://bl.ocks.org/mbostock/4062045
// http://bl.ocks.org/mbostock/1093130
// http://www.delimited.io/blog/2014/1/10/scraping-movie-data-from-the-web-in-nodejs
//---------------------------------------------------------------------------------------------------
tagGraph = function(id) {
    
    d3.json("../theme/js/tag_graph.json", function (error, graph)
    {  
            
    var width = 600,
        height = 600;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-400)
        .linkDistance(100)
        .size([width, height]);

    var svg = d3.select(id).append("svg")
        .attr("width", width)
        .attr("height", height);

      force.nodes(graph.nodes).links(graph.links).start();

      var link = svg.selectAll(".link")
          .data(graph.links)
          .enter().append("line")
          .attr("class", "link")
          .style("stroke-width", function(d) { return Math.sqrt(1*d.value); })
          .style("stroke", "#000");

      var node = svg.selectAll("g.node")
          .data(graph.nodes)
          .enter().append("svg:g")
          .attr("class", "node")
          .call(force.drag);
    
    /*
    node.append("circle")
        .attr("r", function(d) { return d.group == 1 ? 10 : 20; })
        .style("fill", function(d) { return d.group == 1 ? "#bbb": "#98B1C4"; })
        .style("stroke-width", function(d) { return d.group == 1 ? "0px" : "1px"; })
        .style("stroke", "#000");
    */
    
    svg.selectAll(".node").filter(function (d) { return d.group==2;})
        .append("circle")
        .attr("r", function(d) { return d.group == 1 ? 10 : 20; })
        .style("fill", function(d) { return d.group == 1 ? "#bbb": "#98B1C4"; })
        .style("stroke-width", function(d) { return d.group == 1 ? "0px" : "1px"; })
        .style("stroke", "#000");
        
    // Placeholder background reactangle 
    svg.selectAll(".node").filter(function (d) { return d.group==1;})
        .append("g")
        .append("rect");        
          
    // Foreground text
      svg.selectAll(".node").filter(function (d) { return d.group==1;}).select("g")
          .append("text")
          .text(function(d) {return d.name;})
          .attr("dy", "16")
          .attr("dx", "5")
          .style("stroke", "none")
          .style("font-size", "14px")
          .style("fill", "#222")
          .style("text-anchor", "left")
          .style("background-color", "#bbb")
          .style("pointer-events", "none");  
        
      // Now adjust background rectangle based on text width
      svg.selectAll("rect")
          .attr("width", function() { return this.parentNode.children[1].getBBox().width + 17; })
          .attr("height", "24")
          .style("fill", "#bbb");

      // And shift rectangle into the middle
      svg.selectAll(".node").filter(function (d) { return d.group==1;})
          .select("g")
          .attr("transform", function() { return "translate(-" + ((this.children[1].getBBox().width + 15) / 2) + ", -12)"; })
          
//          attr("transform", "translate(-" + this.parentNode.children[1].getBBox().width / 2 + ",0)")
          
         //d3.select(".node").filter(function (d) { return d.group==1;}).
           //   select("rect").attr("width", function(d) { return this.parentNode.getBBox().width; })
          
/*      svg.selectAll(".node").filter(function (d) { return d.group==1;})
          .append("rect")
          .attr("width", function() { return this.parentNode.text.getBBox().width;})
          .attr("height", "30")
          .style("fill", "#bbb");
          */
          //.select(function() { return this.parentNode.text; }).text("test");
          
      svg.selectAll(".node").filter(function (d) { return d.group==2;})
          .on("mouseover", showPopover)
          .on("mouseout", removePopovers)
          .on("click", function(d) { location.href = d.url; })
          .style("cursor", "pointer");

      force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
    
    });
}


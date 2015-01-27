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
  var html = "<span style='color:" + d.color + "'>" + d.category + "</span><br>" + d.text;
  $(this).popover({
    placement: 'auto top',
    container: 'body',
    trigger: 'manual',
    html: true,
    content: function () { return html; }
  });
  $(this).popover('show');
}

function showTagPopover (d) {
  var html =  d.value + "<span class='muted'>" + (d.value>1?" posts":" post") + " with tag </span>"  + d.text;
  $(this).popover({
    placement: 'auto top',
    container: 'body',
    trigger: 'manual',
    html: true,
    content: function () { return html; }
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
    var width = window.innerWidth,
        height = 600;

    // var color = d3.scale.category20();
    var colors = ["#00ADEF", "#ED008C", "#F5892D", "#BBCB5F", "#999", "#ccc"];
    var nodeColorScale = d3.scale.ordinal().range(colors.reverse());
    graph.nodes.forEach(function(d) { d.color = nodeColorScale(d.category); });

    var force = d3.layout.force()
        .charge(-300)
        .linkDistance(90)
        .gravity(0.125)
        .size([width, height]);

    // var svg = d3.select(id).append("svg")
    //     .attr("width", width)
    //     .attr("height", height);

    svg = d3.select(id).append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet");        

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
    
    
    svg.selectAll(".node").filter(function (d) { return d.group==2;})
        .append("circle")
        .attr("r", 15)
        .style("fill", function(d) { return d.color; })
        .style("stroke-width", "1px"  )
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
          .attr("width", function() { return this.parentNode.childNodes[1].getBBox().width + 17; })
          .attr("height", "24")
          .style("fill", "#bbb");

      // And shift rectangle into the middle
      svg.selectAll(".node").filter(function (d) { return d.group==1;})
          .select("g")
          .attr("transform", function() { return "translate(-" + ((this.childNodes[1].getBBox().width + 15) / 2) + ", -12)"; });
          
      svg.selectAll(".node").filter(function (d) { return d.group==2;})
          .on("mouseover", showPopover)
          .on("mouseout", removePopovers)
          .on("click", function(d) { location.href = d.url; })
          .style("cursor", "pointer");

      svg.selectAll(".node").filter(function (d) { return d.group==1;})
          .on("mouseover", showTagPopover)
          .on("mouseout", removePopovers)
          .on("click", function(d) { location.href = d.url; })
          .style("cursor", "pointer");

      collide = function(d, alpha) {
        var padding = 1;    
        
        var r = 2 * (d.group==1 ? 30 : 15) + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
        return function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
              var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y);
              if (l < r) {
                  l = (l - r) / l * alpha;
                  d.x -= x *= l;
                  d.y -= y *= l;
                  quad.point.x += x;
                  quad.point.y += y;
              }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        };
      }

      force.on("tick", function() {

        // Collision detection
        nodes = force.nodes();
        var q = d3.geom.quadtree(nodes),
            i = 0,
            n = nodes.length;

        while (++i < n) q.visit(collide(nodes[i], 0.2));

        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
      });
    
    });
}


var pubs = [
{"name" : "Frontiers", "year" : 2012, 
"values" : [{"label" : "2008", "value" : 0 }, {"label" : "2009", "value" : 2 }, {"label" : "2010", "value" : 3 }, {"label" : "2011", "value" : 6 }, {"label" : "2012", "value" : 4 }]},
{"name" : "SAB", "year" : 2012, 
"values" : [{"label" : "2008", "value" : 5 }, {"label" : "2009", "value" : 3 }, {"label" : "2010", "value" : 1 }, {"label" : "2011", "value" : 0 }, {"label" : "2012", "value" : 0 }]},
{"name" : "ALife", "year" : 2012, 
"values" : [{"label" : "2008", "value" : 0 }, {"label" : "2009", "value" : 1 }, {"label" : "2010", "value" : 4 }, {"label" : "2011", "value" : 8 }, {"label" : "2012", "value" : 9 }]},
]

var width, height;
var dateFormat = d3.time.format("%Y-%m-%d");

//---------------------------------------------------------------------------------------------------
// Pubs list
//---------------------------------------------------------------------------------------------------
htmlForPub = function(p){
    text = "<span> [" + p.num_citations + "] " + p.authors + " (" + p.year + "). " + "<a href='" + p.link + "'>" + p.name + ".</a> " + p.journal + "." + "</span>";
    badge = "<span class='badge pull-right'>" + p.num_citations + "</span>";
    res = text;
    return res;
}

pubsList = function(elemid) {
    d3.tsv("../theme/js/articles.tsv", function(error, pubs)
    {        
        pubelems = d3.select(elemid).selectAll(".ref")
            .data(pubs).enter().append("li")
                .attr("class", "ref")
                .property("id",  function(d) { return d.label; })
                .html(function(d) { return htmlForPub(d); });
    });
}

//---------------------------------------------------------------------------------------------------
// Bar plot
//---------------------------------------------------------------------------------------------------
pubsBars = function(elemid, colSc) {
    
    var margin = {top: 10, right: 40, bottom: 30, left: 30};
    width = 800 - margin.left - margin.right;
    height = 400 - margin.top - margin.bottom;
    
    var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    var y = d3.scale.linear().rangeRound([height, 0]);
    
    //var colors = ["#00ADEF", "#ED008C", "#FEF200", "#BBCB5F"];
    //var color = d3.scale.ordinal().range(colors);
    var color = d3.scale.ordinal().range(colorbrewer[colSc][8]);
    
    var svg = d3.select(elemid).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");      
    
    // Read data 
    d3.tsv("../theme/js/articles.tsv", function(error, artData)
    {
        // Make indexable by label
        var articles = {}
        artData.forEach(function(article) { 
            articles[article.label] = article;
        });
            
    d3.tsv("../theme/js/counts.tsv", function (error, data)
    {    
        var labelVar = 'year';
        var varNames = d3.keys(data[0])
            .filter(function (key) { return key !== labelVar;});

        color.domain(varNames);
            
        data.forEach(function (d) {
          var y0 = 0;
          d.mapping = varNames.map(function (name) { 
            return {
              name: name,
              label: d[labelVar],
              y0: y0,
              y1: y0 += +d[name]
            };
          });
          d.total = d.mapping[d.mapping.length - 1].y1;
        });
        
        console.log(data);
        
        x.domain(data.map(function (d) { return d[labelVar]; }));
        y.domain([0, d3.max(data, function (d) { return d.total; })]);
        
        // Axes
        xAxis = d3.svg.axis().scale(x).orient("bottom");
        yAxis = d3.svg.axis().scale(y).orient("left"); 
    
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);  

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);             
        
        var selection = svg.selectAll(".series")
            .data(data).enter().append("g")
            .attr("class", "series")
            .attr("transform", function (d) { return "translate(" + x(d[labelVar]) + ",0)"; });
            
        selection.selectAll("rect")
            .data(function (d) { return d.mapping; })
            .enter().append("rect")
              .attr("class", "rect")
              .attr("width", x.rangeBand())
              .attr("y", function (d) { return y(d.y1); })
              .attr("height", function (d) { return y(d.y0) - y(d.y1); })
              .style("fill", function (d) { return color(d.name); })
              .style("stroke", "grey")
              .style("stroke-width", "0px")
              
              .on("mouseover", function(d) { 
                  d3.select(this).style("fill", "black")
                  var selectedArt = articles[d.name];
                  showPopover.call(this, d, selectedArt, 'auto top'); 
                  $('.popover').css('background-color', 'rgba(50,50,50,0.6)');
                  $('.popover-title').css('background-color', 'rgba(50,50,50,0.75)');
                  d3.select("#" + d.name).classed("ref-selected", true);
                  })
                  
              .on("mouseout", function(d) { 
                  removePopovers(); 
                  d3.select(this).style("fill", color(d.name)); 
                  d3.selectAll(".ref").classed("ref-selected", false);
                  });
              
              // Hover highlighting
              svg.selectAll(".series")
                  .attr("opacity", 1)
            
                  .on("mouseover", function(d, i) {
                      svg.selectAll(".series").transition()
                          .duration(250)
                          .attr("opacity", function(d, j) {
                              return j != i ? 0.6 : 1;
                          });
                  })
                  
                  .on("mouseout", function(d, i) {
                       svg.selectAll(".series").transition().duration(250).attr("opacity", "1");                 
                       d3.select(this).classed("hover", false).style("stroke-width", "0px");
                    })
          
                  .on("mousemove", function(d, i) {
                      d3.select(this).classed("hover", true).style("stroke-width", "1px");
                  });
    });
    });
}

//---------------------------------------------------------------------------------------------------
// Line plot
//---------------------------------------------------------------------------------------------------
pubsLine = function(elemid) {
    
    names = pubs.map(function(d) { return d.name; });
    console.log("Var names:", names);
    
    labels = pubs.map(function(d) { return d.values.map(function(d) { return d.label}); });
    labels = d3.set(d3.merge(labels)).values().sort(d3.ascending);
    console.log(labels);
    
    values = d3.merge(pubs.map(function(d) { return d.values.map(function(d) { return d.value}); }));
    console.log(values);
    ymin = 0;
    ymax = d3.max(values) + 1;
    console.log(ymin, ymax);
    
    var margin = {top: 10, right: 40, bottom: 30, left: 30};
    width = 800 - margin.left - margin.right;
    height = 400 - margin.top - margin.bottom;
    
    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0, 0).domain(labels);
    var y = d3.scale.linear().nice(1).rangeRound([height, 0]).domain([ymin, ymax]);

    colors = ["#00ADEF", "#ED008C", "#FEF200"];// "#BBCB5F"];
    cdomain = [0, 1, 2, 3];
    color = d3.scale.ordinal().domain(names).range(colors);
    
    var line = d3.svg.line()
        .interpolate("cardinal")
        .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
        .y(function (d) { return y(d.value); });
        
    // Create axes
    xAxis = d3.svg.axis().scale(x).orient("bottom");
    yAxis = d3.svg.axis().scale(y).orient("left").tickValues(d3.range(ymax+1));        
          
    var svg = d3.select(elemid).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);   
  
    var chart = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Append axes
    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);  
   
    chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);
    
    var series = chart.selectAll(".series")
        .data(pubs)
        .enter().append("g")
        .style("stroke", function (d) { return color(d.name); })        
        .attr("class", "series");
        
    series.append("path")
      .attr("class", "line")
      .attr("d", function (d) { return line(d.values); })
      .style("stroke", "inherit")        
      .style("fill", "none");
}

//---------------------------------------------------------------------------------------------------
// Stream plot
// http://www.delimited.io/blog/2014/3/3/creating-multi-series-charts-in-d3-lines-bars-area-and-streamgraphs
// http://bl.ocks.org/WillTurman/4631136
//---------------------------------------------------------------------------------------------------
function removePopovers () {
  $('.popover').each(function() {
    $(this).remove();
  }); 
}

function htmlForArticle(d, art){
    return art.authors + 
    "<br/>Cited <b>" + (d.value ? d.value: d.y1 - d.y0)  + "</b> times in " + d.label + ". <b>" + art.num_citations + "</b> in total.";
}

function showPopover (d, art, dir) {
  $(this).popover({
    title: art.name + " (" + art.year + ")",
    placement: dir,
    container: 'body',
    trigger: 'manual',
    html : true,
    content: function() { return htmlForArticle(d, art); }
  });
  $(this).popover('show');
}

streamCsv = function(elemid, colSc) {
    
    var margin = {top: 10, right: 40, bottom: 30, left: 30};
    width = 800 - margin.left - margin.right;
    height = 400 - margin.top - margin.bottom;
    
    var x = d3.scale.ordinal().rangePoints([0, width]);
    var y = d3.scale.linear().nice(1).rangeRound([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
    var stack = d3.layout.stack()
        .offset("zero")
        .order("inside-out")
        .values(function (d) { return d.values; })
        .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
        .y(function (d) { return d.value; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
        .y0(function (d) { return y(d.y0); })
        .y1(function (d) { return y(d.y0 + d.y); });
        
    //colors = ["#00ADEF", "#ED008C", "#FEF200", "#000", "#B4F043", "#FD4F54", "#FFB63E", "#4852CD"];
    //color = d3.scale.ordinal().range(colors);
    var color = d3.scale.ordinal().range(colorbrewer[colSc][8]);
    
    
    var svg = d3.select(elemid).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          
          
d3.tsv("../theme/js/articles.tsv", function(error, artData)
{
    // Make indexable by label
    var articles = {}
    artData.forEach(function(article) { 
        articles[article.label] = article;
    });
    
    d3.tsv("../theme/js/counts.tsv", function (error, data) 
    {
        var labelVar = 'year';
        var varNames = d3.keys(data[0])
          .filter(function (key) { return key !== labelVar; });
        color.domain(varNames);

        var seriesArr = [], series = {};
        varNames.forEach(function (name) { 
            series[name] = {name: name, values:[] };
            seriesArr.push(series[name]);
        });

        data.forEach(function (d) {
          varNames.map(function (name) {
              series[name].values.push({name: name, label: d[labelVar], value: +d[name]});
          });
        });

        x.domain(data.map(function (d) { return d[labelVar]; }));

        stack(seriesArr);
        
        y.domain([0, d3.max(seriesArr, function (c) { 
            return d3.max(c.values, function (d) { return d.y0 + d.y; });
            })
        ]);
            
        svg.selectAll(".layer")
            .data(seriesArr)
            .enter().append("path")
                .attr("class", "layer")
                .attr("d", function(d) { return area(d.values); })
                .style("fill", function(d) { return color(d.name); })
                .style("stroke", "black");
        
        // axes last for overprinting        
        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);  

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);
          
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxis.orient("right"));   
            
        ordInv = function(y)
        {
            var lefts = x.range();
            var w = x.rangeBand();
            var j;
            for (j=0; y > (lefts[j] + w); j++) {}
            var v = x.domain()[j];
            return [j,v];
        }    
        
        valuesForMouse = function(container, layer)
        {
            mousex = d3.mouse(container)[0];
            var inv = ordInv(mousex);
            return layer.values[inv[0]];
        }
            
        // Hover highlighting
        svg.selectAll(".layer")
            .attr("opacity", 1)
            
            .on("mouseover", function(d, i) {
                svg.selectAll(".layer").transition()
                    .duration(250)
                    .attr("opacity", function(d, j) {
                        return j != i ? 0.6 : 1;
                    });
                
                var selected = valuesForMouse(this, d);
                var selectedArt = articles[selected.name];                
                showPopover.call(this, selected, selectedArt, 'left');     

                svgpos = $(elemid).offset();
                $('.popover').css('top', svgpos.top + 50).css('left', svgpos.left + margin.left + 20);
                $('.popover').addClass("popover-wide"); 
                d3.select("#" + selected.name).classed("ref-selected", true);
            })
            
    		.on('click', function(d) {
                var selected = valuesForMouse(this, d);
                var selectedArt = articles[selected.name];
                window.open(selectedArt.link, "_blank");
            })
            
            .on("mouseout", function(d, i) {
                 svg.selectAll(".layer").transition()
                 .duration(250)
                 .attr("opacity", "1");
                 
                 d3.select(this)
                  .classed("hover", false)
                  .style("stroke-width", "0px");
                  
                  removePopovers();
                  d3.selectAll(".ref").classed("ref-selected", false);
              })
          
            .on("mousemove", function(d, i) {
                d3.select(this).classed("hover", true)
                    .style("stroke-width", "1px");

                var selected = valuesForMouse(this, d);
                var selectedArt = articles[selected.name];
                    
                $(this).data('bs.popover').tip().find(".popover-content").html(htmlForArticle(selected, selectedArt));
            });
    });
});
}
    
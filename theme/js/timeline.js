var experience = [
{"from":"2001-10-01", "to":"2002-10-01",  "label":"VR Research Assistant", "where":"Fraunhofer Institute IAIA", "place": "Sankt Augustin, Germany"},
{"from":"2003-10-01", "to":"2006-11-01",  "label":"Teaching Assistant AI", "where":"University of Sussex", "place":"Brighton UK"},
{"from":"2007-06-01", "to":"2009-03-01",  "label":"Behaviour Engineer", "where":"NaturalMotion", "place":"Oxford, UK"},
{"from":"2009-03-01", "to":"2011-06-01",  "label":"Lead Behaviour Engineer", "where":"NaturalMotion", "place":"Oxford, UK"},
{"from":"2011-06-01", "to":"2014-12-30", "label":"Postdoctoral computational modeller", "where":"Ikerbasque Foundation", "place":"San Sebastian, Spain"},
{"from":"2015-01-01", "to":"2015-12-30", "label":"Social Network Analyst", "where":"University of the Basque Country", "place":"San Sebastian, Spain"},
{"from":"2015-06-01", "to":"2015-12-30", "label":"Frelance Data Scientist", "where":"voopter.com.br", "place":"Madrid, Spain"}
];

var education = [
{"from":"1998-10-01", "to":"2001-09-30", "label":"BSc in Cognitive Science", "where":"Universitat Osnabruck", "place":"Osnabruck, Germany"},
{"from":"2000-10-01", "to":"2001-03-30", "label":"Erasmus (Belfast)", "where":"University of Ulster", "place":"Belfast, UK"},
{"from":"2001-10-01", "to":"2002-09-30", "label":"Neuroinformatics", "where":"Ruhr-Universitat Bochum", "place":"Bochum, Germany"},
{"from":"2002-10-01", "to":"2003-09-30", "label":"MSc Evolutionary & Adaptive Systems", "where":"University of Sussex", "place":"Brighton, UK"},
{"from":"2003-10-01", "to":"2007-09-30", "label":"DPhil Computer Science & AI", "where":"University of Sussex", "place":"Brighton, UK"}
];

var pubs = {"name" : "pubs", "children":""}

var width, height;
var dateFormat = d3.time.format("%Y-%m-%d");

//---------------------------------------------------------------------------------------------------
// Wrapper
//---------------------------------------------------------------------------------------------------
timelineFromJson = function(colSc) {
    draw(education, "#timeline-ed", colSc, 200, 1.2);
    draw(experience, "#timeline-exp", colSc, 300, 2.25);
}

//---------------------------------------------------------------------------------------------------
draw = function(data, elem, colSc, h, m) {
    
	data.forEach(function(d){ 
        d.from = dateFormat.parse(d.from); 
        d.to = dateFormat.parse(d.to); 
    });

	timeline(elem, data, colSc, h, m);
}

//---------------------------------------------------------------------------------------------------
// Popover helpers
//---------------------------------------------------------------------------------------------------
function removePeriodPopovers () {
  $('.popover').each(function() {
    $(this).remove();
  }); 
}

function htmlForPeriod(d){
    //var period = d.to - d.from; // in s?
    //var months = Math.floor(period / (1000 * 60 * 60 * 24));
    var months = d.to.getMonth() - d.from.getMonth();
    var years = d.to.getYear() - d.from.getYear();

    if(years > 1 && months < 0){
        years -= 1;
        months += 12;
    }
    
    var yearStr = "";
    if (years == 1)
        yearStr = "1 year";
    else if (years > 1)
        yearStr = years + " years";
        
    var monthStr = ".";
    if(months > 0){
        var con = yearStr == "" ? "" : " and ";
        monthStr = con + months + " months.";
    }
    
    periodStr = yearStr + monthStr;
    
    return "At " + d.where + " (" + d.place + ")<br/>" +
        "For " + periodStr;
}

function showPeriodPopover (d) {
  $(this).popover({
    title: d.label,
    placement: 'auto top',
    container: 'body',
    trigger: 'manual',
    html : true,
    content: function() { return htmlForPeriod(d); }
  });
  $(this).popover('show');
}

//---------------------------------------------------------------------------------------------------
// d3 chart
//---------------------------------------------------------------------------------------------------
timeline = function(id, dat, colSc, h, m) {
    
    var outFormat = d3.time.format("%Y-%m-%d");
    var margin = {top: 20*m, right: 40*m, bottom: 30, left: 30};
    width = 800 - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    renderLabels = 0;

    // Create scales and axis
    // Add one day before and after first and last data point
    var scaleSep = true;
    if (scaleSep) {
        var fromdomain = d3.extent(dat, function(d) { return d.from; });
        var todomain = d3.extent(dat, function(d) { return d.to; });
        var from = fromdomain[0] < todomain[0] ? fromdomain[0] : todomain[0];
        var to = fromdomain[1] > todomain[1] ? fromdomain[1] : todomain[1];
        var domain = [from, to];
    }
    else {
        var domain = [dateFormat.parse("1998-01-01"), dateFormat.parse("2014-12-31")];
    }
    
    x = d3.time.scale().domain(domain).nice(d3.time.year).rangeRound([0, width]); 

    ydomain = [0, 4];
    y = d3.scale.linear().domain(ydomain).nice().range([height, 0]);
    
    //color = d3.scale.category20();
    colors = ["#00ADEF", "#ED008C", "#FEF200", "#BBCB5F"];
    cdomain = [0, 1, 2, 3];
    //color = d3.scale.ordinal().domain(cdomain).range(colors);
    color = d3.scale.ordinal().range(colorbrewer[colSc][6]);

    // Create axes
    xAxis = d3.svg.axis()
        .scale(x).orient("bottom");
        //.tickFormat(d3.time.format("%d %b"));

    yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    // Create svg container for chart
    var svg = d3.select(id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
        
    chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    // Append axes
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);  

/*        
    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
*/
        
    unit = y(0) - y(1);
    chart.selectAll(".bar")
        .data(dat).enter()
        .append("rect")
        .attr("x", function(d) { return x(d.from); })
        .attr("y", function(d) { return height - unit; })
        .attr("width", function (d) { return x(d.to) - x(d.from); })
        .attr("height", unit)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", function(d,i) { return color(i%colors.length); })
        .attr("class", "bar");

        
    chart.selectAll(".label")
        .data(dat).enter()
        .append("text")
        .attr("x", function(d) { return x(d.from) + 0.5 * (x(d.to) - x(d.from)); })
        .attr("y", function(d,i) { return height - unit - (0.5*unit*(i+1)); })
        .attr("dy", "-0.35em")
        .attr("class", "label")
        .text(function(d) { return d.label; })
        .style("text-anchor", "middle");
        
    chart.selectAll(".lline")
        .data(dat).enter()
        .append("line")
        .attr("x1", function(d) { return x(d.from) + 0.5 * (x(d.to) - x(d.from)); })
        .attr("x2", function(d) { return x(d.from) + 0.5 * (x(d.to) - x(d.from)); })
        .attr("y1", function(d,i) { return height - unit - (0.5*unit*(i+1)); })
        .attr("y2", function(d,i) { return height - unit; })
        .attr("class", "lline");
        
    chart.selectAll(".ldot")
        .data(dat).enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.from) + 0.5 * (x(d.to) - x(d.from)); })
        .attr("cy", function(d,i) { return height - unit; })
        .attr("r", 3)
        .attr("class", "ldot");
        
    // Hover highlighting
    svg.selectAll(".bar")
        .attr("opacity", 1)
        
        .on("mouseover", function(d, i) {
            svg.selectAll(".bar").transition().duration(250)
                .attr("opacity", function(d, j) {
                    return j != i ? 0.4 : 1;
                });
            showPeriodPopover.call(this, d);
        })
        
        .on("mouseout", function(d, i) {
             svg.selectAll(".bar").transition().duration(250).attr("opacity", "1");             
             d3.select(this).classed("hover", false);
             removePeriodPopovers();
          });
        
}


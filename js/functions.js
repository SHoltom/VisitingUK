

<script>

/////////////////////// Ward / Borough Selection ////////////////////////////////////
kk = []
kk.push(1)

B.onclick = function() {
	kk.push(0);
	load();
	};
W.onclick = function() {
	kk.push(1);
	load();
	};


projection = d3.geo.mercator()
       .center([0.12,51.490]) 
       .scale(44800)

/////////////////////// Define Charts /////////////////////////////////////////////////////       

var WardsM = dc.geoChoroplethChart("#wards");
				WardsM.on("preRender", function(chart) {
					chart.colorDomain(d3.extent(chart.data(),chart.valueAccessor()))
					})
				WardsM.on("preRedraw", function(chart) {
					chart.colorDomain(d3.extent(chart.data(),chart.valueAccessor()))
					})
				


var TChart = dc.barChart("#bars");
var HourChart = dc.barChart("#Hbars");
var LineChart = dc.lineChart("#LChart");
var MonthChart = dc.barChart("#month");
var dayOfWeekChart = dc.rowChart("#day-of-week-chart");
var IncType = dc.barChart("#Incident");
var PropType = dc.barChart("#Property");
var dataTable = dc.dataTable('#tabTest');


ll = [] 
kk = [] 
kk2 = [] 
kk3 = []
Area = []
Area2 = [] 
WA = []
Wsum = []

Dbug = []

/////// For Histograms //////////
respT = []
IT = []
UniqueInc = []
PropertyType = []



////////////////////////////////////////////////////////////////////////////////////

load = function() {

WardsM.filterAll()

// d3.csv("static/data/LFB_Samp1000.csv", function (csv) {
d3.csv("static/data/LFB_TEST.csv", function (csv) {

        var monthF = d3.time.format("%b")
        var dateFormat = d3.time.format("%d-%b-%y");
        var timeFormat = d3.time.format("%X");
        var dteFormat = d3.time.format('%Y-%m-%d');
        
        csv.forEach(function (d) {
        d.dd = dateFormat.parse(d.DateOfCall);
        d.month = +d.dd.getMonth(); // pre-calculate month for better performance
        d.day = d.dd.getDate(); 
        if(isNaN(d.FirstPumpArriving_AttendanceTime) == true) {d.FirstPumpArriving_AttendanceTime = -50} else {d.FirstPumpArriving_AttendanceTime = +d.FirstPumpArriving_AttendanceTime}
        d.Event = +1; // coerce to number
        d.time = timeFormat.parse(d.TimeOfCall)
//         d.Hour = x2.getHours(); 
        d.BoroughName = d.Postcode_district
        d.DATE = dteFormat(d.dd)
        
        respT.push(d.FirstPumpArriving_AttendanceTime)
        IT.push(d.Hour)
        UniqueInc.push(d.StopCodeDescription)
        PropertyType.push(d.PropertyCategory)
        
    });
        
         
        
        
        var numberFormat = d3.format(",f");
        
        // kk2 contains number of wards in Borough and Total Area of Borough
        
        console.log(i)
        WA.push(csv) 
        
        kk2.push(d3.nest().key(function(d) {return d.WardName})
        .rollup(function(leaves) { return {"Incidents": leaves.length, "total_area": d3.sum(leaves, function(d) {return parseFloat(d.IncidentGroup);})}
        })
        .entries(csv))
        
         kk3.push(d3.nest().key(function(d) {return d.BoroughName})
        .rollup(function(leaves) { return {"Incidents": leaves.length, "total_area": d3.sum(leaves, function(d) {return parseFloat(d.IncidentGroup);})}
        })
        .entries(csv))
        
        for (var i=0; i<kk2[0].length; i++)
        	{Area.push(kk2[0][i].values.Incidents)}
        
        for (var i=0; i<kk3[0].length; i++)
        	{Area2.push(kk3[0][i].values.Incidents)}
       
       
        
        /////////////////////////////////////////////////////////////////////
        
        var data = crossfilter(csv);
        
        // Day of week formatting //
        var dayOfWeek = data.dimension(function (d) {
        var day = d.dd.getDay();
        var name=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        return day+"."+name[day];
     	});
    	var dayOfWeekGroup = dayOfWeek.group();
        /////////////////////////////
        
        
        // count all the facts
		var all = data.groupAll()
		dc.dataCount(".dc-data-count")
			.dimension(data)
			.group(all);
        
 		var n_bins = 100; // for Group by Response Time
// 		var n_bins2 = 100; // for Group by Hour

  		
  		var Hect = data.dimension(function(d) {return d.WardName;})
 		
		HectCount = Hect.group()
							.reduceSum(function(d) {return +d.Event;})

		//////////////////////////// Total Events Per Day /////////////////////////////////
		
		var TDays = data.dimension(function (d) {
        return d.day;
    	});
 		
 		var TDgroup = TDays.group()
 								.reduceSum(function (d) {
 									return d.Event
 		
 									})
 		var BWgroup = TDays.group()
 					.reduceSum(function (d) {
 									return d.WardName
 											})
 		
 		////////////////////////////// Response Time ///////////////////////////////////
 		
 		var AttTime = data.dimension(function (d) {
        	return d.FirstPumpArriving_AttendanceTime;
 			})
 		
 	    var binWidth = (d3.extent(respT)[1] - d3.extent(respT)[0]) / n_bins
 		 
 		 var AttGrp = AttTime.group(function(d){return Math.floor(d / binWidth) * binWidth;});
 		
 		/////////////////////////////// TimeofCall ///////////////////////////////////////
 		
 		var ITime = data.dimension(function (d) {
        	return d.time.getHours() + d.time.getMinutes() / 60;
 			})

 		
 		var ITGrp = ITime.group(Math.floor)
 		
 		/////////////////////////////// DataTable ///////////////////////////////////////
 		
		var TD = data.dimension(function (d) {
 			return d.DATE
 			})
 		
 		
 		
 		
 		if (kk[kk.length-1] == 1 || kk[kk.length-1] == undefined)
 			{
 		 		var WB = data.dimension(function (d) {
            		return d["WardName"];
         		});
         		
//          		Dbug.push(WB)
         		file = "static/GeoFiles/topo/GTest4.json";
         		max = d3.max(Area)
         		min = d3.min(Area)
         		xExtent = d3.extent(Area)
        	}
        else
        	{
        		var WB = data.dimension(function (d) {
            		return d["BoroughName"];
         });
         		file = "static/GeoFiles/topo/BoroughSimp.json";
         		max = d3.max(Area2)
         		min = d3.min(Area2)
         		console.log(max)
         		xExtent = d3.extent(Area2)
         	}
        	
        var areaWB = WB.group().reduceCount(function (d) {
            return d["Event"];
         });
       
	// Colour Range
	
	Bcol = ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272","#fb6a4a","#ef3b2c","#cb181d", "#a50f15","#67000d" ]
    Wcol = ["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]
	
	Fcol = function() {if (kk[kk.length-1] == 1 || kk[kk.length-1] == undefined) {return Wcol} else {return Bcol}}
	
	TT = []
	
	
	d3.json(file, function (lwjson) {
		

	var tip = d3.tip()
                  .attr('class', 'd3-tip')
                  .offset([-10, 0])
                  .html(function (d) { return "<span style='color: #f0027g'>"  + d3.select(this)['data']()[0]['properties']['NAME']  + "</span>"});
		
		ll.push(lwjson.features)
		WardsM.width(650)
		.height(500)
		.dimension(WB)
		.group(areaWB)
		.projection(projection)
		.colors(d3.scale.quantize().range(Fcol()))
		.colorDomain([min, max])
        .colorCalculator(function (d) { return d ? WardsM.colors()(d) : '#ccc'; })
        .overlayGeoJson(lwjson.features, "state", function (d) {
                        return d.properties.NAME;
                    })
        .title(function (d,i) {TT.push([d.key,d.value]);
                        return "Borough: " + d.key + ' '+ d.value  
                    })         
	
	
	console.log(xExtent)

// 	bcheck = function() {if (kk[kk.length-1]==1 || kk[kk.length-1]== undefined) {return true} else {return false}} 
	bcheck = function() {return true}
	 
	d3.extent(respT)[0] = 5
	d3.extent(respT)[1] = d3.extent(respT)[1]*1.35
	
	TChart.width(450)
		.height(250)
// 		.height(300)
		.margins({top: 10, right: 15, bottom: 40, left: 40})
		.transitionDuration(80)
		.dimension(AttTime)
		.group(AttGrp)
		.centerBar(true)
		.brushOn(bcheck())
		.gap(1)
		.x(d3.scale.linear().domain([-10,d3.extent(respT)[1]]).range([0,n_bins+1]))
// 		.x(d3.scale.linear().domain([0,400]))
// 		.x(d3.time.scale().domain([new Date(2012, 0, 1), new Date(2012, 0, 3)]))
// 		.round(d3.time.day.round)
		.renderHorizontalGridLines(true)
		.elasticY(true)
		.xUnits(function(){return 90;})
// 		.alwaysUseRounding(true)
// 		.xUnits(d3.time.days)
		.xAxis().tickFormat()
		


	HourChart.width(450)
		.height(250)
		.margins({top: 10, right: 10, bottom: 40, left: 40})
		.transitionDuration(80)
		.dimension(ITime)
		.group(ITGrp)
		.centerBar(true)
		.brushOn(bcheck())
		.gap(1)
// 		.x(d3.scale.linear().domain(d3.extent(IT)).range([0,n_bins2]))
		.x(d3.scale.linear().domain([-1,24])
		.rangeRound([0, 10 * 24]))
// 		.x(d3.time.scale().domain([new Date(2012, 0, 1), new Date(2012, 0, 3)]))
// 		.round(d3.time.day.round)
		.renderHorizontalGridLines(true)
		.elasticY(true)
		.xUnits(function(){return 25;})
// 		.alwaysUseRounding(true)
// 		.xUnits(d3.time.days)
		.xAxis().tickFormat()

	////////////////////////////////// LINECHART  /////////////////////////////////////
	
	var IDay = data.dimension(function(d){
						return d.dd
						})
	var IDCount = IDay.group()
					.reduceCount(function(d){ 
						return d.dd
						})
	console.log(WA)
									
	LineChart.width(630)
		.height(200)
		.transitionDuration(200)
		.margins({top: 10, right: 10, bottom: 20, left: 25})
        .dimension(IDay)
        .group(IDCount)
        .round(d3.time.day.round)
        .mouseZoomable(true)
        .xUnits(d3.time.days)
        .elasticY(true)
        .x(d3.time.scale().domain([WA[0][0]['dd'], WA[0][WA[0].length-1]['dd']]))
        .renderHorizontalGridLines(true) 
        .y(d3.scale.linear().domain([100, 500]))
        
       //  .title(function (d) {
//         		return d.data.key + d.data.value
//         		})  
// .xAxis();
        
	  /////////////////////////////// Month Group Chart ////////////////////////////////
	  
	  var Month = data.dimension(function (d) {
        return monthF(d.dd);
    	});
	  
	 var MonthCnt = Month.group()
	  
	  MonthChart.width(290)
// 	  	.renderArea(true)
	  	.height(200)
 		.xUnits(dc.units.ordinal)
		.x(d3.scale.ordinal().domain(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']))
	  	.transitionDuration(200)
	    .margins({top: 35, right: 0, bottom: 20, left: 35})
	  	.dimension(Month)
	  	.group(MonthCnt)
// 	  	.centerBar(true)
        .brushOn(true)
//                 
        .gap(3)
        .elasticY(true)
 
       
	  	
	  	
	  ////////////////////////////////// DAY OF WEEK  ////////////////////////////////////

	 // counts per weekday
    var dayOfWeek = data.dimension(function (d) {
        var day = d.dd.getDay()
        var name=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        return day+"."+name[day];
     });
    var dayOfWeekGroup = dayOfWeek.group();
	
	  //#### Row Chart
    dayOfWeekChart.width(180)
        .height(200)
        .margins({top: 00, left: 40, right: 15, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)
        // assign colors to each value in the x scale domain
//         .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        .ordinalColors(['#045a8d', '#6baed6', '#6baed6', '#6baed6', '#6baed6', '#6baed6', '#045a8d' ])

        .label(function (d) {
            return d.key.split(".")[1];
        })
        // title sets the row text
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(4);
	
	
		////////////////////////////////// INCIDENT TYPE ////////////////////////////////////
	
	function onlyUnique(value, index, self) {   // find unique array entries
    return self.indexOf(value) === index;
}
	
	dom = UniqueInc.filter(onlyUnique)
	
	
	var IncidentT = data.dimension(function(d) {
								return d.StopCodeDescription
								});
	var IncidentGrp = IncidentT.group();
	
	IncType.width(600)
                    .height(325)
                    .transitionDuration(750)
                    .margins({top: 20, right: 10, bottom: 110, left: 50})
                    .dimension(IncidentT)
                    .group(IncidentGrp)
                    .centerBar(true)
                    .brushOn(true)
                    .title(function (d) { return ""; })
                    .gap(25)
                    .elasticY(true)
                    .colors(['steelblue'])
                    .xUnits(dc.units.ordinal)
//                     .x(d3.scale.ordinal().domain(["False Alarm", "Special Service", "Fire"]))
                    .x(d3.scale.ordinal().domain(UniqueInc.filter(onlyUnique)))

// 				   .y(d3.scale.linear().domain([0, 5500000])) 
                    .renderlet(function (chart) {
                    chart.selectAll("g.x text")
                      .style("text-anchor", "end")
                      .attr('transform', "translate(-10,0)rotate(325)");
                	chart.selectAll(".bar")
                		.attr('transform', "translate(13,0)");
                	})
                    .renderHorizontalGridLines(true)
//                     .yAxis().tickFormat(d3.format("s"));
                    

            IncType.xAxis();
	
		////////////////////////////////// PROPERTY TYPE ////////////////////////////////////
		
	var PropertyT = data.dimension(function(d) {
								return d.PropertyCategory
								});
	var PropertyGrp = PropertyT.group();
	
	PropType.width(550)
                    .height(325)
                    .transitionDuration(750)
                    .margins({top: 20, right: 10, bottom: 110, left: 50})
                    .dimension(PropertyT)
                    .group(PropertyGrp)
                    .centerBar(true)
                    .brushOn(true)
                    .title(function (d) { return ""; })
                    .gap(15)
                    .elasticY(true)
//                     .colors(['#807dba'])
                   .colors(['#6baed6'])
                    .xUnits(dc.units.ordinal)
//                     .x(d3.scale.ordinal().domain(["False Alarm", "Special Service", "Fire"]))
                    .x(d3.scale.ordinal().domain(PropertyType.filter(onlyUnique)))

				   // .y(d3.scale.linear().domain([-100, 55000])) 
                   .y(d3.scale.linear().range([-1000,55000]))
                   .renderlet(function (chart) {
                    chart.selectAll("g.x text")
                      .style("text-anchor", "end")
                      .attr('transform', "translate(-10,0)rotate(325)");
                	chart.selectAll(".bar")
                		.attr('transform', "translate(14,0)");
                	})
                    .renderHorizontalGridLines(true)
//                     .yAxis().tickFormat(d3.format("s"));
                    

            PropType.xAxis();
		
	
	
	
	
	
	
	
	
	////////////////////////////////// DATATABLE  ////////////////////////////////////
	
	dataTable.width(950)
		.dimension(TD)
		.group(function(d) {
			return d.DATE
			})
		.size(10)	
		.columns([
			function(d) {
				return d.DATE;
				},
			function(d) {
				return d.TimeOfCall;
				},
			function(d) {
// 				return d.IncidentGroup;
				return d.StopCodeDescription
				},
			function(d) {
				return d.PropertyType;
				},
		// 	function(d) {
// 				return d.Postcode_district;
// 				},
			function(d) {
				return d.WardName;
				},
			function(d) {
				return d.FirstPumpArriving_AttendanceTime;
				}
			])
			.sortBy(function (d) {
            return d.dd;
        })
//         	.order(d3.ascending)
        	.renderlet(function (table) {
            	table.selectAll(".dc-table-group").classed("info", true);
        });


	
			

dc.renderAll();
d3.selectAll("g").call(tip);
                d3.selectAll("g").on('mouseover', tip.show)
                    .on('mouseout', tip.hide); 

function AddXAxis(chartToUpdate, displayText)
{
    chartToUpdate.svg()
                .append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", 0.53*chartToUpdate.width())
                .attr("y", chartToUpdate.height()-1.5)
                .text(displayText);
}

AddXAxis(TChart, "Response Time (s)");
AddXAxis(HourChart, "Incident Time (h)");






})

})




} // end of load function


load()
// });

</script>
// function to retrieve map data
		function getmapdata(){
			d3.json("https://d3js.org/us-10m.v1.json", function(data) {

				mymap = data;
				//console.log(mymap);

				// this is the callback function. make it what I want
				allcropready();
				
			});
			
		}

		// this works. It changes the global variable cropdata, but I struggle with the timing
    	function updatecropdata(){

    		var textcrop = crop;
    		if (textcrop == 'dairy_cow'){
    			textcrop = "dairy cows"
    		}

    		d3.select("#crop-value").text(textcrop);

    		d3.text(crop + "_pivot_table.csv", function(d) {
    
		    var dsv = d3.dsvFormat(',');
		    cropdata = dsv.parse(d);

		    cropready(drawmap);

			});
    		
    	}

    	function setonecolorfunction(){
    		

	    	mymax = cropmaxes[crop]; // gets max for crop selected
	    	newrange = []; 
	    	var x = Math.pow(mymax/1000,1/8);
			var newnum;
			for (i = 0; i < 9; i++) { 
			    newnum = 1000*Math.pow(x,i);
				newrange.push(newnum); 
				console.log(newnum);
			};
			// sets color function
			mycolor = d3.scaleThreshold()
	    		.domain(newrange)
	   			.range(d3.schemeBlues[9].slice(1));

	   		finalcolor = mycolor;
    	}

    	function allcolorfunction(color){
		  return color;
		}

		function newcolorfunction(myvalue) {
			finalcolor = d3.scaleOrdinal(myvalue)
			    .domain(mycrops)
			    .range(d3.schemeSet3);
		}
        
        // I don't think this is being called because I get getting a message that finalcolor isn't a function
		function setallcolorfunction(){
			finalcolor = allcolorfunction;
		}

    	// sets the max min step and starting value of slider
    	// is a little funky. changes values in inspect element but not in view page source
    	// some sources say the source is the original html whereas inspect element
    	// shows the html as the browser is rendering it, some even say inspect element shows 
    	// changes from javascript. if that's true, then it's behaving as it should then
        function setslider(){
            if (crop == "allag") {
            	yearmin = 1997;
            	yearmax = 2012;
            	yearinterval = 5;
            	value = 2012;
            } else {
	            yearmin = cropyears[crop][0];
	            yearmax = cropyears[crop][1];
	            yearinterval = 1;
        	}

            $("#year_slider").attr({
            	"max": yearmax,
            	"min": yearmin,
            	"step": yearinterval,
            	"value": yearmax,
            });
            
        }

        function addlegend(){
        	ylegend = 420;
        	// if there is a legend, removes it
        	if (d3.select("#legendtext")){
        		d3.selectAll("#legendtext").remove();
        		d3.selectAll("#legendrects").remove();
        		d3.selectAll("#legenddescription").remove();
        	}

            svg.append("text")
              .attr("id", "legenddescription")
	          .attr("y", ylegend - 10)
	          .attr("x", xlegend )
	          .text("Acres or head/county")

        	// adds legend
			for ( var row = 0; row < 9; row++) {
			    svg.append("rect")
			      .attr("id", "legendrects")
			      .attr("width", 12)
			      .attr("height", 12)
			      .style("fill", d3.schemeBlues[9][row])
			      .attr("y", ylegend) 
			      .attr("x", xlegend);

			    ylegend +=12;
			    //console.log(color_code[row][1]);
			}
			//ylegend += 12;

			for ( var row = 8; row >= 0; row--) {
			     svg.append("text")
			        .attr("id", "legendtext")
			        .attr("y", ylegend - 2)
			        .attr("x", xlegend + 15)
			        .text(newrange[row])
			        //.attr("font-family", "sans-serif")
			        .attr("font-size", "10px")
			        .attr("fill", "black");

			        //row = row -1;
			        if (row < 9) {
			          ylegend -=12;
			        }
			  }
        }

        function alladdlegend() {
		// adds legend
		   ylegend = 420;

		  //first get rid of any existing legend
		  if (d3.select("#legendtext")){
        		d3.selectAll("#legendtext").remove();
        		d3.selectAll("#legendrects").remove();
        	}

        	  svg.append("text")
                .attr("id", "legenddescription")
	            .attr("y", ylegend - 10)
	            .attr("x", xlegend )
	            .text("Chief product")

		  for ( var row = 0; row < mycrops.length; row++) {
		      svg.append("rect")
		        .attr("id", "legendrects")
		        .attr("width", 12)
		        .attr("height", 12)
		        .style("fill", d3.schemeSet3[row])
		        .attr("y", ylegend) 
		        .attr("x", xlegend);

		      ylegend +=12;
		  }

		  for ( var row = mycrops.length -1; row >= 0; row--) {
		       svg.append("text")
		          .attr("id", "legendtext")
		          .attr("y", ylegend - 2)
		          .attr("x", xlegend + 15)
		          .text(mycrops[row])
		          //.attr("font-family", "sans-serif")
		          .attr("font-size", "10px")
		          .attr("fill", "black");
		          ylegend -=12;
		    }
		}

    	// produces a dict of fips and values
    	function updatecropyeardata(){
    		cropyeardata = d3.map(); // clears out the data, otherwise we get old data being used to draw new map
    		var i = 0;
    		d3.select("#year-slider-value").text(year);
    		d3.select("#year-value").text(year);
	    	// change cropyeardata info  
	    	for (i in cropdata) {
	     	cropyeardata.set(cropdata[i].id, cropdata[i][year]); 
   	

    		};
    	}

    	function allupdatecropyeardata(){
    		cropyeardata = d3.map(); // clears out the variable

    		// Change some text
    	    d3.select("#year-slider-value").text(year);
    		d3.select("#year-value").text(year);

		    d3.tsv("new_ag_" + year + ".tsv", function(d) {
		      
		        // change usofag info  
		        for (i = 0; i < d.length; i++) {
		        cropyeardata.set(d[i].id, d[i].MyCommodity);  
		        }
		         drawmap();
		    });
		   
		}

    	// should work
    	function drawmap(error){
    		if (error) throw error;

    		if(d3.selectAll("path")){
    			d3.selectAll("path").remove();
    		}

    	    // requires: mymap, usofag/cropyeardata, colorfuntion:mycolor
    	    svg.append("g")
	          .attr("class", "counties")
	          .selectAll("path")
	          .data(topojson.feature(mymap, mymap.objects.counties).features)
	          .enter().append("path")
	            .attr("fill", function(data) { 
	            	if (cropyeardata.get(data.id)){ 
	            		return finalcolor(cropyeardata.get(data.id));
	            	} else{
	            		return blank} ; 
	            	}) // makes alaska gray, no data
	          .attr("d", path);
	          //.append("title")
	          //.text('hello');

	        
	        svg.append("path")
		      .datum(topojson.mesh(mymap, mymap.objects.states, function(a, b) { return a !== b; }))
		      .attr("class", "states")
		      .attr("d", path);
		}
    	
    	// manage views functions
    	function cropready(_callback) {
    		updatecropyeardata();
    		setonecolorfunction();
    		setslider();
    		addlegend();

    		_callback();
    	}

    	function allcropready() {
    		d3.select("#crop-value").text("Agriculture");

    		alladdlegend();
    		setslider();
    		newcolorfunction();
    		allupdatecropyeardata();

    		//drawmap();
    	}

    	function yearready(_callback) {
    		updatecropyeardata();

    		_callback();
    	}


    	function allyearready(_callback) {
    		allupdatecropyeardata();
    		
    		_callback();
    	}
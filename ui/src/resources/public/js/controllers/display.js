controllers.controller('Display', ['$scope', 'Watch', function($scope, Watch) {
	$scope.map;
	var pointarray;
	var heatmap;
	var heatmap2;
    $scope.text = '';
    $scope.endtext = '';
    $scope.curr =[];
    $scope.deviceIds = [];
        
	//Creates the heap map
	$scope.loadMap = function() 
	{
	  var mapOptions = {
	    zoom: 13,
	   center: new google.maps.LatLng($scope.records.rows[0].latitude, $scope.records.rows[0].longitude)
	  };
	  $scope.loadIds();
	  $scope.map = new google.maps.Map(document.getElementById('map-canvas'),
	      mapOptions);	  
	}
	
	$scope.matchId = function(index)
	{
		console.log(new Date($scope.deviceIds[index].stDate) + " " + new Date($scope.records.rows[0].dtime));
		var watchData = [];
		if($scope.deviceIds[index].value == true)
		{
			for(var i = 0; i < $scope.records.rows.length; i++)
			{
				if($scope.deviceIds[index].stDate == 0 && $scope.deviceIds[index].enDate == 0)
				{
					if($scope.records.rows[i].deviceid == $scope.deviceIds[index].id)
					{
						//console.log(dt.getDate());
						watchData.push(new google.maps.LatLng(
							$scope.records.rows[i].latitude, $scope.records.rows[i].longitude));
					}
				}
				else
				{
					if($scope.records.rows[i].deviceid == $scope.deviceIds[index].id &&
							$scope.deviceIds[index].stDate <= $scope.records.rows[i].dtime &&
							$scope.deviceIds[index].enDate >= $scope.records.rows[i].dtime)
					{
						
						watchData.push(new google.maps.LatLng(
							$scope.records.rows[i].latitude, $scope.records.rows[i].longitude));
					}
				}
			}
			var pointArray = new google.maps.MVCArray(watchData);
        
			heatmap = new google.maps.visualization.HeatmapLayer({
              data: pointArray
            });
			heatmap.setMap($scope.map);
		}
		else
		{
			heatmap.setMap(null);
		}
	}
	
	$scope.loadIds = function()
	{
		for(var i = 0; i < $scope.records.device.length; i++)
		{
			$scope.deviceIds.push({
				index: i+1,
				id: $scope.records.device[i].device,
				stDate: 0,
				enDate: 0,
				value: false
			});
			
		}
	}
	
	function hM1init(text1, text2)
    {
        var watchData = [];
       var st = text1.split("-");
       var en = text2.split("-");
        for(var i = 0; i < $scope.records.rows.length; i++)
        {
           var dt = new Date($scope.records.rows[i].dtime);
           if($scope.records.rows[i].deviceid === $scope.curr[0] 
                   && (dt.getDate() >= Number(st[2]) && dt.getDate() <= Number(en[2])))
           {
               //console.log(dt.getDate());
               watchData.push(new google.maps.LatLng(
                       $scope.records.rows[i].latitude, $scope.records.rows[i].longitude));
           }
        }
         var pointArray = new google.maps.MVCArray(watchData);
        
          heatmap = new google.maps.visualization.HeatmapLayer({
                data: pointArray
              });
          heatmap.setMap($scope.map);
    }
    function hM2init(text1, text2)
    {
        var watchData = [];
       var st = text1.split("-");
       var en = text2.split("-");
        for(var i = 0; i < $scope.records.rows.length; i++)
        {
           var dt = new Date($scope.records.rows[i].dtime);
           
           if($scope.records.rows[i].deviceid === $scope.curr[1] 
                   && (dt.getDate() >= Number(st[2]) && dt.getDate() <= Number(en[2])))
           {
               //console.log(dt.getDate());
               watchData.push(new google.maps.LatLng(
                       $scope.records.rows[i].latitude, $scope.records.rows[i].longitude));
           }
        }
        
         var pointArray = new google.maps.MVCArray(watchData);
          heatmap2 = new google.maps.visualization.HeatmapLayer({
                data: pointArray
              });
          
          var gradient = [
             'rgba(0, 255, 255, 0)',
             'rgba(0, 255, 255, 1)',
             'rgba(0, 191, 255, 1)',
             'rgba(0, 127, 255, 1)',
             'rgba(0, 63, 255, 1)',
             'rgba(0, 0, 255, 1)',
             'rgba(0, 0, 223, 1)',
             'rgba(0, 0, 191, 1)',
             'rgba(0, 0, 159, 1)',
             'rgba(0, 0, 127, 1)',
             'rgba(63, 0, 91, 1)',
             'rgba(127, 0, 63, 1)',
             'rgba(191, 0, 31, 1)',
             'rgba(255, 0, 0, 1)'
          ];
          heatmap2.set('gradient', heatmap2.get('gradient') ? null : gradient);

          heatmap2.setMap($scope.map);
    }
    
    $scope.submit = function() 
    {
    	if($scope.deviceIds[Number(this.endtext.substring(0,1))-1].value = true)
    	{
    		heatmap.setMap(null);
    	}
    	var date = this.text.substring(3,13);//parse date yyyy-mm-dd
    	date = date.split("-");
    	var newDate = date[0]+","+date[1]+","+date[2] + " 00:00:00 GMT+0400";//date with commas instead of -
    	$scope.deviceIds[Number(this.text.substring(0,1))-1].stDate = new Date(newDate).getTime();
    	var edate = this.endtext.substring(3,13);
    	edate = edate.split("-");
    	var neweDate = edate[0]+","+edate[1]+","+edate[2] + " 23:59:59 GMT+0400";
    	$scope.deviceIds[Number(this.endtext.substring(0,1))-1].enDate = new Date(neweDate).getTime();
    	$scope.deviceIds[Number(this.endtext.substring(0,1))-1].value = true;
    	$scope.matchId(Number(this.text.substring(0,1))-1);
    	$scope.deviceIds[Number(this.text.substring(0,1))-1].stDate = 0;
    	$scope.deviceIds[Number(this.endtext.substring(0,1))-1].enDate = 0;
    	this.text = '';
    	this.endtext = '';
    	
    }
	
	$scope.toggleHeatmap = function() {
		  heatmap.setMap(heatmap.getMap() ? null : $scope.map);
		}

	$scope.changeGradient = function() {
		  var gradient = [
		    'rgba(0, 255, 255, 0)',
		    'rgba(0, 255, 255, 1)',
		    'rgba(0, 191, 255, 1)',
		    'rgba(0, 127, 255, 1)',
		    'rgba(0, 63, 255, 1)',
		    'rgba(0, 0, 255, 1)',
		    'rgba(0, 0, 223, 1)',
		    'rgba(0, 0, 191, 1)',
		    'rgba(0, 0, 159, 1)',
		    'rgba(0, 0, 127, 1)',
		    'rgba(63, 0, 91, 1)',
		    'rgba(127, 0, 63, 1)',
		    'rgba(191, 0, 31, 1)',
		    'rgba(255, 0, 0, 1)'
		  ]
		  heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
		}
	
	$scope.invert = function()
	{
		heatmap.set('radius', heatmap.get('radius')? null:20)
	}
	
	$scope.changeRadius = function() {
		  heatmap.set('radius', heatmap.get('radius') ? null : 20);
		}

	$scope.changeOpacity = function() {
		  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
		}

	 $scope.parseDate = function(input){
  	   var parts = input.split('-');
  	   return new Date(parts[0], parts[1]-1, parts[2]); 
     }
	 
   //Draw the CalendarChart
   $scope.drawChart = function() {
	   
       var dataTable = new google.visualization.DataTable();
       dataTable.addColumn({ type: 'date', id: 'Date' });
       dataTable.addColumn({ type: 'number', id: 'distance' });
       
 	   for(var i = 0; i < $scope.records.aggs.length; i++)
 		  {
 	       	 dataTable.addRow( [ new Date(Date.parse($scope.records.aggs[i].dtime)), parseInt($scope.records.aggs[i].mdistance) ] );
 		  }
 	       
 	   var chart = new google.visualization.Calendar(document.getElementById('calendar_basic'));
 	
 	   var options = {
 	         title: "Distance",
 	         height: 300,
 	         width: 2000,
		    tooltip: {
		    	isHtml: false
		    	},
		    	calendar: { cellSize: 25 }
 	       };
 	
 	   chart.draw(dataTable, options); 
   }
   
   $scope.recordsLoaded = function(results){
	   $scope.loadMap();
	   $scope.drawChart(); 
   }
   
   $scope.records = Watch.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
			$scope.recordsLoaded);
}]);
services.service('BinSearch', function()
{
	this.binStPrep = function(st, results)
	{
		var startInd;
		if(st > results.rows[0].dtime)
		{
			startInd = this.binSearch(st, results.rows);
			if(results.rows[startInd].dtime < startInd)
			{
				startInd--;
			}
			else
			{
				startInd++;
			}
			
		}
		else if(st > results.rows[results.rows.length-1].dtime)
		{
			window.alert("date doesnt exist");
		}
		else if(st < results.rows[0].dtime)
		{
			startInd = 0;
		}
		return startInd;
	}
	this.binSplitPrep = function(split, results)
	{
		var splitInd;
		if(split < results.rows[0].dtime || 
				split > results.rows[results.rows.length-1].dtime)
		{
			window.alert("entry doesnt exist");
		}
		else
		{
			splitInd = this.binSearch(split, results.rows);
		}
		return splitInd;
	}
	this.binEnPrep = function(en, results)
	{
		var endInd;
		if(en < results.rows[results.rows.length-1].dtime)
		{
			endInd = this.binSearch(en, results.rows);
			if(results.rows[endInd] > en)
			{
				endInd++;
			}
			else
			{
				endInd--;
			}
		}
		else if(en < results.rows[0].dtime)
		{
			window.alert("date doesnt exist");
		}
		else
		{
			endInd = results.rows.length-1;
		}
		return endInd;
	}
	this.binSearch= function(val, results)
	{
		var low = 0;
		var high = results.length - 1;

		while (low <= high) {
			var mid = Math.floor(low + ((high - low) / 2));
			var midVal;
			var midSub;
			var midPlus;
			if (results[mid].hasOwnProperty("dtime") == true)
			{
				midVal = results[mid].dtime;
				midSub = results[mid-1].dtime;
				midPlus = results[mid+1].dtime;
			}
			else
			{
				midVal = new Date(results[mid]).getTime();
				midSub = null;
				midPlus = null;
			}
			if ((midSub <= val && midPlus >= val)
					||midVal === val)
			{				
				return mid;		
			}
			else if (midVal > val)
			{
				high = mid - 1;
			}				
			else if(midVal < val)
			{
				low = mid + 1;
			}				
		}
		return -(low + 1);  // key not found.
	};	
});
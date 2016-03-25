/*
* DBSCAN (Density-based spatial clustering of applications with noise)
* Martin Gråd
*/

function dbscan(data, eps, minPts)
{
	var newData = data.slice();
	for(var i = 0; i < data.length; ++i)
	{
		newData[i] = jQuery.extend(true, {}, data[i]);
	}
	var normData = normalizeData(newData);

	// initializing array of zeros, with the size of the data (zero = not visited, one = visited)
	var pointsAreVisited = Array.apply(null, new Array(normData.length)).map(Number.prototype.valueOf, 0);
	// copying the array of zeros
	var pointsAreNoise = pointsAreVisited;
	
	// initializing the clusters variable that will be returned by the function (as an array of arrays of data items)
	var clusters = [];

	var currentPoint;			// holds each data point that is being examined
	var pointAlreadyVisited;	// holds if this point has already been visited
	var neighborPtsIndices;		// holds indices to neighboring data points (for one point at a time)
	
	var clusterIndex = -1;
	// (for each unvisited point P in dataset D)
	for(var i = 0; i < normData.length; ++i)
	{
		// check if point is already visited
		pointAlreadyVisited = pointsAreVisited[i];
		// if it is not already visited...
		if(!pointAlreadyVisited){
			// store current point...
			currentPoint = normData[i];
			// ... and mark it as visited
			pointsAreVisited[i] = 1;
			// find neighbors to the current point
			neighborPtsIndices = regionQuery(currentPoint, eps);
			// if the number of neighbors is not sufficient
			if(neighborPtsIndices.length < minPts){
				// mark current point as noise
	    		pointsAreNoise[i] = 1;
	    	}
	    	// if the number of neighbors is sufficient
		  	else
		  	{
		  		// increment cluster index
				clusterIndex++;
				// expand the current cluster with the current point
		 		expandCluster(currentPoint, neighborPtsIndices, clusterIndex, eps, minPts);
		 	}
		}
	}

	// function that returns data indices for neigboring points
	function regionQuery(_currentPoint, _eps)
	{
		var neighborIndices = [];
		// set arbitrary starting value for euclidean distance... ugly, I know =)
		var euclideanDistance = 66666666;
		var currentNeighbor;
		// for each data point
		for(var i = 0; i < normData.length; ++i)
		{
			// store current neighbor
			currentNeighbor = normData[i];
			// if the current neighbor is not the point itself
			if(currentNeighbor != _currentPoint)
			{
				var tempSum  = 0;
				var tempDiff = 0;
				// for each clustering dimension
				for(var j = 0; j < clusteringDims.length; ++j)
				{
					// calculate difference for current dimension between the current point and the current neighbor
					tempDiff = Math.abs( currentNeighbor[clusteringDims[j]] - _currentPoint[clusteringDims[j]] );
					// add the square of this difference to the sum
					tempSum += Number(tempDiff * tempDiff);
				}
				
				// calculate euclidean distance as the square root of the sum when all terms have been added
				euclideanDistance = Math.sqrt(tempSum);
				
				// if the euclidian distance is smaller enough and the current neighbor is not already port of a cluster...
				if( euclideanDistance <= _eps && !pointIsPartOfAnyCluster(currentNeighbor) )
				{
					// ... add the data point index to the neighbor index array of the current point
					neighborIndices.push(i);
				}
			}
		}
		// return the array of data point indices
		return neighborIndices;
	}

	// function to expand a cluster
	function expandCluster(_currentPoint, _neighborPtsIndices, _clusterIndex, _eps, _minPts)
	{
		var currentNeighborPoint;
		var currentNeighborPointIndex;
		var newNeighborPtsIndices;

		// if a cluster corresponding to _clusterIndex has not yet been initialized...
		if(!clusters[_clusterIndex]){
			// ... initialize it
			clusters[_clusterIndex] = new Array();
		}
		// add current point to current cluster
		clusters[_clusterIndex].push(_currentPoint);
		// for each neighbor point index
		for(var i = 0; i < _neighborPtsIndices.length; ++i){
			// store the data index of the current neigbor point being examined.
			currentNeighborPointIndex = _neighborPtsIndices[i];
			// get the data point using the index
			currentNeighborPoint = normData[currentNeighborPointIndex];
			// if this point has not already been visited...
			if(!pointsAreVisited[currentNeighborPointIndex]){
				// mark currentNeighbor as visited
				pointsAreVisited[currentNeighborPointIndex] = 1;
				newNeighborPtsIndices = regionQuery(currentNeighborPoint, _eps)
				if(newNeighborPtsIndices >= _minPts){
					// Add new neighbors to already stored neighbors
					_neighborPtsIndices.concat(newNeighborPtsIndices);
				}
			}
			//if the current neighbor point is not already a member of any cluster...
			if( !pointIsPartOfAnyCluster(currentNeighborPoint) ){
				// ... add it to the current cluster
				clusters[_clusterIndex].push(normData[currentNeighborPointIndex]);
			}
		}
	}

	// function to determine if a point is a member of any cluster
	function pointIsPartOfAnyCluster(_currentNeighborPoint)
	{
		var isPart = false;
		// for each cluster
		for(var i = 0; i < clusters.length; ++i)
		{
			// if the index of the current neighbor object is not equal to -1...
			if( clusters[i].indexOf(_currentNeighborPoint) != -1 )		// (indexOf() returns -1 when the object is not found)
			{
				// ... the neighbor is part of a cluster
				isPart = true;
				break;
			}
		}
		return isPart;
	}
	// dbscan return (end of class)
	return clusters;
}

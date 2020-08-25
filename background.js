console.log("message log go brrr");

function findSeries(allHistoryText, allHistoryUrl) {
	// main work done here
	/*
	 
	*/

	//	1. all plausable webpage titles which could be series series
	let allHistoryText_withKeyword = [];
	for(var i=0; i<allHistoryText.length; i++) {

		if (
			 allHistoryText[i].includes("Watch") || 
			 allHistoryText[i].includes("watch") ||
			 allHistoryText[i].includes("Episode") ||
			 allHistoryText[i].includes("episode") ||
			 allHistoryText[i].includes("Season") ||
			 allHistoryText[i].includes("season")
		) {

			allHistoryText_withKeyword.push(allHistoryText[i]);
		}
	}
	//console.log(allHistoryText_withKeyword);


	// 2. remove dublicates
	//    create a set, add all element in it, convert back to array
	let setTemp = new Set();
	for(var i=0; i<allHistoryText_withKeyword.length; i++) {
		setTemp.add(allHistoryText_withKeyword[i]);
	}
	let allHistoryText_unique = Array.from(setTemp);
	//console.log(allHistoryText_unique);


	// 3. elements with frequency atleast 2
	// function which returns the last numbers from string
	function episodeNameNoNum(title) {

		let len = title.length;

		var posEnd = -1;
		var posStart;
		for(var i=len-1; i>=0; i--) {

			if(title[i]>='0' && title[i]<= '9' && posEnd == -1) {
				posEnd = i;
				posStart = i;
			}
			if(title[i]>='0' && title[i]<= '9') {
				posStart = i;
			}
			if(!(title[i]>='0' && title[i]<= '9') && posEnd != -1) {
				break;
			}
		}

		if(posEnd == -1) {
			return null;	// return null since title with no ep num is useless
			//console.log("no number found")
		}
		else{
			let episodeName = title.substring(0, posStart) + 
							title.substring(posEnd+1, len);
			//console.log(episodeName);
			return episodeName;
		}
	}
	function episodeNum(title) {

		let len = title.length;

		var posEnd = -1;
		var posStart;
		for(var i=len-1; i>=0; i--) {

			if(title[i]>='0' && title[i]<= '9' && posEnd == -1) {
				posEnd = i;
				posStart = i;
			}
			if(title[i]>='0' && title[i]<= '9') {
				posStart = i;
			}
			if(!(title[i]>='0' && title[i]<= '9') && posEnd != -1) {
				break;
			}

		}

		if(posEnd == -1) {
			return null;
			//console.log("no number found");
		}
		else{
			//console.log(title.substring(posStart, posEnd+1));
			return (title.substring(posStart, posEnd+1));
		}
			
	}

	let arrHash = [];
	for(var i=0; i<allHistoryText_unique.length; i++) {

		//console.log(allHistoryText_unique[i]);
		//episodeNameNoNum(allHistoryText_unique[i]);
		//episodeNum(allHistoryText_unique[i]);

		let strTemp = episodeNameNoNum(allHistoryText_unique[i]);
		if(arrHash.hasOwnProperty(strTemp)) {

			let episodeNumber = episodeNum(allHistoryText_unique[i]);
			arrHash[strTemp].push(episodeNumber);
			//console.log(strTemp, " ", arrHash[strTemp]);	
		}
		else {
			let episodeNumber = episodeNum(allHistoryText_unique[i]);
			if(episodeNumber == null) { // skip if no episode num found
				continue;
			}
			arrHash[strTemp] = [];		
		}

	}

	for(var obj in arrHash) {

		if(arrHash[obj].length > 0) {
			console.log(obj)
			console.log(arrHash[obj]);
		}

	}

	
}

chrome.history.search(
   {
	'text': '',
	'maxResults': 100000,
	'startTime': 0
   },

   function(historyItems) {

   		var allHistoryText = [];
   		var allHistoryUrl = [];

   		for(var i=0; i<historyItems.length; i++) {
   			allHistoryText.push(historyItems[i]["title"]);
   			allHistoryUrl.push(historyItems[i]["url"]);
   		}

       	findSeries(allHistoryText, allHistoryUrl);
  	   
  });
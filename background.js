console.log("message log go brrr");

function findSeries(allHistoryText, allHistoryUrl) {
	// main work done here
	/*
	1. list of all plausable titles which are series
	2. 
	*/

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

	console.log(allHistoryText_withKeyword);

	let allHistoryText_noNum = [];
	for(var i=0; i<allHistoryText_withKeyword.length; i++) {

		let strTemp = allHistoryText_withKeyword[i].replace(/\d+/g, '');
		allHistoryText_noNum.push(strTemp);
	}


	console.log(allHistoryText_noNum);

	
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
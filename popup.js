console.log("message log go brrr");

var finalAllSeries = [];  // object containing list of series and its ep array

function findSeries(allHistoryText, allHistoryUrl) {

  // only search titles with certain keywords
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

  // remove duplicates, same title searched/watched multiple times is useless
  //    create a set, add all element in it, convert back to array
  let setTemp = new Set();
  for(var i=0; i<allHistoryText_withKeyword.length; i++) {
    setTemp.add(allHistoryText_withKeyword[i]);
  }
  let allHistoryText_unique = Array.from(setTemp);


  // function which returns the episode name without the last numbers
  function episodeNameNoNum(title) {

    let len = title.length;

    let posEnd = -1;
    let posStart;
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
      return null;  // return null since title with no ep num is useless
      //console.log("no number found")
    }
    else{
      let episodeName = title.substring(0, posStart) + 
              title.substring(posEnd+1, len);
      return episodeName;
    }
  }


  // funtion that returns the last numbers from a title
  function episodeNum(title) {

    let len = title.length;

    let posEnd = -1;
    let posStart;
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
      return null;  // return null since title with no ep num is useless
    }
    else{
      return (title.substring(posStart, posEnd+1));
    }     
  }


  // the index of arrHash contains the name of the series without ep number
  // the element present at that index is an array consisting of list of episodes
  var arrHash = [];
  for(var i=0; i<allHistoryText_unique.length; i++) {

    let strTemp = episodeNameNoNum(allHistoryText_unique[i]);
    if(arrHash.hasOwnProperty(strTemp)) {

      let episodeNumber = episodeNum(allHistoryText_unique[i]);
      episodeNumber = parseInt(episodeNumber);
      arrHash[strTemp].push(episodeNumber);
    }
    else {
      let episodeNumber = episodeNum(allHistoryText_unique[i]);
      if(episodeNumber == null) { // skip if no episode num found
        continue;
      }
      arrHash[strTemp] = [];
      episodeNumber = parseInt(episodeNumber);
      arrHash[strTemp].push(episodeNumber);
    }
  }


  for(var obj in arrHash) {

    if(arrHash[obj].length > 1) { // user must have watched atleast 2 episode
      finalAllSeries[obj] = arrHash[obj];
    }
  }


}



// displays the series name along with next episode number
function displayAll(finalAllSeries) {

  for(var obj in finalAllSeries) {
    document.write(obj);
    document.write("  -> ", Math.max.apply(Math, finalAllSeries[obj]) );
    document.write("<br><br>");
    
    // console.log(finalAllSeries[obj]);
  }

}



chrome.history.search(
   {
  'text': '',
  'maxResults': 10000,
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
      displayAll(finalAllSeries);
       
});

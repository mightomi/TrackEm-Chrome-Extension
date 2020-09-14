

// object whose indices is the Series name and its value is an 
// array of the episode numbers that the user watched
var finalAllSeries = {};

// contains link of last episode
var lastEpisodeLink = [];

// object which key originalTitle and value 'the title user want to show'
var userTitle = {};

// object with key originalTitle and bool value true if user want to display it else false
var showTitle = {};



function findSeries(allHistoryText, allHistoryUrl) {


  // add space btw number and letter 
  // remove multiple concurrent space with one space
  for(var i=0; i<allHistoryText.length; i++) {
    allHistoryText[i] = allHistoryText[i].replace(/[^0-9](?=[0-9])/g, '$& ')
    allHistoryText[i] = allHistoryText[i].replace(/  +/g, ' ');
  }

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
  // the element present at that index is an array consisting of episodes watched
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


  // add the episode number last watched to the title and find its corresponding url
  function getUrlLink(title, episode) {

    var originalTitle = title;
    var pos = null;
    for(var i=0; i<title.length-1; i++) {   // use multiple space as a indication
      if(title.charAt(i) == ' ' && title.charAt(i+1) == ' ') {
        pos = i;
      }
    }

    var strTemp = title.substring(pos+1, title.length);
    title = title.substring(0, pos+1);
    title += episode;
    title += strTemp;

    // console.log(originalTitle);
    // console.log(title);
    
    var index = allHistoryText.indexOf(title);
    // console.log(allHistoryUrl[index]);
    return allHistoryUrl[index];
  }


  for(var obj in finalAllSeries) {
    // url of the highest episode ever watch
    var url = getUrlLink(obj, Math.max.apply(Math, finalAllSeries[obj])); 
    lastEpisodeLink.push(url);
  }


}



// initialize userTitle if found in storage
function getUserData() {

  chrome.storage.local.get(["userTitle", "showTitle"], function(result) {

      if(result.userTitle == null || result.showTitle == null) {
        console.log("not found userTitle and showTitle creating one");
        // userTitle and showTitle is then filled in displayall()
      } else {
        console.log("user title, showTitle found", result.userTitle, result.showTitle);
        userTitle = result.userTitle;
        showTitle = result.showTitle;
      }
  });
}
getUserData();

// if not found then htis is called by displayall
function writeUserData() {

  chrome.storage.local.set({userTitle: userTitle}, function() {
    console.log('success written userTitle');
  });
  chrome.storage.local.set({showTitle: showTitle}, function() {
    console.log('success written showTitle');
  });

}





// All display stuff done here
function displayAll() {


  // if userTitle[obj] not found in storage it means its a new entry  so 
  // adding it
  for(var obj in finalAllSeries) {
    if(userTitle[obj] == null)
      userTitle[obj] = obj;
    if(showTitle[obj] == null)
      showTitle[obj] = true;
  }
  writeUserData();
  




  var htmlTable = "<table>";

  htmlTable += "<tr>";
  htmlTable += "<th>"+" Index"+"</td>";
  htmlTable += "<th>"+"Series Name"+"</td>";
  htmlTable += "<th>"+"Episode Left At"+"</td>";
  htmlTable += "</tr>";

  var i=0;
  for(var actualTitle in finalAllSeries) {
    var episodeNumber = Math.max.apply(Math, finalAllSeries[actualTitle]);
    var episodeLink = lastEpisodeLink[i];
    // console.log(episodeLink);

    htmlTable += "<tr>";

    htmlTable += "<td>"+(i+1)+"</td>";

    var idTemp = "seriesName"+i;    // every series name has a id of this form
    htmlTable += "<td contenteditable id ="+idTemp+">" +userTitle[actualTitle]+ "</td>";

    htmlTable += "<td>";
    htmlTable += "<a href="+episodeLink+' target="_blank">' + episodeNumber+"</a>";
    htmlTable += "</td>";

    htmlTable += "</tr>";

    i++;
  }

  htmlTable += "</table>";


  document.getElementById("mainTable").innerHTML = htmlTable;





  var len = Object.keys(finalAllSeries).length;

  // for every title add a event listener to it
  for(let i=0; i<len; i++) {

    document.getElementById("seriesName"+i).addEventListener("input", function() {

      // this function is called whenever the user changes any title
      // finalAllSeries is itterated i times so as to find originalTitle
      // originalTitle is used as a key and the value userTitle[originalTitle] 
      // is changed to the new value inputted by user
      console.log("edited to ", document.getElementById('seriesName'+i).innerHTML);

      var j = 0;
      for(var originalTitle in finalAllSeries) {
        if(j == i) {
          userTitle[originalTitle] = document.getElementById('seriesName'+i).innerHTML;
          break;
        }
        j++;
      }
      writeUserData();

    }, false);


  }

  
}





chrome.history.search(
   {
  'text': '',
  'maxResults': 0,
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

      displayAll();
       
});

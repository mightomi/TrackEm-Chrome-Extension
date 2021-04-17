

// object whose indices is the Series name and its value is an 
// array of the episode numbers that the user watched
var finalAllSeries = {};

// contains link of last episode
var lastEpisodeLink = [];

// object which key originalTitle and value 'the title user want to show'
var userTitle = {};

// object with key originalTitle and bool value true if user want to display it else false
var showTitle = {};




// initialize userTitle if found in storage
function getUserData() {

  chrome.storage.sync.get(["userTitle", "showTitle"], function(result) {

      if(result.userTitle == null) {
        console.log("not found userTitle and showTitle");
        // userTitle, showTitle, is then initialised in displayall()
      } else {
        console.log("user title, showTitle, found", result.userTitle, result.showTitle);
        userTitle = result.userTitle;
        showTitle = result.showTitle;
      }

      // call main only after we are done checking the Userdata stored in the storage
      main();
  });
}
getUserData();



function findSeries(allHistoryText, allHistoryUrl) {


  // pre-editing the title
  for(var i=0; i<allHistoryText.length; i++) {
  
    // add space btw words and other character
    var tempStr = "";
    for(var j=0; j<allHistoryText[i].length; j++) {
      // if speacial character then add space before and after it
      if(allHistoryText[i][j].toUpperCase() == allHistoryText[i][j].toLowerCase()
        && !(allHistoryText[i][j] >= '0' && allHistoryText[i][j] <= '9')) {
        tempStr += " " + allHistoryText[i][j] + " ";
      } else {
        tempStr += allHistoryText[i][j];
      }
    }
    allHistoryText[i] = tempStr;

    // add space before and after numbers
    allHistoryText[i] = allHistoryText[i].replace(/[^0-9](?=[0-9])/g, '$& ')

    // remove multiple concurrent space with one space
    allHistoryText[i] = allHistoryText[i].replace(/  +/g, ' ');

  }

  // console.log(allHistoryText.length);

  // only search titles with certain keywords, if keyword is found then 
  // remove all characters after the last number
  let allHistoryText_withKeyword = [];
  for(var i=0; i<allHistoryText.length; i++) {

    if (
       allHistoryText[i].toLowerCase().includes("watch") || 
       // allHistoryText[i].includes("watch") ||
       // allHistoryText[i].includes("Episode") ||
       allHistoryText[i].toLowerCase().includes("episode") ||
       // allHistoryText[i].includes(" Ep ") ||
       allHistoryText[i].toLowerCase().includes(" ep ") ||
       // allHistoryText[i].includes("Season") ||
       allHistoryText[i].toLowerCase().includes("season") ||
       // allHistoryText[i].includes("Chapter") ||
       allHistoryText[i].toLowerCase().includes("chapter") ||
       // allHistoryText[i].includes("Manga") ||
       allHistoryText[i].toLowerCase().includes("manga") ||
       // allHistoryText[i].includes("Read") ||
       allHistoryText[i].toLowerCase().includes("read")

    ) {

      for(var j=allHistoryText.length -1; j>=0; j--){

        if(allHistoryText[i][j] >= '0' && allHistoryText[i][j] <= '9') {

          // console.log(allHistoryText[i]);
          allHistoryText[i] = allHistoryText[i].substring(0, j+1) + ' ';
          // console.log(allHistoryText[i]);

          break;
        }
      }

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
  // console.log(allHistoryText_unique);


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
      // console.log(title, "\n", episodeName);
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
    let episodeNumber = episodeNum(allHistoryText_unique[i]);

    if(strTemp == ' ') { // skip if title is empty after removing episode number
      continue;
      // console.log(strTemp);
    }

    if(arrHash.hasOwnProperty(strTemp)) {

      
      episodeNumber = parseInt(episodeNumber);
      arrHash[strTemp].push(episodeNumber);
    }

    else {
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
    for(var i=0; i<title.length-1; i++) {   // use 2 space as a indication
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




// if not found then this is called by displayall
function writeUserData() {

  chrome.storage.sync.set({userTitle: userTitle, showTitle: showTitle}, function() {
    console.log('Successfully written to storage');
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
  



  function displayHtmlTable() {

    var htmlTable = "<table id='mainTableId'>";

    htmlTable += "<tr>";
    htmlTable += "<th>"+" Index"+"</td>";
    htmlTable += "<th>"+"Series Name"+"</td>";
    htmlTable += "<th>"+"Episode Left At"+"</td>";
    htmlTable += "<th>";
    htmlTable += "<button type='button' class = 'reset' id = "+"button_resetAll"+"> Reset All</button>";
    htmlTable += "</th>";
    htmlTable += "</tr>";

    var i=0;
    var index = 1;
    for(var actualTitle in finalAllSeries) {

      if(!showTitle[actualTitle]) {
        i++;
        continue;
      }

      var episodeNumber = Math.max.apply(Math, finalAllSeries[actualTitle]);
      var episodeLink = lastEpisodeLink[i];
      // console.log(episodeLink);

      htmlTable += "<tr>";

      htmlTable += "<td>"+(index++)+"</td>";

      var idTitleTemp = "seriesName"+i;    // every series name has a id of this form
      htmlTable += "<td contenteditable id ="+idTitleTemp+">" +userTitle[actualTitle]+ "</td>";

      htmlTable += "<td>";
      htmlTable += "<a href="+episodeLink+' target="_blank">' + episodeNumber+"</a>";
      htmlTable += "</td>";

      htmlTable += "<td>";
      var idButtonTemp = "button"+i;
      htmlTable += "<button type='button' class = 'remove' id = "+idButtonTemp+">X</button>";
      htmlTable += "</td>";

      htmlTable += "</tr>";

      i++;
    }

    htmlTable += "</table>";


    document.getElementById("mainTable").innerHTML = htmlTable;
  }
  displayHtmlTable();


  // listener to the remove button
  $("#mainTableId").on('click', '.remove', function () {

    // it takes the user title and returns the original title
    function findOriginalTitle(titleToFind) {
      for(let actualTitle in userTitle) {
        if(userTitle[actualTitle] == titleToFind){
          return actualTitle;
        }
      }
    }

    var currentRow=$(this).closest("tr"); 
    var currentTitle = currentRow.find("td:eq(1)").text();

    console.log("removing the title named ", findOriginalTitle(currentTitle));
    showTitle[findOriginalTitle(currentTitle)] = false;
    currentRow.remove(); 

    writeUserData()
  });



  // listener to the edit input, not the best code ik
  var len = Object.keys(finalAllSeries).length;
  // adding listener to title and remove button
  for(let i=0; i<len; i++) {

    // skip adding a listener if button was not created
    try {
      document.getElementById('seriesName'+i).innerHTML;
      document.getElementById("button"+i)
    }
    catch(err) {
      continue;
    }

    // this function is called whenever the user edits title
    document.getElementById("seriesName"+i).addEventListener("input", function() {

      console.log("Edited to ", document.getElementById('seriesName'+i).innerHTML);

      // finalAllSeries is itterated i times so as to find originalTitle
      // originalTitle is used as a key and the value userTitle[originalTitle] 
      // is changed to the new value inputted by user
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


  // listener to reset all button
  document.getElementById("button_resetAll").addEventListener("click", function() {

    console.log("clicked reset button");

    userTitle = {};
    showTitle = {};
    writeUserData();

    var Table = document.getElementById("mainTableId");
    Table.innerHTML = "";
    displayAll();


  }, false);



  
}




function main() {


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
}
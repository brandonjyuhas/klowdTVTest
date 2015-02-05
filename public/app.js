$('document').ready(function(){

  var klowdEPG = {

    // Active station will be pulled from URL possibly
    activeStation: "23321",
    // Stations the user is subscribed to
    userStations: [89093,78763,62628,33691,90880],
    apikey: "umstwy76p8shpfkxhugr6a2v",
    baseUrl: "http://data.tmsapi.com/v1/lineups/USA-VA70448-DEFAULT/grid",
    zipcode: "20002",

    // Use klowdjs to determine how many hours to show
    findEPGSize: function() {
        breakpoint = klowdjs.breakpoints.getBreakpoint();
        if (breakpoint > 768) { epgHours = 2; epgMinutes = 30; } else
        if (breakpoint > 560) { epgHours = 1; epgMinutes = 30; } else
        { epgHours = 1; epgMinutes = 0; }
        return { hours: epgHours, minutes: epgMinutes };
    },

    // Convert the js Date object to a format acceptable by gracenote
    findCorrectISOTime: function(date){
      date = date.toISOString().substr(0,16);
      if (parseInt(date.substr(14,2)) >= 30 ){
        return date.substring(0, 14) + "30Z"
      }
      else {
        return date.substring(0, 14) + "00Z"
      }
    },

    // Determine if an item is in an array (used to determine whether channels are available to usrs or not, returning true or false)
    inArray: function(value, array){
      contains = false;
      for(var i = 0; i < array.length; i++){
        if(array[i] == value){
          contains = true;
        }
      }
      return contains;
    },


    // Determine difference in minutes between two times (used to determine how many minutes is left in a show)
    findTimeDifference: function(startHour, startMin, currentHour, currentMin){
      if(startHour > currentHour){
        diff = (24 - startHour + currentHour)
        diff = diff * 60 + currentMin - startMin;
      }
      else {
        diff = (currentHour - startHour);
        diff = diff * 60 + currentMin - startMin;
      }

      return diff;
    },

    // If gracenote does not have a field such as short description for a particular show, replace it with an empty string
    isUndefined: function(string){
      if(string){
        return string;
      }
      else{
        return '';
      }
    },

    // Actually create the elements that are added to the EPG
    fillEPG: function(data, today, hours, minutes){
      console.log(data);
      // Parse through the data provided by gracenote
      for(var j = 0; j < data.length; j++){
        // Check to see if we are in mobile view or not
        if (klowdjs.breakpoints.getBreakpoint() < 768){
          var row = "<div class='grid grid-pad'><div class='col-2-12'><div class='content station'><div class='width-25-percent inline-block'><img src='https://www.klowdtv.com/klowd/images/channels/" + data[j]["callSign"].toLowerCase() + "/logo_small.png' class=' inline-block' /></div><div class='stationInfo inline-block text-align-center'></div></div></div><div class='col-10-12'><div class='content'><ul class='programs inactive' channel-id='" + data[j]["stationId"] + "'></ul></div></div></div>"
        }
        else {
          var row = "<div class='grid grid-pad'><div class='col-2-12'><div class='content'><div class='inline-block image-container width-100-percent'><img src='https://www.klowdtv.com/klowd/images/channels/" + data[j]["callSign"].toLowerCase() + "/logo_small.png' /></div></div></div><div class='col-10-12'><div class='content'><ul class='programs inactive' channel-id='" + data[j]["stationId"] + "'></ul></div></div></div>"
        }

        // Add the row to the table
        $('#programGuide').append(row);

        // Highlight the channel if it's what we're currently watching
        if (this.activeStation === data[j]["stationId"]){
          $('.programs').eq(j).addClass('active');
        }
        // Remove the inactive coloring for stations
        if (this.inArray(data[j]["stationId"].toString(), this.userStations)){
          $('.programs').eq(j).removeClass('inactive');
        }
        var airings = data[j]["airings"];

        // Find the amount of minutes being displayed
        var durationLeft = (hours * 60) + minutes;

        for(var i = 0; i < airings.length; i++){
          // Find how much time is left of current program by subtracting the difference between start time and current time
          if(i === 0){
            airings[i]["duration"] -= this.findTimeDifference(parseInt(airings[i]["startTime"].substr(11,2)), parseInt(airings[i]["startTime"].substr(14,2)), parseInt(today.substr(11,2)), parseInt(today.substr(14,2)));
          }

          // Make sure that there's time left in the epg row
          if(durationLeft > 0){
            var program = airings[i];
            if (durationLeft - program["duration"] < 0) {
              program["duration"] = durationLeft;
            }

            // Handle universal attributes here, and desktop specific in if statement
            // Replace all double quotes so that we don't break out of the title attribute
            var episodeTitle = this.isUndefined(program["program"]["episodeTitle"]).replace(/"/g,"'");

            if(klowdjs.breakpoints.getBreakpoint() < 768){
              if(data[j]["stationId"].toString() === this.activeStation){
                var button = "";
              } else
              if(this.inArray(data[j]["stationId"].toString(), this.userStations)){
                button = "<a href='https://klowdtv.com/myKlowd/watchMyKlowd.ktv?watch=" + data[j]["callSign"].toLowerCase() + "'><button class='change-channel inline-block vertical-align-top' channel-id='" + data[j]["stationId"] + "'>Switch to Channel</button></a>";
              }
              else {
                button = "<a href='https://klowdtv.com/myKlowd/editSubscription.ktv'><button class='inline-block vertical-align-top' channel-id='" + data[j]["stationId"] + "'>Purchase Channel</button></a>";
              }
            }
            else{
              // Link to channel if you have the channel
              if(data[j]["stationId"].toString() === this.activeStation){
                var button = "";
              } else
              if(this.inArray(data[j]["stationId"].toString(), this.userStations)){
                  button = "&lt;a href=&quot;https://klowdtv.com/myKlowd/watchMyKlowd.ktv?watch=" + data[j]["callSign"].toLowerCase() + "&quot;&gt;&lt;button class=&quot;change-channel&quot; channel-id=&quot;"
                  + data[j]["stationId"]
                  + "&quot; &gt; Switch to Channel &lt;/button&gt;&lt;/a&gt;";
              }
              // Link to purchase the channel if you do not
              else {
                button = "&lt;a href=&quot;https://klowdtv.com/myKlowd/editSubscription.ktv&quot;&gt;&lt;button class=&quot;purchase&quot; channel-id=&quot;"
                  + data[j]["stationId"]
                  + "&quot; &gt; Purchase Channel &lt;/button&gt;&lt;/a&gt;";
              }
            }

            // Need to figure out how to avoid blank spaces where an element that isn't large enough to be displayed
            if (program["duration"] < 2) {
              program["duration"] = 0;
            }

            if(program["duration"] > 0){
              // Skip steps if mobile view
              if (klowdjs.breakpoints.getBreakpoint() < 768){
                if(i === 0){
                  if(episodeTitle != ''){
                    episodeTitle = ": " + episodeTitle;
                  }
                  $('.stationInfo').eq(j).html("<h3>" + program["program"]["title"] + episodeTitle + "</h3>");
                  $('.station').eq(j).append(button);
                }
                $('.programs').eq(j).append("<li class='centered-text-li'>"+ program["program"]["title"] +"</li>");
              }

              else {
                var shortDescription = this.isUndefined(program["program"]["shortDescription"]).replace(/"/g,"'");

                // If top cast is provided by gracenote, created a ul with each actor as an li
                var cast = "";
                if (program["program"]["topCast"]){
                  cast += "&lt;ul&gt;"
                  for (var actor = 0; actor < program["program"]["topCast"].length; actor++){
                    cast += "&lt;li&gt;" + program["program"]["topCast"][actor] + "&lt;/li&gt;"
                  }
                  cast += "&lt;/ul&gt;"
                }
                console.log('In media query');
              // Append a li for the program, combining all of the information we have into the tooltip
                $('.programs').eq(j).append("<li class='tooltip centered-text-li' title=\"&lt;h2&gt;"
                  + (program["program"]["title"])
                  + "&lt;/h2&gt; &lt;h3&gt;"
                  + episodeTitle
                  + "&lt;/h3&gt; &lt;p&gt;"
                  + shortDescription
                  + " &lt;/p&gt; &lt;/br&gt; "
                  + cast
                  + button
                  + "\" class='tooltip'>"
                  + program["program"]["title"]
                  + "</li>");
              }
              currentProgram = $('.programs li').last();
              // Determine how large li will be based on how wide the timeline is are
              if (hours === 2)   { minuteDiff = (((program["duration"]) / 30 ) * 20 - 1);  } else
              if (minutes === 30){ minuteDiff = (((program["duration"]) / 30 ) * 33.33 - 1)} else
                                 { minuteDiff = (((program["duration"]) / 30 ) * 50 - 1);  }
              if(minuteDiff > 100){
                minuteDiff = "99%";
              }
              else{
                minuteDiff = minuteDiff + "%";
              }
              currentProgram.width(minuteDiff);
              durationLeft -= program["duration"];
            }
          }

          // If we're out of time in the display, break out of the for loop
          else {
            break;
          }
        }
      }
    },

    // Move forward in time by making api call and resetting the EPG
    addTimeBlock: function(time, hours, minutes){
      time = new Date(time);
      time = new Date(time.setHours(time.getHours() + hours));
      time = new Date(time.setMinutes(time.getMinutes() + minutes));
      $('.date').text(time.toString().substr(0,15));
      return this.findCorrectISOTime(time);
    },

    // Move backward in time by making api call and resetting the EPG
    removeTimeBlock: function(time, hours, minutes){
      time = new Date(time);
      time = new Date(time.setHours(time.getHours() - hours));
      time = new Date(time.setMinutes(time.getMinutes() - minutes));
      $('.date').text(time.toString().substr(0,15));
      return this.findCorrectISOTime(time);
    },

    // Stylize times
    getHoursMinutes: function(hours, minutes){
      var meridiem = "AM";
      if (hours > 12){
        hours -= 12;
        meridiem = "PM";
      }
      else if(hours == 00){
        hours = 12;
      }
      if (minutes >= 30){
        minutes = ":30";
      }
      else {
        minutes = ":00";
      }
      return hours + minutes + meridiem;
    },

    // Place time blocks into the timebar
    setTimeBar: function(today, hours, minutes){
        // Determine how many 30 minute blocks to create
        var length = (hours * 2);
        if (minutes > 0){
          length += 1;
        }
        for (var i = 0; i < length; i++){
          var date = new Date(new Date(today).getTime() + ((i) * 30)*60000);
          var hours = date.getHours();
          var minutes = date.getMinutes();
          $('#time').append('<li class="half-hour"><p class="pushed-to-bottom">' + this.getHoursMinutes(hours, minutes) + '</p></li>');
        }
        // Determine size based on thirty min blocks
        if (length === 5){ $('.half-hour').width('20%'); } else
        if (length === 3){ $('.half-hour').width('33.33%'); } else
                         { $('.half-hour').width('50%'); }
    },

    // On initialization
    init: function(){
      epg = this;
      // Change the text of the date object to todays date
      $('.date').text(new Date().toString().substr(0,15));
      // Figure out the time right now
      time = this.findCorrectISOTime(new Date());
      // Find EPG size in terms of hours and minutes displayed
      hoursMins = this.findEPGSize();
      // Set the EPG using the current time and the hours and minutes being displayed as arguments
      this.setEPG(time, hoursMins["hours"], hoursMins["minutes"]);

      // Use Fetching data to prevent users from spamming the button while it's running
      // Any function that talks with the API requires fetchingData to be false, and sets it true when it starts
      // At the end of the function, after a certain amount of time, it sets fetchingData to false
      var fetchingData = false;
      // Add the functionality to the next and previous button
      $('#next').on('click', function(){
          if(fetchingData != true){
              fetchingData = true;
            // Empty the EPG of its current contents
            $('#programGuide').empty();
            // Remove the half hours from the timebar
            $('.half-hour').remove();
            // Figure out how large the epg's scope is based off of screen size
            hoursMins = epg.findEPGSize();
            // Find new time by adding time to current time
            time = epg.addTimeBlock(time, hoursMins["hours"], hoursMins["minutes"]);
            // Run the setEPG method again with the new time, and total hours and minutes being displayed as arguments
            epg.setEPG(time, hoursMins["hours"], hoursMins["minutes"]);
            setTimeout(function(){
              fetchingData = false;
            }, 1000);
          }
        });
      $('#previous').on('click', function(){
        if(fetchingData != true){
          fetchingData = true;
          // Empty the EPG of its current contents
          $('#programGuide').empty();
          // Remove the half hours from the timebar
          $('.half-hour').remove();
          // Figure out how large the epg's scope is based off of the screen size
          hoursMins = epg.findEPGSize();
          // Find new time by removing time to current time
          time = epg.removeTimeBlock(time, hoursMins["hours"], hoursMins["minutes"]);
          // Run the setEPG method again with the new time, and total hours and minutes being displayed as arguments
          epg.setEPG(time, hoursMins["hours"], hoursMins["minutes"]);
          setTimeout(function(){
            fetchingData = false;
          }, 1000);
        }
      });
      // If window resizes, make sure to refresh the EPG to the new size
      $(window).resize(function(){
        if(fetchingData != true){
          fetchingData = true;
          setTimeout(function(){
            // Empty the EPG of its current contents
            $('#programGuide').empty();
            // Remove the half hours from the timebar
            $('.half-hour').remove();
            console.log('resize');
            hoursMins = epg.findEPGSize();
            epg.setEPG(time, hoursMins["hours"], hoursMins["minutes"]);
            fetchingData = false;
          }, 1000);
        }
      })
    },

    setEPG: function(time, hours, minutes){

      // Set 'this' as a variable so I can access it in the ajax
      var epg = this;

      // Determine ISO 8601 in Zulu time (What Gracenote Uses)
      epg.setTimeBar(time, hours, minutes);

      // If you're looking at the current time, you can't go back, so remove the previous button
      if (time === epg.findCorrectISOTime(new Date())){
        $('#previous').hide();
      }
      else {
        $('#previous').show();
      }
      // Send request to gracenote
      $.ajax({
        url: epg.baseUrl,
        data: {
          startDateTime: time,
          api_key: epg.apikey,
        },
      })
      .done(function(data){
        // Fill the EPG with the data we just pulled
        epg.fillEPG(data, time, hours, minutes);
        // Initialize tooltipster for the clickable information if screen is mobile
        // Documentation for tooltipster: http://iamceege.github.io/tooltipster/
        if(klowdjs.breakpoints.getBreakpoint() > 768){
          $('.tooltip').tooltipster({
            trigger: 'click',
            contentAsHTML: true,
            interactive: true,
            });
          }
      });
    },
  }

  klowdEPG.init();

});